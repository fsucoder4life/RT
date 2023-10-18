define([
        'app/store/construction',
        'dojo/text!app/view/workflow/payment-monetization-order.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
], function (construction, template, widgetHelper, Dialog, TextBox, Button) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var store = options.store,
                    t = $(template);

                //Activate all the fields marked as display
                widgetHelper.activate($(t).find('#message'), store);

                //Create input boxes for the to/from/cc/subject fields
                me.subject = new TextBox({
                    value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - Payment Monetization Order",
                    style: "width: 100%"
                }, $(t).find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: "Send Next Gen Pays Order"
                }, $(t).find('#submit-button')[0]);

                
                
                var vpUnitsQuantity;
                var hughesSwitchUpgradeOrderedQuantity;
                
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Construction Extend",
                    CAMLViewFields: "<ViewFields><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_' /><FieldRef Name='Hughes_x0020_Switch_x0020_Upgrad' /></ViewFields>",
                    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                    CAMLRowLimit: 1,
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            var vpUnits = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_");
                            var hughesSwitchUpgradeOrdered = $(this).attr("ows_Hughes_x0020_Switch_x0020_Upgrad");
                            
                            vpUnitsQuantity = (vpUnits === '' ? 0 : parseInt(vpUnits));
                            hughesSwitchUpgradeOrderedQuantity = (hughesSwitchUpgradeOrdered === '' ? 0 : parseInt(hughesSwitchUpgradeOrdered));
                            $(t).find('.vpUnitsQuantity').text(vpUnitsQuantity);
                            $(t).find('.hughesSwitchUpgradeOrderedQuantity').text(hughesSwitchUpgradeOrderedQuantity);
                        });
                    }
                });

                //Create the dialog box
                me.dialog = new Dialog({
                    title: "Next Gen Pays Order",
                    content: t,
                    style: "width: 1150px; height: 710px;",
                    hide: function () {
                        me.subject.destroy();
                        me.submit.destroy();
                        me.message.destroy();
                        me.dialog.destroy();
                    }
                });

                //Show the dialog box
                me.dialog.show();

                //Activate ckeditor
                me.message = CKEDITOR.replace('message', {
                    height: '450px',
                    allowedContent: true,
                    toolbarGroups: [
                        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                        { name: 'editing',     groups: [ 'find', 'selection'] },
                        { name: 'links' },
                        { name: 'insert' },
                        { name: 'forms' },
                        { name: 'tools' },
                        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
                        { name: 'others' },
                        '/',
                        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                        { name: 'styles' },
                        { name: 'colors' },
                        { name: 'about' }
                    ]
                });

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
}
);