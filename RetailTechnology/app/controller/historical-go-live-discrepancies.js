define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
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
                {key: 'StoreNumber', title: 'Details'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'ProjectManager', title: 'IT PM', editable: true, minWidth: '100px'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'GroundBreakDate', title: 'Ground<br/>Break', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'InitialCallDate', title: 'Initial Call', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'InitialInstallDate', title: 'Initial<br/>Install', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'InitialGoLiveDate', title: 'Initial<br/>Go-Live', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'GoLiveDate', title: 'Go Live', transform: 'date', editable: true, minWidth: '100px'},
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