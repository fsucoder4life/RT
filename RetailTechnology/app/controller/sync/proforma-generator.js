define(['app/view/sync/proforma-generator', 'app/view/report', 'app/store/combined', 'app/store/construction', 'dijit/registry', "dojo/hash", "app/controller/proforma"], function (view, report, combined, construction, registry, hash, proforma) {
    var compareData = [];

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
            //Give them all the type of construction
            _.forEach(data, function (store) {
                store.InstallType = 'Construction';
            });

            //Notify complete
            stores = stores.concat(data);
            constructionComplete = true;
            complete();
        });


        //Parse the store number, whether or not it has DSL
        _.forEach(compareData, function (store) {
            var san = store.SAN;

            //Get the store number and trim the leading zero
            var storeNumber = san.replace(/\D*/g, "");
            store.StoreNumber = parseInt(storeNumber, 10).toString();

            //Check to see if it's primary or not
            store.Secondary = san[san.length-1] === "A";

            //Check to see if it has wireless
            store.Wireless = san.search(/\dDT/) !== -1;
            //If it doesn't, check to see if it has DSL
            store.Han = san.search(/\dDA{0,1}$/) !== -1;
        });

        //Index them by store number
        compareData = _.indexBy(compareData, function (store) {
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
                    //Register a handler for the paste event
                    form.input.on('paste', function (evt) {
                        var text = '';
                        if (window.clipboardData && window.clipboardData.getData) { // IE
                            text = window.clipboardData.getData('Text');
                        } else if (evt.clipboardData && evt.clipboardData.getData) {
                            text = evt.clipboardData.getData('text/plain');
                        }

                        //Remove commas and dollar signs to make sure it parses a tab delimited list and that we don't have to deal with messy monetary values - this is only store numbers and money
                        text = text.replace(/[\,\$]/g, '');

                        //Parse out of tab delimited data
                        var data = $.parse(text, {header: false}).results;

                        //Generate a dash delimited list of proformas, grab POS amounts if they exist
                        var stores = '';
                        _.each(data, function (store, index) {
                            if (stores.length > 0) {
                                stores += "-";
                            }
                            //Add store to list
                            stores += store[0];
                            //Add pos amount to list if it's there and numeric
                            if (store.length > 1) {
                                proforma.storeData[store[0]] = proforma.storeData[store[0]] || {};
                                proforma.storeData[store[0]].PosAmount = store[1];
                            }
                        });

                        //Build the proformas by changing the hash
                        hash("proforma/" + stores);
                    });
                }
            });
        }
    };
});