define([
        'app/store/construction',
        'dojo/text!app/view/workflow/payment-modernization-order.html',
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

            me.to = new TextBox({
                value: "SonicOrder@level10.com; ",
                style: "width: 100%"
            }, $(t).find('#to')[0]);

            me.cc = new TextBox({
                value: "technology.implementation@sonicdrivein.com;" + currentUsersEmail + "; ",
                style: "width: 100%"
            }, $(t).find('#cc')[0]);

            //Create the button
            me.submit = new Button({
                label: "Send Next Gen Pays Order"
            }, $(t).find('#submit-button')[0]);



            var vpUnitsQuantity;
            var hughesSwitchUpgradeOrderedQuantity;
            var vp45Quantity;
            var vp90Quantity;
            var sunShieldQuantity;
            var DTWindowQuantity;
            var serverCabinetQuantity;
            var serverCabinet12uQuantity;
            var serverCabinetShelfQuantity;

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLViewFields: "<ViewFields><FieldRef Name='VP6800_x0020_Server_x0020_Cabine2' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine1' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine0' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_0' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_1' /><FieldRef Name='Hughes_x0020_Switch_x0020_Upgrad' /><FieldRef Name='VP6800_x0020_Sunshield' /><FieldRef Name='VP6800_x0020_DT_x0020_Window' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine' /></ViewFields>",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                CAMLRowLimit: 1,
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var vpUnits = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_");
                        var vpUnits45 = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_0");
                        var vpUnits90 = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_1");
                        var hughesSwitchUpgradeOrdered = $(this).attr("ows_Hughes_x0020_Switch_x0020_Upgrad");
                        var sunShieldOrdered = $(this).attr("ows_VP6800_x0020_Sunshield");
                        var DTWindow = $(this).attr("ows_VP6800_x0020_DT_x0020_Window");
                        var serverCabinet = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine");
                        var serverCabinetOrdered = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1");
                        var serverCabinet12uOrdered = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2");
                        var serverCabinetShelf = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine0");

                        vpUnitsQuantity = (vpUnits === '' ? 0 : parseInt(vpUnits));
                        vp45Quantity = (vpUnits45 === '' ? 0 : parseInt(vpUnits45));
                        vp90Quantity = (vpUnits90 === '' ? 0 : parseInt(vpUnits90));
                        hughesSwitchUpgradeOrderedQuantity = (hughesSwitchUpgradeOrdered === '' ? 0 : parseInt(hughesSwitchUpgradeOrdered));
                        sunShieldQuantity = (sunShieldOrdered === '' ? 0 : parseInt(sunShieldOrdered));
                        DTWindowQuantity = (DTWindow === '' ? 0 : parseInt(DTWindow));
                        serverCabinetQuantity = (serverCabinetOrdered === '' ? 0 : parseInt(serverCabinetOrdered));
                        serverCabinet12uQuantity = (serverCabinet12uOrdered === '' ? 0 : parseInt(serverCabinet12uOrdered));

                        serverCabinetShelfQuantity = (serverCabinetShelf === '' ? 0 : parseInt(serverCabinetShelf));

                        if (Number.isNaN(serverCabinetQuantity) || serverCabinetQuantity === 0) {
                            serverCabinetQuantity = 0;
                        }

                        if (Number.isNaN(serverCabinet12uQuantity) || serverCabinet12uQuantity === 0) {
                            serverCabinet12uQuantity = 0;
                        }

                        if (Number.isNaN(serverCabinetShelfQuantity) || serverCabinetShelfQuantity === 0) {
                            serverCabinetShelfQuantity = 0;
                        }

                        if (Number.isNaN(vpUnitsQuantity) || vpUnitsQuantity === 0) {
                            vpUnitsQuantity = 0;
                            $(t).find('.vpUnitsQuantityRow').remove();
                        }

                        if (Number.isNaN(hughesSwitchUpgradeOrderedQuantity) || hughesSwitchUpgradeOrderedQuantity === 0) {
                            hughesSwitchUpgradeOrderedQuantity = 0;
                            $(t).find('.hughesSwitchUpgradeOrderedQuantityRow').remove();
                        }

                        if (serverCabinetShelfQuantity > 0) {
                            $(t).find('#MOR71').css("display", "");
                            $(t).find('#MOR71').removeClass("TablePMORemoveRow");
                        }
                        else
                            $(t).find('#MOR71').remove();

                        if (Number.isNaN(vp45Quantity) || vp45Quantity === 0) {
                            vp45Quantity = 0;
                            $(t).find('.vp45QuantityRow').remove();
                        }
                        if (Number.isNaN(vp90Quantity) || vp90Quantity === 0) {
                            vp90Quantity = 0;
                            $(t).find('.vp90QuantityRow').remove();
                        }
                        if (Number.isNaN(sunShieldQuantity) || sunShieldQuantity === 0) {
                            sunShieldQuantity = 0;
                            $(t).find('.sunShieldQuantityRow').remove();
                        }
                        if (Number.isNaN(DTWindowQuantity) || DTWindowQuantity === 0) {
                            DTWindowQuantity = 0;
                            $(t).find('.DTWindowQuantityRow').remove();
                        }
                        if (serverCabinetQuantity) {
                            if (serverCabinetQuantity > 0) {
                                $(t).find('#serverCabinet6u').css("display", "");
                                $(t).find('#serverCabinet6u').removeClass("TablePMORemoveRow");
                            }
                            else
                                $(t).find('#serverCabinet6u').remove();
                        }
                        else
                            $(t).find('#serverCabinet6u').remove();
                        if (serverCabinet12uQuantity) {
                            if (serverCabinet12uQuantity > 0) {
                                $(t).find('#serverCabinet12u').css("display", "");
                                $(t).find('#serverCabinet12uFan').css("display", "");
                                $(t).find('#serverCabinet12u').removeClass("TablePMORemoveRow");
                                $(t).find('#serverCabinet12uFan').removeClass("TablePMORemoveRow");
                            }
                            else {
                                $(t).find('#serverCabinet12u').remove();
                                $(t).find('#serverCabinet12uFan').remove();
                            }
                        }
                        else {
                            $(t).find('#serverCabinet12u').remove();
                            $(t).find('#serverCabinet12uFan').remove();
                        }

                        var fanKitQuantity = 0;
                        if (serverCabinetQuantity === 0 && serverCabinet12uQuantity === 0) {
                            $(t).find('.fankit').remove();
                        }
                        else {
                            if (serverCabinetQuantity === 0) {
                                fanKitQuantity = serverCabinet12uQuantity;
                            }
                            if (serverCabinet12uQuantity === 0) {
                                fanKitQuantity = serverCabinetQuantity;
                            }

                        }
                        $(t).find('.vpUnitsQuantity').text(vpUnitsQuantity);
                        $(t).find('.hughesSwitchUpgradeOrderedQuantity').text(hughesSwitchUpgradeOrderedQuantity);
                        $(t).find('.vp45Quantity').text(vp45Quantity);
                        $(t).find('.vp90Quantity').text(vp90Quantity);
                        $(t).find('.sunShieldQuantity').text(sunShieldQuantity);
                        $(t).find('.DTWindowQuantity').text(DTWindowQuantity);
                        $(t).find('.serverCabinetQuantity').text(serverCabinetQuantity);
                        $(t).find('.fanKitQuantity').text(fanKitQuantity);
                        $(t).find('.serverCabinet12uQuantity').text(serverCabinet12uQuantity);
                        $(t).find('.serverCabinetShelfQuantity').text(serverCabinetShelfQuantity);

                    });
                }
            });


            var topPONum;

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='VP6800_x0020_PO_x0020_Num' /></ViewFields>",
                CAMLQuery: "<Query><Where><Leq><FieldRef Name='VP6800_x0020_PO_x0020_Num' /><Value Type='Number'>199999</Value></Leq></Where><OrderBy><FieldRef Name='VP6800_x0020_PO_x0020_Num' Ascending='FALSE' /></OrderBy></Query>",
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
            if (VP6800PONumTemp > 200000) //only Level 10 POs are above 200000
                VP6800PONumTemp = VP6800PONumTemp - 100000;
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

            $(t).find('#PONum').text(VP6800PONumTemp);

            //Create the dialog box
            me.dialog = new Dialog({
                title: "Next Gen Pays Order",
                content: t,
                style: "width: 1150px; height: 710px;",
                hide: function () {
                    me.subject.destroy();
                    me.to.destroy();
                    me.cc.destroy();
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
                    { name: 'clipboard', groups: ['clipboard', 'undo'] },
                    { name: 'editing', groups: ['find', 'selection'] },
                    { name: 'links' },
                    { name: 'insert' },
                    { name: 'forms' },
                    { name: 'tools' },
                    { name: 'document', groups: ['mode', 'document', 'doctools'] },
                    { name: 'others' },
                    '/',
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
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