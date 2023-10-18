define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck) {
            //Build query
            var query =
                "<Query></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'DmbQuantity', title: 'DMB<br/>Qty.', transform: 'number'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live<br/>Date', transform: 'date'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Digital Menu Boards - All Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.InsideDining.toUpperCase().indexOf('YES') !== -1) {
                        keepers.push(store);
                    }
                });

                return keepers;
            };


            //Show report
            report.render({
                constructionQuery: query,
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