define([
        'app/store/construction',
        'dojo/text!app/view/sync/commworks.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip',
        "dojo/number"
    ], function (construction, template, TextBox, Button, report, registry, Tooltip, dNumber) {

        return {
            render: function (options) {
                var me = {},
                    form = $(template);

                //Make sure the old widget was destroyed
                var input = registry.byId('commworks');
                if (input) {input.destroy();}

                //Create input boxes for the to/from/cc/subject fields
                me.input = new TextBox({
                    placeholder: 'Paste data from excel here',
                    style: {
                        width: "350px",
                        margin: "15px 0"
                    }
                }, $(form).find('#commworks')[0]);

                //Show the form
                $(options.target).html(form);

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            },
            results: function (options) {
                var me = {
                    results: options.results
                };

                //Hide the input box
                $('#input-form').hide();

                //Show the reports
                report.render({
                    data: options.results.missingC3,
                    columns: [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'GoLiveDate', title: 'Go Live', transform: 'date'},
                        {key: 'PopsDeliveryDate', title: 'Pops Delivery', transform: 'date'},
                        {key: 'ChronicallyAiling', title: 'Ailing'},
                        {key: 'ProjectManager', title: 'IT PM'},
                        {key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
                            return "<a target='_blank' href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'GoLiveDate',
                            direction: 'DESC'
                    },
                    target: $('#missing-c3'),
                    routeCheck: options.routeCheck
                });

                report.render({
                    data: options.results.missingSonic,
                    columns: [
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'GoLiveDate', title: 'Go Live', transform: 'date'},
                        {key: 'PopsDeliveryDate', title: 'Pops Delivery', transform: 'date'},
                        {key: 'StoreNumber', title: '', transform: function (value, row, data, index) {
                            return "<a target='_blank' href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'GoLiveDate',
                        direction: 'DESC'
                    },
                    target: $('#missing-sonic'),
                    routeCheck: options.routeCheck
                });

                //Variables for differences table
                var diff = {};
                var diffTable = $('#differences');   //differences table element
                var odd = false;
                //Grab max cell count:
                var maxCells = 0;
                _.forEach(options.results.diff, function (differences, storeNumber) {
                    if (differences.length > maxCells) {
                        maxCells = differences.length;
                    }
                });
                //Update the main content width to accomodate the differences list
                $('#main').attr('min-width', (maxCells * 250) + 'px');

                //Build a table row for each store that has a difference
                _.forEach(options.results.diff, function (differences, storeNumber) {
                    //Create a row/cell for each
                    var cells = [$('<td><a target="_blank" href="#summary/' + storeNumber + '"><h3>Store<br/>#' + storeNumber + '</h3></a></td>')];
                    _.forEach(differences, function (difference, index) {
                        //Format
                        var sonic = difference.sonic,
                            c3 = difference.c3;
                        if (difference.type === 'date') {
                            sonic = moment(sonic).format('l');
                            c3 = moment(c3).format('l');
                        } else if (difference.type === 'integer') {
                            sonic = (sonic === "" ? "" : dNumber.format(sonic, {places: 0, locale: 'en-us'}));
                            c3 = (c3 === "" ? "" : dNumber.format(c3, {places: 0, locale: 'en-us'}));
                        }
                        difference.sonicFormatted = sonic;
                        difference.c3Formatted = c3;
                        //Create Cell
                        cells.push($(
                            '<td>' +
                                '<table id="DifferenceTable-' + difference.field + '-' + storeNumber + '">' +
                                    '<tr><td colspan=2><span style="font-weight: bold;">' + difference.title + '</style></td></tr>' +
                                    '<tr><td>Sonic: </td><td>' + sonic + '</td></tr>' +
                                    '<tr><td>C3: </td><td>' + c3 + '</td></tr>' +
                                    '<tr><td colspan=2><button id="Difference-' + difference.field + '-' + storeNumber+ '" type="button"></button></td></tr>' +
                                '</table>' +
                            '</td>'
                        ))
                    });

                    //Create any needed blank cells
                    for (var i = differences.length; i < maxCells; i++) {
                        cells.push($('<td></td>'));
                    }
                    //Append the row
                    var row = $('<tr id="DifferenceRow-' + storeNumber +'"></tr>');
                    $(row).append(cells);
                    $(diffTable).append(row);
                });

                //Create dojo buttons for difference
                _.forEach(options.results.diff, function (differences, storeNumber) {
                    _.forEach(differences, function (difference, index) {
                        var button = registry.byId('Difference-' + difference.field + '-' + storeNumber);
                        if (button) {button.destroy();}

                        //Create Button
                        button = new Button({
                            label: 'Update',
                            style: 'width: 90px'
                        }, 'Difference-' + difference.field + '-' + storeNumber);
                        //This is a hack because you can't set the width
                        $(button.domNode).find('>span').css('width', '90px');
                    });
                });

                //Create a Dojo Button for auto updating
                me.autoUpdateButton = registry.byId('auto-update');
                if (me.autoUpdateButton) {me.autoUpdateButton.destroy();} //destroy button if already exists in dom

                //Create button between the two reports
                $('<button id="auto-update" type="button"></button>').insertAfter('#missing-sonic-container');
                me.autoUpdateButton = new Button({
                    label: 'Auto Update Project Manager, Audio Pre-Cable Date, Extension Brackets, and C-Channel Brackets',
                }, 'auto-update');
                //This is a hack because you can't set the width
//                $(me.autoUpdateButton.domNode).find('>span').css('width', '250px');

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
    }
);