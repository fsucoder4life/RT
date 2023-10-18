define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                ),
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                    CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThan('2020-01-01')
                ),
                CamlBuilder.Expression().TextField('DT_x0020_POPS_x0020_Quantity').NotEqualTo('0'),
                CamlBuilder.Expression().TextField('DT_x0020_POPS_x0020_Quantity').NotEqualTo('')
            );

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type', whiteSpace: 'nowrap'},
                {key: 'StoreNumber', title: 'No.', whiteSpace: 'nowrap'},
                {key: 'City', title: 'City', whiteSpace: 'nowrap'},
                {key: 'State', title: 'State', whiteSpace: 'nowrap'},
                {key: 'Installer', title: 'Installer', whiteSpace: 'nowrap', editable: true},
                {key: 'DtPopsStatus', title: 'Status', editable: true, whiteSpace: 'nowrap'},
                {key: 'DtPopsQuantity', title: 'Qty.', editable: true, whiteSpace: 'nowrap'},
                {key: 'InstallDate', title: 'Install<br/>Date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'DT POPS - Upcoming Construction Projects';

            //Define sorting
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    /**
                     * Sort conversions by dt pops install date, others by install date or calculated install date
                     */
                    if (a.ProjectType === 'POS Conversion') {
                        if (typeof a.DtPopsInstallDate === 'undefined' || a.DtPopsInstallDate === '') {
                            a = '2020-01-01 00:00:00';
                        } else {
                            a = a.DtPopsInstallDate;
                            console.log(a.DtPopsInstallDate);
                        }
                    } else {
                        if (typeof a.InstallDate === 'undefined' || a.InstallDate === '') {
                        } else {
                            a = a.InstallDate;
                        }
                    }

                    if (b.ProjectType === 'POS Conversion') {
                        if (typeof b.DtPopsInstallDate === 'undefined' || b.DtPopsInstallDate === '') {
                            b = '2020-01-01 00:00:00';
                        } else {
                            b = b.DtPopsInstallDate;
                        }
                    } else {
                        if (typeof b.InstallDate === 'undefined' || b.InstallDate === '') {
                            b = moment(b.GoLiveDate).add(-10, 'days').toISOString();
                        } else {
                            b = b.InstallDate;
                        }
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
                _.forEach(arr, function (store, index) {
                    //Verify it has DT POPS
                    if (store.DtPopsQuantity !== '' && store.DtPopsQuantity !== '0') {
                        //Verify it's in scope for conversions
                        if (store.ProjectType === 'POS Conversion' && store.DtPopsInstallDate >= moment().format('YYYY-MM-DD')) {
                            keepers.push(store);
                        } else if (store.GoLiveDate >= moment().format('YYYY-MM-DD')) {
                            keepers.push(store);
                        }
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