define(['app/view/project-review/report', 'app/rules/construction'], function (report, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
            //Make sure options is an object
            options = options || {};

            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({months: 4}).format('YYYY-MM-DD'))),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            query = "<Query>" + query.ToString() + "</Query>";

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

            //Define filtering
            var filter = function (arr) {
                var keepers = [];

                _.forEach(arr, function (store, index) {
                    //Check to see if ITPM matches if passed, that signoffs haven't been submitted and the project status is not complete
                    var itpm = (typeof options.itpm === 'undefined' ? true : store.ProjectManager.toUpperCase().indexOf(options.itpm.toUpperCase()) !== -1),
                        notComplete = store.ProjectStatus.toUpperCase().indexOf('COMPLETE') === -1,
                        noSignoffs = store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== 0 && store.InstallSignoffStatus.toUpperCase().indexOf('FAILURE TO SUBMIT') !== 0,
                        noTestTransactions = (store.TestTransactionStatus.toUpperCase().indexOf('YES') === -1 && store.TestTransactionStatus.toUpperCase().indexOf('N/A') === -1) && moment(store.GoLiveDate).diff(moment('2017-07-31'), 'days') > 30,
                        noInstallEndDate = store.InstallEndDate === '' && moment(store.GoLiveDate).diff(moment('2017-07-31'), 'days') > 30;

                    if (itpm && (notComplete || noSignoffs || noTestTransactions || noInstallEndDate)) {
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            function afterRender (view) {
                //Expand the first row
                view.el.find('.expander').first().trigger('click');

                //Go through each row of the table and run rules on only that target/store info
                _.forEach(view.stores, function (store, storeIndex) {
                    //Grab the row el
                    var $el = $(view.el).find('#number' + store.StoreNumber);
                    //Call the helper function for that target
                    constructionRules.helper($el, store);
                });
            }

            //Show report
            report.render({
                afterChange: constructionRules.tableChangeHelper,
                combinedQuery: query,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender
            });

        }
    };
});