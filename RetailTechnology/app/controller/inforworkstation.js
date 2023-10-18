define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                
                CamlBuilder.Expression().TextField('POS_x0020_Selection').EqualTo('Infor')
                
            ).OrderByDesc('Project_x0020_Type');

            query = "<Query>" + query.ToString() + "</Query>";

            
            //Define Report Columns
            var columns = [
                {key: 'ProjectType', whiteSpace: 'nowrap', title: 'Type'},
                {key: 'StoreNumber', title: 'Details'},
                {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }
                },
                { key: 'InforWorkstationHDDDelivery', title: 'Infor Workstation<br />HDD Delivery', whiteSpace: 'nowrap', transform: 'date', editable: true },
                { key: 'InforWorkstationHDDGoLive', title: 'Infor Workstation<br />HDD Go-Live', whiteSpace: 'nowrap', transform: 'date', editable: true },
                {key: 'AudioType', title: 'Audio<br/>Type', whiteSpace: 'break-all', editable: true, minWidth: '70px'},
                {key: 'AudioStatus', title: 'Audio<br/>Status', editable: true, minWidth: '150px'},
                {key: 'PosStatus', title: 'POS<br/>Status', minWidth: '150px', editable: true},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', whiteSpace: 'nowrap', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'PosDeliveryDate', title: 'POS<br/>Delivery', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosConfigDate', title: 'POS CAL<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosTechnician', title: 'POS<br/>Tech', whiteSpace: 'nowrap', editable: true},
                {key: 'Installer', title: 'Installer', whiteSpace: 'break-all', minWidth: '55px', editable: true},
                {key: 'LeadTechnician', title: 'Install<br/>Tech', whiteSpace: 'nowrap', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectManager', title: 'IT PM', minWidth: '120px', whiteSpace: 'nowrap'}
            ];

            //Define report title
            var title = 'Infor - Workstation - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if (store.Pos.toUpperCase() === 'INFOR' && (store.InforWorkstationHDDDelivery || store.InforWorkstationHDDGoLive)) {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
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
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});