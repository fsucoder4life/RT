define(function () {
  return {

    activate: function (elements) {
      if (elements instanceof Array == false) {
        elements = [elements];
      }

      _.forEach(elements, function (element, index) {
        //Get the element if it's not set
        element.el = $(element.el || $(element.selector));

        //Check to see if we are using a content editable DIV or an actual TEXTAREA
        if (element.el.is('textarea')) {
          var value = element.value || element.el.val();

          //Convert line breaks and spaces to characters
          value = value
              .replace(/<br\s*[\/]?>/gi, "\r\n")
              .replace(/\&nbsp\;/gi, ' ');

          //Set the value in case it was passed in vs. being in the content
          element.el.val(value);

          //Shared function for changes
          var changed = function () {
            //Check to see if it's changed
            var newValue = element.el.val();
            if (newValue != value) {
              //Disable momentarily
              element.el.attr('disabled', true);

              //Save changes via passed callback
              if (element.change) {
                var revertBackground = function () {
                  element.el.attr('disabled', false);
                };

                element.change(newValue.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n|\n|\r/g, '&lt;br/&gt;'), revertBackground, value, element.el);
              }

              //Store new value
              value = newValue;
            }
          };

          //Setup event handlers for the textarea
          element.el
            .focus(function (evt) {
              //Show border
              element.el.css('box-shadow', 'inset 0px 0px 5px #006');
            })
            .blur(function (evt) {
              //Hide border
              element.el.css('box-shadow', 'none');
              changed();
            })
            .on('keydown', function (evt) {
              //Check to see if it was the ctrl+enter key or escape key
              if (evt.keyCode == 13 && evt.ctrlKey) {
                evt.preventDefault();
                //Force blur if enter is pressed
                element.el.blur();
              } else if (evt.keyCode == 27) {
                //Restore old value if escape is pressed and blur
                element.el
                  .val(value)
                  .blur();
              }
            });

        } else {
          //Get the value if it doesn't exist yet
          var value = element.value || $(element.el).html();

          //Remove the wrapper div that sharepoint adds (it will get re-added, but it's stripped when inserted and causes a save the first time you blur the notes field)
          try {
            if (typeof $(value).prop('class') !== 'undefined' && $(value).prop('class').indexOf("ExternalClass") !== -1) {
              value = $(value).html();
            }
          } catch (e) {
            //Ignore the exceptions here
          }

          //Add to element and set content editable true
          $(element.el)
            .attr('contenteditable', 'true')
            .html(value);

          //Shared function for changes
          var changed = function () {
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

                element.change(newValue.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), revertBackground, value, $(element.el));
              }

              //Store new value
              value = newValue;
            }
          };

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
              //Check to see if it was the ctrl+enter key or escape key
              if (evt.keyCode == 13 && evt.ctrlKey) {
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
          ;
        }
      });
    }
  }
});