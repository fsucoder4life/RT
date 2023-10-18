define([
        'app/store/construction',
        'dojo/text!app/view/workflow/level-ten-data-order.html',
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
                    value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - Next Gen Pays Order",
                    style: "width: 100%"
                }, $(t).find('#subject')[0]);
                $(t).find('#cc').html("SDI-NewStoreTechnologyInstallations-DL@sonicdrivein.com;" + currentUsersEmail + "; ");
                
                //Create the button
                me.submit = new Button({
                    label: "Send Level 10 Order"
                }, $(t).find('#submit-button')[0]);






                var topPONum;

                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Construction Extend",
                    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='VP6800_x0020_PO_x0020_Num' /></ViewFields>",
                    CAMLQuery: "<Query><OrderBy><FieldRef Name='VP6800_x0020_PO_x0020_Num' Ascending='FALSE' /></OrderBy></Query>",
                    CAMLRowLimit: 1,
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            topPONum = $(this).attr("ows_VP6800_x0020_PO_x0020_Num");
                        });
                    }
                });
                var VP6800OrderedDate = moment().format('MM/DD/YYYY');
                var VP6800PONumTemp = Number(topPONum) + 1;
                if (VP6800PONumTemp < 200000) //only Level 10 POs are above 200000
                    VP6800PONumTemp = VP6800PONumTemp + 100000;
                //console.log("VP6800PONumTemp:" + VP6800PONumTemp.substring(0,1));
                $("#VP6800Ordered").text(VP6800OrderedDate);
                $("#VP6800PONum").text(VP6800PONumTemp);

                if (store.CombinedConstructionExtendId === undefined) {
                    $().SPServices({
                        operation: "GetListItems",
                        listName: "Combined Construction Extend",
                        CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
                        CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                        CAMLRowLimit: 1,
                        async: false,
                        completefunc: function (xData, Status) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                store.CombinedConstructionExtendId = $(this).attr("ows_ID");
                            });
                        }
                    });
                }

                var VP6800OrderedDateSPFormat = moment(VP6800OrderedDate, ['MM/DD/YYYY', 'YYYY-MM-DD']).toISOString();
                 
                //update in the store:
                $().SPServices({
                    operation: "UpdateListItems",
                    listName: "Combined Construction Extend",
                    ID: store.CombinedConstructionExtendId,
                    async: false,
                    batchCmd: "Update",
                    valuepairs: [["VP6800_x0020_PO_x0020_Num", VP6800PONumTemp], ["VP6800_x0020_Ordered", VP6800OrderedDateSPFormat]]
                });

                $(t).find('#VP6800PONum').text(VP6800PONumTemp);







                //Update the serial cable quantity
                var paysQuantity = (store.PaysQuantity === '' ? 0 : parseInt(store.PaysQuantity));
                t.find('#serial-cables').html(1);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: "Level 10 Order",
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