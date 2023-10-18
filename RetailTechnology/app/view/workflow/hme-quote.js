define([
        'app/store/construction',
        'dojo/text!app/view/workflow/hme-quote.html',
        'app/widget/widgetHelper',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button'
    ], function (construction, quoteTemplate, widgetHelper, Dialog, TextBox, Button) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var store = options.store,
                    quote = $(quoteTemplate);

                //Activate all the fields marked as display
                widgetHelper.activate($(quote).find('#quote-info'), store);

                //Estimate the number of routers
                var stalls = store.TotalStalls;
                
                var TotalStallCountWithFlat = (store.StallCount !== "" ? parseInt(store.StallCount) : 0) + (store.FlatCount !== "" ? parseInt(store.FlatCount) : 0);
                
//                if (store.DriveThru.toUpperCase.indexOf('SINGLE') !== -1)
//                    stalls++;
//                if (store.DriveThru.toUpperCase.indexOf('DOUBLE') !== -1)
//                    stalls+= 2;
                var routers;
                if (stalls <= 15) {
                    routers = 1;
                } else if (stalls > 15 && stalls <= 31) {
                    routers = 2;
                } else if (stalls > 31 && stalls <= 47) {
                    routers = 3
                } else {
                    routers = 4;
                }

                $(quote).find('#Routers').html(routers);
                $(quote).find('#TotalStallCountWithFlat').html(TotalStallCountWithFlat);
                if (store.FranchiseGroup.toUpperCase().indexOf('SONIC') !== -1 && store.FranchiseGroup.toUpperCase().indexOf('RESTAURANTS') !== -1 && store.FranchiseGroup.toUpperCase().indexOf('INC') !== -1) {
                    $(quote).find('#Cable').html('Yes');
                    $(quote).find('#SpeakersMics').html('Yes');
                    
                    //FlatCount
                }

                //Create input boxes for the to/from/cc/subject fields
                me.subject = new TextBox({
                    value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - HME Quote Request",
                    style: "width: 100%"
                }, $(quote).find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: "Send Quote Request"
                }, $(quote).find('#submit-button')[0]);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: "HME Quote Request",
                    content: quote,
                    style: "width: 1000px",
                    hide: function () {
                        me.message.destroy();
                        me.dialog.destroy();
                        me.subject.destroy();
                        me.submit.destroy();
                    }
                });

                //Show the dialog box
                me.dialog.show();

                //Activate ckeditor
                me.message = CKEDITOR.replace('message', {
                    height: '450px',
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