define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
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
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS'},
                {key: 'DriveThruFormat', title: 'Drive-Thru'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'Installer', title: 'Installer'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Upcoming Counter Service Stores';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.InsideDining && store.InsideDining.toUpperCase() === 'YES' ) {
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