define([
        'app/store/construction',
        'dojo/text!app/view/workflow/fabcon-commworks.html',
        'dojo/text!app/view/workflow/fabcon-commworks-dt-base.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (construction, popsTemplate, dtBaseTemplate, widgetHelper, Dialog, TextBox, Button) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var store = options.store,
                    t, title;
                
                if (options.type === 'pops') {
                    t = $(popsTemplate);
                    //Create input boxes for the to/from/cc/subject fields
                    me.subject = new TextBox({
                        value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - ISC/CommWorks POPS Purchase Order Initiation",
                        style: "width: 100%"
                    }, $(t).find('#subject')[0]);
    
                    //Create the button
                    me.submit = new Button({
                        label: "Send POPS Purchase Order"
                    }, $(t).find('#submit-button')[0]);
                    
                    title = "POPS Purchase Order";
                } else if (options.type === 'dt-base-kit') {
                    t = $(dtBaseTemplate);
                    //Create input boxes for the to/from/cc/subject fields
                    me.subject = new TextBox({
                        value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - ISC/CommWorks DT Base Kit Order Initiation",
                        style: "width: 100%"
                    }, $(t).find('#subject')[0]);
    
                    //Create the button
                    me.submit = new Button({
                        label: "Send DT Base Kit Purchase Order"
                    }, $(t).find('#submit-button')[0]);
                    
                    title = "DT Base Kit Purchase Order"
                }

                //Activate all the fields marked as display
                widgetHelper.activate($(t).find('#message'), store);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: title,
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