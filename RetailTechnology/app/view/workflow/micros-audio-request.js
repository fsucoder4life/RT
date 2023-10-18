define([
        'app/store/construction',
        'dojo/text!app/view/workflow/micros-audio.html',
        'dojo/text!app/view/workflow/micros-audio-input.html',
        'dojo/text!app/view/workflow/email.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (construction, quoteTemplate, inputTemplate, emailTemplate, widgetHelper, Dialog, TextBox, Button) {

        return {
            renderModal: function(options) {
                var me = {};

                //Grab the store, and turn the template into an element
                var store = options.store,
                  modal = $(inputTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate(modal, store);

                //Grab links to buttons
                me.OrderTakers = modal.find('#micros-audio-order-takers');
                me.Yes = modal.find('#micros-audio-input-yes');
                me.No = modal.find('#micros-audio-input-no');

                modal.appendTo('body').modal();

                return me;
            },
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var store = options.store,
                    quote = $(quoteTemplate),
                    email = $(emailTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate(quote, store);

                //Edit template fields for the PM signature:
                quote.find('#pm').html(store.ProjectManager);
                if (typeof options.pm !== undefined) {
                    quote.find('#phone').html(options.pm.phone);
                    quote.find('#email').html(options.pm.email);
                }

                //Put a border on all the tops of the second table
                quote.find('table#order-items td').css('border-top', '1px solid black');

                //Inject the message body
                email.find('#message-body').html(quote);

                //Create input boxes for the to/from/cc/subject fields
                me.to = new TextBox({
                    value: options.to,
                    style: "width: 100%"
                }, email.find('#to')[0]);

                me.cc = new TextBox({
                    value: options.cc,
                    style: "width: 100%"
                }, email.find('#cc')[0]);

                me.subject = new TextBox({
                    value: store.City + ', ' + store.State + ' #' + store.StoreNumber + ' - Micros Audio Request',
                    style: "width: 100%"
                }, email.find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: 'Send Request'
                }, email.find('#submit-button')[0]);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: 'Micros Audio Request',
                    content: email,
                    style: "width: 1150px; height: 710px;",
                    hide: function () {
                        me.to.destroy();
                        me.cc.destroy();
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
                        // { name: 'styles' },
                        { name: 'colors' },
                        // { name: 'about' }
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