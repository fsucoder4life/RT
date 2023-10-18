define([
  'dojo/text!app/view/installquotegen/installquotegen.html',
  'app/view/report-installquotegen',
  'app/widget/widgetHelper',
  'app/store/purchaseOrders',
  'app/store/purchaseOrderItems',
  "dojo/number"
], function (editorTemplate, reportView, widgetHelper, purchaseOrderStore, purchaseOrderItemStore, dNumber) {
    return {
        render: function (options) {
            //Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY - h:mm A'));
            //Set the title
            $('#sub-title').html('Purchase Order Editor - PO #' + options.purchaseOrder.PurchaseOrderId);

            var template = $(editorTemplate),
              me = {
                  purchaseOrderItems: options.purchaseOrderItems,
                  purchaseOrder: options.purchaseOrder,
                  products: options.products,
                  html: template
              };

            me.updateTotal = function () {
                var total = Big('0');
                _.each(me.purchaseOrderItems, function (item) {
                    var price = Big(item.Price),
                      qty = Big(item.Quantity);

                    template.find('#store-' + item.PurchaseOrderItemId + '-Total').html(dNumber.format(qty.times(price).toString(), { places: 2, locale: 'en-us' }));
                    template.find('#store-' + item.PurchaseOrderItemId + '-Price').html(dNumber.format(item.Price, { places: 2, locale: 'en-us' }));
                    template.find('#store-' + item.PurchaseOrderItemId + '-Quantity').html(dNumber.format(item.Quantity, { places: 2, locale: 'en-us' }));

                    total = total.plus(price.times(qty));
                });

                template.find('#po-total').html(dNumber.format(total.toString(), { places: 2, locale: 'en-us' }));
            };
            me.updateTotal();

            //Activate editable/data-display fields
            widgetHelper.activate(template, me.purchaseOrder, undefined, undefined, purchaseOrderStore);

            //Add click handler for send button
            template.find('#po-send-po').on('click', function () {
                if (typeof me.onSendClick === 'function') {
                    //Mask and call callback
                    me.onSendClick();
                }
            });

            //Show each line item
            me.updatePurchaseOrderItemList = function () {
                reportView.render({
                    data: me.purchaseOrderItems,
                    columns: [
                      { key: 'Description', title: 'Description', editable: true },
                      { key: 'PartNumber', title: 'Part Number', editable: true },
                      {
                          key: 'Price', title: 'Price', editable: true, transform: function (value, row, data, index) {
                              return dNumber.format(value, { places: 2, locale: 'en-us' });
                          }
                      },
                      {
                          key: 'Quantity', title: 'Quantity', editable: true, transform: function (value, row, data, index) {
                              return dNumber.format(value, { places: 2, locale: 'en-us' });
                          }
                      },
                      {
                          key: 'Total', title: 'Total', transform: function (value, row, data, index) {
                              var price = Big(row.Price),
                                qty = Big(row.Quantity);

                              return dNumber.format(qty.times(price).toString(), { places: 2, locale: 'en-us' });
                          }
                      }
                      
                    ],
                    showExportOptions: false,
                    dataStore: purchaseOrderItemStore,
                    idField: 'PurchaseOrderItemId',
                    target: template.find('#po-items'),
                    routeCheck: options.routeCheck,
                    afterChange: function (report, key, value, store, revertBackground, response) {
                        revertBackground();
                        me.updateTotal();

                    }
                });

            };
            me.updatePurchaseOrderItemList();


            //Add the template to the content area
            $(options.target).html(template);

            if (typeof options.callback === 'function') options.callback(me);
        }
    };
});