define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo('2016-03-24T00:00:00.000Z'),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({weeks: 4}).format('YYYY-MM-DD'))),
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
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'StoreNumber', title: 'Details', whiteSpace: 'nowrap', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>" + row.City + ", " + row.State + "</a>"
                }},
                {key: 'Pos', title: 'POS'},
                {key: 'InstallationStatus', title: 'Install<br/>Status', whiteSpace: 'nowrap', editable: true},
                {key: 'InstallSignoffStatus', title: 'Signoffs', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectStatus', title: 'Project<br/>Status', whiteSpace: 'nowrap', editable: true},
                {key: 'OvernightInstall', title: 'Install<br/>Time', whiteSpace: 'nowrap', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                {key: 'Installer', title: 'Installer', whiteSpace: 'nowrap', editable: true},
                {key: 'ProjectManager', title: 'IT PM', whiteSpace: 'nowrap'},
                {key: 'OldNotes', title: 'Notes', editable: true}

            ];

            //Define report title
            var title = 'Construction - Post Install Issues';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering - remove stores after both signoffs and project are complete
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    if ((store.ProjectStatus.toUpperCase().indexOf('COMPLETE') !== 0 || (store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== 0 && store.InstallSignoffStatus.toUpperCase().indexOf('FAILURE TO SUBMIT') !== 0)) && store.InstallDate < moment().toISOString()) {
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