define([
        'app/store/construction',
        'dojo/text!app/view/workflow/promotion-order.html',
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
                widgetHelper.activate($(quote).find('#message'), store);

                //Update the HDMI Cable Count
                var tv = parseInt(store.TvQuantity || 0),
                    dmb = parseInt(store.DmbQuantity || 0);
                quote.find('#hdmi').html(tv + dmb);

                //set display and TV size
                if (promotionOrderDisplaySize === 49) {
                    quote.find('#digitalMenuSize').html("49\" Digital Menu");
                    quote.find('#digitalTVSize').html("49\" TV");
                }
                else {
                    quote.find('#digitalMenuSize').html("55\" Digital Menu");
                    quote.find('#digitalTVSize').html("55\" TV");
                }

                //Populate the marketing content field
                if (store.DmbQuantity == 1) {
                    quote.find('#MarketingContent').html("<ul><li>Display 1: Static Menu - All Items</li></ul>");
                } else if (store.DmbQuantity == 2) {
                    quote.find('#MarketingContent').html("<ul>" +
                        "<li>Display 1: Static Menu - All Items</li>" +
                        "<li>Display 2: Video - LTO - " + store.MorningDrinkStopTime + " Morning Drink Stop End</li>" +
                    "</ul>");
                } else if (store.DmbQuantity == 3) {
                    quote.find('#MarketingContent').html("<ul>" +
                        "<li>Display 1: Static Menu - All Combos</li>" +
                        "<li>Display 2: Static Menu - Drinks/Frozen</li>" +
                        "<li>Display 3: Video - LTO - " + store.MorningDrinkStopTime + " Morning Drink Stop End</li>" +
                    "</ul>");
                } else if (store.DmbQuantity == 4) {
                    quote.find('#MarketingContent').html("<ul>" +
                        "<li>Display 1: Static Menu - Combo 1 - 13</li>" +
                        "<li>Display 2: Static Menu - Combo 14+/Drinks</li>" +
                        "<li>Display 3: Static Menu - Frozen</li>" +
                        "<li>Display 4: Video - LTO - " + store.MorningDrinkStopTime + " Morning Drink Stop End</li>" +
                    "</ul>");
                }

                //Create input boxes for the to/from/cc/subject fields
                me.subject = new TextBox({
                    value: "Store #" + store.StoreNumber + " - " + store.City + " " + store.State + " - ProMotion Quote Request",
                    style: "width: 100%"
                }, $(quote).find('#subject')[0]);

                //Create the button
                me.submit = new Button({
                    label: "Send Quote Request"
                }, $(quote).find('#submit-button')[0]);

                //Create the dialog box
                me.dialog = new Dialog({
                    title: "ProMotion Order",
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