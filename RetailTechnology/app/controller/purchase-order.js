define(['app/view/purchase-order/purchase-order', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems', 'app/store/products', 'dojo/text!resources/style/main.css', 'dojo/text!resources/style/pure-min.css', 'app/store/combined', 'app/store/construction', 'app/utility/sp-utility', 'app/widget/widgetHelper', 'dojo/text!app/view/workflow/fabcon-purchase-order.html','app/brands/services/brandServices','app/brands/services/logHelper'],
  function (summary, purchaseOrderStore, purchaseOrderItemStore, products, mainCss, pureCss, combined, construction, spUtility, widgetHelper, emailTemplate,brandServices,logHelper) {
      logHelper.logInfo("purchase-order.js: Begin");
    //var purchaseOrderDetails = brandServices.getEmailDistributionDetails("purchaseOrder","default");
    const valEmailTo = "";
    const valEmailCC = "";
    // if (purchaseOrderDetails){
    //     valEmailTo = purchaseOrderDetails.emailTo;
    //     if (purchaseOrderDetails.emailCC){
    //         valEmailCC = purchaseOrderDetails.emailCC;
    //     }
        
    // }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-indexed)
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        const formattedDate = date.toLocaleDateString();
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
      }

      var siteUrl2
  var currentUser;
  function getCurrentUser(){
    logHelper.logInfo("purchase-order.js: Inside getCurrentUser: ");
    var ctx= new SP.ClientContext.get_current();
    logHelper.logInfo("purchase-order.js: Inside getCurrentUser: 2" + ctx);
    var web = ctx.get_web();
    logHelper.logInfo("purchase-order.js: Inside getCurrentUser: 3 " + web);
    currentUser = web.get_currentUser();
    logHelper.logInfo("purchase-order.js: Current User: " + currentUser.UserName);
    // ctx.load(currentUser);
    // ctx.executeQueryAsync(onSuccess, onFailure);
    }
      function triggerWorkflow(store,workFlowType,hasAttachment,fileName) {
        try {
            logHelper.logInfo("purchase-order.js: Inside triggerWorkFlow: " + workFlowType);
                var siteUrl = "https://irbpartners.sharepoint.com/sites/RetailTechDeployment/";
                getCurrentUser();
                
                console.log("siteUrl2: " + siteUrl2);
                var clientContext = new SP.ClientContext(siteUrl);
                var oList = clientContext.get_web().get_lists().getByTitle('WorkFlowTriggerRequest');
                    
                var itemCreateInfo = new SP.ListItemCreationInformation();
                this.oListItem = oList.addItem(itemCreateInfo);
                
                const newDate = new Date();
                const formattedDate = formatDate(newDate);
                
            
                var title = store + '-' + workFlowType + '-' + formattedDate;

                oListItem.set_item('Title', title);
                oListItem.set_item('Store', store);
                oListItem.set_item('WFType', workFlowType);
                oListItem.set_item('RequestBy', currentUser.UserName);
                oListItem.set_item('DateRequested', new Date());
                if (hasAttachment === true){
                     this.oListItem.set_item('HasAttachment',hasAttachment);
                     this.oListItem.set_item('AttachmentFileName',fileName);
                }
               
               logHelper.logInfo("purchase-order.js: Before updating the list:" + oList);
                oListItem.update();
            
                clientContext.load(oListItem);

        clientContext.executeQueryAsync(
            //Success callback
            () => {
                logHelper.logInfo("purchase-order.js: Successfully created trigger request");                 
                alert("Workflow Trigger Created");
            },
            //Error callback
            (sender, args) => {
                logHelper.logError("purchase-order.js: An error occured:", args.get_message());
                alert("Error creating trigger");
            }
            // Function.createDelegate(this, this.onQuerySucceeded), 
            // Function.createDelegate(this, this.onQueryFailed)
        );
    // function onQuerySucceeded() {
    //     alert('Item created: ' + oListItem.get_id());
    // }
    
    //  function onQueryFailed(sender, args) {
    //     alert('Request failed. ' + args.get_message() + 
    //         '\n' + args.get_stackTrace());
    // }
            return true;
        } catch (error) {
            return false;
        }
        
     
    }
    var self = {
          emailTo: valEmailTo,//'kgelfer@fabcon.com; cromero@fabcon.com; Kimberly.Oliver@sonicdrivein.com; BJuarez@fabcon.com; IEscobar@fabcon.com; RAlbrechtsen@fabcon.com; MPerez@fabcon.com; rMagallanes@fabcon.com; ',
          emailCc: valEmailCC,//'nsti@sonicdrivein.com; Charles.Cease@sonicdrivein.com; ',
          // emailTo: 'Stephen.Tremaine@sonicdrivein.com; ',
          // emailCc: 'Stephen.Tremaine@sonicdrivein.com; ',
          buildSubject: function (po) {
              return po.ShippingCity + ', ' + po.ShippingState + ' #' + po.StoreNumber + ' - FabCon Purchase Order';
          },
          buildBody: function (po, store) {
              var lastDocument = _.last(po.Documents);
              var template = $(emailTemplate);

              //Activate any data fields
              widgetHelper.activate(template, po, undefined, undefined, purchaseOrderStore);
              widgetHelper.activate(template, store);
              //Notate this is a revision if it is
              template.find('#filename').html(lastDocument.FileName);
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


              function pdfUploadComplete(){

            
              }
                
            //   function pdfUploadComplete(purchaseOrder) {
            //       require(['app/view/workflow/email'], function (form) {
            //           mask.html('Loading Store Data');
            //           construction.loadData({ combinedQuery: "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo(purchaseOrder.StoreNumber).ToString() + "</Query>" }, function (stores) {
            //               var store = stores[0];
            //               //Close the modal
            //               $.modal.close();

            //               //Show the quote
            //               form.render({
            //                   subject: self.buildSubject(view.purchaseOrder),
            //                   to: self.emailTo,
            //                   cc: self.emailCc,
            //                   body: self.buildBody(view.purchaseOrder, store),
            //                   button: 'Send Purchase Order',
            //                   title: 'FabCon Purchase Order',
            //                   callback: function (mailView) {
            //                       //Grab the most current document
            //                       var lastDocument = _.last(view.purchaseOrder.Documents);

            //                       //Add a link to the attachment
            //                       $('span[widgetid="submit-button"]').after("Attachment: <a href='" + encodeURI(lastDocument.FilePath) + "'>" + lastDocument.FileName + "</a>");


            //                       //Add event handler for click
            //                       mailView.submit.on('click', function () {
            //                           //Disable the button
            //                           mailView.submit.setDisabled(true);

            //                           self.sendUpdatedPurchaseOrder(stores[0], purchaseOrder, mailView.message.getData(), mailView.subject.getValue(), mailView.to.getValue(), mailView.cc.getValue(), lastDocument.FilePath, lastDocument.FileName, function () {
            //                               if (purchaseOrder.PoType === 'FabCon - DT POPS') {
            //                                   construction.changeValue('DtPopsBaseStatus', 'PO Issued ' + moment().format('M/D'), store, function () {
            //                                       //Hide the view & go back to the summary 
            //                                       mailView.dialog.hide();
            //                                       location.hash = 'summary/' + store.StoreNumber;
            //                                   });
            //                               } else if (store.ProjectType === 'POS Conversion') {
            //                                   //Hide the view & go back to the summary
            //                                   mailView.dialog.hide();
            //                                   location.hash = 'summary/' + store.StoreNumber;
            //                               } else {
            //                                   //Update the status to requested today
            //                                   construction.changeValue('PopsStatus', 'PO Issued ' + moment().format('M/D'), store, function () {
            //                                       //Hide the view & go back to the summary
            //                                       mailView.dialog.hide();
            //                                       location.hash = 'summary/' + store.StoreNumber;
            //                                   });
            //                               }
            //                           });
            //                       });
            //                   }
            //               });
            //           });
            //       });
            //   }
          }
      };

      self.buildPdf = async function (view, callback) {
        logHelper.logInfo("purchase-order.js: Begin buildPdf");
        var pdfAPIUrl = await brandServices.getSharePointUrlByKey('api-pdfGenerator');
          //Make the date input plain html
          view.html.find('#po-delivery').closest('td').html(view.html.find('#po-delivery').val());

          //Format html/remove UI elements
          var html = view.html.clone();
          html.find('#po-items td:nth-child(6)').remove();
          html.find('#po-items th:nth-child(6)').remove();
          html.find('#po-buttons').remove();
          html.css('margin', '100px');
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
                      fileName = "Purchase Order - " + view.purchaseOrder.PurchaseOrderId;
                      if (purchaseOrder.Documents.length > 0) {
                          fileName += '- revision ' + (view.purchaseOrder.Documents.length);
                      }
                      fileName += '.pdf';
                      logHelper.logInfo("fileName generated: " + fileName);  
                      //Upload
                      purchaseOrderStore.uploadDocument(view.purchaseOrder, reader.result.replace('data:application/pdf;base64,', ''), fileName, function(){
                       logHelper.logInfo("view.purchaseOrder: " + JSON.stringify(view.purchaseOrder));
                        console.log("Inside fabcon-create-purchase-order-workflow");
                        triggerWorkflow(view.purchaseOrder.StoreNumber,"FabconCPO",true, fileName);
                        $.modal.close();
                      });
                  });
              });

              reader.readAsDataURL(req.response);
          };

          //Send request
          req.open("POST", pdfAPIUrl);
          req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          req.responseType = "blob";
          req.send("MarginLeft=1&MarginRight=1&MarginTop=1&MarginBottom=1&apikey=dca86da0-12d0-4620-a58b-eb7e1936df7c&value=" + encodeURIComponent(html));
      };

      self.sendUpdatedPurchaseOrder = function (store, purchaseOrder, msg, subject, to, cc, filePath, filename, callback) {
        logHelper.logInfo("purchase-order.js: Begin sendUpdatedPurchaseOrder");  
        //Get the escaped body with no breaks

          msg = spUtility.escapeXml(msg);
          subject = spUtility.escapeXml(subject);
          to = spUtility.escapeXml(to);
          cc = spUtility.escapeXml(cc);
          var url = spUtility.escapeXml(filePath);
          filename = spUtility.escapeXml(filename);

          //lookup store record in combined schedule and see if fabcon credit packet attachment found

          var fabconCreditPacketFilename;
          var fabconCreditPacketFileURL;
          try {
              $().SPServices({
                  operation: "GetAttachmentCollection",
                  listName: "Combined Schedule",
                  ID: store.CombinedId,
                  async: false,
                  completefunc: function (xData, Status) {
                      $(xData.responseXML).find("Attachments > Attachment").each(function (i, el) {
                          var $node = $(this),
                            filePath2 = $node.text(),
                            arrString = filePath2.split("/"),
                            fileName2 = arrString[arrString.length - 1];
                          if (fileName2.indexOf("FabCon Credit Packet") > -1) {

                              fabconCreditPacketFilename = spUtility.escapeXml(fileName2);
                              fabconCreditPacketFileURL = spUtility.escapeXml(filePath2);
                          }
                          //store.Documents.push({ FileName: fileName, FilePath: filePath });
                      });


                  }
              });
          }
          catch (err) {
              console.log("error in pulling fabcon credit packet attachment from combined schedule record for this store:" + err.message);
          }

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
                              if (typeof fabconCreditPacketFilename === 'undefined')
                                  fabconCreditPacketFilename = '';
                              if (typeof fabconCreditPacketFileURL === 'undefined')
                                  fabconCreditPacketFileURL = '';
                              $().SPServices({
                                  operation: "StartWorkflow",
                                  item: purchaseOrder.EncodedAbsoluteUrl,
                                  templateId: "{" + guid + "}",
                                  workflowParameters: "<Data>" +
                                  "<eTo>" + to + "</eTo>" +
                                  "<eCC>" + cc + "</eCC>" +
                                  "<eFrom>spadmin@Sonicdrivein.com</eFrom>" +
                                  "<eSubject>" + subject + "</eSubject>" +
                                  "<eFilename>" + filename + "</eFilename>" +
                                  "<eFileURL>" + url + "</eFileURL>" +
                                  "<fabconCreditPacketFilename>" + fabconCreditPacketFilename + "</fabconCreditPacketFilename>" +
                                  "<fabconCreditPacketFileURL>" + fabconCreditPacketFileURL + "</fabconCreditPacketFileURL>" +
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
        logHelper.logInfo("purchase-order.js: Begin show by calling purchaseOrderStore.loadData");  
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
        logHelper.logInfo("purchase-order.js: Begin sendUpdate");  
          //Options should contain a callback and purzchaseOrderId
          var callback = options.callback || function () { };

          //After showing the view, build a new PDF, and send the email, then call the original callback
          options.callback = function (view) {
              self.buildPdf(view, function () {
                  var lastDocument = _.last(view.purchaseOrder.Documents);
                  construction.loadData({ combinedQuery: "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo(view.purchaseOrder.StoreNumber).ToString() + "</Query>" }, function (stores) {
                      var bodyTemp = self.buildBody(view.purchaseOrder, stores[0]);
                      var subjectTemp = self.buildSubject(view.purchaseOrder);
                      //IDTech
                      if (view.purchaseOrder.PoType)
                          if (view.purchaseOrder.PoType.indexOf('IDTech') > -1) {
                              bodyTemp = bodyTemp.replace("FabCon", "IDTech");
                              subjectTemp = subjectTemp.replace("FabCon", "IDTech");
                              self.emailTo = 'justin.ning@idtechproducts.com; sandy.lee@itsco.net; Victoria.chan@itsco.net; grace.jin@idtechproducts.com; ';
                              self.emailCc = 'nsti@sonicdrivein.com; Charles.Cease@sonicdrivein.com; spadmin@sonicdrivein.com; ';

                          }
                      
                      console.log("query: " + "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo(view.purchaseOrder.StoreNumber).ToString() + "</Query>");
                      console.log("self.emailTo: " + self.emailTo);
                      console.log("self.emailCc: " + self.emailCc);
                      console.log("purchaseOrder.PoType: " + view.purchaseOrder.PoType);
                      //other wise it's using: self.emailTo: kgelfer@fabcon.com; cromero@fabcon.com; Kimberly.Oliver@sonicdrivein.com; BJuarez@fabcon.com; IEscobar@fabcon.com; RAlbrechtsen@fabcon.com; MPerez@fabcon.com; rMagallanes@fabcon.com; 
                      //self.emailCc: nsti@sonicdrivein.com; Charles.Cease@sonicdrivein.com; 
                      self.sendUpdatedPurchaseOrder(stores[0], view.purchaseOrder, bodyTemp, subjectTemp, self.emailTo, self.emailCc, lastDocument.FilePath, lastDocument.FileName, callback);
                  });
              });
          };

          //Mock up an invisible element and show the po - function that returns true is in place of the check function to confirm we are still on this page.
          self.show($('<div></div>'), options, function () {
              return true;
          });
      };
      logHelper.logInfo("purchase-order.js: End");  
      return self;
  });