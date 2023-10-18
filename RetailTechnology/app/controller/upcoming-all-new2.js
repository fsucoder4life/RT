define(['app/view/report', 'app/store/combined', 'app/store/construction'], function (report, combined, construction) {
    return {
        show: function (target, routeCheck, options) {
            var combinedComplete = false,
                constructionComplete = false,
                stores = [];

            //Build combined query
            var combinedQuery = new CamlBuilder().Where().All(

                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Pre_x002d_Cable_x0020').GreaterThanOrEqualTo(moment().format('YYYY-MM-DD'))
                        
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment().add({ days: -1 }).format('YYYY-MM-DD')) //subtract a day to grab the deliveries that deliver on saturday, imply sunday install
                        
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                        
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                        
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                        
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POS_x0020_Pre_x002d_Cable').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                        
                    )
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

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
                        popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsDelivery).add({ days: 2 }).format('YYYY-MM-DD') : moment(popsDelivery).add({ days: 1 }).format('YYYY-MM-DD'),
                            posInstallGoLive = moment(store.PosDeliveryDate).format('YYYY-MM-DD');

                    
                    if  ((posInstall != 'Invalid date') && (posInstall.diff(moment(store.PopsDeliveryDate)) == 0 && store.GoLiveDate > today )) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = posInstall.format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS';
                        keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (store.GoLiveDate > today ) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = posInstall.format('YYYY-MM-DD');
                            copy.InstallType = 'POS';
                            keepers.push(copy);
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
                            copy.InstallType = 'POPS Conversion';

                            keepers.push(copy);
                        }
                    }

                    //Add audio pre-cable HME projects
                    if ((audioPreCable != 'Invalid date') && (today <= audioPreCable && store.AudioType.toUpperCase().indexOf('HME') !== -1 && store.AudioDeliveryDate !== '')) {
                        copy = _.clone(store);
                        copy.InstallDate = moment(store.AudioDeliveryDate).toISOString();  //Conversions use this as the audio pre-cable night
                        copy.InstallType = 'Audio Pre-Cable';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({ days: 3 }).format('YYYY-MM-DD');      //go live is the morning after
                        keepers.push(copy);
                    }

                    //Add the Audio projects
                    if ((audioInstall != 'Invalid date') && today <= audioInstall) {
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioInstallDate;
                        copy.InstallType = 'Audio Conversion';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({ days: 3 }).format('YYYY-MM-DD');      //go live is the morning after
                        keepers.push(copy);
                    }



                    //Add the POS Pre-Cable projects
                    if ((posPreCable != 'Invalid date') && (store.PosPreCableDate !== '' && today <= posPreCable )) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PosPreCableDate;
                        copy.InstallType = 'POS Pre-Cable';
                        copy.GoLiveDate = store.GoLiveDate;
                        keepers.push(copy);
                    }

                    //Add the POPS Pre-Cable projects
                    if ((popsPreCable != 'Invalid date') && (today <= popsPreCable )) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PopsPreCableDate;
                        copy.InstallType = 'POPS Pre-Cable';
                        copy.GoLiveDate = popsGoLive;
                        keepers.push(copy);
                    }

                    //add the POS > Delivery Date
                    if ((posInstallGoLive != 'Invalid date') && (today <= posInstallGoLive)) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PosDeliveryDate;
                        copy.InstallType = 'POS Delivery Date';
                        copy.GoLiveDate = posInstallGoLive;
                        keepers.push(copy);
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
                    
                ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({ query: constructionQuery }, function (data) {
                //Give them all the type of construction
                _.forEach(data, function (store) {
                    store.InstallType = 'Construction';
                });

                //Notify complete
                stores = stores.concat(data);
                constructionComplete = true;
                complete();
            });

            //Define Report Columns
            var columns = [
                
                { key: 'InstallType', title: 'Type of Install' },
                { key: 'StoreNumber', title: 'No.' },
                { key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date' },
                {
                    key: 'Installer', title: 'Installer', transform: function (value, row, data, index) {
                        if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1) {
                            return row.AudioInstaller;
                        } else if (row.InstallType.toUpperCase().indexOf('POPS') !== -1 && row.PopsInstaller !== '') {
                            return row.PopsInstaller;
                        } else {
                            return row.Installer;
                        }
                    }
                },
                { key: 'FranchiseGroup', title: 'Franchisee' },


                { key: 'City', title: 'City' },
    { key: 'State', title: 'State' },
        { key: 'MarketLeader', title: 'Market Leader' },
        { key: 'SeniorVicePresident', title: 'SVP' },
        { key: 'RegionalVicePresident', title: 'RVP' },



                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                }
            ];

            //Define report title
            var title = 'Upcoming Projects - All - New';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };

            function complete() {
                if (constructionComplete && combinedComplete) {
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