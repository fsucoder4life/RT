define(['app/store/combined', 'app/view/report', 'app/rules/construction', 'app/email'], function (combined, report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query - this is everything so...
            // var query = new CamlBuilder().Where().All(
            //     CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
            //     CamlBuilder.Expression().TextField('POS_x0020_Selection').EqualTo('Micros'),
            //     CamlBuilder.Expression().Any(
            //         CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
            //         CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
            //         CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
            //         CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
            //     )
            // ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', whiteSpace: 'nowrap', title: 'Type'},
                {key: 'StoreNumber', title: 'Details'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'AudioType', title: 'Audio<br/>Type', whiteSpace: 'break-all', editable: true, minWidth: '70px'},
                {key: 'AudioStatus', title: 'Audio<br/>Status', editable: true, minWidth: '150px'},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', whiteSpace: 'nowrap', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'PosVendorSupportDate', title: 'Support', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'Installer', title: 'Installer', whiteSpace: 'break-all', minWidth: '55px', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectManager', title: 'IT PM', minWidth: '120px', whiteSpace: 'nowrap'}
            ];

            //Define report title
            var title = 'Micros - All Projects Historical & Future';

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
                dataStore: combined,
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