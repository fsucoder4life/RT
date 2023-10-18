define([
    'dojo/text!app/view/weekly-pops/weekly-pops.html',
    'app/view/report',
    "dojo/number",
    'dijit/form/DateTextBox',
    'dijit/registry',
    "dijit/TitlePane",
    'dijit/form/Button'
    ], function (installTemplate, report, dNumber, DateTextBox, registry, TitlePane, Button) {

    return {
        render: function (options) {
            //Stop if another route has registered
            if (!options.routeCheck()) {
                return;
            }
            var me = {};


            //Add the template to the content area
            $(options.target).html(installTemplate);


            //Create one week for each week in range
            var start = moment(options.start),
                end = moment(options.end),
                weeks = end.diff(start, 'weeks') + 1,
                weekly = [];

            for (var i=0; i < weeks; i++) {
                var weekStart = moment(start).add(i * 7, 'days'),
                    weekEnd = moment(weekStart).add(7, 'days'),
                    counts = {
                        Start: weekStart,
                        End: weekEnd,
                        MicrosConversion: 0,
                        InforConversion: 0,
                        New: 0,
                        ReloRemodelRebuild: 0,
                        TotalInstalls: 0,
                        TotalPops: 0
                    };

                _.forEach(options.data, function (store, index) {
                    if (store.PopsDeliveryDate >= weekStart.format('YYYY-MM-DD') && store.PopsDeliveryDate <= weekEnd.format('YYYY-MM-DD')) {
                        switch (store.InstallType) {
                            case 'Micros Conversion':
                                counts.MicrosConversion++; break;
                            case 'Infor Conversion':
                                counts.InforConversion++; break;
                            case 'New':
                                counts.New++; break;
                            case 'Relo/Rebuild/Remodel':
                            default:
                                counts.ReloRemodelRebuild++; break;
                        }

                        counts.TotalInstalls++;
                        counts.TotalPops += store.TotalStalls;
                    }
                });

                weekly.push(counts);
            }

            //Add them to the table
            var table = $('table#deliveries'),
                headerRow = table.find('thead tr:first-child'),
                microsRow = table.find('tbody tr:nth-child(1)'),
                inforRow = table.find('tbody tr:nth-child(2)'),
                newRow = table.find('tbody tr:nth-child(3)'),
                reloRebuildRemodelRow = table.find('tbody tr:nth-child(4)'),
                totalInstallsRow = table.find('tbody tr:nth-child(10)'),
                fabconRow = table.find('tbody tr:nth-child(12)'),
                idTechRow = table.find('tbody tr:nth-child(13)'),
                blankRows = table.find('tbody tr:nth-child(5)')
                    .add(table.find('tbody tr:nth-child(6)'))
                    .add(table.find('tbody tr:nth-child(7)'))
                    .add(table.find('tbody tr:nth-child(8)'))
                    .add(table.find('tbody tr:nth-child(9)'))
                    .add(table.find('tbody tr:nth-child(11)'))
            ;
            _.forEach(weekly, function (week, index) {
                headerRow.append('<td>' + week.Start.format('M/D') + '</td>');
                microsRow.append('<td>' + week.MicrosConversion + '</td>');
                inforRow.append('<td>' + week.InforConversion + '</td>');
                newRow.append('<td>' + week.New + '</td>');
                reloRebuildRemodelRow.append('<td>' + week.ReloRemodelRebuild + '</td>');
                totalInstallsRow.append('<td>' + week.TotalInstalls + '</td>');
                fabconRow.append('<td>' + week.TotalPops + '</td>');
                idTechRow.append('<td>' + week.TotalPops + '</td>');
                blankRows.append('<td></td>');
            });

            //Add the export to csv link as a full length row
            var link = $("<a id='csv-export' href='#'>Export as CSV File</a>");

            //Turn on the click event for the csv export
            link.on('click', function (evt) {
                //Grab the data and remove the click link
                var $rows = table.find('tr');

                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                var tmpColDelim = String.fromCharCode(11), // vertical tab character
                    tmpRowDelim = String.fromCharCode(0); // null character

                // actual delimiter characters for CSV format
                var colDelim = '","',
                    rowDelim = '"\r\n"';

                // Grab text from table into CSV formatted string
                var csv = '"' + $rows.map(function (i, row) {
                        var $row = $(row),
                            $cols = $row.find('td');

                        if ($cols.length === 0) {
                            $cols = $row.find('th');
                        }

                        return $cols.map(function (j, col) {
                            //If column has a line break, replace it with a space!
                            var $col = $(col);
                            $col.find('br').replaceWith('\r\n');

                            //Grab the text
                            var text = $col.text();

                            //Replace an &nbsp; with a space
                            debugger;
                            if (text === ' ') text = ' ';

                            //TODO - HACK - if there is a quote at the end of a value, the csv export doesn't add one, have to triple quote it - remove the replace function to undo this
                            // escape double quotes
                            return text.replace('"', '""').replace(/\"$/, '""');
                        }).get().join(tmpColDelim);

                    }).get().join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim) + '"';

                // Data URI
                var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

                $(this)
                    .attr({
                        'download': "Export.csv",
                        'href': csvData,
                        'target': '_blank'
                    });
            });
            //Insert after the table
            table.after(link);


            ///Set the date
            $('#current-date').html(moment(options.start).format('dddd, MMMM Do') + ' - ' + moment(options.end).format('dddd, MMMM Do') + " (Viewed " + moment().format('l') + ")");
            //Set the title
            $('#sub-title').html("Weekly POPS");

            //Make sure the date pickers got destroyed
            var start = registry.byId('start-date'),
                end = registry.byId('end-date'),
                container = registry.byId('filters'),
                button = registry.byId('filter-button')
            ;
            if (start) start.destroy();
            if (end) end.destroy();
            if (container) container.destroy();
            if (button) button.destroy();

            //Create collapsible filter container
            me.container = new TitlePane({
                title: 'Report Filters',
                style: {
                    width: '555px',
                    margin: '0 10px 10px 10px'
                }
            }, $('#filters')[0]);

            //Create date pickers
            me.start = new DateTextBox({
                value: options.start,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#start-date')[0]);


            me.end = new DateTextBox({
                value: options.end,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#end-date')[0]);

            me.end.rangeCheck = function(date,constraints) {
                var day=date.getDay();
                return day===6;
            };
            me.start.rangeCheck = function(date,constraints) {
                var day=date.getDay();
                return day===0;
            };

            me.button = new Button({
                label: 'Apply Filters'
            }, 'filter-button');

            //Table Header Date
            $('#installs-header').html(moment(options.start).format('dddd, MMMM Do') + ' through ' + moment(options.end).format('dddd, MMMM Do') + " - Total Deliveries: " + options.data.length);

            if (options.callback) {
                options.callback(me);
            }
        }
    };
});