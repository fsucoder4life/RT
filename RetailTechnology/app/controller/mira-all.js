define(['app/view/report', 'app/store/combined', 'app/store/construction'], function (report, combined, construction) {
    return {
        /**
         * Shows a report with all conversion/construction projects.  Estimates install date 2 weeks before items with no install date.
         * Also breaks projects into multiple installs if they aren't a one day offset for pos delivery and go live for POS/POPS conversions
         * @param target
         * @param routeCheck
         */
        show: function (target, routeCheck, options) {
            var combinedComplete = false,
                constructionComplete = false,
                stores = [];

            //Build combined query
            var combinedQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                    CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                ),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThan('2020-01-01'),
                    CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThan('2020-01-01')
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
                        //Add the POS project
                        if (today <= posInstall && (popsDelivery < today || popsDelivery > posInstall) && posInstall < '2020-01-01') {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                            copy.InstallType = 'POS Conversion';
                            keepers.push(copy);
                        }

                        //Add the POPS projects
                        if (today <= popsDelivery && (posInstall < today || posInstall > posInstall) && popsDelivery < '2020-01-01') {
                            copy = _.clone(store);
                            copy.InstallDate = store.PopsDeliveryDate;
                            copy.InstallType = 'POPS Conversion';
                            copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                            keepers.push(copy);
                        }
                    }
                });

                //Notify complete
                window.combined = keepers;
                stores = stores.concat(keepers);
                combinedComplete = true;
                complete();
            });

            //Build construction query
            var constructionQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({combinedQuery: constructionQuery}, function (data) {
                //Give them all the type of construction
                _.forEach(data, function (store) {
                    store.InstallType = store.ProjectType;
                });

                //Notify complete
                window.construction = data;
                stores = stores.concat(data);
                constructionComplete = true;
                complete();
            });

            //Define Report Columns
            var columns = [
                {key: 'InstallType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'Installer', title: 'Installer'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'MIRA - Upcoming Projects';

            //Define sorting
//            var sort = {
//                key: 'InstallDate',
//                direction: 'DESC'
//            };
            var sort = function (arr) {
                return arr.sort(function (a, b) {
                    var aInstall = a.InstallDate || moment(a.GoLiveDate).add({days: -14}).format('YYYY-MM-DD'),
                        bInstall = b.InstallDate || moment(b.GoLiveDate).add({days: -14}).format('YYYY-MM-DD');
                    if (aInstall < bInstall) {
                        return -1;
                    } else if (bInstall < aInstall) {
                        return 1
                    }
                    return 0;
                });
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if ((store.Installer.toUpperCase().indexOf('MIRA') !== -1 || store.Installer === '') && (store.InstallDate > moment().format('YYYY-MM-DD') || store.InstallDate === '')) {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            //Show report
            function complete() {
                if (constructionComplete && combinedComplete) {
                    report.render({
                        data: stores,
                        columns: columns,
                        title: title,
                        target: target,
                        sort: sort,
                        filter: filter,
                        routeCheck: routeCheck
                    });
                }
            }
        }
    };
});