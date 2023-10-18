define([
        'app/store/construction',
        'dojo/text!app/view/workflow/pos-data-order.html',
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
                    value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - POS Data Order",
                    style: "width: 100%"
                }, $(t).find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: "Send POS Data Order"
                }, $(t).find('#submit-button')[0]);

                //Update the serial cable quantity
                var paysQuantity = (store.PaysQuantity === '' ? 0 : parseInt(store.PaysQuantity));
                t.find('#serial-cables').html(1);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: "POS Data Order",
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