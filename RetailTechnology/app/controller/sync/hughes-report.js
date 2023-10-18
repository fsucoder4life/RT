define(['app/view/sync/hughes-report', 'app/view/report', 'app/store/combined', 'app/store/construction', 'dijit/registry'], function (view, report, combined, construction, registry) {
    var orderData = [],
        installedData= [];

    function compare(routeCheck) {
        var combinedComplete = false,
            constructionComplete = false,
            stores = [];

        //Build combined query
        var combinedQuery = new CamlBuilder().Where().All(
            CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
            CamlBuilder.Expression().Any(
                CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
            )
        );

        combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

        //Load combined data
        combined.loadData({query: combinedQuery}, function (data) {
            var keepers = [],
                copy;


            //Create a new entry for each date within our range
            _.forEach(data, function (store, index) {

                var posInstall = moment(store.GoLiveDate).subtract({days: 1}).format('YYYY-MM-DD'),
                    popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                    today = moment().format('YYYY-MM-DD');
                if (moment(posInstall).diff(moment(popsDelivery)) == 0) {
                    //Add a combined project if the go live minus one is the same as the install
                    copy = _.clone(store);
                    //Install is the day before go live here
                    copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                    copy.InstallType = 'POPS & POS Conversion';
                    keepers.push(copy);
                } else {
                    //We're only adding one of these projects in this case since he doesn't need to care about it if it's further out

                    //Add the POS project
                    if (today <= posInstall && (popsDelivery < today || popsDelivery > posInstall)) {
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                        copy.InstallType = 'POS Conversion';
                        keepers.push(copy);
                    }

                    //Add the POPS projects
                    if (today <= popsDelivery && (posInstall < today || posInstall > posInstall)) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PopsDeliveryDate;
                        copy.InstallType = 'POPS Conversion';
                        copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                        keepers.push(copy);
                    }
                }
            });

            //Notify complete
            stores = stores.concat(keepers);
            combinedComplete = true;
            complete();
        });

        //Build construction query
        var constructionQuery = new CamlBuilder().Where().Any(
            CamlBuilder.Expression().All(
                CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
            )
        );

        constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

        //Load construction data
        construction.loadData({query: constructionQuery}, function (data) {
            //Give them all the type of construction and push into the stores array
            _.forEach(data, function (store) {
                if (store.ProjectType !== 'POS Conversion') {
                    store.InstallType = 'Construction';
                    store.push(store);
                }
            });

            //Notify complete
            constructionComplete = true;
            complete();
        });


        //Parse the store number, whether or not it has a HAN, and the HAN Type out of the install base list
        debugger;
        var installed = {};
        _.forEach(installedData, function (store) {
            //Skip the two non-store items
            if (store.SAN === 'CORPSON' || store.SAN === 'SOHNELABD') return;
            //Check if it's a secondary location:
            var secondary = store.SAN[store.SAN.length-1] === "A";
            //Find the store number
            var storeNumber;
            if (secondary) {
                var storeNumber = store.SAN.substr(3,4);
            } else {
                var storeNumber = store.SAN.substr(4,4);
            }

            //TODO - store number finder isn't working here!!! Need to adjust for varying start of
            var data;
            if (typeof installed[storeNumber] === 'undefined') {
                data = {
                    StoreNumber: storeNumber,
                    HAN: false,
                    VSAT: false,
                    HasSecondary: false,
                    SecondaryHAN: false,
                    SecondaryVSAT: false
                };
                installed[storeNumber] = data;
            } else {
                data = installed[storeNumber]
            };

            //Check to see if it's primary or not
            if (secondary) data.HasSecondary = store.SAN[store.SAN.length-1] === "A";

            //Check to see if it's a HAN
            if (store.SAN.search(/\dDT/) !== -1) {
                if (secondary) data.SecondaryHAN = 'Wireless Installed'
                else data.HAN = 'Wireless Installed';
            } else if (store.SAN.search(/\dDA{0,1}$/) !== -1) {
                if (secondary) data.SecondaryHAN = 'Wired Installed'
                else data.HAN = 'Wired Installed'
            } else {
                //Assume it's a VSAT store
                if (secondary)  data.SecondaryVSAT = true;
                else data.VSAT = true;
            }
        });
debugger;
        //Parse the active order list
        _.forEach(orderData, function (store) {
            //Skip the two non-store items
            if (store.San === 'CORPSON' || store.San === 'SOHNELABD') return;
            //Check if it's a secondary location:
            var secondary = store.San[store.San.length-1] === "A";
            //Find the store number
            var storeNumber;
            if (secondary) {
                var storeNumber = store.San.substr(3,4);
            } else {
                var storeNumber = store.San.substr(4,4);
            }

            /**
             * Check active list first
             * Check within last three months to find any orders that are relevant
             *  Find the date by using these in order of preference:
             *      - Confirm Schd
             *      - Tentative Schds
             *      - Cust Due
             *    Store the date type based on which one of these is used - can use the scheduled status for this
             * Check "Schd Status"
             *  - Canceled- ignore
             *  - Unscheduled - date was missed
             *  - Tentative - processing, not confirmed by by customer
             *  - Suspended - Weird issue
             *  - On-Site - good, note status
             *  - Completed - good, note status
             *  - Confirmed - good, customer has confirmed date
             * Check Order Type:
             *  - De-install - ignore
             *  - Abort - ignore
             *  - Only care about install & re-install
             *
             */

        });

        //Utility function for getting/creating a store
        //Index them by store number
        orderData = _.indexBy(orderData, function (store) {
            return store.StoreNumber;
        });

        //Called after combined and construction projects are loaded
        function complete() {
            if (combinedComplete && constructionComplete) {
                //Go through all of our stores, keep a list of things that don't have a match
                var diff = {
                    satellite: [],
                    han: []
                };

                _.forEach(stores, function (store) {
                    //Check to see if it's still in the development report
                    if (typeof compareData[store.StoreNumber] === 'undefined') {
                        diff.satellite.push(store);
                    } else {
                        var compareStore = compareData[store.StoreNumber];
                        //If it exists, check to see if it needs wireless
                        if (compareStore.Wireless === false && compareStore.Han == false) {
                            store.Hughes = compareStore;
                            diff.han.push(store);
                        }
                    }
                });

                //Build and display three reports, one for new stores, one for deleted stores, and one for stores with different go live dates
                view.results({
                    results: diff,
                    routeCheck: routeCheck,
                    callback: afterRender
                });

                //Event handling for view controls
                function afterRender(view) {}
            }
        }
    }

    return {
        show: function (target, routeCheck, options) {
            //Show form
            view.render({
                target: target,
                routeCheck: routeCheck,
                callback: function (form) {
                    //Track if both forms have been uploaded
                    var ordersPasted = false,
                        orderText = '',
                        installedPasted = false,
                        installedText = '';

                    //Register a handler for the paste event
                    form.inputInstalled.on('paste', function (evt) {
                        installedPasted = true;
                        if (window.clipboardData && window.clipboardData.getData) { // IE
                            installedText = window.clipboardData.getData('Text');
                        } else if (evt.clipboardData && evt.clipboardData.getData) {
                            installedText = evt.clipboardData.getData('text/plain');
                        }

                        //Parse out of tab delimited data
                        installedData = $.parse(installedText, {header: true}).results.rows;

                        //Verify all data is pasted
                        complete();
                    });

                    //Register a handler for the paste event
                    form.inputOrders.on('paste', function (evt) {
                        ordersPasted = true;
                        if (window.clipboardData && window.clipboardData.getData) { // IE
                            orderText = window.clipboardData.getData('Text');
                        } else if (evt.clipboardData && evt.clipboardData.getData) {
                            orderText = evt.clipboardData.getData('text/plain');
                        }

                        //Parse out of tab delimited data
                        orderData = $.parse(orderText, {header: true}).results.rows;

                        //Verify all data is pasted
                        complete();
                    });

                    function complete () {
                        if (ordersPasted && installedPasted) {
                            //Compare
                            compare(routeCheck);
                        }
                    }
                }
            });
        }
    };
});