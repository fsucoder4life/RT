define(['app/view/purchase-order/fabcon-id-tech-purchase-order', 'app/store/purchaseOrders', 'app/store/fabConIDTechPurchaseOrderItems', 'app/store/products', 'dojo/text!resources/style/main.css', 'dojo/text!resources/style/pure-min.css', 'app/store/combined', 'app/store/construction', 'app/utility/sp-utility', 'app/widget/widgetHelper', 'dojo/text!app/view/workflow/fabcon-id-tech-purchase-order.html'],
  function (summary, purchaseOrderStore, purchaseOrderItemStore, products, mainCss, pureCss, combined, construction, spUtility, widgetHelper, emailTemplate) {
      var self = {
          emailTo: 'mperez@fabcon.com; iescobar@fabcon.com; kgelfer@fabcon.com; bjuarez@fabcon.com; justin.ning@idtechproducts.com; sandy.lee@idtechproducts.com; ',
          emailCc: 'SDI-NewStoreTechnologyInstallations-DL@Sonicdrivein.com; Post.InstallationManagement@Sonicdrivein.com; ccease@inspirebrands.com; kgreen@inspirebrands.com; ',
          // emailTo: 'Stephen.Tremaine@sonicdrivein.com; ',
          // emailCc: 'Stephen.Tremaine@sonicdrivein.com; ',
          buildSubject: function (po) {
              return po.ShippingCity + ', ' + po.ShippingState + ' #' + po.StoreNumber + ' - FabCon/ID Tech Purchase Order';
          },
          buildBody: function (po, store) {
              var lastDocument = _.last(po.Documents);
              var template = $(emailTemplate);

              //Activate any data fields
              widgetHelper.activate(template, po, undefined, undefined, purchaseOrderStore);
              widgetHelper.activate(template, store);
              //Notate this is a revision if it is
              template.find('#filename').html(po.Documents[po.Documents.length - 2].FileName + "<br />" + lastDocument.FileName);
              return template.html();
          }
      };

      self.afterRender = function (view) {

          var deletingId;
          view.onDeletePoItemClick = function (poItem, removeFromList) {
              //Make sure we don't hit the button multiple times while deleting
              if (deletingId === poItem.PurchaseOrderItemId) {
                  return
              }
              else {
                  deletingId = poItem.PurchaseOrderItemId;
              }

              //Delete from Sharepoint & let view remove from list
              purchaseOrderItemStore.destroy(poItem.PurchaseOrderItemId, function () {
                  //Remove from the po item list
                  _.remove(view.purchaseOrderItems, { PurchaseOrderItemId: poItem.PurchaseOrderItemId });

                  //Update Total
                  view.updateTotal();
                  view.updatePurchaseOrderItemList();
                  view.updateProductList();
                  deletingId = undefined;
              });
          };

          view.onAddItemClick = function (product) {
              purchaseOrderItemStore.create({
                  ProductId: product.ProductId + ';#' + product.ProductId,
                  PurchaseOrderId: view.purchaseOrder.PurchaseOrderId + ';#' + view.purchaseOrder.PurchaseOrderId,
                  Description: product.Description,
                  Price: product.Price,
                  PartNumber: product.PartNumber,
                  Quantity: '0',
                  Vendor: product.Vendor
              }, function (poItem) {
                  view.purchaseOrderItems.push(poItem);
                  view.updatePurchaseOrderItemList();
                  view.updateProductList();
              });
          };

          view.onSendClick = function () {
              //Mask to prevent re-clicking
              var mask = $('<div>Preparing PO</div>'),
                fileName;
              mask.modal({
                  escapeClose: false,
                  clickClose: false,
                  showClose: false
              });

              self.buildPdf(view, pdfUploadComplete);

              function pdfUploadComplete(purchaseOrder) {
                  require(['app/view/workflow/email'], function (form) {
                      mask.html('Loading Store Data');
                      construction.loadData({ combinedQuery: "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo(purchaseOrder.StoreNumber).ToString() + "</Query>" }, function (stores) {
                          var store = stores[0];
                          //Close the modal
                          $.modal.close();

                          //Show the quote
                          form.render({
                              subject: self.buildSubject(view.purchaseOrder),
                              to: self.emailTo,
                              cc: self.emailCc,
                              body: self.buildBody(view.purchaseOrder, store),
                              button: 'Send Purchase Order',
                              title: 'FabCon/ID Tech Purchase Order',
                              callback: function (mailView) {
                                  //Grab the most current document
                                  
                                  //var lastDocument2 = _.last(view.purchaseOrder.DocumentsIDTech);
                                  
                                  //use last on array from this - filtering by ID Tech:
                                  var IDTechDocuments = [];
                                  for (var i = 0; i < view.purchaseOrder.Documents.length; i++) 
                                      if (view.purchaseOrder.Documents[i].FileName.indexOf("ID Tech") > -1)
                                          IDTechDocuments.push(view.purchaseOrder.Documents[i]);

                                  var FabConDocuments = [];
                                  for (var i = 0; i < view.purchaseOrder.Documents.length; i++)
                                      if (view.purchaseOrder.Documents[i].FileName.indexOf("FabCon") > -1)
                                          FabConDocuments.push(view.purchaseOrder.Documents[i]);
                                  
                                  function compare(a, b) {
                                      if (a.version < b.version) {
                                          return -1;
                                      }
                                      if (a.version > b.version) {
                                          return 1;
                                      }
                                      return 0;
                                  }

                                  FabConDocuments.sort(compare);
                                  IDTechDocuments.sort(compare);

                                  var lastFabConDocument = _.last(FabConDocuments);
                                  var lastIDTechDocument = _.last(IDTechDocuments);

                                  
                                  
                                  //Add a link to the attachment
                                  $('span[widgetid="submit-button"]').after("Attachment: <a href='" + encodeURI(lastFabConDocument.FilePath) + "'>" + lastFabConDocument.FileName + "</a> - <a href='" + encodeURI(lastIDTechDocument.FilePath) + "'>" + lastIDTechDocument.FileName + "</a>");


                                  //Add event handler for click
                                  mailView.submit.on('click', function () {
                                      //Disable the button
                                      mailView.submit.setDisabled(true);

                                      self.sendUpdatedPurchaseOrder(stores[0], purchaseOrder, mailView.message.getData(), mailView.subject.getValue(), mailView.to.getValue(), mailView.cc.getValue(), lastFabConDocument.FilePath, lastFabConDocument.FileName, lastIDTechDocument.FilePath, lastIDTechDocument.FileName, function () {
                                          if (purchaseOrder.PoType === 'FabCon - DT POPS') {
                                              construction.changeValue('DtPopsBaseStatus', 'PO Issued ' + moment().format('M/D'), store, function () {
                                                  //Hide the view & go back to the summary 
                                                  mailView.dialog.hide();
                                                  location.hash = 'summary/' + store.StoreNumber;
                                              });
                                          } else if (store.ProjectType === 'POS Conversion') {
                                              //Hide the view & go back to the summary
                                              mailView.dialog.hide();
                                              location.hash = 'summary/' + store.StoreNumber;
                                          } else {
                                              //Update the status to requested today
                                              construction.changeValue('PopsStatus', 'PO Issued ' + moment().format('M/D'), store, function () {
                                                  //Hide the view & go back to the summary
                                                  mailView.dialog.hide();
                                                  location.hash = 'summary/' + store.StoreNumber;
                                              });
                                          }
                                      });
                                  });
                              }
                          });
                      });
                  });
              }
          }
      };

      self.buildPdf = function (view, callback) {
          //Make the date input plain html
          view.html.find('#po-delivery').closest('td').html(view.html.find('#po-delivery').val());

          //Format html/remove UI elements
          var html = view.html.clone();
          //html.find('#po-items td:nth-child(7)').remove();
          //html.find('#po-items th:nth-child(7)').remove();
          html.find('#po-buttons').remove();
          html.css('margin', '100px');

          //$('table#stores tbody tr').each(function () {

          var total = Big('0');
          $(html).find('table#stores tbody tr').each(function () {
              var firstCell = $('td:first-child', this).text();
              if (firstCell.toUpperCase().indexOf('ID TECH') > -1)
                  $(this).remove();
              else {
                  var itemTotal = $('td:nth-child(6)', this).text();
                  total = total.plus(itemTotal.replace(",", ""));
              }
          });
          $(html).find('#po-total').text("$" + total);

          //$(html).find('#stores').css("width", "100%");
          
          //Inline css and make it a string
          html = "<style>" + pureCss + " " + mainCss + "</style>" + html.prop('outerHTML');

          //Build request
          var req = new XMLHttpRequest();

          //Setup event handler for callback
          req.onload = function (event) {
              var reader = new FileReader();

              reader.addEventListener("loadend", function () {
                  //Save resulting base 64 string to sharepoint
                  purchaseOrderStore.getDocuments(view.purchaseOrder, function (purchaseOrder) {
                      //Build filename
                      fileName = "FabCon Purchase Order - " + view.purchaseOrder.PurchaseOrderId;
                      if (purchaseOrder.Documents.length > 0) {
                          fileName += '- revision ' + (view.purchaseOrder.Documents.length);
                      }
                      fileName += '.pdf';

                      //Upload
                      purchaseOrderStore.uploadDocument(view.purchaseOrder, reader.result.replace('data:application/pdf;base64,', ''), fileName, callback);
                  });
              });

              reader.readAsDataURL(req.response);
          };

          //Send request
          req.open("POST", "https://api.html2pdfrocket.com/pdf");
          req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          req.responseType = "blob";
          req.send("MarginLeft=1&MarginRight=1&MarginTop=1&MarginBottom=1&apikey=dca86da0-12d0-4620-a58b-eb7e1936df7c&value=" + encodeURIComponent(html));





          ///////////////////////////////NEXT DOC

          //Make the date input plain html
          view.html.find('#po-delivery').closest('td').html(view.html.find('#po-delivery').val());

          //Format html/remove UI elements
          var html = view.html.clone();
          //html.find('#po-items td:nth-child(6)').remove();
          //html.find('#po-items th:nth-child(6)').remove();
          html.find('#po-buttons').remove();
          html.css('margin', '100px');

          var total = Big('0');
          $(html).find('table#stores tbody tr').each(function () {
              var firstCell = $('td:first-child', this).text();
              if (firstCell.toUpperCase().indexOf('FABCON') > -1)
                  $(this).remove();
              else {
                  var itemTotal = $('td:nth-child(6)', this).text();
                  total = total.plus(itemTotal.replace(",", ""));
              }
          });
          $(html).find('#po-total').text("$" + total);

          //Inline css and make it a string
          html = "<style>" + pureCss + " " + mainCss + "</style>" + html.prop('outerHTML');

          //Build request
          var req2 = new XMLHttpRequest();

          //Setup event handler for callback
          req2.onload = function (event) {
              var reader = new FileReader();

              reader.addEventListener("loadend", function () {
                  //Save resulting base 64 string to sharepoint
                  purchaseOrderStore.getDocuments(view.purchaseOrder, function (purchaseOrder) {
                      //Build filename
                      fileName = "ID Tech Purchase Order - " + view.purchaseOrder.PurchaseOrderId;
                      if (purchaseOrder.Documents.length > 0) {
                          fileName += '- revision ' + (view.purchaseOrder.Documents.length);
                      }
                      fileName += '.pdf';

                      //Upload
                      purchaseOrderStore.uploadDocument(view.purchaseOrder, reader.result.replace('data:application/pdf;base64,', ''), fileName, callback);
                  });
              });

              reader.readAsDataURL(req2.response);
          };

          //Send request
          req2.open("POST", "https://api.html2pdfrocket.com/pdf");
          req2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          req2.responseType = "blob";
          req2.send("MarginLeft=1&MarginRight=1&MarginTop=1&MarginBottom=1&apikey=dca86da0-12d0-4620-a58b-eb7e1936df7c&value=" + encodeURIComponent(html));
      };

      self.sendUpdatedPurchaseOrder = function (store, purchaseOrder, msg, subject, to, cc, filePath, filename, filePath2, filename2, callback) {
          //Get the escaped body with no breaks
          msg = spUtility.escapeXml(msg);
          subject = spUtility.escapeXml(subject);
          to = spUtility.escapeXml(to);
          cc = spUtility.escapeXml(cc);
          //var url = spUtility.escapeXml(filePath);
          //filename = spUtility.escapeXml(filename);

          //lookup store record in combined schedule and see if fabcon credit packet attachment found

          //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
          $().SPServices({
              operation: "GetTemplatesForItem",
              item: purchaseOrder.EncodedAbsoluteUrl,
              async: false,
              completefunc: function (xData, Status) {
                  $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                      if ($(this).attr("Name") == "PO Email") {
                          var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                          if (guid != null) {
                              //Fire the workflow on the construction list
                              $().SPServices({
                                  operation: "StartWorkflow",
                                  item: purchaseOrder.EncodedAbsoluteUrl,
                                  templateId: "{" + guid + "}",
                                  workflowParameters: "<Data>" +
                                  "<eTo>" + to + "</eTo>" +
                                  "<eCC>" + cc + "</eCC>" +
                                  "<eFrom>spadmin@Sonicdrivein.com</eFrom>" +
                                  "<eSubject>" + subject + "</eSubject>" +
                                  "<eFilename>filename</eFilename>" +
                                  "<eFileURL>url</eFileURL>" +
                                  "<fabconIDTechCreditPacketFilename>" + filename + "</fabconIDTechCreditPacketFilename>" +
                                  "<fabconIDTechCreditPacketFileURL>" + filePath + "</fabconIDTechCreditPacketFileURL>" +
                                  "<fabconIDTechCreditPacketFilename2>" + filename2 + "</fabconIDTechCreditPacketFilename2>" +
                                  "<fabconIDTechCreditPacketFileURL2>" + filePath2 + "</fabconIDTechCreditPacketFileURL2>" +
                                  "<eBody>" + msg + "</eBody>" +
                                  "</Data>",
                                  completefunc: function () {

                                      if (callback) callback();
                                  }
                              });
                          }
                      }
                  });
              }
          });
      };

      self.show = function (target, options, routeCheck) {
          //Get the purchase order
          purchaseOrderStore.loadData(function (purchaseOrders) {
              var po = purchaseOrders[0];

              //Get the purchase order items
              purchaseOrderItemStore.loadData(function (poItems) {
                  //Confirm they didn't navigate elsewhere while we were loading data
                  if (routeCheck() === false) return;

                  //Get the product list
                  products.loadData(function (products) {
                      //Show editor
                      summary.render({
                          purchaseOrder: po,
                          purchaseOrderItems: poItems,
                          products: products,
                          target: target,
                          routeCheck: routeCheck,
                          callback: function (view) {
                              self.afterRender(view);
                              if (options.callback) {
                                  options.callback(view);
                              }
                          }
                      });
                  });
              }, { PurchaseOrderId: options.purchaseOrderId });
          }, { PurchaseOrderId: options.purchaseOrderId });
      };

      self.sendUpdate = function (options) {
          //Options should contain a callback and purzchaseOrderId
          var callback = options.callback || function () { };

          //After showing the view, build a new PDF, and send the email, then call the original callback
          options.callback = function (view) {
              self.buildPdf(view, function () {
                  var lastDocument = _.last(view.purchaseOrder.Documents);
                  construction.loadData({ combinedQuery: "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo(view.purchaseOrder.StoreNumber).ToString() + "</Query>" }, function (stores) {
                      self.sendUpdatedPurchaseOrder(stores[0], view.purchaseOrder, self.buildBody(view.purchaseOrder, stores[0]), self.buildSubject(view.purchaseOrder), self.emailTo, self.emailCc, lastDocument.FilePath, lastDocument.FileName, callback);
                  });
              });
          };

          //Mock up an invisible element and show the po - function that returns true is in place of the check function to confirm we are still on this page.
          self.show($('<div></div>'), options, function () {
              return true;
          });
      };
      return self;
  });