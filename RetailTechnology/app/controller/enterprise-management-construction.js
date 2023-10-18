define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().TextField('POS_x0020_Selection').EqualTo('Micros'),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'AudioType', title: 'Audio<br/>Type', editable: true},
                {key: 'DriveThruFormat', title: 'DT<br/>Lanes', editable: true},
                {key: 'EnterpriseManagementStatus', title: 'EM-Status', editable: true},
                {key: 'PosDeliveryDate', title: 'Delivery<br/>Date', transform: 'date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', editable: true},
                {key: 'PosConfigDate', title: 'EM/POS<br/>CAL Date', transform: 'date', editable: true},
                {key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', editable: true}
            ];

            //Define report title
            var title = 'Enterprise Management - Construction - Upcoming Projects';

            //Define sorting
            //Define sorting
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    if (typeof a.PosConfigDate === 'undefined' || a.PosConfigDate === '') {
                        if (typeof a.InstallDate === 'undefined' || a.InstallDate === '') {
                            a = moment(a.GoLiveDate).add(-6, 'days').toISOString();
                        } else {
                            a = moment(a.InstallDate).add(4, 'days').toISOString();
                        }
                    } else {
                        a = a.PosConfigDate;
                    }

                    if (typeof b.PosConfigDate === 'undefined' || b.PosConfigDate === '') {
                        if (typeof b.InstallDate === 'undefined' || b.InstallDate === '') {
                            b = moment(b.GoLiveDate).add(-6, 'days').toISOString();
                        } else {
                            b = moment(b.InstallDate).add(4, 'days').toISOString();
                        }
                    } else {
                        b = b.PosConfigDate;
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

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.Pos.toUpperCase() === 'MICROS') {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

            //Load combined data
            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});