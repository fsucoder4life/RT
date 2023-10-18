define(['app/store/combined', 'app/view/report', 'app/rules/construction', 'app/email'], function (combined, report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            // Build query - this is everything so...
            var query = new CamlBuilder().Where().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment().add(-1, 'month').toISOString()).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', whiteSpace: 'nowrap', title: 'Type'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                  return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.StoreNumber + "</a>";
                }},
                {key: 'Address', title: 'Address', whiteSpace: 'nowrap', editable: true},
                {key: 'City', title: 'City', whiteSpace: 'nowrap', editable: true},
                {key: 'State', title: 'Stae', whiteSpace: 'nowrap', editable: true},
                {key: 'Zip', title: 'Zip', whiteSpace: 'nowrap', editable: true},
                {key: 'Pos', title: 'POS<br/>Type', whiteSpace: 'nowrap', editable: true},
                {key: 'OrdermaticPosVersion', title: 'OMC POS<br/>Type', whiteSpace: 'nowrap', editable: true},
                {key: 'AudioType', title: 'Audio<br/>Type', whiteSpace: 'break-all', editable: true, minWidth: '70px'},
                {key: 'AudioStatus', title: 'Audio<br/>Status', editable: true, minWidth: '150px'},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', whiteSpace: 'nowrap', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'PosConfigDate', title: 'CAL', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosVendorSupportDate', title: 'Support', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'Installer', title: 'Installer', whiteSpace: 'break-all', minWidth: '55px', editable: true},
                {key: 'MarketStartDate', title: 'Market Start Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'DMA', title: 'DMA', editable: true},
                {key: 'TotalStalls', title: 'Total POPS', whiteSpace: 'nowrap'},
                {key: 'FranchiseGroup', title: 'Franchisee', whiteSpace: 'nowrap', editable: true},
                {key: 'Classification', title: 'SRI/SII', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectManager', title: 'IT PM', minWidth: '120px', whiteSpace: 'nowrap'}
            ];

            //Define report title
            var title = 'Combined Schedule - Upcoming';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            // var filter = function (arr) {
            //     var keepers = [];
            //     _.forEach(arr, function (store, index) {
            //         if (store.Pos.toUpperCase() !== 'INFOR') {
            //             keepers.push(store);
            //         }
            //     });
            //
            //     return keepers;
            // };

            var afterRender = function (view) {
                // constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

            //Load combined data
            //Show report
            report.render({
                query: query,
                dataStore: combined,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                // filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});