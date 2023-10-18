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
                { key: 'OracleServerUpgradeServerType', title: 'Oracle Server Upgrade-Server Type', whiteSpace: 'nowrap' },
                { key: 'OracleServerUpgradeOrdered', title: 'Oracle Server Upgrade-Ordered', whiteSpace: 'nowrap' },
                { key: 'OracleServerUpgradeDelivery', title: 'Oracle Server Upgrade-Delivery', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'OracleServerUpgradeGoLive', title: 'Oracle Server Upgrade-Go-Live', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'OracleServerUpgradeInstaller', title: 'Oracle Server Upgrade-Installer', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'OracleServerUpgradeSerialNum', title: 'Oracle Server Upgrade-Serial #', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'OracleServerUpgradeWindowsUpgrade', title: 'Oracle Server Upgrade-Windows Upgrade', whiteSpace: 'nowrap' },
                { key: 'OracleServerUpgradeGoLive2', title: 'Oracle Server Upgrade-Go-Live', whiteSpace: 'nowrap', transform: 'date' },
                { key: 'OracleServerUpgradePM', title: 'Oracle Server Upgrade-Project Manager', whiteSpace: 'nowrap' }
                
            ];

            //Define report title
            var title = 'OTI Oracle - Projects';

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