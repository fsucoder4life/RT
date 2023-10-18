define(['app/view/report', 'app/rules/construction', 'app/email', 'app/widget/widgetHelper', 'app/rules/construction'], function (report, constructionRules, email, widgetHelper, rules) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment().add(-1, 'days').toISOString()),
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
                {key: 'StoreNumber', title: 'No.', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>" + value + "</a>";
                }},
                {key: 'Address', title: 'Address', width: "200px", transform: function (address, store, stores, index) {
                    return address + "<br/>" + store.City + ", " + store.State + " " + store.Zip
                }},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'PrimaryContact', title: 'POC'},
                {key: 'PrimaryPhone', width: '250px', title: 'POC<br/>Contact', transform: function (phone, store, stores, i) {
                    return '<div style="max-width: 250px; overflow: ">' + phone + "<br/>" + store.PrimaryEmail + '</div>';
                }},
                {key: 'HughesNotes', title: 'Notes', editable: true},
                {key: 'HughesTempStatus', title: '4G<br/>Status', editable: true},
                {key: 'HughesTempDate', title: '4G<br/>Date', editable: true},
                {key: 'HughesPrimaryStatus', title: 'Primary<br/>Status', editable: true},
                {key: 'HughesPrimaryDate', title: 'Primary<br/>Date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                // {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'ProjectManager', title: 'IT PM'}
            ];

            //Define report title
            var title = 'Comcast - Primary Installs';


            //Define sorting - optional sort by install date by parameter
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
            
            function filter (stores) {
              var keepers = [];
              _.each(stores, function (store) {
                if (store.HughesPrimaryStatus.toUpperCase().indexOf('COMPLETE') === -1 && store.HughesPrimaryStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                  keepers.push(store);
                }
              });
              
              return keepers;
            }

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
                // filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});