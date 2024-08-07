define(['app/view/installquotegen/installquotegen', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems', 'app/store/products', 'dojo/text!resources/style/main.css', 'dojo/text!resources/style/pure-min.css', 'app/store/combined', 'app/store/construction', 'app/utility/sp-utility', 'app/widget/widgetHelper', 'dojo/text!app/view/workflow/fabcon-purchase-order.html', 'app/view/quotegen/quotegen', 'app/store/user', 'app/brands/services/brandServices'],
  function (summary, purchaseOrderStore, purchaseOrderItemStore, products, mainCss, pureCss, combined, construction, spUtility, widgetHelper, emailTemplate, proforma, user, brandServices) {
      var self = {
          emailTo: 'kgelfer@fabcon.com; mflores@fabcon.com; cromero@fabcon.com; James.Carroll@Sonicdrivein.com; Kimberly.Oliver@sonicdrivein.com; vtaylor@fabcon.com; mKosta@fabcon.com; Matt.Spessard@Sonicdrivein.com; VTaylor@fabcon.com; IEscobar@fabcon.com; RAlbrechtsen@fabcon.com; MPerez@fabcon.com; rMagallanes@fabcon.com; ',
          emailCc: 'nsti@sonicdrivein.com; PostInstallationManagement@Sonicdrivein.com; Charles.Cease@sonicdrivein.com; Kyle.Green@Sonicdrivein.com; ',
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

          view.onSendClick = function () {
              //Mask to prevent re-clicking
              var mask = $('<div>Preparing PDF</div>'),
                fileName;
              mask.modal({
                  escapeClose: false,
                  clickClose: false,
                  showClose: false
              });

              //self.buildPdf(view, pdfUploadComplete);

              pdfUploadComplete();

              function pdfUploadComplete() {
                  require(['app/view/workflow/email'], function (form) {
                      mask.html('Loading Store Data');
                      construction.loadData({ combinedQuery: "<Query>" + new CamlBuilder().Where().TextField('Title').EqualTo('1003').ToString() + "</Query>" }, function (stores) {
                          var store = stores[0];
                          //Close the modal
                          $.modal.close();

                          //Show the quote
                          form.render({
                              subject: 'subject',
                              to: 'sendTo',
                              cc: 'CC',
                              body: 'body',
                              button: 'Send Email',
                              title: 'POS Installation Quote Generator',
                              callback: function (mailView) {
                                  //Grab the most current document
                                  var lastDocument = "";

                                  //Add a link to the attachment
                                  //$('span[widgetid="submit-button"]').after("Attachment: <a href='" + encodeURI(lastDocument.FilePath) + "'>" + lastDocument.FileName + "</a>");


                                  //Add event handler for click
                                  mailView.submit.on('click', function () {
                                      //Disable the button
                                      mailView.submit.setDisabled(true);
                                      return;
                                      self.sendUpdatedPurchaseOrder(purchaseOrder, mailView.message.getData(), mailView.subject.getValue(), mailView.to.getValue(), mailView.cc.getValue(), lastDocument.FilePath, lastDocument.FileName, function () {
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

      self.buildPdf = async function (view, callback) {
        var pdfAPIUrl = await brandServices.getSharePointUrlByKey('api-pdfGenerator');
          //Make the date input plain html
          //view.html.find('#po-delivery').closest('td').html(view.html.find('#po-delivery').val());

          //Format html/remove UI elements
          var html = $(".proforma").html();

          //html.find('#po-buttons').remove();
          //html.css('margin', '100px');
          //Inline css and make it a string
          html = "<style>" + pureCss + " " + mainCss + "</style>" + html;
          //Build request
          var req = new XMLHttpRequest();

          //Setup event handler for callback
          req.onload = function (event) {
              var reader = new FileReader();

              reader.addEventListener("loadend", function () {
                  //Save resulting base 64 string to sharepoint
                  purchaseOrderStore.getDocuments(view.purchaseOrder, function (purchaseOrder) {
                      //Build filename
                      fileName = "POS Installation Quote - " + view.purchaseOrder.PurchaseOrderId;
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
          req.open("POST", pdfAPIUrl);
          req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          req.responseType = "blob";
          req.send("MarginLeft=1&MarginRight=1&MarginTop=1&MarginBottom=1&apikey=dca86da0-12d0-4620-a58b-eb7e1936df7c&value=" + encodeURIComponent(html));
      };

      self.sendUpdatedPurchaseOrder = function (purchaseOrder, msg, subject, to, cc, filePath, filename, callback) {
          //Get the escaped body with no breaks
          msg = spUtility.escapeXml(msg);
          subject = spUtility.escapeXml(subject);
          to = spUtility.escapeXml(to);
          cc = spUtility.escapeXml(cc);
          var url = spUtility.escapeXml(filePath);
          filename = spUtility.escapeXml(filename);

          //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
          $().SPServices({
              operation: "GetTemplatesForItem",
              item: purchaseOrder.EncodedAbsoluteUrl,
              async: true,
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
                                  // "<eTo>Stephen.Tremaine@sonicdrivein.com; </eTo>" +
                                  // "<eCC>Stephen.Tremaine@sonicdrivein.com; </eCC>" +
                                  "<eFrom>spadmin@Sonicdrivein.com</eFrom>" +
                                  "<eSubject>" + subject + "</eSubject>" +
                                  "<eFilename>" + filename + "</eFilename>" +
                                  "<eFileURL>" + url + "</eFileURL>" +
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

      self.show = function (target, storeNumbers, routeCheck) {


          var constructionSearchBlocks = [],
                combinedSearchBlocks = [];
          _.forEach(storeNumbers, function (storeNumber, i) {
              //Add to the caml query
              constructionSearchBlocks.push(CamlBuilder.Expression().TextField('Store_x0020_Number').Contains(storeNumber));
              combinedSearchBlocks.push(CamlBuilder.Expression().TextField('Title').Contains(storeNumber));
          });

          var constructionQuery = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), constructionSearchBlocks);
          constructionQuery = "<Query><Where>" + constructionQuery.ToString() + "</Where></Query>";
          var combinedQuery = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), combinedSearchBlocks);
          combinedQuery = "<Query><Where>" + combinedQuery.ToString() + "</Where></Query>";

          construction.loadData({ constructionQuery: constructionQuery, combinedQuery: combinedQuery }, function (stores) {
              //Make a construction query
              var searchBlocks = [];
              _.forEach(storeNumbers, function (storeNumber, i) {
                  //Add to the caml query
                  searchBlocks.push(CamlBuilder.Expression().TextField('Store_x0020_Number').Contains(storeNumber));
              });

              var combinedQuery = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), searchBlocks);
              combinedQuery = "<Query><Where>" + combinedQuery.ToString() + "</Where></Query>";
              //Create the line items for each invoice item
              _.each(stores, function (store, index) {
                  //Shared Items
                  var items = [];

                  var microsQty = 0;
                  var DTPOPSQty = 0;
                  var DriveThruFormatQty = 0;
                  var POSDiscountQty = 0;
                  var ConstPOPSBaseQty = 0;
                  var ConstPOPSStallOver15Qty = 0;
                  var POPSDiscountQty = 0;
                  var IncludesSonicRadioQty = 0;
                  var PAYSMasterRadioInstallQty = 0;
                  var PAYSInstallDTQty = 0;
                  var HMEBaseQty = 0;
                  var HMEPriceStallOver15Qty = 0;
                  var MicrosAudioBaseQty = 0;
                  var MicrosPriceStallOver15Qty = 0;
                  var DigitalMenuBoardInstallationQty = 0;
                  var DiningRoomTVQty = 0;

                  //You can write the script to assume if HME is selected as audio then you will have the same amount of quantity as stalls for HME speakers and felt


                  if (store.Pos.toUpperCase().indexOf('MICROS') > -1)
                      microsQty = 1;

                  if (parseInt(store.DtPopsQuantity) > 0)
                      DTPOPSQty = 1;

                  if (parseInt(store.DtPopsQuantity) > 0) {
                      if (store.DriveThruFormat.toUpperCase().indexOf('SINGLE') > -1)
                          DriveThruFormatQty = 1;
                      if (store.DriveThruFormat.toUpperCase().indexOf('DOUBLE') > -1)
                          DriveThruFormatQty = 2;
                  }

                  if (parseInt(store.TotalStalls) > 0 && microsQty > 0) {
                      POSDiscountQty = 1;
                      POPSDiscountQty = 1;
                  }

                  if (parseInt(store.TotalStalls) > 0)
                      ConstPOPSBaseQty = 1;

                  if (parseInt(store.TotalStalls) > 0 && ConstPOPSBaseQty > 0)
                      ConstPOPSStallOver15Qty = store.TotalStalls - (ConstPOPSBaseQty * 15);

                  var outdoorSpeakers = (store.SonicRadioOutdoorSpeakerCount !== '' ? parseInt(store.SonicRadioOutdoorSpeakerCount.replace(/[^0-9]+/g, '')) : 0),
                          ceilingSpeakers = (store.SonicRadioCeilingSpeakerCount !== '' ? parseInt(store.SonicRadioCeilingSpeakerCount.replace(/[^0-9]+/g, '')) : 0),
                          zoneControls = (store.SonicRadioZoneCount !== '' ? parseInt(store.SonicRadioZoneCount.replace(/[^0-9]+/g, '')) : 0);

                  if (outdoorSpeakers > 0 || ceilingSpeakers > 0 || zoneControls > 0)
                      IncludesSonicRadioQty = 1;

                  if (parseInt(store.PaysEnclosureDriveThru) > 0)
                      PAYSMasterRadioInstallQty = 1;

                  if (parseInt(store.PaysEnclosureDriveThru) > 0)
                      PAYSInstallDTQty = parseInt(store.PaysEnclosureDriveThru);

                  if (store.AudioType.toUpperCase().indexOf('HME') > -1)
                      HMEBaseQty = 1;

                  if (HMEBaseQty > 0 && parseInt(store.TotalStalls) > 15)
                      HMEPriceStallOver15Qty = parseInt(store.TotalStalls) - 15;

                  if (store.AudioType.toUpperCase().indexOf('MICROS') > -1)
                      MicrosAudioBaseQty = 1;

                  if (MicrosAudioBaseQty > 0 && parseInt(store.TotalStalls) > 15)
                      MicrosPriceStallOver15Qty = parseInt(store.TotalStalls) - 15;

                  if (parseInt(store.DmbQuantity) > 0)
                      DigitalMenuBoardInstallationQty = 1;

                  if (parseInt(store.TvQuantity) > 0)
                      DiningRoomTVQty = parseInt(store.TvQuantity);

                  items.push({
                      Description: 'POS Pre-Cable',
                      Price: 1775,
                      Quantity: microsQty,
                      Notes: ''
                  });

                  items.push({
                      Description: 'POS Install',
                      Price: 2675,
                      Quantity: microsQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Order Confirmation',
                      Price: 395,
                      Quantity: DriveThruFormatQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'POS Discount',
                      Price: -250,
                      Quantity: POSDiscountQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Construction POPS Base',
                      Price: 2880,
                      Quantity: ConstPOPSBaseQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Construction POPS/Stall over 15',
                      Price: 70,
                      Quantity: ConstPOPSStallOver15Qty,
                      Notes: 'Accounts for Drive-Thru as one item'
                  });
                  items.push({
                      Description: 'POPS Discount',
                      Price: -250,
                      Quantity: POPSDiscountQty,
                      Notes: 'If POPS & POS back to back - $250 discount will be given'
                  });
                  items.push({
                      Description: 'Permit FEE',
                      Price: 125,
                      Quantity: 0,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Sonic Radio Installation',
                      Price: 1000,
                      Quantity: IncludesSonicRadioQty,
                      Notes: 'Amp, 6 Speakers, Wire, Zone Control Installation'
                  });
                  items.push({
                      Description: 'PAYS Master Radio Installation',
                      Price: 35,
                      Quantity: PAYSMasterRadioInstallQty,
                      Notes: 'Amp, 6 Speakers, Wire, Zone Control Installation'
                  });
                  items.push({
                      Description: 'PAYS Installation (non-drive thru)',
                      Price: 55,
                      Quantity: 1,
                      Notes: ''
                  });
                  items.push({
                      Description: 'PAYS Installation (drive thru)',
                      Price: 95,
                      Quantity: PAYSInstallDTQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'HME Base',
                      Price: 3655,
                      Quantity: HMEBaseQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'HME Price/Stall over 15',
                      Price: 105,
                      Quantity: HMEPriceStallOver15Qty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'HME Audio Speakers & Felt',
                      Price: 30,
                      Quantity: 1,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Micros Audio Base',
                      Price: 3950,
                      Quantity: MicrosAudioBaseQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Micros Price/Stall over 15',
                      Price: 95,
                      Quantity: MicrosPriceStallOver15Qty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Digital Menu Board Installation',
                      Price: 1250,
                      Quantity: DigitalMenuBoardInstallationQty,
                      Notes: 'Includes 4 displays, cabling, switch, configuration, and troubleshooting'
                  });
                  items.push({
                      Description: 'Dining Room Televisions',
                      Price: 90,
                      Quantity: DiningRoomTVQty,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Miscellaneous Labor',
                      Price: 0,
                      Quantity: 1,
                      Notes: ''
                  });
                  items.push({
                      Description: 'Travel',
                      Price: 0,
                      Quantity: 1,
                      Notes: ''
                  });

                  store.invoiceItems = items;
              });


              proforma.render({
                  stores: stores,
                  showPosDisclaimer: true,
                  taxRate: 0.085,
                  shipping: 60.00,
                  user: user.loadData(),
                  target: target,
                  routeCheck: routeCheck,
                  callback: function (view) {
                      self.afterRender(view);
                      
                  }
                  
              });

          });
          return;






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
                      self.sendUpdatedPurchaseOrder(view.purchaseOrder, self.buildBody(view.purchaseOrder, stores[0]), self.buildSubject(view.purchaseOrder), self.emailTo, self.emailCc, lastDocument.FilePath, lastDocument.FileName, callback);
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