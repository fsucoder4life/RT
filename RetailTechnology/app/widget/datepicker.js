define([/*'dijit/CalendarLite'*/], function (Calendar) {
  function formatDate(dateString, formatString) {
    formatString = formatString || "l";

    if (dateString && moment(dateString).isValid()) {
      return moment(dateString).format(formatString);
    } else {
      return "";
    }
  }

  return {
    /**
     * Applies drop down date picker to each of the passed elements
     * @param elements an array of elements that define the selector for an element
     *     {selector: 'div #stuff' OR el: $('div #stuff'), value: 'Current Value', change: function (el, evt) {}}
     */
    activate: function (elements) {
      if (elements instanceof Array == false) {
        elements = [elements];
      }

      _.forEach(elements, function (element, index) {
        //Get the element if it's not set
        element.el = $(element.el || $(element.selector));

        if (element.el.is('input')) {
          //Get the value if not set
          if (element.value && typeof element.value === 'string') {
            element.value = formatDate(element.value);
          } else {
            element.value = formatDate(element.el.val());
          }

          //Hold a copy of the value and set it to that n case it was just passed in
          var value = formatDate(element.value);
          element.el.val(value);

          //Turn it into a datepicker field
          element.el.datepicker({format: 'm/d/yyyy'});

          //Shared function for changes
          var changed = function () {
            //Grab new value
            var newValue = element.el.val();

            //Check to see if it's a valid date or empty string
            var dateFormat = ["M/D/YYYY", "M/D/YY", "M/D", "D"];
            //All the new value checks except empty string are for weird IE injection issues
            if (moment(newValue, dateFormat, true).isValid() === false && newValue !== "" && newValue !== " ") {
              //Revert to old value and alert
              element.el.val(value);
              window.alert('Error: "' + newValue + '" is not a valid date, changes will not be saved.');
              return;
            } else if (newValue !== "" && newValue !== " ") {
              //If it's just month/day, make sure the year is in the future
              if (moment(newValue, 'M/D', true).isValid()) {
                var d = moment(newValue, 'M/D');
                if (moment().isAfter(d) && !moment().isSame(d, 'day')) {
                  d.add(1, 'years');
                }
                newValue = d.format('l');
              } else {
                //Set the date to the formatted version
                newValue = moment(newValue, dateFormat, true).format('l');
              }

              element.el.val(newValue);
            }


            //Check to see if it's changed
            if (newValue != value) {
              //Disable momentarily
              element.el.attr('disabled', true);

              //Save changes
              if (element.change) {
                var revertBackground = function () {
                  element.el.attr('disabled', false);
                };

                element.change(newValue, revertBackground, value, $(element.el));
              }

              //Store new value
              value = newValue;
            }
          };

          //Setup event handlers
          element.el
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
              if (evt.keyCode == 13) {
                evt.preventDefault();
                //Save if enter is pressed
                changed();
                element.el.datepicker('hide');
              } else if (evt.keyCode == 27) {
                //Restore old value if escape is pressed
                element.el.val(value);
                element.el.datepicker('hide');
              } else if (evt.keyCode == 9) {
                //Hide the picker if it's a tab
                element.el.datepicker('hide');
              }
            })
            .on('pick.datepicker', function (e) {
              //Handle when the date is picked from the picker
              element.el.val(moment(e.date).format('l'));
              changed();
              element.el.datepicker('hide');
              e.preventDefault();
            });

        } else {
          /**For the content editable version, not the input**/
          //Get the value if not set
          if (element.value && typeof element.value === 'string') {
            element.value = formatDate(element.value);
          } else {
            element.value = formatDate($(element.el).html());
          }

          //Add to element and set content editable true
          $(element.el)
            .attr('contenteditable', 'true')
            .html(element.value);

          //Hold a copy of the value
          var value = formatDate(element.value);

          //Shared function for changes
          var changed = function () {
            //Grab new value
            var editor = $(element.el);
            var newValue = $(editor).html();

            //Check to see if it's a valid date or empty string
            var dateFormat = ["M/D/YYYY", "M/D/YY", "M/D", "D"];
            //All the new value checks except empty string are for weird IE injection issues
            if (moment(newValue, dateFormat, true).isValid() === false && newValue !== "" && newValue !== "<br>" && newValue !== "<br/>" && newValue !== "&nbsp;") {
              //Revert to old value and alert
              $(editor).html(value);
              window.alert('Error: "' + newValue + '" is not a valid date, changes will not be saved.');
              return;
            } else if (newValue !== "" && newValue !== "<br>" && newValue !== "<br/>" && newValue !== "&nbsp;") {
              //If it's just month/day, make sure the year is in the future
              if (moment(newValue, 'M/D', true).isValid()) {
                var d = moment(newValue, 'M/D');
                if (moment().isAfter(d) && !moment().isSame(d, 'day')) {
                  d.add(1, 'years');
                }
                newValue = d.format('l');
              } else {
                //Set the date to the formatted version
                newValue = moment(newValue, dateFormat, true).format('l');
              }

              $(editor).html(newValue);
            }


            //Check to see if it's changed
            if (newValue != value) {
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
          };

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
              if (evt.keyCode == 13) {
                evt.preventDefault();
                //Save if enter is pressed
                changed();
              } else if (evt.keyCode == 27) {
                //Restore old value if escape is pressed
                $(element.el).html(value);
              }
            })
            .on('paste', function (evt) {
              if (evt.type == 'paste') {
                setTimeout(function () {
                  if ($(element.el).html().indexOf('<') == 0) {
                    //Strip the html elements down to just text
                    $(element.el).html($($(element.el).html()).text());
                  }
                  console.log(arguments);
                }, 1);
              }
            });
          ;
        }
      });
    }
  }
});