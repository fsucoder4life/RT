define([
        'app/store/construction',
        'dojo/text!app/view/quotegen/quotegen.html',
        'app/controller/search',
        'app/widget/dropdown',
        'app/widget/datepicker',
        'app/widget/textfield',
        'app/widget/numberfield',
        'app/widget/widgetHelper',
        'app/router',
        'dijit/form/CurrencyTextBox',
        'dijit/form/TextBox',
        'dijit/form/NumberTextBox',
        'dijit/InlineEditBox',
        'dojo/Number'
], function (construction, proformaTemplate, searchController, dropdown, datePicker, textfield, numberfield, widgetHelper, router, CurrencyTextBox, TextBox, NumberTextBox, InlineEditBox) {

        function formatMoney (money) {
            if (money instanceof Big) {
                return dojo.number.format(money.toString(), {places: 2, locale: 'en-us'});
            } else {
                return dojo.number.format(money, {places: 2, locale: 'en-us'});
            }
        }

        function formatQuantity (qty) {
            if (qty instanceof Big) {
                return dojo.number.format(qty.toString(), {places: 0, locale: 'en-us'});
            } else {
                return dojo.number.format(money, {places: 2, locale: 'en-us'});
            }
        }

        

        return {
            render: function (options) {
                //Stop if another route has registered
                if (!options.routeCheck()) {
                    return;
                }

                //Clear the body
                $('body').html('');

                var me = { proformas: [] };

                _.forEach(options.stores, function (store, index) {
                    var pf = {
                        invoiceItems: [],
                        store: store
                    };

                    //Turn the proforma template into a dom element
                    var proforma = $($.parseHTML(proformaTemplate));

                    //Activate all the fields marked as display or editable
                    widgetHelper.activate(proforma, store);

                    
                    //Make sure the tax rate is a big number
                    if (!options.taxRate instanceof Big) {
                        options.taxRate = new Big(options.taxRate);
                    }
                    if (!options.shipping instanceof Big) {
                        options.shipping = new Big(options.shipping);
                    }

                    var mapping = {
                        ows_Primary_x0020_Contact: { mappedName: 'PrimaryContact', objectType: 'Text' },
                        ows_Primary_x0020_Contact_x0020_Phon: { mappedName: 'PrimaryPhone', objectType: 'Text' },
                        ows_Primary_x0020_Contact_x0020_Emai: { mappedName: 'PrimaryEmail', objectType: 'Text' },
                        ows_Address_x0020_Full: { mappedName: 'Address', objectType: 'Text' },
                        ows_City: { mappedName: 'City', objectType: "Text" },
                        ows_State_x0020_: { mappedName: 'State', objectType: 'Text' },
                        ows_Zipcode: { mappedName: 'Zip', objectType: 'Text' },
                    };

                    //Build the fields request xml
                    var fields = "<ViewFields>";

                    _.forIn(mapping, function (val, key) {
                        fields += '<FieldRef Name="' + key.substr(4) + '" />'
                    });

                    fields += "</ViewFields>";

                    var storeNumberHash = window.location.hash.substr(1);
                    storeNumberHash = storeNumberHash.substr(9, 4);

                    var query = "<Query><Where><Eq><FieldRef Name='Title' /><Value Type='Text'>" + storeNumberHash + "</Value></Eq></Where></Query>";

                    $().SPServices({
                        operation: "GetListItems",
                        listName: "Combined Schedule",
                        CAMLViewFields: fields,
                        CAMLQuery: query,
                        completefunc: function (xData, Status) {
                            $(xData.responseXML).SPFilterNode("z:row").each(function () {
                                var primaryContact = $(this).attr("ows_Primary_x0020_Contact");                                proforma.find("#BillingName").html(primaryContact);                                proforma.find("#ShippingName").html(primaryContact);                                var primaryPhone = $(this).attr("ows_Primary_x0020_Contact_x0020_Phon");                                proforma.find("#BillingPhone").html(primaryPhone);                                proforma.find("#ShippingPhone").html(primaryPhone);                                var primaryEmail = $(this).attr("ows_Primary_x0020_Contact_x0020_Emai");                                proforma.find("#BillingEmail").html(primaryEmail);                                proforma.find("#ShippingEmail").html(primaryEmail);                                var primaryAddress = $(this).attr("ows_Address_x0020_Full");                                proforma.find("#BillingAddress").html(primaryAddress);                                proforma.find("#ShippingAddress").html(primaryAddress);                                var primaryCity = $(this).attr("ows_City");                                proforma.find("#BillingCity").html(primaryCity);                                proforma.find("#ShippingCity").html(primaryCity);                                var primaryState = $(this).attr("ows_State_x0020_");                                proforma.find("#BillingState").html(primaryState);                                proforma.find("#ShippingState").html(primaryState);                                var primaryZip = $(this).attr("ows_Zipcode");                                proforma.find("#BillingZip").html(primaryZip);                                proforma.find("#ShippingZip").html(primaryZip);
                            });
                        }
                    });


                    

                    //Create editor boxes for each invoice item
                    var tableBody = proforma.find('.proforma-items tbody');
                    _.each(store.invoiceItems, function (item, i) {
                      var el = $('<tr>' +
                          '<td><div></div></td>' +
                          '<td><div></div></td>'+
                          '<td><div></div></td>'+
                          '<td><div></div></td>' +
                          '<td><div></div></td>' +
                          '<td style="text-align:right;padding:6px 12px;" id="store-3673-Delete" data-display="Delete"><i id="poItemId-3673" class="po-delete-item fa fa-times-circle" aria-hidden="true" style="font-size:21px;cursor: pointer;"></i></td>' +
                        '</tr>'),
                        invoiceItem = {},
                        cells = $(el).find('td > div:not(.proforma-dollar)'),
                        dollars = $(el).find('td > div.proforma-dollar');
  
                      //Convert to Big Numbers for arbitrary precision math
                      if (item.Price instanceof Big !== true) {
                          if (item.Price !== '' && !isNaN(item.Price)) {
                          item.Price = new Big(item.Price);
                        } else {
                          item.Price = new Big(0);
                        }
                      }
                      if (item.Quantity instanceof Big !== true) {
                          if (item.Quantity !== '' && !isNaN(item.Quantity)) {
                          item.Quantity  = new Big(item.Quantity);
                        } else {
                          item.Quantity = new Big(0);
                        }
                      }
  
                      //Create textfields for the first two rows
                      
                      invoiceItem.Description = new InlineEditBox({
                        editor: TextBox,
                        noValueIndicator: '',
                        value: item.Description
                      }, cells[0]);

                      invoiceItem.Notes = new InlineEditBox({
                          editor: TextBox,
                          noValueIndicator: '',
                          value: item.Notes
                      }, cells[4]);
  
                      //Create number fields for the other three fields
                      if (item.Price == 0) {
                        invoiceItem.Price = new InlineEditBox({
                          editor: CurrencyTextBox,
                          noValueIndicator: '',
                          lang: 'en-us',
                          currency: "USD"
                        }, cells[1]);
                      } else {
                        invoiceItem.Price = new InlineEditBox({
                          editor: CurrencyTextBox,
                          noValueIndicator: '',
                          lang: 'en-us',
                          currency: "USD",
                          value: formatMoney(item.Price)
                        }, cells[1]);
                      }
  
                      if (item.Quantity == 0) {
                        invoiceItem.Quantity = new InlineEditBox({
                          editor: NumberTextBox,
                          noValueIndicator: '0'
                        }, cells[2]);
                      } else {
                        invoiceItem.Quantity = new InlineEditBox({
                          editor: NumberTextBox,
                          noValueIndicator: '',
                          value: formatQuantity(item.Quantity)
                        }, cells[2]);
                      }
  
                      var total = cells[3];
                      invoiceItem.Total = {
                        get: function (type, value) {
                          if (type === 'value') {
                            return item.Quantity.times(item.Price);
                          }
      
                          return undefined;
                        },
                        update: function () {
                          $(total).html(formatMoney(item.Quantity.times(item.Price)));
                        }
                      };
  
                      if (item.Price != 0 && item.Quantity != 0) {
                        invoiceItem.Total.update();
                        $(dollars).show();
                      } else {
                        $(dollars).hide();
                      }
  
                      invoiceItem.Dollars = $($(dollars));
  
                      //Startup everything
                      //invoiceItem.ProductCode.startup();
                      invoiceItem.Description.startup();
                      invoiceItem.Quantity.startup();
                      invoiceItem.Price.startup();
                      invoiceItem.Notes.startup();
                      
                      //Add invoice items to tmeplate
                      tableBody.append(el);
                      pf.invoiceItems.push(invoiceItem);
                    });

                    //proforma.find('.po-delete-item').on('click', function (e) {
                    $('body').on('click', '.po-delete-item', function (e) {
                        if (typeof me.onDeletePoItemClick === 'function') {
                            me.onDeletePoItemClick(this);
                            return;
                            var poItemId = $(this).attr('id').split('-')[1],
                              row = $(this).closest('tr');
                            var poItem = _.find(me.purchaseOrderItems, { PurchaseOrderItemId: poItemId });

                            me.onDeletePoItemClick(poItem);
                        }
                    });

                    proforma.find('#po-add-item').on('click', function () {
                        if (typeof me.AddItemClick === 'function') {
                            //Mask and call callback
                            me.AddItemClick();
                        }
                    });

                    proforma.find('#po-send-po').on('click', function () {
                        if (typeof me.onSendClick === 'function') {
                            //Mask and call callback
                            me.onSendClick();
                        }
                    });

                    //Handle taxes and totals
                    function calculateSubTotal () {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                        });

                        return total;
                    }

                    
                    function calculateTotal () {
                        return calculateSubTotal();
                    }

                    function calculatePOSTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "POS Pre-Cable" || desc === "POS Install" || desc === "Order Confirmation" || desc === "POS Discount") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculateAudioTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "HME Base" || desc === "HME Price/Stall over 15" || desc === "HME Audio Speakers & Felt" || desc === "Micros Audio Base" || desc === "Micros Price/Stall over 15") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculatePOPSTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Construction POPS Base" || desc === "Construction POPS/Stall over 15" || desc === "POPS Discount") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculatePermitFeeTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Permit FEE") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculateSonicRadioTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Sonic Radio Installation") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculatePAYSTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "PAYS Master Radio Installation" || desc === "PAYS Installation (non-drive thru)" || desc === "PAYS Installation (drive thru)") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculateDigitalMenuBoardsTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Digital Menu Board Installation" || desc === "Dining Room Televisions" ) {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculateMiscellaneousLaborTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Miscellaneous Labor" ) {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }

                    function calculateTravelTotal() {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            var desc = invoiceItem.Description;
                            if (desc === "Travel") {
                                if (invoiceItem.Price && invoiceItem.Quantity)
                                    total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total;
                    }
                    
                    function calculateInstallerQuoteTotal() {
                        var total = new Big(0);
                        total = total.plus(calculatePOSTotal().plus(calculateAudioTotal().plus(calculatePOPSTotal().plus(calculatePermitFeeTotal().plus(calculateSonicRadioTotal().plus(calculatePAYSTotal().plus(calculateDigitalMenuBoardsTotal().plus(calculateMiscellaneousLaborTotal().plus(calculateTravelTotal())))))))));

                        return total;
                    }
                    
                    pf.SubTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateSubTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('.proforma-totals tbody td.proforma-sub div:not(.proforma-dollar)').html(formatMoney(calculateSubTotal()));
                            proforma.find('.proforma-totals tbody td.proforma-sub div.proforma-dollar').show();
                        }
                    };
                    

                    pf.Total = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('.proforma-totals tbody td.proforma-total div:not(.proforma-dollar)').html(formatMoney(calculateTotal()));
                            proforma.find('div.proforma-dollar2').show();
                        }
                    };

                    pf.InstallerQuoteTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateInstallerQuoteTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#InstallerQuoteTotal').html(formatMoney(calculateInstallerQuoteTotal()));
                        }
                    };

                    pf.POSTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculatePOSTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#POSTotal').html(formatMoney(calculatePOSTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.AudioTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateAudioTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#AudioTotal').html(formatMoney(calculateAudioTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.POPSTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculatePOPSTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#POPSTotal').html(formatMoney(calculatePOPSTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.PermitFeeTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculatePermitFeeTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#PermitFeeTotal').html(formatMoney(calculatePermitFeeTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.SonicRadioTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateSonicRadioTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#SonicRadioTotal').html(formatMoney(calculateSonicRadioTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.PAYSTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculatePAYSTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#PAYSTotal').html(formatMoney(calculatePAYSTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.DigitalMenuBoardsTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateDigitalMenuBoardsTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#DigitalMenuBoardsTotal').html(formatMoney(calculateDigitalMenuBoardsTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.MiscellaneousLaborTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateMiscellaneousLaborTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#MiscellaneousLaborTotal').html(formatMoney(calculateMiscellaneousLaborTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.TravelTotal = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateTravelTotal();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('#TravelTotal').html(formatMoney(calculateTravelTotal()));
                            //proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };
                    
                    pf.POSTotal.update();
                    pf.AudioTotal.update();
                    pf.POPSTotal.update();
                    pf.PermitFeeTotal.update();
                    pf.SonicRadioTotal.update();
                    pf.PAYSTotal.update();
                    pf.DigitalMenuBoardsTotal.update();
                    pf.MiscellaneousLaborTotal.update();
                    pf.TravelTotal.update();
                    pf.SubTotal.update();
                    pf.Total.update();
                    pf.InstallerQuoteTotal.update();
                    
                    
                    me.proformas.push(pf);

                    $('body').append(proforma);

                    //Handle changes in value columns or return them as an object....or....???
                });

                if (options.callback) {
                    options.callback(me);
                }
            }
        }
});