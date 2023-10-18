define(['app/view/report', 'app/store/combined'], function (report, combined) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query =
                "<Query><Where><And>" +
                    '<Geq><FieldRef Name="GO_x0020_LIVE_x0020_DATE" /><Value Type="DateTime"><Today /></Value></Geq>' +
                    '<And>' +
                        '<Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">POS Conversion</Value></Eq>' +
                        '<Contains><FieldRef Name="POS_x0020_Selection" /><Value Type="Text">Infor</Value></Contains>' +
                    '</And>' +
                "</And></Where><OrderBy><FieldRef Name='Store_x0020_Number_x003a_Store_x' Ascending='False' /></OrderBy></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'PosPreCableDate', title: 'Pre-Cable', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', editable: true},
                {key: 'Installer', title: 'POS Installer', editable: true},
                {key: 'PopsDeliveryDate', title: 'Pops Delivery<br>Date', editable: true},
                {key: 'PopsInstaller', title: 'POPS Installer', editable: true},
                {key: 'ProjectManager', title: 'IT PM', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', whiteSpace: 'nowrap', editable: true},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Infor - Conversions - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.Pos.toUpperCase() === 'INFOR') {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            //Load combined data
            combined.loadData({combinedQuery: query}, function (data) {
                //Show report
                report.render({
                    data: data,
                    columns: columns,
                    title: title,
                    target: target,
                    sort: sort,
                    filter: filter,
                    routeCheck: routeCheck
                });
            });
        }
    };
});