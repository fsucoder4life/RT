define(function () {
    return {

        activate: function (elements) {
            if (elements instanceof Array == false) {
                elements = [elements];
            }

            _.forEach(elements, function (element, index) {
                //Get the element if it's not set
                element.el = element.el || $(element.selector);

                //Get the value if it doesn't exist yet
                var value = element.value || $(element.el).html();

                //Add to element and set content editable true
                $(element.el)
                    .attr('contenteditable','true')
                    .html(value);

                //Shared function for changes
                function changed () {
                    //Check to see if it's changed
                    var newValue = $(element.el).html();
                    if (newValue != value) {
                        //Disable momentarily
                        $(element.el)
                            .attr('contenteditable', 'false')
                            .addClass('saving-lock');

                        //Save changes via passed callback
                        if (element.change) {
                            var revertBackground = function () {
                                $(element.el)
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
                        //Show border
                        $(this).css('box-shadow', 'inset 0px 0px 5px #006');
                    })
                    .blur(function (evt) {
                        //Hide border
                        $(this).css('box-shadow', 'none');

                        changed();
                    })
                    .on('keydown', function (evt) {
                        //Check to see if it was the enter key or escape key
                        if(evt.keyCode == 13) {
                            evt.preventDefault();
                            //Force blur if enter is pressed
                            $(this).blur();
                        } else if (evt.keyCode == 27) {
                            //Restore old value if escape is pressed and blur
                            $(element.el)
                                .html(value)
                                .blur()
                            ;
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
        }
    }
});