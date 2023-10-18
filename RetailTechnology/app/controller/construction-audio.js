define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
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
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'AudioType', title: 'Type', editable: true, minWidth: '100px'},
                {key: 'GroundLoopStatus', title: 'Loop<br/>Note', editable: true, minWidth: '100px'},
                {key: 'AudioStatus', title: 'Quote<br/>Status', editable: true, minWidth: '175px'},
                {key: 'AudioConfiguration', title: 'Config', editable: true, minWidth: '175px'},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', transform: 'date', editable: true, minWidth: '100px'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Construction Projects - Audio';

            //Define sorting
//            var sort = {
//                key: 'InstallDate',
//                direction: 'DESC'
//            };
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    if ( (typeof a.InstallDate === 'undefined' || a.InstallDate === '') && typeof a.GoLiveDate !== 'undefined') {
                        a = moment(a.GoLiveDate).add(-10, 'days').toISOString();
                    } else {
                        a = a.InstallDate;
                    }
                    if ( (typeof b.InstallDate === 'undefined' || b.InstallDate === '') && typeof b.GoLiveDate !== 'undefined') {
                        b = moment(b.GoLiveDate).add(-10, 'days').toISOString();
                    } else {
                        b = b.InstallDate;
                    }

                    if (a > b) {
                        return 1;
                    } else if (a < b) {
                        return -1;
                    }

                    return 0;
                });
                return arr;
            };

            //Define Filtering
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.AudioType.toUpperCase().indexOf('HME') !== -1) {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };

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
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
//                filter: filter
            });

        }
    };
});