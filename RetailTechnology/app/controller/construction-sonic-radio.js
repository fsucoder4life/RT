define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment().toISOString()),
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
                {key: 'Pos', title: 'POS'},
                {key: 'SonicRadioStatus', title: 'Status', editable: true, minWidth: '150px'},
                {key: 'SonicRadioOutdoorSpeakerCount', title: 'Outdoor<br/>Speakers', editable: true},
                {key: 'SonicRadioOutdoorSpeakerColor', title: 'Outdoor<br/>Color', editable: true},
                {key: 'SonicRadioCeilingSpeakerCount', title: 'Ceiling<br/>Speakers', editable: true},
                {key: 'SonicRadioZoneCount', title: 'Zone<br/>Controls', editable: true},
                {key: 'SonicRadioRackCount', title: 'Server<br/>Racks', editable: true},
                {key: 'SonicRadioDeliveryDate', title: 'Deliery<br/>Date', transform: 'date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                {key: 'Installer', title: 'Installer', editable: true},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Construction Installers  - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define passed sorting values
            if (typeof options.sort !== 'undefined') {
                sort.key = options.sort;
            }
            //Custom sort for install date
            if (typeof options.sort !== 'undefined' && options.sort === "InstallDate") {
                sort = function (arr) {
                    arr.sort(function (a, b) {
                        //Create a fake date of 10 days before openig if it doesn't exists
                        if (a.InstallDate === '') {
                            a = moment(a.GoLiveDate).add(-10, 'days').toISOString();
                        } else {
                            a = a.InstallDate;
                        }

                        if (b.InstallDate === '') {
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
                }
            }

            //Define filtering - remove stores after both signoffs and project are complete
            var filter = function (arr) {
                // var keepers = [];
                // // _.forEach(arr, function (store, index) {
                // //     console.log(store.StoreNumber, (typeof store.ProjectStatus !== 'undefined' ? store.ProjectStatus : 'ERROR'));
                // // });
                // _.forEach(arr, function (store, index) {
                //     if (store.ProjectStatus.toUpperCase().indexOf('COMPLETE') === -1 || store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') === -1) {
                //         keepers.push(store);
                //     }
                // });
                //
                // return keepers;
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
                // filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});