define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion'),
                CamlBuilder.Expression().TextField('DT_x0020_POPS_x0020_Quantity').NotEqualTo('0'),
                CamlBuilder.Expression().TextField('DT_x0020_POPS_x0020_Quantity').IsNotNull()
            );

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type', whiteSpace: 'nowrap'},
                {key: 'StoreNumber', title: 'No.', whiteSpace: 'nowrap'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'AudioType', title: 'Audio', whiteSpace: 'nowrap', editable: true},
                {key: 'DtPopsInstaller', title: 'Installer', whiteSpace: 'nowrap'},
                {key: 'DtPopsSurveyStatus', title: 'Survey', editable: true, whiteSpace: 'nowrap'},
                {key: 'DtPopsStatus', title: 'Status', editable: true, whiteSpace: 'nowrap'},
                {key: 'DtPopsQuantity', title: 'Qty.', editable: true, whiteSpace: 'nowrap'},
                {key: 'DtPopsConstructionDate', title: 'Construction', transform: 'date', minWidth: '100px'},
                {key: 'DtPopsDeliveryDate', title: 'Delivery<br/>Date', whiteSpace: 'nowrap', transform: 'date'},
                {key: 'DtPopsInstallDate', title: 'Install<br/>Date', whiteSpace: 'nowrap', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', whiteSpace: 'nowrap', transform: 'date'},
                {key: 'FranchiseGroup', title: 'Franchisee'}
            ];

            //Define report title
            var title = 'DT POPS - Upcoming Conversion Projects';

            //Define sorting
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    /**
                     * Sort conversions by dt pops install date, others by install date or calculated install date
                     * Insert a 1/1/2020 date if they don't have an install date yet but have a delivery date
                     */
                    if ((typeof a.DtPopsInstallDate === 'undefined' || a.DtPopsInstallDate === '') && a.DtPopsDeliveryDate !== '') {
                        a = moment(a.DtPopsDeliveryDate).add(5, 'days').toISOString();
                    } else if (typeof a.DtPopsInstallDate === 'undefined' || a.DtPopsInstallDate === '') {
                        a = '2020-01-01 00:00:00';
                    } else {
                        a = a.DtPopsInstallDate;
                    }


                    if ((typeof b.DtPopsInstallDate === 'undefined' || b.DtPopsInstallDate === '') && b.DtPopsDeliveryDate !== '') {
                        b = moment(b.DtPopsDeliveryDate).add(5, 'days').toISOString();
                    } else if (typeof b.DtPopsInstallDate === 'undefined' || b.DtPopsInstallDate === '') {
                        b = '2020-01-01 00:00:00';
                    } else {
                        b = b.DtPopsInstallDate;
                    }

                    if (a > b) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    }

                    return 0;
                });
                return arr;
            };

            //Define Filtering
            var filter = function (arr) {
                var keepers = [];

                //First go through and fix the values so we only have to do it in one place:
                _.forEach(arr, function (store, index) {
                    //Create a calculated install date if there isn't one input as 5 days prior to go live
                    var installDate,
                        goLiveDate;

                    if (store.ProjectType !== 'POS Conversion' && store.InstallDate === '') {
                        installDate = moment(store.GoLiveDate).add(-5, 'days').startOf('day').toISOString();
                    } else if (store.ProjectType !== 'POS Conversion') {
                        installDate = moment(store.InstallDate).startOf('day').toISOString();
                    }

                    //Determine if it should be treated as a construction or a conversion project based on project type or if the delivery date is after the install date
                    if (store.ProjectType !== 'POS Conversion' && moment(store.DtPopsDeliveryDate).startOf('day').toISOString() <= installDate) {
                        //Treat these as construction projects, set Install date to store install date, go live to store go-live date, installer,
                        store.DtPopsInstallDate = installDate;
                        store.DtPopsInstaller = store.Installer;
                        goLiveDate = store.GoLiveDate;
                    } else {
                        store.ProjectType = 'Conversion';
                        store.GoLiveDate = moment(store.DtPopsInstallDate).add(1, 'days').toISOString();
                        store.ProjectType = 'Conversion';

                        if (store.DtPopsInstallDate === '' || typeof store.DtPopsInstallDate === 'undefined') {
                            goLiveDate = moment(store.DtPopsDeliveryDate).add(6, 'days').toISOString();
                        } else {
                            goLiveDate = store.GoLiveDate;
                        }
                    }

                    if (moment().toISOString() <= goLiveDate && store.ProjectType === 'Conversion') {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                routeCheck: routeCheck,
                filter: filter
            });

        }
    };
});