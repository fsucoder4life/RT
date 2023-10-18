define(['app/view/report', 'app/store/combined'], function (report, combined) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query =
                "<Query><Where><And>" +
                    '<Geq><FieldRef Name="GO_x0020_LIVE_x0020_DATE" /><Value Type="DateTime"><Today /></Value></Geq>' +
                    '<And>' +
                        '<Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">POS Conversion</Value></Eq>' +
                        '<And>' +
                            '<Contains><FieldRef Name="POS_x0020_Selection" /><Value Type="Text">Micros</Value></Contains>' +
                            '<Neq><FieldRef Name="GO_x0020_LIVE_x0020_DATE" /><Value Type="DateTime">2020-01-01</Value></Neq    >' +
                        '</And>' +
                    '</And>' +
                "</And></Where><OrderBy><FieldRef Name='Store_x0020_Number_x003a_Store_x' Ascending='False' /></OrderBy></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'SiteSurveyTimeframe', title: 'Site-Survey<br/>Timeframe', editable: true},
                {key: 'SiteSurvey', title: 'Site-Survey', editable: true},
                {key: 'PosPreCableDate', title: 'Pre-Cable', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', editable: true},
                {key: 'PopsDeliveryDate', title: 'Pops<br/>Delivery', editable: true},
                {key: 'Installer', title: 'Installer', editable: true},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Micros - Conversions - Upcoming Projects';

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