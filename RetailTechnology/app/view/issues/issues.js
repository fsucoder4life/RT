define([
    'dojo/text!app/view/issues/issues.html',
    "dojo/number",
    'dijit/form/DateTextBox',
    'dijit/registry',
    "dijit/TitlePane",
    "dijit/form/TextBox",
    'dijit/form/Button',
    'dijit/form/MultiSelect',
    'dojox/uuid/generateTimeBasedUuid',
    'app/widget/panelCollapse'
    ], function (issuesTemplate, dNumber, DateTextBox, registry, TitlePane, TextBox, Button, MultiSelect, uuid, panelCollapse) {

    return {
        render: function (options) {
            //Stop if another route has registered
            if (!options.routeCheck()) {
                return;
            }
            var me = {};

            //TODO - bootstrap search

            ///Set the date
            $('#current-date').html(moment(options.start).format('dddd, MMMM Do') + ' - ' + moment(options.end).format('dddd, MMMM Do') + " (Viewed " + moment().format('l') + ")");
            //Set the title
            $('#sub-title').html("Project Issues");
            //Set the width to wide
            $('#main').css('width', '99%');

            var $view = $($(issuesTemplate)),
                $stores = $($view.find('#store-container')),
                storePanels = [];

            //Create a div for each store
            _.each(options.stores, function (store) {
                var mostSevereIssue = '',
                    $issues = $($('<div style="margin: 0px 10px 10px 10px; clear: both;"></div>'));

                //Create each issue
                _.each(store.Issues, function (issue) {
                    //Track the most severe issue for summary viewing
                    if (issue.Severity.length > 1) {
                        if (mostSevereIssue === '' || issue.Severity[1] > mostSevereIssue[1]) {
                            mostSevereIssue = issue.Severity;
                        }
                    }

                    //Create issue markup
                    var $issueContainer = $($('<div></div>')),
                        $issueHeader = $($('<h3 style="padding-top: 3px; padding-right: 5px; padding-bottom: 3px;"></h3>')),
                        $issueTitle = $($('<span style="font-size: 16px; display: inline-block;">' + issue.Title + '</span>')),
                        $issueDetails = $($('<span style="display: inline-block; font-weight: normal; font-size: 14px; float: right;">' +
                                '<span style="display: inline-block; width: 200px;">Assigned:' + issue.Assigned + '</span>' +
                                '<span style="display: inline-block; width: 250px;">Waiting On: ' + issue.WaitingOn + '</span>' +
                                '<span style="display: inline-block; width: 100px;">Status: ' + issue.Status + '</span>' +
                            '</span><div style="clear: both;"></div>')),
                        $issueBody = $($('<div style=""></div>'));

                    //Build body
                    var $issueDescription = $($("<div style='overflow: hidden;' class='issue-description'>" + issue.Description + "</div>"));
                    $issueBody.append($issueDescription);

                    //Compose
                    $issueHeader.append($issueTitle, $issueDetails);
                    $issueContainer.append($issueHeader, $issueBody);
                    $issues.append($issueContainer);

                    //Apply expand/collapse
                    panelCollapse({el: $issueContainer});
                });

                //Build the store view
                var $storeContainer = $($('<div></div>')),
                    $storeHeader = $($('<h3 style="padding-top: 3px; padding-right: 5px; padding-bottom: 3px;"></h3>')),
                    $storeTitle = $($('<span style="display: inline-block;">' + store.City + ' ' + store.State + ' (' + store.StoreNumber + ') - ' + store.ProjectType + '</span>')),
                    $storeDetails = $($('<span style="display: inline-block; font-weight: normal; font-size: 14px; float: right;">' +
                        '<span style="display: inline-block; width: 90px;">' + store.Issues.length + ' Issues</span>' +
                        '<span style="display: inline-block; width: 260px;">Most Severe Issue: ' + mostSevereIssue + '</span>' +
                        '<span style="display: inline-block; width: 125px;">Install: ' + moment(store.InstallDate).format('l') + '</span>' +
                        '<span style="display: inline-block; width: 100px;">Live: ' + moment(store.GoLiveDate).format('l') + '</span>' +
                        '<a href="#summary/' + store.StoreNumber + '" style="background: #c5dbec; padding: 3px 14px; ; margin-left: 10px; margin-right: 10px;" class="pure-button">Details</a>' +
                    '</span><div style="clear: both;"></div>')),
                $storeBody = $($('<div></div>'));

                //Build the store body
                var $storeTable1 = $($('<table style="width: 400px; float: left; margin: 10px 30px 5px 10px; border: 1px solid #cbcbcb;"></table>')),
                    $storeTable2 = $($('<table style="width: 400px; float: left; margin: 10px 0px; border: 1px solid #cbcbcb;""></table>'));
                $storeTable1.append('<thead><th class="ui-state-default" colspan="2">Stakeholders</th></tr></thead><tr>');
                $storeTable1Body = $('<tbody></tbody>');
                $storeTable1.append($storeTable1Body);
                $storeTable1Body.append('<tr><td style="width: 135px">Franchisee:</td><td>' + store.FranchiseGroup + '</td></tr>');
                if (store.ProjectType !== 'POS Conversion') $storeTable1Body.append('<tr><td>Primary Contact:</td><td>' + store.PrimaryContact + '</td></tr>');
                $storeTable1Body.append('<tr><td>RVP:</td><td>' + store.RegionalVicePresident + '</td></tr>');
                $storeTable1Body.append('<tr><td>Market Leader:</td><td>' + store.MarketLeader + '</td></tr>');
                if (store.ProjectType !== 'POS Conversion') $storeTable1Body.append('<tr><td>Construction PM:</td><td>' + store.ConstructionManager + '</td></tr>');
                if (store.ProjectType !== 'POS Conversion') $storeTable1Body.append('<tr><td>IT PM:</td><td>' + store.ProjectManager + '</td></tr>');

                if (store.ProjectType !== 'POS Conversion') {
                    $storeTable2.append('<thead><tr><th class="ui-state-default" colspan="2">Status</th></tr></thead>');
                    $storeTable2Body = $('<tbody></tbody>');
                    $storeTable2.append($storeTable2Body);
                    $storeTable2.append('<tr><td style="width: 80px">Satellite:</td><td>' + store.SatelliteStatus + '</td></tr>');
                    $storeTable2.append('<tr><td>POS:</td><td>' + store.PosStatus+ '</td></tr>');
                    $storeTable2.append('<tr><td>POPS:</td><td>' + store.PopsStatus + '</td></tr>');
                    $storeTable2.append('<tr><td>Audio:</td><td>' + store.AudioStatus+ '</td></tr>');
                    $storeTable2.append('<tr><td>PAYS:</td><td>' + store.PaysStatus+ '</td></tr>');
                    $storeTable2.append('<tr><td>DMB/TV:</td><td>' + store.DmbTvStatus + '</td></tr>');
                    $storeTable2.append('<tr><td>Install:</td><td>' + store.InstallationStatus + '</td></tr>');
                }

                $storeBody.append($storeTable1, $storeTable2, $issues);

                //Compose and add to dom
                $storeHeader.append($storeTitle, $storeDetails);
                $storeContainer.append($storeHeader, $storeBody);
                $stores.append($storeContainer);

                //Apply expand/collapse
                storePanels.push(panelCollapse({el: $storeContainer}));
            });

            //Setup a handler for expand/collapse all
            $view.find('a#expand-all').on('click', function (e) {
                e.preventDefault(true);
                _.each(storePanels, function (panel) {
                    panel.expand();
                });
            });
            $view.find('a#collapse-all').on('click', function (e) {
                e.preventDefault(true);
                _.each(storePanels, function (panel) {
                    panel.collapse();
                });
            });

            //Setup handlers to expand/collapse the filters
            var $filterHeader = $($view.find('#filter-header')),
                $filterForm = $($view.find('#filter-form'));
//            $filterHeader.on('click', function (e) {
//                $filterForm.slideToggle();
//            });
            panelCollapse({
                el: $view.filter('#filters'),
                header: $view.find('#filter-header'),
                body: $view.find('#filter-form'),
                headerCollapse: true,
                showIcon: false
            });

            //Create Date Pickers
            me.liveStartDate = datepicker({el: $view.find('#live-start-date')});
            me.liveEndDate = datepicker({el: $view.find('#live-end-date')});
            function datepicker(options) {
                var $el = $($(options.el)),
                    value = $el.val(),
                    format = options.format || 'l';

                //Set value if passed
                if (options.value) {
                    value = moment(value).format(format);
                    $el.val(value);
                }

                //Create date picker
                var picker = $el.datepicker(),
                    val = picker.val;

                //Create a new value setting function
                picker.val = function () {
                    if (arguments.length >= 1) {
                        arguments[0] = moment(arguments[0]).format(format);
                    }
                    val.apply(picker, arguments);
                };

                $el.blur(function (evt) {
                    //Check if it's changed
                    changed();
                });

                $el.on('keydown', function (evt) {
                    //Check to see if it was the enter key or escape key
                    if (evt.keyCode == 27) {
                        //Restore old value if escape is pressed
                        $el.val(value);
                    }
                });
                function changed() {
                    var newValue = $el.val();

                    //Check to see if it's a valid date or empty string
//                    var dateFormat = ["M/D/YYYY", "M/D/YY", "M/D", "D"];
                    //All the new value checks except empty string are for weird IE injection issues
//                    if (moment(newValue, dateFormat, true).isValid() === false && newValue !== "") {
//                        //Revert to old value and alert
//                        $el.val(value);
//                        window.alert('Error: "' + newValue + '" is not a valid date');
//                        return;
//                    } else if (newValue !== "" && newValue !== "<br>" && newValue !== "<br/>" && newValue !== "&nbsp;") {
//                        //Set the date to the formatted version
//                        newValue = moment(newValue, dateFormat, true).format(format);
//                        $el.val(newValue);
//                    }


                    //Check to see if it's changed
//                    if (newValue != value) {
//                        //TODO - fire an event maybe?
//                    }
                }

                return picker;
            }

            //Grab a reference to the button and inputs for use in the controller
            me.button = $($filterForm.find('#filter-button'));
            me.issueStatus = $($filterForm.find('#issue-status'));
            me.orderBy = $($filterForm.find('#order-by'));
            me.projectManager = $($filterForm.find('#project-manager'));


            //Set the values if options were passed
            if (options.liveStartDate) {
                me.liveStartDate.val(options.liveStartDate);
            }
            if (options.liveEndDate) {
                me.liveEndDate.val(options.liveEndDate);
            }
            if (options.issueStatus) {
                me.issueStatus.val(options.issueStatus);
            }
            if (options.orderBy) {
                me.orderBy.val(options.orderBy);
            }
            if (options.projectManager) {
                me.projectManager.val(options.projectManager);
            }

            //Add the template to the content area
            $(options.target).html($view);


            //Make sure the date pickers got destroyed
         if (options.callback) {
                options.callback(me);
            }
        }
    };
});