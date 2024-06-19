define([
        'app/store/construction',
        'dojo/text!app/view/tablePaymentmodprojectdates.html',
        'app/widget/dropdown',
        'app/widget/datepicker',
        'app/widget/textfield',
        'app/widget/numberfield',
        'app/widget/textarea',
        "dojo/number"
], function (construction, tableTemplate, dropdown, datePicker, textfield, numberfield, textarea, dNumber) {

    return {
        render: function (options) {
            //required options:  construction || combined query, columns, title, target
            options.callback = options.callback || function () { };
            options.dataStore = options.dataStore || construction;
            options.idField = options.idField || 'StoreNumber';

            //Turn the tableTemplate into a dom element
            var table = $($.parseHTML(tableTemplate));

            //Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY - h:mm A'));
            //Set the title
            $('#sub-title').html(options.title);

            //Grab the report sort and filter options so we don't do it twice (once here and once in the store
            var sort = options.sort,
                filter = options.filter;
            options.sort = undefined;
            options.filter = undefined;

            //Get the data - pass the whole options object, only requires the combined/construction queries
            if (options.data) {
                processData(options.data);
            } else {
                //Don't pass the sort/filter options!
                options.dataStore.loadData(options, processData);
            }

            //Process the data
            function processData(data) {
                //Stop if another route has registered
                if (!options.routeCheck()) {
                    return;
                }
                //Build the rows
                var html = "";

                //Turn it into an array to filter and sort
                var arr = [];

                _.forIn(data, function (store, storeNumber) {
                    arr.push(store);
                });

                //Filter
                if (typeof filter === 'function') {
                    arr = filter(arr);
                }

                //Sort
                if (typeof sort === 'function') {
                    arr = sort(arr);
                } else if (typeof sort === 'object') {
                    if (arr.length > 1 && "StoreNumber" in arr[0]) {

                        arr = _.map(_.sortBy(arr, [sort.key, "StoreNumber"]))
                    } else {
                        arr = _.map(_.sortBy(arr, [sort.key]));
                    }

                    if ("direction" in sort && sort.direction !== "DESC") {
                        arr.reverse();
                    }
                }


                //Build the headers
                var headers = "<tr>";
                _.forEach(options.columns, function (col, index) {
                    var style = " style='";
                    if (typeof col.width !== 'undefined') {
                        style += "width: " + col.width + ";";
                    }
                    if (typeof col.minWidth !== 'undefined') {
                        style += "min-width: " + col.minWidth + ";";
                    }
                    style += "'";
                    headers += "<th " + style + ">" + col.title + "</th>"
                });
                headers += "</tr>";

                //Add headers to table
                table.find('thead').append(headers);

                var storeNumbersFound = [];
                //Build the store data
                _.forEach(arr, function (store, storeIndex) {

                    if (store[options.idField]) {
                        storeNumbersFound.push(store[options.idField]);
                        //Go through each column and get the data
                        html += "<tr id='number" + store[options.idField] + "' style='vertical-align: top;'>";
                        _.forEach(options.columns, function (col, colIndex) {
                            //Get the data either by transform function or lookup key
                            col.key = col.key || 'Id';
                            var val = '';
                            if (typeof col.transform === 'function') {
                                val = col.transform(store[col.key], store, data, storeIndex);
                            } else if (typeof col.transform === 'string' && col.transform === 'date') {
                                val = formatDate(store[col.key]);
                            } else if (typeof col.transform === 'string' && col.transform === 'number') {
                                val = dNumber.format(store[col.key], { places: 0, locale: 'en-us' });
                            } else if (typeof col.transform === 'string' && col.transform === 'boolean') {
                                val = (store[col.key]) ? "True" : "False";
                            } else {
                                val = store[col.key];
                            }

                            //Add the table cell, use the column key and store number to create an id for later use in creating editors

                            html += "<td " +
                                "id='store-" + store[options.idField] + "-" + col.key + "' " +
                                (col.editable ? "data-editable='" : "data-display='") + col.key + "' " +
                                (typeof col.whiteSpace !== 'undefined' ? "style='white-space:" + col.whiteSpace + "' " : '') +
                            ">" + val + "</td>";
                        });

                        html += "</tr>";
                    }
                });

                //search by GC / Contractor, get results:
                var contractorRows = "";
                if (options.title === "Search Results") {
                    $().SPServices({
                        operation: "GetListItems",
                        listName: "Construction_Calls",
                        CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Store_x0020_Number' /><FieldRef Name='Contractor' /></ViewFields>",
                        CAMLQuery: "<Query><Where><Contains><FieldRef Name='Contractor' /><Value Type='Text'>" + $("#search").val() + "</Value></Contains></Where></Query>",
                        CAMLRowLimit: 0,
                        async: false,
                        completefunc: function (xData, Status) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                //skip if store already included

                                //store.EncodedAbsoluteUrl = "https://irbpartners.sharepoint.com/sites/RetailTechDeployment/Lists/Construction%20Calls/" + $(this).attr("ows_ID") + "_.000";
                                //showAlert = true;
                                var storeNumber = $(this).attr("ows_Store_x0020_Number");
                                if (storeNumber.indexOf(";#") > -1)
                                    storeNumber = storeNumber.substring(storeNumber.indexOf(";#") + 2);
                                var contractor = $(this).attr("ows_Contractor");

                                html = html.replace("<td id='store-" + storeNumber + "-Contractor' data-display='Contractor' ></td>", "<td id='store-" + storeNumber + "-Contractor' data-display='Contractor' >" + contractor + "</td>");

                                //store already found in table, no need to add row 
                                for (var i = 0; i < storeNumbersFound.length; i++) {
                                    if (storeNumbersFound[i] === storeNumber) {
                                        return true;
                                    }
                                }

                                $().SPServices({
                                    operation: "GetListItems",
                                    listName: "Combined Schedule",
                                    CAMLViewFields: "<ViewFields><FieldRef Name='Primary_x0020_Contact' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='State_x0020_' /><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><FieldRef Name='City' /><FieldRef Name='ID' /><FieldRef Name='Project_x0020_Type' /></ViewFields>",
                                    CAMLQuery: "<Query><Where><Contains><FieldRef Name='Title' /><Value Type='Text'>" + storeNumber + "</Value></Contains></Where></Query>",
                                    CAMLRowLimit: 0,
                                    async: false,
                                    completefunc: function (xData, Status) {
                                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                            var projectType = $(this).attr("ows_Project_x0020_Type");
                                            var city = $(this).attr("ows_City");
                                            var state = $(this).attr("ows_State_x0020_");
                                            var goLive = $(this).attr("ows_GO_x0020_LIVE_x0020_DATE");
                                            goLive = moment(goLive).format('l');
                                            var pos = $(this).attr("ows_POS_x0020_Selection");
                                            var franchisee = $(this).attr("ows_Franchise_x0020_Group");
                                            var rvp = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                                            var poc = $(this).attr("ows_Primary_x0020_Contact");
                                            contractorRows += "<tr id='number" + storeNumber + "' style='vertical-align: top;'><td id='store-" + storeNumber + "-ProjectType' data-display='ProjectType'>" + projectType + "</td><td id='store-" + storeNumber + "-StoreNumber' data-display='StoreNumber'>" + storeNumber + "</td><td id='store-" + storeNumber + "-City' data-display='City'>" + city + "</td><td id='store-" + storeNumber + "-State' data-display='State'>" + state + "</td><td id='store-" + storeNumber + "-GoLiveDate' data-display='GoLiveDate'>" + goLive + "</td><td id='store-" + storeNumber + "-Pos' data-display='Pos'>" + pos + "</td><td id='store-" + storeNumber + "-FranchiseGroup' data-display='FranchiseGroup'>" + franchisee + "</td><td id='store-" + storeNumber + "-RegionalVicePresident' data-display='RegionalVicePresident'>" + rvp + "</td><td id='store-" + storeNumber + "-PrimaryContact' data-display='PrimaryContact'>" + poc + "</td><td id='store-" + storeNumber + "-Contractor' data-display='Contractor'>" + contractor + "</td><td id='store-" + storeNumber + "-StoreNumber' data-display='StoreNumber'><a href='#summary/" + storeNumber + "'>more</a></td></tr>";
                                        });
                                    }
                                });

                            });
                        }
                    });
                }

                //Insert the rows into the table element
                table.find('#storesTBody').append(html + contractorRows);

                if (options.showExportOptions !== false) {
                    //Add the export to csv link as a full length row
                    var link = $("<a id='csv-export' href='#'>Export as CSV File (doesn't work in IE)</a>");
                    var excelLink = $("<a id='excel-export' href='#' style='display:none;'>Export as Excel File (IE 10+)</a>");

                    //Turn on the click event for the csv export
                    link.on('click', function (evt) {
                        //Grab the data and remove the click link
                        var $rows = table.find('#storesTBody tr');

                        // Temporary delimiter characters unlikely to be typed by keyboard
                        // This is to avoid accidentally splitting the actual contents
                        var tmpColDelim = String.fromCharCode(11), // vertical tab character
                          tmpRowDelim = String.fromCharCode(0); // null character

                        // actual delimiter characters for CSV format
                        var colDelim = '","',
                          rowDelim = '"\r\n"';

                        var csvHeading = '"Store","Scheduled Go-Live","Franchise Group","DMA","City","State","PM","Install Team","Intro Call","Site Survey Requested (Installation Company Assigned)","Hughes Document sent to FRAN","Hughes Document sent to Hughes","Site Survey Schedule Confirmed by Installation Company","SITE SURVEY COMPLETED","Site Survey Results Reviewed with FRAN","Order Documents sent to FRAN","INSTALL SCHEDULED","ORDER PLACED","30 DAYS COMMS","2 WEEK COMMS","1 WEEK COMMS","1 DAY COMMS","Level 10 Tracking #","DELIVERY DATE","REVIEW SIGN-OFFS","RMA OR OPEN ITEMS"\r\n';

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

                                //If column has a dropdown, only grab the value, not the list
                                if ($col.find('.dropdown').length === 1) {
                                    text = $col.find('[contenteditable=true]').text();
                                }

                                //TODO - HACK - if there is a quote at the end of a value, the csv export doesn't add one, have to triple quote it - remove the replace function to undo this
                                // escape double quotes
                                return text.replace('"', '""').replace(/\"$/, '""');
                            }).get().join(tmpColDelim);

                        }).get().join(tmpRowDelim)
                            .split(tmpRowDelim).join(rowDelim)
                            .split(tmpColDelim).join(colDelim) + '"';

                        // Data URI
                        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvHeading + csv);

                        $(this)
                          .attr({
                              'download': "Export.csv",
                              'href': csvData,
                              'target': '_blank'
                          });
                    });

                    //Turn on the click event for the excel export
                    excelLink.on('click', function (evt) {
                        //Grab the data and transform it a bit
                        var $rows = table.find('#storesTBody tr');

                        // Do some formatting
                        $rows.each(function (i, row) {
                            var $row = $(row),
                              $cols = $row.find('td');

                            if ($cols.length === 0) {
                                $cols = $row.find('th');
                            }

                            $cols.each(function (j, col) {
                                //If column has a line break, replace it with a space!
                                var $col = $(col);
                                $col.find('br').replaceWith('\r\n');

                                //Grab the text
                                var text = $col.text();

                                //If column has a dropdown, only grab the value, not the list
                                if ($col.find('.dropdown').length === 1) {
                                    text = $col.html($col.find('[contenteditable=true]').text());
                                }
                            });
                        });

                        //Add table export links:
                        var tx = table.tableExport({ formats: ["xlsx"] });
                        $('.btn-toolbar button.xlsx')[0].click()
                        $('.btn-toolbar').remove();
                    });
                }

                var me = {
                    el: table,
                    stores: arr
                };

                //Activate any editors
                _.forEach(arr, function (store, storeIndex) {
                    _.forEach(options.columns, function (col, colIndex) {
                        if (col.editable) {
                            //Find the row element
                            var el = table.find('#store-' + store[options.idField] + '-' + col.key),
                                field = options.dataStore.getField(col.key);

                            //Create change function if after change function passed, if not, revert background after change
                            var change = options.dataStore.changeFactory(col.key, store, function (key, value, store, revertBackground, response) {
                                if (options.afterChange) return options.afterChange(me, key, value, store, revertBackground, response);
                                else revertBackground();
                            });

                            switch (field.type) {
                                case 'date':
                                    datePicker.activate({ el: el, change: change });
                                    break;
                                case 'select':
                                    dropdown.activate({ el: el, change: change, options: field.options });
                                    break;
                                case 'number':
                                    numberfield.activate({ el: el, change: change, field: field });
                                    break;
                                case 'textarea':
                                    textarea.activate({ el: el, change: change });
                                    break;
                                default:
                                    textfield.activate({ el: el, change: change });
                                    break;
                            }
                        }
                    });
                });

                //setup report filter fields:
                var m = moment();
                
                var startDate = "";
                var endDate = "";
                var itpm = "";
                var sortByGoLiveDate = "";
                var franchisee = "";
                var sitesurveycompleted = "";
                var orderdocsent = "";
                var hashURL = window.location.hash.substr(1);
                var hashes = hashURL.split('/');

                if (hashes.length > 1) {

                    // Typical For loop. We start at 1 and not 0 since the array length starts counting at 1 but the array counts positions starting at 0
                    for (var i = 1; i < hashes.length; i++) {

                        // Run the function. We run the # value through the window to grab the function. This is a bit harder to explain so just take my word for it
                        if (hashes[i] === "start")
                            startDate = hashes[i + 1];
                        else if (hashes[i] === "end")
                            endDate = hashes[i + 1];
                        else if (hashes[i] === "itpm")
                            itpm = hashes[i + 1];
                        else if (hashes[i] === "golivedate")
                            sortByGoLiveDate = hashes[i + 1];
                        else if (hashes[i] === "franchisee")
                            franchisee = hashes[i + 1];
                        else if (hashes[i] === "sitesurveycompleted")
                            sitesurveycompleted = hashes[i + 1];
                        else if (hashes[i] === "orderdocsent")
                            orderdocsent = hashes[i + 1];

                    }

                }

                if (startDate.length > 0)
                {
                    var m2 = moment(startDate, 'YYYY-MM-DD');
                    table.find('#start-date').val(m2.format('MM/DD/YYYY'));
                }
                else
                    table.find('#start-date').val(m.format('MM/DD/YYYY'));

                if (endDate.length > 0) {
                    var m2 = moment(endDate, 'YYYY-MM-DD');
                    table.find('#end-date').val(m2.format('MM/DD/YYYY'));
                }
                else
                    table.find('#end-date').val(m.add(150, 'days').format('MM/DD/YYYY'));

                if (itpm.length > 0)
                    table.find('#itpm option[value="' + itpm + '"]').attr('selected', 'selected');
                    
                if (franchisee.length > 0)
                    table.find('#Franchisee').val(franchisee);

                if (sortByGoLiveDate.length > 0)     
                    table.find('input[name=golivedate][value=' + sortByGoLiveDate + ']').prop('checked', 'checked');
                
                if (sitesurveycompleted.length > 0)
                    table.find('input[name=sitesurveycompleted][value=' + sitesurveycompleted + ']').prop('checked', 'checked');

                if (orderdocsent.length > 0)
                    table.find('input[name=orderdocsent][value=' + orderdocsent + ']').prop('checked', 'checked');
                
                //Insert the table into the target element
                $(options.target).html(table);
               
                if (options.showExportOptions !== false) $(options.target).append(link, " - ", excelLink);

                //Callback
                options.callback(me);

            }
        }
    };

    //Utility function
    //TODO Put this somewhere to be accesed by all views that use sharepoint data
    function formatDate(dateString, formatString) {
        formatString = formatString || "l";

        if (typeof dateString !== 'undefined' && dateString.split("-").length > 1) {
            return moment(dateString).format("l");
        } else {
            return "";
        }
    }
});