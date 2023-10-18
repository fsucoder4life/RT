define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend2', 'app/rules/paymentmod'], function (report, combined, construction, combinedconstructionextend, paymentmodRules) {
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
            console.log("combinedconstructionextendQuery: " + combinedconstructionextendQuery);
            //Load combinedconstructionextend data
            var combinedQuery2;
            combinedconstructionextend.loadData({ query: combinedconstructionextendQuery }, function (data) {
                //console.log("combinedconstructionextend.loadData:" + data);
                var today = moment().format('YYYY-MM-DD'),
                quarter = moment().add({ months: 4 }).format('YYYY-MM-DD'),
                keepers = [],
                copy;

                //Give them all the type of construction
                _.forEach(data, function (store) {
                    copy = _.clone(store);
                    combinedQuery2 = combinedQuery2 + "<Value Type='Text'>" + store.StoreNumber + "</Value>";
                    //console.log("store.StoreNumber:" + store.StoreNumber);
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
                    quarter = moment().add({ months: 4 }).format('YYYY-MM-DD'),
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

                    if (posInstall.diff(moment(store.PopsDeliveryDate)) == 0 && store.GoLiveDate > today && store.GoLiveDate < quarter) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = posInstall.format('YYYY-MM-DD');

                        //keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (store.GoLiveDate > today && store.GoLiveDate < quarter) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = posInstall.format('YYYY-MM-DD');

                            //keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((today <= popsDelivery || (today <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6")) && popsDelivery <= quarter) {
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
                
                

                {
                    key: 'StoreNumber', title: 'Store', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>" + value + "</a>"
                    }
                },
                
                {
                    key: 'VP6800GoLive', title: 'Scheduled Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'FranchiseGroup', title: 'Franchisee' },
                { key: 'DMA', title: 'DMA' },
                
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'VP6800ITPM', title: 'PM' },
                { key: 'VP6800Installer', title: 'Install Team' },


                { key: 'VP6800IntroCallToFee', title: 'Intro Call', transform: 'date' },
                { key: 'VP6800ProjectSiteSurveyCompany', title: 'Site Survey Requested (Installation Company Assigned)' },
                { key: 'VP6800HughesDoctoFEE', title: 'Hughes Document sent to FRAN', transform: 'date' },
                { key: 'VP6800HughesDoctoHughes', title: 'Hughes Docuemnt sent to Hughes', transform: 'date' },
                { key: 'VP6800SiteSurveyConfirmedbyInstaller', title: 'Site Survey Schedule Confirmed by Installation Company', transform: 'date' },
                
                { key: 'VP6800ProjectSiteSurveyDate', title: 'SITE SURVEY COMPLETED', transform: 'date' },
                { key: 'VP6800ReviewSignOffs', title: 'Site Survey Results Reviewed with FRAN', transform: 'date' },
                { key: 'VP6800OrderDocSenttoFee', title: 'Order Documents sent to FRAN', transform: 'date' },

                { key: 'VP6800Ordered', title: 'ORDER PLACED', transform: 'date' },
                { key: 'VP6800InstallScheduled', title: 'INSTALL SCHEDULED', transform: 'date' },
                { key: 'VP680030DayComm', title: '30 DAYS COMMS', transform: 'date' },
                { key: 'VP68002WeekComm', title: '2 WEEK COMMS', transform: 'date' },
                { key: 'VP68001WeekComm', title: '1 WEEK COMMS', transform: 'date' },
                { key: 'VP6800DayBeforeInstallComm', title: '1 DAY COMMS', transform: 'date' },
                
                { key: 'VP6800TrackingNum', title: 'Tracking #', transform: 'date' },
                
                
                

                
                

            ];

            //Define report title
            var title = 'Next Gen Pays Readiness Report';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'VP6800GoLive',
                direction: 'DESC'
            };

            function complete() {
                if (combinedComplete && combinedconstructionextendComplete) {

                    var afterRender = function (view) {
                        paymentmodRules.tableHelper(view);
                    };
                    //Build report if complete
                    report.render({
                        data: stores,
                        columns: columns,
                        title: title,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck,
                        callback: afterRender
                    });
                }
            }
        }
    };
});