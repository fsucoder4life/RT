define([
  'dojo/text!app/view/purchase-order/purchase-order-editor.html',
  'app/view/report',
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
            var poTitle = options.purchaseOrder.PoTitle || options.purchaseOrder.PoType || 'Purchase Order';
            $('#sub-title').html(poTitle + ' - PO #' + options.purchaseOrder.PurchaseOrderId);

            var template = $(editorTemplate),
              me = {
                  purchaseOrderItems: options.purchaseOrderItems,
                  purchaseOrder: options.purchaseOrder,
                  products: options.products,
                  html: template
              };


            function renderFormTypeBody(poType) {
                var body = template.find('#po-form-type-body');
                body.empty();

                var type = (poType || '').toUpperCase();
                if (type.indexOf('HMEAUDIOQUOTE') > -1) {
                    body.html('<table id="po-form-type-fields"><tr><td><h3>HME Audio Quote Details</h3></td></tr><tr><td data-editable="Notes"></td></tr></table>');
                    return;
                }

                if (type.indexOf('SONICRADIO') > -1) {
                    body.html('<table id="po-form-type-fields"><tr><td><h3>Sonic Radio Order Details</h3></td></tr><tr><td data-editable="Notes"></td></tr></table>');
                    return;
                }

                if (type.indexOf('PROMOTION') > -1) {
                    body.html('<table id="po-form-type-fields"><tr><td><h3>Promotion Order Details</h3></td></tr><tr><td data-editable="Notes"></td></tr></table>');
                }
            }

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

            renderFormTypeBody(me.purchaseOrder.PoType);

            //Activate editable/data-display fields
            widgetHelper.activate(template, me.purchaseOrder, undefined, undefined, purchaseOrderStore);

            template.find('#po-title').text(poTitle);

            //Add products to the drop down
            var addItemSelect = template.find('#po-add-item');
            me.updateProductList = function () {
                addItemSelect.empty();
                addItemSelect.append('<option value="0">Add Item</option>');
                _.each(me.products, function (product) {
                    if (_.findIndex(me.purchaseOrderItems, { ProductId: product.ProductId }) === -1) {
                        addItemSelect.append('<option value="' + product.ProductId + '">' + product.Vendor + " - " + product.Description + '</option>');
                    }
                });
            };
            me.updateProductList();

            var hideItemEditing = (me.purchaseOrder.PoType || '').toUpperCase().indexOf('HMEAUDIOQUOTE') > -1 || (me.purchaseOrder.PoType || '').toUpperCase().indexOf('SONICRADIO') > -1;
            if (hideItemEditing) {
                template.find('#po-add-item').hide();
                template.find('#po-items').hide();
            }

            //Add change handler for the select
            addItemSelect.on('change', function () {
                if ($(this).val() !== 0 && typeof me.onAddItemClick === 'function') {
                    var productId = $(this).val();
                    var product = _.find(me.products, { ProductId: productId });

                    me.onAddItemClick(product);
                }
            });

            //Add click handler for send button
            template.find('#po-send-po').on('click', function () {
                if (typeof me.onSendClick === 'function') {
                    //Mask and call callback
                    me.onSendClick();
                }
            });

            if(window.location.hash.indexOf("idtech") > -1)
                template.find('#po-send-po').text("Send to ID Tech");
            else
                template.find('#franchiseePlaceHolder').remove();
            
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
                      },
                      {
                          key: 'Delete', title: '', transform: function (value, row, data, index) {
                              return '<i id="poItemId-' + row.PurchaseOrderItemId + '" class="po-delete-item fa fa-times-circle" aria-hidden="true"></i></a>';
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

                //Setup click handlers for deleting an item
                template.find('.po-delete-item').on('click', function (e) {
                    if (typeof me.onDeletePoItemClick === 'function') {
                        var poItemId = $(this).attr('id').split('-')[1],
                          row = $(this).closest('tr');
                        var poItem = _.find(me.purchaseOrderItems, { PurchaseOrderItemId: poItemId });

                        me.onDeletePoItemClick(poItem);
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