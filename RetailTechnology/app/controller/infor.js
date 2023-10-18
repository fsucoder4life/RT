define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().TextField('POS_x0020_Selection').EqualTo('Infor'),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
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
                {key: 'EnterpriseManagementStatus', title: 'Questionnaire<br/>Status', whiteSpace: 'nowrap', editable: true},
                {key: 'PosStatus', title: 'POS<br/>Status', whiteSpace: 'nowrap', editable: true},
                {key: 'PosDeliveryDate', title: 'Delivery<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', whiteSpace: 'nowrap', transform: 'date', editable: true},
                {key: 'PosTechnician', title: 'POS<br/>Tech', whiteSpace: 'nowrap', editable: true},
                {key: 'Installer', title: 'Installer', whiteSpace: 'nowrap', editable: true},
                {key: 'LeadTechnician', title: 'Install<br/>Tech', whiteSpace: 'nowrap', editable: true},
                {key: 'FranchiseGroup', title: 'Franchisee', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectManager', title: 'IT PM', whiteSpace: 'nowrap'}
            ];

            //Define report title
            var title = 'Infor - Upcoming Projects';

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