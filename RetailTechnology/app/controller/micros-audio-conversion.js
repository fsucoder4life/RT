define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('Audio_x0020_Go_x0020_Live_x0020_').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().TextField('Audio_x0020_Type').EqualTo('Micros'),
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'StoreNumber', title: 'Details'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'AudioStatus', title: 'Status', editable: true, minWidth: '175px'},
                {key: 'AudioSiteSurveyDate', title: 'Survey<br/>Date', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'AudioDeliveryDate', title: 'Delivery<br/>Date', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'AudioInstallDate', title: 'Install<br/>Date', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'AudioGoLiveDate', title: 'Go-Live<br/>Date', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'AudioInstaller', title: 'Installer', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', editable: true}
            ];

            //Define report title
            var title = 'Micros - Construction - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
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
                // constructionRules.tableHelper(view);

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