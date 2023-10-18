define(function () {

  return {
    /**
     * Applies drop down data to each of the passed elements
     * @param elements an array of elements that define the selector for an element
     *     {selector: 'div #stuff' OR el: $('div #stuff'), value: 'Current Value', options: ['My Value', ...], change: function (el, evt) {}}
     */
    activate: function (elements) {
      if (elements instanceof Array == false) {
        elements = [elements];
      }

      _.forEach(elements, function (element, index) {
        //Get the element if it's not set
        element.el = $(element.el || $(element.selector));

        if (element.el.is('input')) {
          var value = element.value || element.el.val();

          //Set the value in case it was passed in vs. being in the content
          element.el.val(value);

          //Add a dropdown arrow on our input by adding the dropdown class
          element.el.addClass('dropdown-input');

          //Build UL
          var ul = $("<ul class='dropdown-ul'></ul>");
          _.forEach(element.options, function (option, optionIndex) {
            ul.append("<li id='id-" + optionIndex + "'>" + option + "</li>");
          });
          //Append it at the end of the parent element;
          element.el.parent().append(ul);

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

                element.change(newValue, revertBackground, value, element.el);
              }

              //Store new value
              value = newValue;
            }
          };

          //Listen for events on the input
          element.el
            .on('focus', function() {
              //Make sure it's in the right spot
              ul.css({
                top: element.el.position().top + element.el.outerHeight(),
                left: element.el.position().left
              });
              ul.show();
            })
            .on('blur', function () {
              ul.hide();
              changed();
            })
            .on('keydown', function (evt) {
              //Check to see if it was the enter key or escape key
              if (evt.keyCode == 13) {
                evt.preventDefault();
                //Force blur if enter is pressed
                $(this).blur();
              } else if (evt.keyCode == 27) {
                //Restore old value if escape is pressed
                element.el.val(value);
                //Close the list and blur
                ul.hide();
                element.el.blur();
              }
            });

          ul.find('li')
            .on('mousedown', function(e) {
              e.stopPropagation();
              e.preventDefault();
              //Get the option index
              var index = $(this).attr('id').split('-')[1];
              //Set the value, then let the blur function store it
              element.el.val(element.options[index]);
              element.el.blur();
            });

        } else {
          //Get the value if not set
          if (typeof element.value === 'undefined') {
            element.value = $(element.el).html();
          }

          //Build value div
          var html = "<div class='dropdown'><div contenteditable='true'>" + element.value + "</div>";

          //Build UL
          html += "<ul>";
          _.forEach(element.options, function (option, optionIndex) {
            html += "<li id='id-" + optionIndex + "'>" + option + "</li>";
          });
          //Close tags
          html += "</ul></div>";

          //Add to element
          $(element.el).html(html);

          //Hold a copy of the value
          var value = element.value;

          //Shared function for changes
          var changed= function () {
            //Check to see if it's changed
            var newValue = $(element.el).find('[contenteditable]').html();
            //Strip a BR tag if it's there
            newValue = newValue.replace('<br>', '').replace('<br/>', '').replace('<BR>', '').replace('<BR>', '');

            if (newValue != value) {
              //Disable momentarily
              var editor = $(element.el).find('[contenteditable]');
              $(editor)
                .attr('contenteditable', 'false')
                .addClass('saving-lock');

              //Save changes via passed callback - they have to
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
          $(element.el).find('[contenteditable]')
            .focus(function (evt) {
              //Show the drop down
              $(element.el).find('ul').show();
              //Show a border
              $(this).css('box-shadow', 'inset 0px 0px 5px #006');
            })
            .blur(function (evt) {
              //Hide Border
              $(this).css('box-shadow', 'none');
              //Wait for one cycle to make sure we didn't click the drop down
              setTimeout(function () {
                //Hide the drop down
                $(element.el).find('ul').hide();

                changed();
              }, 300);
            })
            .on('keydown', function (evt) {
              //Check to see if it was the enter key or escape key
              if (evt.keyCode == 13) {
                evt.preventDefault();
                //Force blur if enter is pressed
                $(this).blur();
              } else if (evt.keyCode == 27) {
                //Restore old value if escape is pressed
                $(element.el).find('[contenteditable]').html(value);
                //Close the list and blur
                $(element.el).find('ul').hide();
                $(element.el).find('[contenteditable]').blur();
              }
            })
            .on('paste', function (evt) {
              if (evt.type == 'paste') {
                setTimeout(function () {
                  if ($(element.el).find('[contenteditable]').html().indexOf('<') == 0) {
                    //Strip the html elements down to just text
                    $(element.el).find('[contenteditable]').html($($(element.el).find('[contenteditable]').html()).text());
                  }
                }, 1);
              }
            });
          ;

          //Setup event handlers for the list
          $(element.el).find('li').click(function () {
            //Get the option index
            var index = $(this).attr('id').split('-')[1];
            //Set the value, then let the blur function store it
            $(element.el).find('[contenteditable]').html(element.options[index]);
          });
        }
      });
    }
  }
});