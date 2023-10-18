define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                // CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({months: 4}).format('YYYY-MM-DD'))),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type', whiteSpace: 'nowrap'},
                {key: 'StoreNumber', title: 'No.', whiteSpace: 'nowrap'},
                {key: 'City', title: 'Location', whiteSpace: 'nowrap', transform: function (value, row, data, index) {
                    return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                }},
                {key: 'Installer', title: 'Installer', whiteSpace: 'nowrap'},
                {key: 'GroundLoopStatus', title: 'Loop<br/>Note', editable: true, whiteSpace: 'nowrap'},
                {key: 'AudioStatus', title: 'Quote<br/>Status', editable: true},
                {key: 'AudioVendorStatus', title: 'Vendor<br/>Status', editable: true},
                {key: 'AudioDeliveryDate', title: 'Delivery', editable: true, whiteSpace: 'nowrap'},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', whiteSpace: 'nowrap'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', whiteSpace: 'nowrap'},
                {key: 'Pos', title: 'Pos', whiteSpace: 'nowrap'},
                {key: 'FranchiseGroup', title: 'Franchisee', minWidth: '160px', whiteSpace: 'nowrap'},
                {key: 'ProjectManager', title: 'IT PM', minWidth: '120px', whiteSpace: 'nowrap'}
            ];

            //Define report title
            var title = 'HME - Upcoming Projects';

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
            } else if (typeof options.sort !== 'undefined' && options.sort === "InstallDate") {
                sort = function (arr) {
                    arr.sort(function (a, b) {
                        //Construction - sort by Audio delivery date, estimate it based on install/golive if so
                        (function () {
                            var goLive  = moment(a.GoLiveDate),
                                install = (a.InstallDate !== '' ? moment(a.InstallDate) : goLive.add(-10, 'days'));

                            //Make string comparable
                            a = install.toISOString();
                        })();

                        (function () {
                            var goLive  = moment(b.GoLiveDate),
                                install = (b.InstallDate !== '' ? moment(b.InstallDate) : goLive.add(-10, 'days'));

                            //Make string comparable
                            b = install.toISOString();
                        })();

                        if (a > b) {
                            return 1;
                        } else if (a < b) {
                            return -1;
                        }

                        return 0;
                    });
                    return arr;
                };
            }

            //Define Filtering
            var filter = function (arr) {
                var keepers = [];
                _.forEach(arr, function (store, index) {
                    //Verify it's an HME project and construction
                    if (store.AudioType.toUpperCase().indexOf('HME') !== -1 && store.ProjectType !== 'POS Conversion') {
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
                routeCheck: routeCheck,
                filter: filter,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});