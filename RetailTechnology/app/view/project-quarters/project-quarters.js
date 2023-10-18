define([
        'app/store/construction',
        'dojo/text!app/view/project-assignment/project-assignment.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip',
        'app/rules/construction'
    ], function (construction, template, TextBox, Button, report, registry, Tooltip, constructionRules) {
        //Utility String Function
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }

        return {
            render: function (options) {
                if (options.routeCheck()) {
                    //Create a table and return it
                    var me = {
                        table: $('<table class="project-quarterly-table"><thead></thead><tbody></tbody><tfoot></tfoot></table>')
                    };

                    //Determine which quarter we're in and the starting month number
                    var quarter = Math.ceil((moment().months()+5)/4),
                        m1 = [],
                        m2 = [],
                        m3 = [],
                        q1New = 0,
                        q2New = 0,
                        q3New = 0,
                        q3New = 0,
                        q1Total = 0,
                        q2Total = 0,
                        q3Total = 0,
                        q4Total = 0;

                    _.each(options.stores, function (store, i) {
                        //Determine which quarter the store is in
                        var q, quarterMonth;

                        switch (moment(store.GoLiveDate).months() + 1) {
                            case 9:
                                q = 1; quarterMonth = 1; break;
                            case 10:
                                q = 1; quarterMonth = 2; break;
                            case 11:
                                q = 1; quarterMonth = 3; break;
                            case 12:
                                q = 2; quarterMonth = 1; break;
                            case 1:
                                q = 2; quarterMonth = 2; break;
                            case 2:
                                q = 2; quarterMonth = 3; break;
                            case 3:
                                q = 3; quarterMonth = 1; break;
                            case 4:
                                q = 3; quarterMonth = 2; break;
                            case 5:
                                q = 3; quarterMonth = 3; break;
                            case 6:
                                q = 4; quarterMonth = 1; break;
                            case 7:
                                q = 4; quarterMonth = 2; break;
                            case 8:
                                q = 4; quarterMonth = 3; break;
                        }

                        //Check to see if it's in the current quarter, and sort it into three month arrays to be displayed
                        if (quarter === q && quarterMonth === 1) {
                            m1.push(store);
                        } else if (quarter === q && quarterMonth === 2) {
                            m2.push(store);
                        } else if (quarter === q && quarterMonth === 3) {
                            m3.push(store);
                        }
                    });


                    var m1Header = '(New: ' + _.countBy(m1, 'ProjectType').New + '&nbsp;&nbsp;Total: ' + m1.length + ')';
                    var m2Header = '(New: ' + _.countBy(m2, 'ProjectType').New + '&nbsp;&nbsp;Total: ' + m2.length + ')';
                    var m3Header = '(New: ' + _.countBy(m3, 'ProjectType').New + '&nbsp;&nbsp;Total: ' + m3.length + ')';

                    if (quarter === 1){
                        me.table.find('thead').append('<tr><th>Q1 - ' + options.fiscalYearShort + ' - September ' + m1Header + '</th><th>Q1 - ' + options.fiscalYearShort + ' - October ' + m2Header + '</th><th>Q1 - ' + options.fiscalYearShort + ' - November ' + m3Header + '</th></tr>');
                    } else if (quarter === 2){
                        me.table.find('thead').append('<tr><th>Q2 - ' + options.fiscalYearShort + ' - December ' + m1Header + '</th><th>Q2 - ' + options.fiscalYearShort + ' - January ' + m2Header + '</th><th>Q2 - ' + options.fiscalYearShort + ' - February ' + m3Header + '</th></tr>');
                    } else if (quarter === 3){
                        me.table.find('thead').append('<tr><th>Q3 - ' + options.fiscalYearShort + ' - March ' + m1Header + '</th><th>Q3 - ' + options.fiscalYearShort + ' - April ' + m2Header + '</th><th>Q3 - ' + options.fiscalYearShort + ' - May ' + m3Header + '</th></tr>');
                    } else if (quarter === 4){
                        me.table.find('thead').append('<tr><th>Q4 - ' + options.fiscalYearShort + ' - June ' + m1Header + '</th><th>Q4 - ' + options.fiscalYearShort + ' - July ' + m2Header + '</th><th>Q4 - ' + options.fiscalYearShort + ' - August ' + m3Header + '</th></tr>');
                    }


                    function getPmImage(store) {
                        var img = '';

                        if (store.ProjectManager.toUpperCase().indexOf('LIZ') !== -1) {
                            img = '<img src="resources/images/unicorn.jpg" style="display:inline-block; height: 15px; width: 15px; border-radius: 5px; border: 1px solid dodgerblue; float: right; margin-top:2px; margin-right: 2px;" />'
                        } else if (store.ProjectManager.toUpperCase().indexOf('JASON') !== -1) {
                            img = '<img src="resources/images/tesseract.jpg" style="display:inline-block; height: 15px; width: 15px; border-radius: 5px; border: 1px solid dodgerblue; float: right; margin-top:2px; margin-right: 2px;" />'
                        } else if (store.ProjectManager.toUpperCase().indexOf('BARRET') !== -1) {
                            img = '<img src="resources/images/liger.png" style="display:inline-block; height: 15px; width: 15px; border-radius: 5px; border: 1px solid dodgerblue; float: right; margin-top:2px; margin-right: 2px;" />'
                        }

                        return img;
                    }

                    function getModalCover(store) {
                        if (moment(store.GoLiveDate).hours(0).minutes(0).seconds(0).diff(moment().hours(0).minutes(0).seconds(0)) <= 0) {
                            return '<div class="project-quarterly-modal"></div>';
                        } else {
                            return '';
                        }
                    }

                    function getRulesClass (store) {
                        //Test the rule:
                        var description = '',
                            severity = 1;

                        _.each(constructionRules.rules, function (rule) {
                            var result = rule.test(store);

                            //Update category
                            if (result.severity > 1) {
                                //Update severity
                                severity = (severity < result.severity ? result.severity : severity);
                                //Update text
                                description += result.description + "\r\n";
                            } else if (severity === 1 && result.severity === 0) {
                                //Update severity
                                severity = result.severity;
                                //Update text
                                description += result.description + "\r\n";
                            }
                        });
debugger;
                        switch (severity) {
                            case 0:
                                return ' class = "green-highlight"'; break;
                            case 1:
                                return ''; break;
                            case 2:
                                return ' class = "yellow-highlight"'; break;
                            case 3:
                                return ' class = "red-highlight"'; break;
                        }
                    }

                    var length = Math.max(m1.length, m2.length, m3.length);
                    for (var j = 0; j < length; j++) {
                        //Add each row if it exists/there are enough stores that month
                        var row = '<tr class="project-quarterly-row">';

                        row += ((m1.length > j) ? '<td><div' + getRulesClass(m1[j]) + '>' + m1[j].StoreNumber + '&nbsp;&nbsp;' + toTitleCase(m1[j].City) + ', ' + m1[j].State + ' - ' + toTitleCase(m1[j].FranchiseGroup) + ' - <b>' + moment(m1[j].GoLiveDate).format('l') + '</b>' + getPmImage(m1[j]) + '</div>' + getModalCover(m1[j]) : '<td>') + '</td>';
                        row += ((m2.length > j) ? '<td><div' + getRulesClass(m2[j]) + '>' + m2[j].StoreNumber + '&nbsp;&nbsp;' + toTitleCase(m2[j].City) + ', ' + m2[j].State + ' - ' + toTitleCase(m2[j].FranchiseGroup) + ' - <b>' + moment(m2[j].GoLiveDate).format('l') + '</b>' + getPmImage(m2[j]) + '</div>' + getModalCover(m2[j]) : '<td>') + '</td>';
                        row += ((m3.length > j) ? '<td><div' + getRulesClass(m3[j]) + '>' + m3[j].StoreNumber + '&nbsp;&nbsp;' + toTitleCase(m3[j].City) + ', ' + m3[j].State + ' - ' + toTitleCase(m3[j].FranchiseGroup) + ' - <b>' + moment(m3[j].GoLiveDate).format('l') + '</b>' + getPmImage(m3[j]) + '</div>' + getModalCover(m3[j]) : '<td>') + '</td>';

                        row += '</tr>';

                        me.table.find('tbody').append(row);
                    }

                    $('body')
                        .html(me.table)
                        .css('background-color', '#ECECEC');

                    //Put the modal's in the right places
                    me.table.find('td div.project-quarterly-modal').each(function () {
                        var modal = $(this),
                            content = modal.prev();

                        modal.css({
                            top: content.position().top,
                            left: content.position().left,
                            height: content.height(),
                            width: content.width()
                        });
                    });

                    //Fire callback if passed
                    if (options.callback) {
                        options.callback(me);
                    }
                }
            }
        };
    }
);