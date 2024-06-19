define([
        'app/store/construction',
        'dojo/text!app/view/workflow/hughes-request.html',
        'dojo/text!app/view/workflow/hughes-address-check.html',
        'dojo/text!app/view/workflow/hughes-status-check.html',
        'dojo/text!app/view/workflow/hughes-file-upload.html',
        'dojo/text!app/view/workflow/email.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (construction, quoteTemplate, warningTemplate, statusTemplate, fileUploadTemplate, emailTemplate, widgetHelper, Dialog, TextBox, Button) {

        return {
            renderAddressWarning: function(options) {
                var me = {};

                //Grab the store, and turn the template into an element
                var store = options.store,
                  warning = $(warningTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate(warning, store);

                //Grab links to buttons
                me.Yes = warning.find('#hughes-address-check-yes');
                me.No = warning.find('#hughes-address-check-no');

                warning.appendTo('body').modal();

                return me;
            },
            renderFileUpload: function(options) {
                var me = {};

                //Grab the store, and turn the template into an element
                var store = options.store,
                warning = $(warningTemplate),
                  upload = $(fileUploadTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate(upload, store);

                //Grab links to buttons
                me.Upload = upload.find('#hughes-agreement-upload');
                me.UploadLabel = upload.find('label[for="hughes-agreement-upload"]');
                me.UploadButton = upload.find('#hughes-upload-button');
                me.SendWithout = upload.find('#hughes-send-without');

                if (warning){
                    //remove the warning template
                    const divToRemove = document.getElementById("store-address-modal");

                    if (divToRemove) {
                    divToRemove.remove();
                    } else {
                    console.error("Div with ID 'store-address-modal' not found");
                    }
                }
                upload.appendTo('body').modal();

                return me;
            },
            renderStatusCheck: function(options) {
                var me = {};

                //Grab the store, and turn the template into an element
                var store = options.store,
                    upload = $(fileUploadTemplate),
                    status = $(statusTemplate);

                //Activate all the fields marked as display,
                widgetHelper.activate(status, store);

                //Grab links to buttons & Checkboxes
                me.Next = status.find('#hughes-status-check-next');
                me.UpdateVsat = status.find('#update-vsat-status');
                me.UpdateTemp = status.find('#update-temp-status');
                me.UpdatePrimary = status.find('#update-primary-status');
                me.UpdateDeinstall = status.find('#update-deinstall-status');

                if (upload){
                    //remove the warning template
                    const divToRemove = document.getElementById("file-upload-modal");

                    if (divToRemove) {
                    divToRemove.remove();
                    } else {
                    console.error("Div with ID 'file-upload-modal' not found");
                    }
                }
                status.appendTo('body').modal();

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
                    try {
                        quote.find('#phone').html(options.pm.phone);
                    } catch (e) {
                        
                    }

                        
                    
                    try {
                        quote.find('#email').html(options.pm.email);
                    } catch (e) {
                        
                    }

                        
                }

                //Hide anything noted as not required
                if (store.HughesVsatStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                    quote.find('#hughes-vsat-row').hide();
                }
                if (store.HughesTempStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                    quote.find('#hughes-temp-row').hide();
                }
                if (store.HughesPrimaryStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                    quote.find('#hughes-primary-row').hide();
                }
                if (store.HughesDeinstallStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                    quote.find('#hughes-deinstall-row').hide();
                }

                //Put a border on all the tops of the second table
                quote.find('table#schedule-table td').css('border-top', '1px solid black');

                //Inject the message body
                email.find('#message-body').html(quote);

                //Add the attachment note if it's there
                if (typeof store.CombinedDocuments !== 'undefined') {
                    me.attachment = false;
                    _.each(store.CombinedDocuments, function (doc, index) {
                        if (doc.FileName.indexOf('HUGHES-') !== -1 || doc.FileName.indexOf('HAN Agreement.xlsx') !== -1) {
                            me.attachment = doc;
                        }
                    });
                    if (me.attachment) {
                        email.find('#submit-button').after("Attachment: <a href='" + encodeURI(me.attachment.FilePath) +"'>" + me.attachment.FileName + "</a>");
                    } else {
                        email.find('#submit-button').after('No Attachment Found');
                    }
                }

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
                    value: store.City + ', ' + store.State + ' #' + store.StoreNumber + ' - Comcast Request',
                    style: "width: 100%"
                }, email.find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: 'Send Request'
                }, email.find('#submit-button')[0]);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: 'Comcast Request',
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