define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/rules/construction'], function (report, combined, construction, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            query = "<Query>" + query + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Installer', title: 'Installer'},
                {key: 'Pos', title: 'POS<br/>Vendor'},
                {key: 'PosDeliveryDate', title: 'POS<br/>Delivery', transform: 'date'},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', transform: 'date'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'RegionalVicePresident', title: 'RVP'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Construction - All';

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


            //Show report
            report.render({
                constructionQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck,
                callback: constructionRules.tableHelper,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});