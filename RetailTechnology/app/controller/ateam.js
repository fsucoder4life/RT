define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment().add(-10, 'days').toISOString()),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS', minWidth: '100px'},
                {key: 'AudioType', title: 'Audio<br/>Type', minWidth: '100px'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'PosConfigDate', title: 'POS CAL<br/>Date', transform: 'date'},
                {key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'Installer', title: 'Installer'},
                {key: 'Trainer', title: 'Trainer', editable: true},
                {key: 'ATeamStatus', title: 'A-Team', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', editable: true},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'A-Team Status - New Stores - Upcoming Projects';

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


            //Load combined data
            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck
            });

        }
    };
});