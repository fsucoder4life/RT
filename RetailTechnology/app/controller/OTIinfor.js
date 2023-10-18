define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                //CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                //CamlBuilder.Expression().TextField('POS_x0020_Selection').EqualTo('Infor'),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('OTI')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', whiteSpace: 'nowrap', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'Location', whiteSpace: 'nowrap', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                { key: 'InforServerHDDUpgradesServerType', title: 'Infor Server and HDD Upgrades-Server Type', whiteSpace: 'nowrap' },
                { key: 'InforServerHDDUpgradesOrdered', title: 'Infor Server and HDD Upgrades-Ordered', whiteSpace: 'nowrap' },
                { key: 'InforServerHDDUpgradesDelivered', title: 'Infor Server and HDD Upgrades-Delivered', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforServerHDDUpgradesGoLive', title: 'Infor Server and HDD Upgrades-Go-Live', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforServerHDDUpgradesHDDType', title: 'Infor Server and HDD Upgrades-HDD Type', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforServerHDDUpgradesHDDOrdered', title: 'Infor Server and HDD Upgrades-HDD Ordered', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforServerHDDUpgradesHDDDelivered', title: 'Infor Server and HDD Upgrades-HDD Delivered', whiteSpace: 'nowrap' },
                { key: 'InforServerHDDUpgradesHDDGoLive', title: 'Infor Server and HDD Upgrades-HDD Go-Live', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforServerHDDUpgradesHDDProjectManager', title: 'Infor Server and HDD Upgrades-HDD Project Manager', whiteSpace: 'nowrap' },
                { key: 'InforTerminalUpgradesNumOfTerminals', title: 'Infor Terminal Upgrades-Num Of Terminals', whiteSpace: 'nowrap' },
                { key: 'InforTerminalUpgradesNumUpgraded', title: 'Infor Terminal Upgrades-Num Upgraded', whiteSpace: 'nowrap' },
                { key: 'InforTerminalUpgradesOrdered', title: 'Infor Terminal Upgrades-Ordered', whiteSpace: 'nowrap' },
                { key: 'InforTerminalUpgradesDelivery', title: 'Infor Terminal Upgrades-Delivery', whiteSpace: 'nowrap' },
                { key: 'InforTerminalUpgradesGoLive', title: 'Infor Terminal Upgrades-Go-Live', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'InforTerminalUpgradesProjectManager', title: 'Infor Terminal Upgrades-Project Manager', whiteSpace: 'nowrap' }
            ];

            //Define report title
            var title = 'OTI Infor - Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    
                        keepers.push(store);
                    
                });

                return keepers;
            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

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