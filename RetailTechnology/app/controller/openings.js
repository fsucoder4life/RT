define(['app/view/report', 'app/store/combined', 'app/store/construction'], function (report, combined, construction) {
    return {
        show: function (target, routeCheck, options) {
            var combinedComplete = false,
                constructionComplete = false,
                stores = [];

            //Build combined query
            var combinedQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment().add({days: -2}).format('YYYY-MM-DD')),  //subtract an extra day to pull in the POPS deliveries that are special case saturday deliveries, with sunday install, monday go-live
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(moment().add({months: 1}).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment().add({months: 1}).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(moment().add({days: -2}).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').LessThanOrEqualTo(moment().add({months: 4}).format('YYYY-MM-DD'))
                    )
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({query: combinedQuery}, function (data) {
                var today = moment().format('YYYY-MM-DD'),
                    quarter =  moment().add({months: 4}).format('YYYY-MM-DD'),
                    keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {

                    var posInstall = moment(store.GoLiveDate).subtract({days: 1}),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                        audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                        audioGoLive = moment(store.AudioInstallDate).add(2, 'days').format('YYYY-MM-DD');

                    if (posInstall.diff(moment(store.PopsDeliveryDate) && store.GoLiveDate > today && store.GoLiveDate < quarter) == 0) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = posInstall.format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS';
                        keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (store.GoLiveDate > today && store.GoLiveDate < quarter) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = posInstall.format('YYYY-MM-DD');
                            copy.InstallType = 'POS';
                            keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((today <= popsDelivery || (today <= moment(popsDelivery).add(2, 'days').format('YYYY-MM-DD') && moment(popsDelivery).format('E') === "6")) && popsDelivery <= quarter) {
                            copy = _.clone(store);
                            //If on a saturday, install is sunday, go-live is on monday
                            if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is on monday
                            } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                            }
                            copy.InstallType = 'POPS Conversion';

                            keepers.push(copy);
                        }
                    }

                    //Add the Audio projects
                    if (today <= audioGoLive && audioGoLive <= quarter) {
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioInstallDate;
                        copy.InstallType = 'Audio Conversion';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({days: 2}).format('YYYY-MM-DD');      //go live is the morning after
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
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').LessThanOrEqualTo(moment().add({months: 4}).format('YYYY-MM-DD'))
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

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'InstallType', title: 'Install Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'Classification', title: 'Type'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'AudioType', title: 'Audio', transform: function (value, row, data, index) {
                    if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1 || row.InstallType.toUpperCase().indexOf('CONSTRUCTION') !== -1) {
                        return row.AudioType;
                    } else {
                        return ''
                    }
                }},
                {key: 'Installer', title: 'Installer', transform: function (value, row, data, index) {
                    if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1) {
                        return row.AudioInstaller
                    } else {
                        return row.Installer
                    }
                }},
                {key: 'InstallDate', title: 'Install Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Upcoming Projects';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            function complete () {
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