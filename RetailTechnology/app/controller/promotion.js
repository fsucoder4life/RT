define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query =
                "<Query><Where>" +
                '<Geq><FieldRef Name="Store_x0020_Number_x003a_Store_x" /><Value Type="DateTime"><Today /></Value></Geq>' +
                "</Where><OrderBy><FieldRef Name='Store_x0020_Number_x003a_Store_x' Ascending='False' /></OrderBy></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'ProjectStatus', title: 'Project<br/>Status', editable: true},
                {key: 'MorningDrinkStopTime', title: 'Drink Stop<br/>Time', editable: true},
                {key: 'DmbContentCreated', title: 'Content<br/>Created', editable: true},
                {key: 'DmbTvStatus', title: 'Status', editable: true},
                {key: 'DmbQuantity', title: 'DMB<br/>Qty.', editable: true},
                {key: 'TvQuantity', title: 'TV<br/>Quantity', editable: true},
                {key: 'DmbTvDeliveryDate', title: 'Delivery<br/>Date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', editable: true},
                {key: 'ProjectManager', title: 'IT PM'}
            ];

            //Define report title
            var title = 'Digital Menu Boards - Upcoming Projects';

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

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
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
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});