define([
        'app/store/construction',
        'dojo/text!app/view/workflow/pro-forma-address-check.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (construction,  warningTemplate, widgetHelper, Dialog, TextBox, Button) {

        return {
            renderAddressWarning: function(options) {
                var me = {};

                //Grab the store, and turn the template into an element
                var store = options.store,
                  warning = $(warningTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate(warning, store);

                //Grab links to buttons
                me.Yes = warning.find('#pro-forma-address-check-yes');
                me.No = warning.find('#pro-forma-address-check-no');

                warning.appendTo('body').modal();

                return me;
            }
            
            
            
        };
}
);