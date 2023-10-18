define([
        'app/store/construction',
        'dojo/text!app/view/project-review/table.html',
        'dojo/text!app/view/project-review/row.html',
        'app/widget/dropdown',
        'app/widget/datepicker',
        'app/widget/textfield',
        'app/widget/numberfield',
        'app/widget/widgetHelper',
        "dojo/number"
    ], function (construction, tableTemplate, rowTemplate, dropdown, datePicker, textfield, numberfield, widgetHelper, dNumber) {

    return {
        render: function (options) {
            //required options:  construction || combined query, columns, title, target
            options.callback = options.callback || function () {};

            //Turn the tableTemplate into a dom element
            var table = $($.parseHTML(tableTemplate));

            //Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY - h:mm A'));
            //Set the title
            $('#sub-title').html(options.title);

            //Get the data - pass the whole options object, only requires the combined/construction queries
            if (options.data) {
                processData(options.data);
            } else {
                construction.loadData(options, processData);
            }

            //Process the data
            function processData (data) {
                //Stop if another route has registered
                if (!options.routeCheck()) {
                    return;
                }

                //Turn it into an array to filter and sort
                var arr = [];
                _.forIn(data, function (store, storeNumber) {
                    arr.push(store);
                });

                //Filter
                if (typeof options.filter === 'function') {
                    arr = options.filter(arr);
                }

                //Sort
                if (typeof options.sort === 'function') {
                    arr = options.sort(arr);
                } else if (typeof options.sort === 'object') {
                    if (arr.length > 1 && "StoreNumber" in arr[0]) {
                        arr = _.map(_.sortBy(arr, [options.sort.key, "StoreNumber"]))
                    } else {
                        arr = _.map(_.sortBy(arr, [options.sort.key]));
                    }

                    if ("direction" in options.sort && options.sort.direction !== "DESC") {
                        arr.reverse();
                    }
                }

                //Build the store data
                _.forEach(arr, function (store, storeIndex) {
                    //Go and add a row for each store, set an id so you can find it later
                    var $tr = $(rowTemplate);
                    $tr.attr('id', "number" + store.StoreNumber);

                    //make the title link have an href
                    $tr.find('#store-link').attr('href', '#summary/' + store.StoreNumber);

                    //Remove the config & EM statuses on Infor stores
                    if (store.Pos.toUpperCase() === "INFOR"){
                        $tr.find('div[data-editable="PosConfigDate"]').parent().remove();
                    }

                    //Add view to callback for value changes
                    function beforeChange (key, newValue, revertBackground, oldValue, el) {
                        //If function is passed, call on each value change and return the value in this callback - allows business logic before field change
                        if (options.beforeChange) return options.beforeChange(me, key, newValue, revertBackground, oldValue, el);
                    }
                    //Add view to callback for value changes
                    function afterChange (key, value, store, revertBackground, response) {
                        //If function is passed, call on each value change and return the value in this callback - allows business logic after field change/save
                        if (options.afterChange) return options.afterChange(me, key, value, store, revertBackground, response);
                        else revertBackground();
                    }

                    //Activate all the fields marked as display or editable
                    widgetHelper.activate($tr, store, beforeChange, afterChange);

                    //Remove the data-display values from the row summaries and headers so the business rules don't run twice
                    $tr.find('.row-summary div[data-display]')
                        .removeData('display')
                        .removeAttr('data-display');

                    table.children('table').children('tbody').append($tr);

                    //Apply an event listener to the plus/minus button
                    var expanded = false,
                        startHeight;
                    $tr.find('.expander').click(function() {
                        if (expanded) {
                            //Show the summary and collapse the details
                            $tr.find('.row-summary').show();
                            $tr.find('.row-details').slideUp(500, function (e) {
                                $tr.find('i.fa-minus-circle')
                                    .removeClass('fa-minus-circle')
                                    .addClass('fa-plus-circle');
                                expanded = false;
                            });
                            //Fix the height of the absolute positioned cell at left
                            $tr.find('td:nth-child(1)').animate({'height': startHeight});
                        } else {
                            //Grab start height
                            startHeight = $tr.find('td:nth-child(1)').height();

                            //Hide the details
                            $tr.find('.row-summary').hide();

                            //Show/hide the element to get it's computed height, then slide the first cell to the same height
                            $tr.find('.row-details').show();
                            $tr.find('td:nth-child(1)').animate({'height': $tr.find('td:nth-child(2)').height()}, 500);
                            $tr.find('.row-details').hide();

                            //Expand the details
                            $tr.find('.row-details').slideDown(500, function (e) {
                                //Swap the plus/minus
                                $tr.find('i.fa-plus-circle')
                                    .removeClass('fa-plus-circle')
                                    .addClass('fa-minus-circle');
                                expanded = true;
                            });
                        }
                    });
                });

                var me = {
                    el: table,
                    stores: arr,
                    el: table
                };

                //Insert the table into the target element
                
                $(options.target).html(table);

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