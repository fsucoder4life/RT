define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo('2017-09-01'),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThan('2019-01-01'),
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
{key: 'ProjectType', title: 'Install Type', transform: function (value, row, data, index) {
                    return "Construction*"
                }},
                {key: 'StoreNumber', title: 'No.'},
				{key: 'Address', title: 'Address'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
				{key: 'AudioType', title: 'Audio'},
                {key: 'Pos', title: 'POS'},
                {key: 'Installer', title: 'Installer'},
                {key: 'InstallDate', title: 'Install Start<br />Date', transform: 'date' },             
                {key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date'},
				{key: 'Classification', title: 'Type'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
				{key: 'ProjectType', title: 'Details'},
                {key: 'ProjectManager', title: 'IT PM'}

            ];

            //Define report title
            var title = 'Upcoming Construction Schedule';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Pos.toUpperCase() === 'MICROS') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
                return arr;
            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

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