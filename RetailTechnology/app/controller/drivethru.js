define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo('2005-01-01')
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
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'Installer', title: 'Installer'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Drive-Thru Stores';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                debugger;
                _.forEach(arr, function (store, index) {
                    // if (store.DriveThruFormat && (store.DriveThruFormat.toUpperCase().indexOf('SINGLE') >= 0 || store.DriveThruFormat.toUpperCase().indexOf('DOUBLE') >= 0)/* && (store.Ocb === "" || store.Ocb == "No")*/) {
                    if (store.DriveThruFormat && (store.DriveThruFormat.toUpperCase().indexOf('DOUBLE') >= 0)/* && (store.Ocb === "" || store.Ocb == "No")*/) {
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