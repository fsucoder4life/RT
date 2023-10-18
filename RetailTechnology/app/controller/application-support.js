define(['app/view/report'], function (report) {
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
                {key: 'PosConfigDate', title: 'POS CAL<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'RegionalVicePresident', title: 'RVP'},
                {key: 'MarketLeader', title: 'ML'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'ConstructionManager', title: 'Construction<br/>PM'},
                {key: 'StoreNumber', title: 'MyMicros', transform: function (value, row, data, index) {
                    if (index < 10)
                        return ["In Progress", "On Hold", "Complete", ''][parseInt(Math.random() * 4)];
                    else
                        return '';
                }},
                {key: 'StoreNumber', title: 'Polling<br/>Activation', transform: function (value, row, data, index) {
                    if (index < 10)
                        return ["In Progress", "On Hold", "Complete", ''][parseInt(Math.random() * 4)];
                    else
                        return '';
                }},
                {key: 'StoreNumber', title: 'Analytics<br/>Activation', transform: function (value, row, data, index) {
                    if (index < 10)
                        return ["In Progress", "On Hold", "Complete", ''][parseInt(Math.random() * 4)];
                    else
                        return '';
                }},
                {key: 'StoreNumber', title: 'EM<br/>Toolset', transform: function (value, row, data, index) {
                    if (index < 10)
                        return ["In Progress", "On Hold", "Complete", ''][parseInt(Math.random() * 4)];
                    else
                        return '';
                }},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Application Support - Upcoming Projects';

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
//            };


            //Load combined data
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