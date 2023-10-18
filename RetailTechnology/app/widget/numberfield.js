define([/*'dijit/CalendarLite'*/], function (Calendar) {
    function formatNumber(number, format) {
      format = format || function (val) {return parseInt(val)};
      if (typeof number === 'string') {
            return format(number.replace(/[^-0-9\.]/g,''));
        } else {
            return format(number);
        }
    }

    return {
        activate: function (elements) {
            if (elements instanceof Array == false) {
                elements = [elements];
            }

            _.forEach(elements, function (element, index) {
                //Get the element if it's not set
                element.el = element.el || $(element.selector);
                
                var format = element.field.format || function (val) {return parseInt(val)};

                //Get the value if not set
                if (element.value && typeof element.value === 'string') {
                    element.value = formatNumber(element.value, format);
                } else {
                    element.value = formatNumber($(element.el).html(), format);
                }

                //Add to element and set content editable true
                $(element.el)
                    .attr('contenteditable','true')
                    .html(element.value);

                //Hold a copy of the value
                var value = formatNumber(element.value, format);

                //Shared function for changes
                function changed () {
                    //Grab new value
                    var editor = $(element.el);
                    var newValue = $(editor).html();

                    //Set the date to the formatted version
                    newValue = formatNumber(newValue, format);

                    //Check to see if it's changed
                    if (newValue != value) {
                        //Make sure it's equal to it's formatted version
                        $(editor).html(newValue);

                        //Disable momentarily
                        $(editor)
                            .attr('contenteditable', 'false')
                            .addClass('saving-lock');

                        //Save changes
                        if (element.change) {
                            var revertBackground = function () {
                                $(editor)
                                    .attr('contenteditable', 'true')
                                    .removeClass('saving-lock');
                            };

                            element.change(newValue, revertBackground, value, $(element.el));
                        }

                        //Store new value
                        value = newValue;
                    }
                }

                //Setup event handlers for the editable section
                $(element.el)
                    .focus(function (evt) {
                        //Show a border
                        $(this).css('box-shadow', 'inset 0px 0px 5px #006');
                    })
                    .blur(function (evt) {
                        //Hide border
                        $(this).css('box-shadow', 'none');

                        //Check if it's changed
                        changed();
                    })
                    .on('keydown', function (evt) {
                        //Check to see if it was the enter key or escape key
                        if(evt.keyCode == 13) {
                            evt.preventDefault();
                            //Save if enter is pressed
                            changed();
                        } else if (evt.keyCode == 27) {
                            //Restore old value if escape is pressed
                            $(element.el).html(value);
                        }
                    })
                    .on('paste', function (evt) {
                        if (evt.type == 'paste') {setTimeout(function () {
                            if ($(element.el).html().indexOf('<') == 0) {
                                //Strip the html elements down to just text
                                $(element.el).html($($(element.el).html()).text());
                            }
                            console.log(arguments);
                        }, 1);}
                    });

                ;
            });
        },

        formatNumber: formatNumber
    }
});