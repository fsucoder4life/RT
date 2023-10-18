define(['app/view/report', 'app/store/purchaseOrders', 'app/store/combined', 'app/store/purchaseOrderItems', 'dojo/number', 'dojo/text!app/view/idtech-invoice/create-idtech-invoice.html', 'dojo/text!app/view/idtech-invoice/idtech-invoice.html', 'app/widget/widgetHelper.js', 'app/view/report', 'app/rules/purchase-orders'], function (report, purchaseOrderStore, combinedStore, purchaseOrderItems, dNumber, createInvoiceDialog, idtechInvoice, widgetHelper, reportView, purchaseOrderRules) {
    return {
        show: function (target, routeCheck, options) {
            //Build query for PO's that have shipped
            var query = new CamlBuilder().Where().DateField('DeliveryDate').LessThanOrEqualTo(CamlBuilder.CamlValues.Today).OrderByDesc('DeliveryDate');

            query = "<Query>" + query.ToString() + "</Query>";
            
            purchaseOrderStore.loadData(function (purchaseOrders) {
                var combinedQuery = "<Query>" + new CamlBuilder().Where().TextField("Title").In(_.map(purchaseOrders, function (po) { return po.StoreNumber })).ToString() + "</Query><RowLimit>1000</RowLimit>";
                var purchaseOrderItemQuery = "<Query>" + new CamlBuilder().Where().LookupIdField("PurchaseOrderId").In(_.map(purchaseOrders, function (po) { return po.PurchaseOrderId })).ToString() + "</Query><RowLimit>1000</RowLimit>";

              combinedStore.loadData({query: combinedQuery}, function (stores) {
                //Merge Store Data
                _.each(purchaseOrders, function (po, i) {
                  _.merge(po, _.find(stores, {StoreNumber: po.StoreNumber}));
                });
                
                //Get PO Items
                // var purchaseOrderItemQuery = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), poItemSearchBlocks);
                // purchaseOrderItemQuery = "<Query><Where>" + purchaseOrderItemQuery.ToString() + "</Where></Query>";
                purchaseOrderItems.loadData(function (poItems) {
                  //Associate PO Items
                  _.each(purchaseOrders, function (po, i) {
                    po.purchaseOrderItems = _.filter(poItems, {PurchaseOrderIdId: po.PurchaseOrderId});
                    
                  });
  
                  //Define Report Columns
                  var columns = [
                    {key: 'ProjectType', title: 'Type'},
                    {key: 'StoreNumber', title: 'No.'},
                    {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                      return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                    }},
                    {key: 'FranchiseGroup', title: 'Franchisee'},
                    {key: 'DeliveryDate', title: 'Delivery<br/>Date', transform: 'date'},
                    {key: 'GoLiveDate', title: 'Go Live<br/>Date', transform: 'date'},
                    {key: 'AudioGoLiveDate', title: 'Audio Live<br/>Date', transform: function (audioLive, store, stores, i) {
                      if (store.ProjectType === 'New') {
                        return moment(store.GoLiveDate).format('l');
                      } else if (store.ProjectType === 'POS Conversion') {
                        if (store.AudioGoLiveDate === '') {return ''}
                        else {return moment(store.AudioGoLiveDate).format('l');}
                      } else {
                        return 'See Notes';
                      }
                    }},
                    {key: 'PoTotal', title: 'PO Total', transform: function (value, po, pos, i) {
                      return '<a href="#purchase-order/' + po.PurchaseOrderId + '">' + dNumber.format(purchaseOrderStore.getTotal(po), {places: 2, locale: 'en-us'}) + '</a>';
                    }},
                    {key: 'ActualShippingCost', title: 'Shipping', editable: true, transform: function (value, po, pos, i) {
                      return dNumber.format(value.toString(), {places: 2, locale: 'en-us'});
                    }},
                    {key: 'ActualTaxCost', title: 'Tax', editable: true, transform: function (value, po, pos, i) {
                      return dNumber.format(value, {places: 2, locale: 'en-us'});
                    }},
                    {key: 'ExpectedTotal', title: 'Expected<br/>Total', transform: function (value, po, pos, i) {
                      var total = parseFloat(purchaseOrderStore.getTotal(po)) + parseFloat(po.ActualTaxCost === '' ? 0 : po.ActualTaxCost) + parseFloat(po.ActualShippingCost === '' ? 0 : po.ActualShippingCost);
                      return dNumber.format(total.toString(), {places: 2, locale: 'en-us'});
                    }},
                    {key: 'FabConTotal', title: 'FabCon<br/>Total', editable: true, transform: function (value, po, pos, i) {
                      return dNumber.format(value, {places: 2, locale: 'en-us'});
                    }},
                    {key: 'IdTechTotal', title: 'ID Tech<br/>Total', editable: true, transform: function (value, po, pos, i) {
                      return dNumber.format(value, {places: 2, locale: 'en-us'});
                    }},
                    {key: 'BillingStatus', title: 'Status', editable: true},
                    {key: 'PurchaseOrderId', title: '', transform: function (poId, po, pos, i) {
                      return '<button class="pure-button create-idtech-invoice" style="padding:3px 15px" id="' + poId + '">Create Invoice</button>';
                    }}
                  ];
  
                  //Define report title
                  var title = 'Purchase Order Invoices';
  
                  //Define sorting
                  var sort = {
                    key: 'DeliveryDate',
                    direction: 'DESC'
                  };
  
                  //Define filtering todo - make this filter out any that have a zero balance
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Pos.toUpperCase() === 'MICROS') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };
  
  
                  //Load combined data
                  //Show report
                  report.render({
                    data: purchaseOrders,
                    dataStore: purchaseOrderStore,
                    idField: 'PurchaseOrderId',
                    columns: columns,
                    title: title,
                    target: target,
                    sort: sort,
//                filter: filter,
                    routeCheck: routeCheck,
                    callback: function (view) {
                      var table = view.el,
                        purchaseOrders = view.stores;
                      
                      //Fix the padding around the button
                      table.find('tbody > tr > td:last-child').css('padding', '2px 7px')
                      
                      //Fix the number formatting
                      table.find('tbody > tr > td:nth-child(n+9):nth-child(-n+13)').each(function () {
                        $(this).html(dNumber.format($(this).html().replace(/\,/g, ''), {places: 2, locale: 'en-us'}));
                      });
                      
                      //PO Button Handler
                      table.find('button.create-idtech-invoice').on('click', function () {
                        var button = $(this),
                          poId = button.attr('id'),
                          po = _.find(purchaseOrders, {PurchaseOrderId: poId}),
                          modal = $(createInvoiceDialog);
                        
                        //Set the PM fee checkbox
                        if (po.ProjectType !== 'New') {
                          modal.find('input#include-pm-fee').prop('checked', true);
                          modal.find('input#include-rebate').prop('checked', true);
                          
                          if (po.ProjecType === 'POS Conversion' && po.AudioGoLiveDate <= po.GoLiveDate) {
                            modal.find('input#include-audio-pm-fee').prop('checked', true);
                          }
                        }
                        
                        //Show the Dialog box
                        modal.modal();
                        
                        //Close Button
                        modal.find('button#invoice-cancel-button').on('click', function () {
                          //Close Modal
                          $.modal.close();
                          modal.remove();
                        });
                        
                        //Create Invoice Button
                        modal.find('button#invoice-create-button').on('click', function () {
                          var template = $(idtechInvoice),
                            deliveryDate = template.find('td[data-display="DeliveryDate"]'),
                            table = template.find('div#po-items'),
                            invoiceItems = [],
                            includeRebate = modal.find('input#include-rebate').is(":checked"),
                            includeAudioPmFee = modal.find('input#include-audio-pm-fee').is(":checked"),
                            includePmFee = modal.find('input#include-pm-fee').is(":checked"),
                            total = template.find('#po-total');
                          
                          //Format Template and show data-display fields
                          widgetHelper.activate(template, po);
                          deliveryDate.html(moment(deliveryDate.html()).format('l'));
                          template.find('#today').html(moment().format('l'));
                          
                          //Determine number of displays
                          var displays = 0,
                            pops = 0;
                          _.each(po.purchaseOrderItems, function (item, i) {
                            if (item.PartNumber === 'FC-6675' || item.PartNumber === 'FC-6115 A2' || item.PartNumber === 'FC-6632P') {
                              displays += parseInt(item.Quantity);
  
                              if (item.PartNumber === 'FC-6675' || item.PartNumber === 'FC-6115 A2' ) {
                                pops += parseInt(item.Quantity)
                              }
                            }
                          });
                          
                          //Add displays
                          if (displays > 0) {
                            invoiceItems.push({
                              Description: 'Display;Sonic POPS;Sanning SIX;w/Licensing',
                              PartNumber: '80168201-002-LI',
                              Quantity: displays,
                              Price: "1559.60"
                            });
  
                            invoiceItems.push({
                              Description: 'Digital Signage Display - 5 year warranty',
                              PartNumber: 'WARRANTY',
                              Quantity: displays,
                              Price: "250"
                            });
                            
                            //Add rebate if checked
                            if (includeRebate) {
                              invoiceItems.push({
                                Description: 'Coca Cola - Dr Pepper Funds',
                                PartNumber: 'REBATE',
                                Quantity: displays,
                                Price: "-1275.00"
                              });
                            }
                          }
                          
                          //Add POPS related items
                          if (pops > 0) {
  
                            invoiceItems.push({
                              Description: 'Secure MOIR;DH;RS232;3T;Flush-Bzl;CC;NGA',
                              PartNumber: 'SPTE-283-33-1NN0C-001-C1',
                              Quantity: pops,
                              Price: "69.80"
                            });
                            
                            invoiceItems.push({
                              Description: 'Key Inj;Retalix;DUKPT;TDES;Activated',
                              PartNumber: 'DT-KEYINJ-057',
                              Quantity: pops,
                              Price: "3.00"
                            });
                            
                            invoiceItems.push({
                              Description: 'Cbl;I/O;SingleEnd;RS232;Custom;18";RoHS',
                              PartNumber: 'CAB1041-4',
                              Quantity: pops,
                              Price: "5.00"
                            });
                            
                            invoiceItems.push({
                              Description: 'CBL;ConvertUSB/USB-WPowerPlug;Sonic POPS',
                              PartNumber: '80168205-001',
                              Quantity: pops,
                              Price: "9.80"
                            });
                          }
                          
                          //Add pm fee
                          if (includeAudioPmFee || includePmFee) {
                            invoiceItems.push({
                              Description: 'Technology Project Management Fee',
                              PartNumber: 'PM-FEE',
                              Quantity: 1,
                              Price: ((includePmFee ? 1500 : 0) + (includeAudioPmFee ? 500 : 0)).toString()
                            });
                          }
                          
                          //Enable Report
                          reportView.render({
                            data: invoiceItems,
                            columns: [
                              {key: 'Description', title: 'Description', editable: true},
                              {key: 'PartNumber', title: 'Part Number', editable: true},
                              {key: 'Price', title: 'Price', editable: true, transform: function(value, row, data, index) {
                                return dNumber.format(value, {places: 2, locale: 'en-us'});
                              }},
                              {key: 'Quantity', title: 'Quantity', editable: true, transform: function(value, row, data, index) {
                                return dNumber.format(value, {places: 2, locale: 'en-us'});
                              }},
                              {key: 'Total', title: 'Total', transform: function (value, row, data, index) {
                                var price = Big(row.Price),
                                  qty = Big(row.Quantity);
        
                                return dNumber.format(qty.times(price).toString(), {places: 2, locale: 'en-us'});
                              }}
                            ],
                            showExportOptions: false,
                            dataStore: purchaseOrderItems,
                            idField: 'PartNumber',
                            target: table,
                            routeCheck: routeCheck
                          });
                          table.find('table').css('font-size', '12px');
                          
                          //Add total
                          var invoiceTotal = new Big('0');
                          _.each(invoiceItems, function (item, i) {
                            var itemPrice = new Big(item.Price),
                              itemQty = new Big(item.Quantity),
                              itemTotal = itemQty.times(itemPrice);
                            
                            invoiceTotal = invoiceTotal.plus(itemTotal);
                          });
                          
                          total.html(dNumber.format(invoiceTotal.toString(), {places: 2, locale: 'en-us'}));
                          
                          //Open a window with the invoice in it
                          var childWindow = window.open(window.location.origin + window.location.pathname + '#idtech-po', '_blank');
                          //Inject the template and open the print dialog so it can be saved as a PDF
                          childWindow.onload = function () {
                            childWindow.document.body.innerHTML = template[0].outerHTML;
                            setTimeout(function () {
                              childWindow.print();
                            }, 500);
                          };
                          
                          //Update Status & ID Tech Total
                          purchaseOrderStore.changeValue('IdTechTotal', invoiceTotal.toString(), po.PurchaseOrderId, function () {
                            purchaseOrderStore.changeValue('BillingStatus', "ID Tech Invoice Created " + moment().format('M/D'), po.PurchaseOrderId, function () {
                              $('#store-'+ po.PurchaseOrderId + '-IdTechTotal').html(dNumber.format(invoiceTotal.toString(), {places: 2, locale: 'en-us'}));
                              $('#store-'+ po.PurchaseOrderId + '-BillingStatus div[contenteditable="true"]').html("ID Tech Invoice Created " + moment().format('M/D'));
                            });
                          });
                          
                          //Close Modal
                          $.modal.close();
                          modal.remove();
                        });
                      });
  
                      //Enable business rules
                      purchaseOrderRules.tableHelper(view);
                    },
                    afterChange: function (view, key, value, po, revertBackground, response) {
                      //Format if it's a number field
                      if (key === 'ActualTaxCost' || key === 'ActualShippingCost' || key === 'FabConTotal' || key === 'IdTechTotal') {
                        //Find the changed element
                        var el = view.el.find('#store-' + po.PurchaseOrderId + '-' + key);
                        el.html(dNumber.format(el.html().replace(/\,/g, ''), {places: 2, locale: 'en-us'}));
                        //Update Totals if it's one of the fields we calculate from
                        if (key === 'ActualTaxCost' || key === 'ActualShippingCost') {
                          var poTotal = parseFloat(view.el.find('#store-' + po.PurchaseOrderId + '-PoTotal a').html().replace(/\,/g, '')),
                            tax = parseFloat(view.el.find('#store-' + po.PurchaseOrderId + '-ActualTaxCost').html().replace(/\,/g, '')),
                            shipping = parseFloat(view.el.find('#store-' + po.PurchaseOrderId + '-ActualShippingCost').html().replace(/\,/g, '')),
                            expectedTotal = poTotal + shipping + tax;
  
                          view.el.find('#store-' + po.PurchaseOrderId + '-ExpectedTotal').html(dNumber.format(expectedTotal, {places: 2, locale: 'en-us'}));
                        }
                      }
  
                      //Update the store
                      _.find(view.stores, {PurchaseOrderId: po.PurchaseOrderId})[key] = value;
  
                      //Check business rules
                      purchaseOrderRules.tableChangeHelper(view, key, value, po, revertBackground, response)
                    }
                  });
                }, {query: purchaseOrderItemQuery});
              });
              
            }/*, {query: query}*/);

        }
    };
});