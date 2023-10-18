define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where()
                .DateField('Site_x0020_Surveys_x0020_POPS').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
                .OrderByDesc('Site_x0020_Surveys_x0020_POPS');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'SiteSurvey', title: 'Survey<br/>Date', transform: 'date'},
                {key: 'Installer', title: 'Installer'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Site Surveys - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'SiteSurvey',
                direction: 'DESC'
            };

            //Define filtering
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Installer.toUpperCase().indexOf('IST') !== -1) {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };


            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
//                filter: filter,
                routeCheck: routeCheck
            });

        }
    };
});