define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment('2015-09-01').toISOString()),
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
                {key: 'ProjectStatus', title: 'Project<br/>Status', editable: true},
                {key: 'MerchantId', title: 'Merchant ID', editable: true},
                {key: 'ServerEps', title: 'ServerEPS', editable: true},
                {key: 'CirronetStatus', title: 'POS Data', editable: true},
                {key: 'PaysType', title: 'Pays<br/>Type', editable: true},
                {key: 'PaysQuantity', title: 'Pays<br/>Qty.', editable: true},
                {key: 'PaysDeliveryDate', title: 'Delivery<br/>Date.', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'FranchiseGroup', title: 'Franchisee'}
            ];

            //Define report title
            var title = 'PAYS - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define Filtering TODO - This is a hack!!!! - remove after the lightbox projects
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.PaysStatus.toUpperCase() !== 'NOT REQUIRED') {
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