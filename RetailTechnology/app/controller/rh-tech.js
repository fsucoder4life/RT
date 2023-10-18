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
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS'},
                {key: 'DriveThruFormat', title: 'Drive<br/>Thru'},
                {key: 'InsideDining', title: 'Inside<br/>Dining'},
                {key: 'SpeakerReceiverStatus', title: 'Music<br/>Required'},
                {key: 'Ocb', title: 'OCB'},
                {key: 'InstallationStatus', title: 'Install<br/>Status'},
                {key: 'KitchenInstallDate', title: 'Kitchen<br/>Install', transform: 'date'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'RH Tech - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.Installer.toUpperCase().indexOf('RH TECH') !== -1) {
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