define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var combinedComplete = false,
                constructionComplete = false,
                combinedconstructionextendComplete = false,
                stores = [];

            //Build combinedconstructionextend query
            var combinedconstructionextendQuery = new CamlBuilder().Where().Any(
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('VP6800_x0020_Go_x0020_Live').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                )
            );

            combinedconstructionextendQuery = "<Query>" + combinedconstructionextendQuery.ToString() + "</Query>";

            //Load combinedconstructionextend data
            var combinedQuery2;
            combinedconstructionextend.loadData({ query: combinedconstructionextendQuery }, function (data) {

                var today = moment().format('YYYY-MM-DD'),
                keepers = [],
                copy;

                //Give them all the type of construction
                _.forEach(data, function (store) {
                    copy = _.clone(store);
                    combinedQuery2 = combinedQuery2 + "<Value Type='Text'>" + store.StoreNumber + "</Value>";

                    keepers.push(copy);

                });
                //Notify complete

                stores = stores.concat(keepers);
                combinedconstructionextendComplete = true;
                complete();
            });


            var combinedQuery = "<Where><In><FieldRef Name='Title' /><Values>" + combinedQuery2 + "</Values></In></Where>";

            //Load combined data
            combined.loadData({ query: combinedQuery }, function (data) {

                var today = moment().format('YYYY-MM-DD'),
                    keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {

                    var posInstall = moment(store.GoLiveDate).subtract({ days: 1 }),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                        audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                        audioPreCable = moment(store.AudioDeliveryDate).format('YYYY-MM-DD'),
                        posPreCable = moment(store.PosPreCableDate).format('YYYY-MM-DD'),
                        popsPreCable = moment(store.PopsPreCableDate).format('YYYY-MM-DD'),
                        //Determine the POPS go-Live date based on whether or not it was delivered on saturday which implies a sunday install
                        popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsDelivery).add({ days: 2 }).format('YYYY-MM-DD') : moment(popsDelivery).add({ days: 1 }).format('YYYY-MM-DD');

                    if ((posInstall != 'Invalid date') && posInstall.diff(moment(store.PopsDeliveryDate)) == 0 && store.GoLiveDate > today ) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = posInstall.format('YYYY-MM-DD');

                        //keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (store.GoLiveDate > today ) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = posInstall.format('YYYY-MM-DD');

                            //keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((popsDelivery != 'Invalid date') && (today <= popsDelivery || (today <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6"))) {
                            copy = _.clone(store);
                            //If on a saturday, install is sunday, go-live is on monday
                            if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is on monday
                            } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is the morning after
                            }


                            //keepers.push(copy);
                        }
                    }

                });

                //Notify complete
                stores = stores.concat(data);
                combinedComplete = true;
                complete();
            });



            //Define Report Columns
            var columns = [
                
                { key: 'ProjectType', title: 'Type' },

                { key: 'StoreNumber', title: 'No.' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                {
                    key: 'VP6800GoLive', title: 'VP6800 Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'VP6800NumOfTerminals', title: '# Of Terminals' },
                { key: 'VP6800NumOf45Units', title: '#&nbsp;of&nbsp;45 Units' },
                { key: 'VP6800NumOf90Units', title: '#&nbsp;of&nbsp;90 Units' },
                { key: 'VP6800DTWindow', title: 'DT Window' },
                { key: 'VP6800Sunshield', title: 'Sunshield' },
                {
                    key: 'VP6800Ordered', title: 'Ordered', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'VP6800Delivery', title: 'Delivery', transform: 'date' },
                { key: 'VP6800TrackingNum', title: 'Tracking #' },
                { key: 'VP6800Installer', title: 'Installer' },

                {
                    key: 'VP6800PONum', title: 'PO Number', transform: function (value, row, data, index) {
                        if (value)
                            if (value.indexOf(".") > -1)
                                return value.substring(0, value.indexOf("."));
                            else return "";
                        else return "";
                    }
                },
                { key: 'VP6800ITPM', title: 'IT PM' },
                { key: 'HughesSwitchUpgradeOrdered2', title: 'Hughes Switch Upgrade Ordered' },
                
                { key: 'VP6800ServerCabinetNumber', title: 'Server Cabinet 6u&nbsp;QTY' },
                
                {
                    key: 'VP6800ServerCabinet12uNumber', title: 'Server Cabinet 12u&nbsp;QTY', transform: function (value, row, data, index) {
                        if (value)
                            return value;
                        else
                            return "";
                    }
                },
                { key: 'VP6800ServerCabinetShelf', title: 'Server Cabinet Shelf' },
                { key: 'VP6800ProjectSiteSurveyDate', title: 'Site Survey Date', transform: 'date' },
                { key: 'VP6800ProjectSiteSurveyCompany', title: 'Site Survey Company' },
                { key: 'VP6800ProjectSignOffsComplete', title: 'Sign Offs Complete' },

                { key: 'VP6800ProjectSwitchSerialNum', title: 'Switch Serial #' },


                { key: 'FranchiseGroup', title: 'Franchisee' },
                { key: 'DMA', title: 'DMA' },


                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                },

            ];

            //Define report title
            var title = 'Next Gen Pays - Upcoming Projects';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'VP6800GoLive',
                direction: 'DESC'
            };

            function complete() {
                if (combinedComplete && combinedconstructionextendComplete) {
                    //Build report if complete
                    report.render({
                        data: stores,
                        columns: columns,
                        title: title,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck
                    });
                }
            }
        }
    };
});