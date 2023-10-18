define([
    'app/store/construction',
    'app/store/combined',
    'app/widget/datepicker',
    'app/widget/dropdown',
    'app/widget/textfield',
    'app/widget/numberfield',
    'app/widget/textarea'
], function (construction, combined, datePicker, dropDown, textField, numberField, textArea) {
    var self = {};

    self.activate = function (element, store, beforeChange, afterChange, dataStore) {
        //Get the element if it's a selector
        if (typeof element === 'string') {
            element = $(element);
        }
        dataStore = dataStore || construction;
        var changeFactory = (typeof dataStore !== 'undefined' ?  dataStore.changeFactory : construction.changeFactory);
        
        //Locate all the data-editable items and activate
        element.find('[data-editable]').each(function () {
            //Lookup the item in the construction list, then the combined list
            var key = $(this).attr('data-editable'),
                field = dataStore.getField(key) || combined.getField(key);

            //Build the callback function if needed - default to the change factory on the store for the field
            var change = changeFactory(key, store, afterChange);
            //Call the beforeChange callback if it was passed in - calls same one for every field, then the relevant change factory function if not returned a false value
            if (typeof beforeChange === 'function') {
                change = function (newValue, revertBackground, oldValue, el) {
                    if (beforeChange(key, newValue, revertBackground, oldValue, el) !== false) {
                        return changeFactory(key, store, afterChange)(newValue, revertBackground, oldValue, el);
                    } else {
                        return false;
                    }
                }
            }

            //Build the appropriate field
            switch (field.type) {
                case 'select':
                    dropDown.activate({el: this, value: store[key], options: field.options, change: change});
                    break;
                case 'date':
                    datePicker.activate({el: this, value: store[key], change: change});
                    break;
                case 'number':
                    numberField.activate({el: this, value: store[key], change: change, field: field});
                    break;
                case 'textarea':
                    textArea.activate({el: this, value: store[key], change: change});
                    break;
                default:
                    textField.activate({el: this, value: store[key], change: change});
                    break;
            }
        });

        //Locate all the data-display items to show values
        element.find('[data-display]').each(function () {
            //Lookup the item in the construction list, then the combined list
            var key = $(this).attr('data-display'),
                field = dataStore.getField(key);

            //Build the appropriate field
            switch (field.type) {
                case 'date':
                    $(this).html(store[key] !== "" ? moment(store[key]).format('l') : "");
                    break;
                case 'number':  
                    $(this).html(numberField.formatNumber(store[key]), field.format);
                    break;
                default:
                    $(this).html(store[key]);
                    break;
            }
        });
    };

    return self;
});