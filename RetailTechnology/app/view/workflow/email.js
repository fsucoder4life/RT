define([
        'dojo/text!app/view/workflow/email.html',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (template, Dialog, TextBox, Button) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var to = options.to || '',
                    cc = options.cc || '',
                    subject = options.subject || '',
                    body = options.body || '',
                    buttonText = options.button || 'Send Email',
                    title = options.title || 'Email',
                    t = $(template);

                //Inject the message body
                t.find('#message-body').html(body);

                //Create input boxes for the to/from/cc/subject fields
                me.to = new TextBox({
                    value: to,
                    style: "width: 100%"
                }, $(t).find('#to')[0]);
                me.cc = new TextBox({
                    value: cc,
                    style: "width: 100%"
                }, $(t).find('#cc')[0]);
                me.subject = new TextBox({
                    value: subject,
                    style: "width: 100%"
                }, $(t).find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: buttonText
                }, $(t).find('#submit-button')[0]);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: title,
                    content: t,
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