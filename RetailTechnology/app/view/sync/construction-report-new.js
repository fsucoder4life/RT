define([
        'app/store/construction',
        'dojo/text!app/view/sync/construction-report-new.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip'
], function (construction, template, TextBox, Button, report, registry, Tooltip) {

    return {
        render: function (options) {
            var me = {},
                form = $(template);

            //Make sure the old widget was destroyed
            var input = registry.byId('construction-report');
            if (input) { input.destroy(); }

            //Create input boxes for the to/from/cc/subject fields
            me.input = new TextBox({
                placeholder: 'Paste data from excel here',
                style: {
                    width: "350px",
                    margin: "15px 0"
                }
            }, $(form).find('#construction-report')[0]);

            //Show the form
            $(options.target).html(form);

            //Fire callback if passed
            if (options.callback) {
                options.callback(me);
            }
        },
        results: function (options) {
            var me = {
                results: options.results,
                buttons: {
                    goLive: [],
                    groundBreak: [],
                    "new": [],
                    missing: [],
                    constructionManager: []
                }
            };

            //Hide the input box
            $('#input-form').hide();

            //Show the reports
            report.render({
                data: options.results.new,
                columns: [
                  { key: 'ProjectType', title: 'Project Type', width: '95px' },
                  { key: 'FranchiseGroup', title: 'Franchisee' },
                  { key: 'StoreNumber', title: 'No.', width: '95px' },
                  {
                      key: 'City', title: 'City', transform: function (city, store, stores, i) {
                          return "<a href='#summary/" + store.StoreNumber + "'>" + store.City + ", " + store.State + "</a>";
                      }
                  },
                  { key: 'GoLiveDate', title: 'Go Live', transform: 'date', width: '105px' },
                  {
                      key: '', title: '', width: '500px', transform: function (value, store, stores, index) {
                          return "<button class='pure-button pure-button-primary add-to-retail' id='" + store.StoreNumber + "-add-to-retail'>Add to Retail Tech</button>"
                      }
                  }
                ],
                sort: {
                    key: 'GoLiveDate',
                    direction: 'DESC'
                },
                target: $('#new'),
                routeCheck: options.routeCheck
            });
            report.render({
                data: options.results.missing,
                columns: [
                    { key: 'ProjectType', title: 'Type' },
                    { key: 'StoreNumber', title: 'No.' },
                    { key: 'FranchiseGroup', title: 'Franchisee' },
                    {
                        key: 'City', title: 'City', transform: function (city, store, stores, i) {
                            return "<a href='#summary/" + store.StoreNumber + "'>" + store.City + ", " + store.State + "</a>";
                        }
                    },
                    { key: 'GoLiveDate', title: 'Go Live', transform: 'date' },
                    {
                        key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
                            return '<button id="MissingDeleteButton-' + value + '" type="button"></button>'
                        }
                    },
                ],
                sort: {
                    key: 'GoLiveDate',
                    direction: 'DESC'
                },
                target: $('#removed'),
                routeCheck: options.routeCheck
            });
            report.render({
                data: options.results.goLive,
                columns: [
                    { key: 'ProjectType', title: 'Type' },
                    { key: 'StoreNumber', title: 'No.' },
                    { key: 'FranchiseGroup', title: 'Franchisee' },
                    {
                        key: 'City', title: 'City', transform: function (city, store, stores, i) {
                            return "<a href='#summary/" + store.StoreNumber + "'>" + store.City + ", " + store.State + "</a>";
                        }
                    },
                    { key: 'GoLiveDate', title: 'Retail Tech - Go Live', transform: 'date' },
                    { key: 'NewGoLiveDate', title: 'Dev Report - Go Live', transform: 'date' },
                    { key: 'ProjectManager', title: 'IT PM' },
                    { key: 'InitialCallDate', title: 'First Call', transform: 'date' },
                    {
                        key: 'DevelopmentNote', title: 'Note', transform: function (note, store, stores, index) {

                            try {
                                return note.toString().substring(0, 30);
                            }
                            catch (err) {
                                return '';
                            }


                        }
                    },
                    {
                        key: 'GoLiveDate', title: 'Significant', transform: function (goLive, store, stores, index) {
                            var diff = moment(goLive).diff(moment(store.NewGoLiveDate), 'days');
                            if (diff > 4 || diff < -4) {
                                return 'TRUE';
                            } else {
                                return 'FALSE';
                            }
                        }
                    },
                    {
                        key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
                            return '<button id="GoLiveUpdateButton-' + value + '" type="button"></button>';
                        }
                    }
                ],
                sort: {
                    key: 'GoLiveDate',
                    direction: 'DESC'
                },
                target: $('#go-live'),
                routeCheck: options.routeCheck
            });
            report.render({
                data: options.results.constructionManager,
                columns: [
                    { key: 'ProjectType', title: 'Type' },
                    { key: 'StoreNumber', title: 'No.' },
                    { key: 'FranchiseGroup', title: 'Franchisee' },
                    {
                        key: 'City', title: 'City', transform: function (city, store, stores, i) {
                            return "<a href='#summary/" + store.StoreNumber + "'>" + store.City + ", " + store.State + "</a>";
                        }
                    },
                    { key: 'ConstructionManager', title: 'Retail Tech<br/>Construction PM' },
                    { key: 'NewConstructionManager', title: 'Dev Report</br>Construction PM' },
                    { key: 'GoLiveDate', title: 'Retail Tech<br/>Go Live', transform: 'date' },
                    { key: 'NewGoLiveDate', title: 'Dev Report<br/>Go Live', transform: 'date' },
                    { key: 'ProjectManager', title: 'IT PM' },
                    {
                        key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
                            return '<button id="ConstructionManagerUpdateButton-' + value + '" type="button"></button>'
                        }
                    }
                ],
                sort: {
                    key: 'GoLiveDate',
                    direction: 'DESC'
                },
                target: $('#construction-manager'),
                routeCheck: options.routeCheck
            });
            //report.render({
            //    data: options.results.groundBreak,
            //    columns: [
            //        {key: 'ProjectType', title: 'Type'},
            //        {key: 'StoreNumber', title: 'No.'},
            //        {key: 'FranchiseGroup', title: 'Franchisee'},
            //        {key: 'City', title: 'City', transform: function (city, store, stores, i) {
            //          return "<a href='#summary/" + store.StoreNumber + "'>" + store.City + ", " + store.State + "</a>";
            //        }},
            //        {key: 'GroundBreakDate', title: 'Retail Tech<br/>Ground Break', transform: 'date'},
            //        {key: 'NewGroundBreakDate', title: 'Dev Report</br>Ground Break', transform: 'date'},
            //        {key: 'GoLiveDate', title: 'Retail Tech<br/>Go Live', transform: 'date'},
            //        {key: 'NewGoLiveDate', title: 'Retail Tech<br/>Go Live', transform: 'date'},
            //        {key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
            //            return '<button id="GroundBreakUpdateButton-' + value + '" type="button"></button>'
            //        }}
            //    ],
            //    sort: {
            //        key: 'GoLiveDate',
            //        direction: 'DESC'
            //    },
            //    target: $('#ground-break'),
            //    routeCheck: options.routeCheck
            //});

            //Create buttons and note tooltips for each new item
            _.forEach(options.results.new, function (store) {
                //Create a tooltip for each note
                var row = $('#new tr#number' + store.StoreNumber);
                row.attr('title', store.DevelopmentNote);

                //Create a handler for each button
                var button = $('#' + store.StoreNumber + '-add-to-retail'),
                  cell = button.closest('td');
                button.on('click', function (e) {
                    //Show a modal - Note - changing to show text in place of button
                    // var modal = $('<div>Adding Store to Retail</div>');
                    cell.html('Adding Store to Retail');
                    button.remove();

                    var closeModal = function () {
                        // $.modal.close();
                        // modal.remove();
                    };

                    var updateModal = function () {
                        // modal.html.apply(modal, arguments);
                        cell.html.apply(cell, arguments);
                    };

                    var deleteRow = function () {
                        row.fadeOut.apply(row, arguments);
                    };

                    //Find the record
                    if (typeof me.onAddProjectClick === 'function') {
                        // modal.modal({
                        //   escapeClose: false,
                        //   clickClose: false,
                        //   showClose: false
                        // });
                        me.onAddProjectClick(store, deleteRow, updateModal, closeModal);
                    }
                });

                //Fix the padding for that cell
                cell.css('padding', '1px 0');
            });

            //Create dojo buttons and note tooltips for each missing item
            _.forEach(options.results.goLive, function (store) {
                var button = registry.byId('GoLiveButton-' + store.StoreNumber);
                var tip = registry.byId('DevelopmentNote-' + store.StoreNumber);
                if (button) { button.destroy(); }
                if (tip) { tip.destroy(); }

                //Create a tooltip for each note if it's longer than 30 characters (or whatever the substring value is above
                if (store.DevelopmentNote)
                    if (store.DevelopmentNote.length > 30) {
                        tip = new Tooltip({
                            connectId: $('#go-live').find('tr#number' + store.StoreNumber),
                            label: store.DevelopmentNote
                        });
                    }
                //
                //                    //Create input boxes for the to/from/cc/subject fields
                //                    button = new Button({
                //                        label: 'Update',
                //                        style: 'width: 90px'
                //                    }, 'GoLiveButton-' + store.StoreNumber);
                //                    //This is a hack because you can't set the width
                //                    $(button.domNode).find('>span').css('width', '90px');
                //                    me.buttons.goLive.push(button);
            });

            //Create dojo buttons for each missing item
            _.forEach(options.results.missing, function (store) {
                var button = registry.byId('MissingDeleteButton-' + store.StoreNumber);
                if (button) { button.destroy(); }

                //Create input boxes for the to/from/cc/subject fields
                button = new Button({
                    label: 'Delete',
                    style: 'width: 90px'
                }, 'MissingDeleteButton-' + store.StoreNumber);
                //This is a hack because you can't set the width
                $(button.domNode).find('>span').css('width', '90px');
                me.buttons.missing.push(button);
            });

            //Create dojo buttons for each go-live item
            _.forEach(options.results.goLive, function (store) {
                var button = registry.byId('GoLiveUpdateButton-' + store.StoreNumber);
                if (button) { button.destroy(); }

                //Create input boxes for the to/from/cc/subject fields
                button = new Button({
                    label: 'Update',
                    style: 'width: 90px'
                }, 'GoLiveUpdateButton-' + store.StoreNumber);
                //This is a hack because you can't set the width
                $(button.domNode).find('>span').css('width', '90px');
                me.buttons.goLive.push(button);
            });

            //Create dojo buttons for each ground break item
            _.forEach(options.results.groundBreak, function (store) {
                var button = registry.byId('GroundBreakUpdateButton-' + store.StoreNumber);
                if (button) { button.destroy(); }

                //Create input boxes for the to/from/cc/subject fields
                button = new Button({
                    label: 'Update',
                    style: 'width: 90px'
                }, 'GroundBreakUpdateButton-' + store.StoreNumber);
                //This is a hack because you can't set the width
                $(button.domNode).find('>span').css('width', '90px');
                me.buttons.groundBreak.push(button);
            });

            //Create dojo buttons for each construction manager item
            _.forEach(options.results.constructionManager, function (store) {
                var button = registry.byId('ConstructionManagerUpdateButton-' + store.StoreNumber);
                if (button) { button.destroy(); }

                //Create input boxes for the to/from/cc/subject fields
                button = new Button({
                    label: 'Update',
                    style: 'width: 90px'
                }, 'ConstructionManagerUpdateButton-' + store.StoreNumber);
                //This is a hack because you can't set the width
                $(button.domNode).find('>span').css('width', '90px');
                me.buttons.constructionManager.push(button);
            });

            //Fire callback if passed
            if (options.callback) {
                options.callback(me);
            }
        }
    };
}
);