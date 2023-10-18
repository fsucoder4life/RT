define(['app/view/report', 'app/rules/construction', 'app/email', 'app/widget/widgetHelper', 'app/rules/construction'], function (report, constructionRules, email, widgetHelper, rules) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
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
            var topLeftStyle = "width: 87px; box-shadow: none; border: none; border-right: 1px solid #e8e8e8; background-color: inherit;",
                topRightStyle = "width: 86px; box-shadow: none; border: none; background-color: inherit;",
                bottomStyle = "width: 174px; box-shadow: none; border: none; border-top: 1px solid #e8e8e8; background-color: inherit;";
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>" + value + "</a>";
                }},
                {key: 'Address', title: 'Address', minWidth: "250px", width: "250px", transform: function (address, store, stores, index) {
                    return address + "<br/>" + store.City + ", " + store.State + " " + store.Zip
                }},
                {key: 'HughesNotes', title: 'Notes', minWidth: '200px', width: '200px', editable: true},
                {key: 'HughesVsat', title: 'Backup', width: '150px', transform: function (status, store, stores, index) {
                    var html = '<input data-editable="HughesVsatDate" style="' + topLeftStyle +'" />' +
                      '<input data-editable="HughesVsatDateType" style="' + topRightStyle +'" /><br/>' +
                      '<input data-editable="HughesVsatStatus" style="' + bottomStyle +'" />';
                    return html;

                }},
                {key: 'HughesTemp4G', title: 'Temp 4G', width: '150px', transform: function (status, store, stores, index) {
                    var html = '<input data-editable="HughesTempDate" style="' + topLeftStyle +'" />' +
                      '<input data-editable="HughesTempDateType" style="' + topRightStyle +'" /><br/>' +
                      '<input data-editable="HughesTempStatus" style="' + bottomStyle +'" />';
                    return html;

                }},
                {key: 'HughesPrimary', title: 'Primary', width: '150px', transform: function (status, store, stores, index) {
                    var html = '<input data-editable="HughesPrimaryDate" style="' + topLeftStyle +'" />' +
                      '<input data-editable="HughesPrimaryDateType" style="' + topRightStyle +'" /><br/>' +
                      '<input data-editable="HughesPrimaryStatus" style="' + bottomStyle +'" />';
                    return html;

                }},
                {key: 'HughesTemp4G', title: 'Deinstall', width: '150px', transform: function (status, store, stores, index) {
                    var html = '<input data-editable="HughesDeinstallDate" style="' + topLeftStyle +'" />' +
                      '<input data-editable="HughesDeinstallDateType" style="' + topRightStyle +'" /><br/>' +
                      '<input data-editable="HughesDeinstallStatus" style="' + bottomStyle +'" />';
                    return html;

                }},
                // {key: 'HughesTempStatus', title: 'HAN Status', editable: true, minWidth: '150px'},
                // {key: 'HughesTempDate', title: 'HAN Date', transform: 'date', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'ProjectManager', title: 'IT PM'}
            ];

            //Define report title
            var title = 'Comcast - Upcoming Projects';


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

            var afterRender = function (view) {
                function processFieldGroup (i, el) {
                    el = $(el);
                    var storeNumber = el.attr('id').substr(6, 4),
                      store = _.find(view.stores, function (store, i) {
                          return (store.StoreNumber === storeNumber);
                      });

                    //Fix the padding
                    el.css('padding', '3px 0');

                    //Activate the widgets
                    widgetHelper.activate(el, store, undefined, function  (key, value, store, revertBackground, response) {
                        //Rerun the business rules on change to update the view
                        revertBackground();
                        constructionRules.tableHelper(view);
                    });
                }
                //Activate the embeded items - start by finding all the temp4g rows
                view.el.find('tbody > tr > td[data-display="HughesTemp4G"]').each(processFieldGroup);

                //VSAT Ones
                view.el.find('tbody > tr > td[data-display="HughesVsat"]').each(processFieldGroup);

                //Hughes Primary
                view.el.find('tbody > tr > td[data-display="HughesPrimary"]').each(processFieldGroup);

                //Deinstall ones
                view.el.find('tbody > tr > td[data-display="HughesDeinstall"]').each(processFieldGroup);

                constructionRules.tableHelper(view);

                //Change from inputs to divs due to rendering issue in email and pdf rocket
                if (typeof options.email !== 'undefined' && (options.email === 'html' || options.email === 'pdf')) {

                    view.el.find('input').each(function () {
                        //Replace with a div of the same info
                        var el = $(this),
                            newEl = $('<div>' + el.val() + '</div>');

                        // var styles = el.getStyleObject();
                        // newEl.css(styles);
                        newEl.css('width', el.css('width'));
                        newEl.css('box-shadow', el.css('box-shadow'));
                        newEl.css('border-top', el.css('border-top'));
                        newEl.css('border-bottom', el.css('border-bottom'));
                        newEl.css('border-left', el.css('border-left'));
                        newEl.css('border-image', el.css('border-image'));
                        newEl.css('border-right', el.css('border-right'));
                        newEl.css('background-color', el.css('background-color'));
                        newEl.css('display', 'inline-block');
                        var classes = el.attr('class');
                        newEl.attr('class', classes);

                        el.replaceWith(newEl);

                    });
                    view.el.find('ul').remove();
                }
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
//                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});