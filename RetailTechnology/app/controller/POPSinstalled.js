define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThan('2020-01-01'),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
                )
            ).OrderByDesc('POPS_x0020_Delivery_x0020_Date');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Installer', title: 'Installer'},
                {key: 'Pos', title: 'POS<br/>Vendor'},
                { key: 'PopsDeliveryDate', title: 'POPS Delivery<br />Date', transform: 'date' },
                
                {key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date'},
                {key: 'FranchiseGroup', title: 'Franchisee', editable: true},
                {key: 'SeniorVicePresident', title: 'SVP', editable: true},
                {key: 'RegionalVicePresident', title: 'RVP', editable: true},
                {key: 'MarketLeader', title: 'ML'},
                {key: 'ConstructionManager', title: 'CM', editable: true},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Future POPS Installations';

            //Define sorting
            var sort = {
                key: 'PopsDeliveryDate',
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