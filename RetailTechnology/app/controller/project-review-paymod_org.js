define(['app/view/project-review-paymod/report', 'app/rules/construction'], function (report, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
            //Make sure options is an object
            options = options || {};

            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo('2016-04-01T05:00:00.000Z'),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({ months: 4 }).format('YYYY-MM-DD'))),
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

            function afterRender(view) {
                //Expand the first row

                view.el.find('.expander').first().trigger('click');

                view.el.find('#expandAll').click(function () {
                    //view.el.find('.expander').trigger('click');
                    view.el.find('.row-summary').hide();
                    view.el.find('.row-details').show();
                    view.el.find('tr').css('height', '150px');
                    view.el.find('td:nth-child(1)').css('height', '138px');
                    //Swap the plus/minus
                    view.el.find('i.fa-plus-circle').removeClass('fa-plus-circle').addClass('fa-minus-circle');
                });

                view.el.find('#collapseAll').click(function () {
                    //view.el.find('.expander').trigger('click');
                    view.el.find('.row-summary').show();
                    view.el.find('.row-details').hide();
                    view.el.find('tr').css('height', '');
                    view.el.find('td:nth-child(1)').css('height', '');
                    //Swap the plus/minus
                    view.el.find('i.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
                });

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
                routeCheck: routeCheck,
                callback: afterRender
            });

        }
    };
});