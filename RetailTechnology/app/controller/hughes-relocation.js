define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({months: 3}).format('YYYY-MM-DD'))),
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation')
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'HughesTempDate', title: 'Comcast Install<br/>Date', transform: 'date'},
                {key: 'InstallDate', title: 'IP Relocation<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Comcast - Relocation Projects';

            //Define sorting
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    if (a.InstallDate === '') {
                        a = moment(a.GoLiveDate).add(-10, 'days').toISOString();
                    } else {
                        a = a.InstallDate;
                    }

                    if (b.InstallDate === '') {
                        b = moment(b.GoLiveDate).add(-10, 'days').toISOString();
                    } else {
                        b = b.InstallDate;
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
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.InsideDining.toUpperCase() === 'YES') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };

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
//                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});