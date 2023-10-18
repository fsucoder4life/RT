define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Chronically_x0020_Ailing').EqualTo('Yes'),
                    CamlBuilder.Expression().TextField('Chronically_x0020_Ailing').EqualTo('Submitted'),
                    CamlBuilder.Expression().TextField('Chronically_x0020_Ailing').EqualTo('Approved')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'ProjectType', title: 'Project', transform: function (type, store, stores, storeIndex) {
                    if (typeof store.GoLiveDate !== 'undefined' && typeof store.PopsDeliveryDate !== 'undefined' && store.GoLiveDate !== '' && store.PopsDeliveryDate !== '') {
                        return 'POS & POPS';
                    }
                    if (typeof store.PopsDeliveryDate !== 'undefined' && store.PopsDeliveryDate !== '') {
                        return 'POPS';
                    }
                    if (typeof store.GoLiveDate !== 'undefined' && store.GoLiveDate !== '') {
                        return 'POS';
                    }
                }},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Installer', title: 'Installer'},
                {key: 'Pos', title: 'POS<br/>Vendor'},
                {key: 'SiteSurvey', title: 'Site<br/>Survey', transform: 'date'},
                {key: 'PopsDeliveryDate', title: 'POPS<br/>Delivery', transform: 'date'},
                {key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'RegionalVicePresident', title: 'RVP'},
                {key: 'ChronicallyAiling', title: 'Chronically<br/>Ailing', editable: true},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Chronically Ailing';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Pos.toUpperCase() === 'MICROS') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//                return arr;
//            };


            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
//                filter: filter,
                routeCheck: routeCheck
            });

        }
    };
});