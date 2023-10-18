define([
        'app/store/construction',
        'dojo/text!app/view/proforma/proforma.html',
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

                var me = {proformas: []};

                _.forEach(options.stores, function (store, index) {
                    var pf = {
                        invoiceItems: [],
                        store: store
                    };

                    //Turn the proforma template into a dom element
                    var proforma = $($.parseHTML(proformaTemplate));

                    //Activate all the fields marked as display or editable
                    widgetHelper.activate(proforma, store);

                    //Set the user
                    proforma.find('.proforma-user').html(options.user.FirstName + " " + options.user.LastName);

                    //Show or hide the proforma disclaimer
                    if (options.showPosDisclaimer === false) {
                        proforma.find('.proforma-disclaimer-pos').hide();
                        proforma.find('.proforma-disclaimer-electrical').hide();
                        proforma.find('.proforma-disclaimer-pops').hide();
                    }

                    //Make sure the tax rate is a big number
                    if (!options.taxRate instanceof Big) {
                        options.taxRate = new Big(options.taxRate);
                    }
                    if (!options.shipping instanceof Big) {
                        options.shipping = new Big(options.shipping);
                    }

                    //Create editor boxes for each invoice item
                    var tableBody = proforma.find('.proforma-items tbody');
                    _.each(store.invoiceItems, function (item, i) {
                      var el = $('<tr>' +
                          '<td><div></div></td>' +
                          '<td><div></div></td>' +
                          '<td><div class="proforma-dollar">$</div><div></div></td>'+
                          '<td><div></div></td>'+
                          '<td><div class="proforma-dollar">$</div><div></div></td>'+
                        '</tr>'),
                        invoiceItem = {},
                        cells = $(el).find('td > div:not(.proforma-dollar)'),
                        dollars = $(el).find('td > div.proforma-dollar');
  
                      //Convert to Big Numbers for arbitrary precision math
                      if (item.Price instanceof Big !== true) {
                        if (item.Price !== '') {
                          item.Price = new Big(item.Price);
                        } else {
                          item.Price = new Big(0);
                        }
                      }
                      if (item.Quantity instanceof Big !== true) {
                        if (item.Quantity  !== '') {
                          item.Quantity  = new Big(item.Quantity);
                        } else {
                          item.Quantity = new Big(0);
                        }
                      }
  
                      //Create textfields for the first two rows
                      invoiceItem.ProductCode = new InlineEditBox({
                        editor: TextBox,
                        noValueIndicator: '',
                        value: item.ProductCode
                      }, cells[0]);
                      invoiceItem.Description = new InlineEditBox({
                        editor: TextBox,
                        noValueIndicator: '',
                        value: item.Description
                      }, cells[1]);
  
                      //Create number fields for the other three fields
                      if (item.Price == 0) {
                        invoiceItem.Price = new InlineEditBox({
                          editor: CurrencyTextBox,
                          noValueIndicator: '',
                          lang: 'en-us',
                          currency: "USD"
                        }, cells[2]);
                      } else {
                        invoiceItem.Price = new InlineEditBox({
                          editor: CurrencyTextBox,
                          noValueIndicator: '',
                          lang: 'en-us',
                          currency: "USD",
                          value: formatMoney(item.Price)
                        }, cells[2]);
                      }
  
                      if (item.Quantity == 0) {
                        invoiceItem.Quantity = new InlineEditBox({
                          editor: NumberTextBox,
                          noValueIndicator: ''
                        }, cells[3]);
                      } else {
                        invoiceItem.Quantity = new InlineEditBox({
                          editor: NumberTextBox,
                          noValueIndicator: '',
                          value: formatQuantity(item.Quantity)
                        }, cells[3]);
                      }
  
                      var total = cells[4];
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
                      invoiceItem.ProductCode.startup();
                      invoiceItem.Description.startup();
                      invoiceItem.Quantity.startup();
                      invoiceItem.Price.startup();
                      
                      //Add invoice items to tmeplate
                      tableBody.append(el);
                      pf.invoiceItems.push(invoiceItem);
                    });
                    /*proforma.find('.proforma-items tbody tr').each(function(i, el) {
                        var invoiceItem = {};
                        var cells = $(el).find('td > div:not(.proforma-dollar)');
                        var dollars = $(el).find('td > div.proforma-dollar');
                        var item = store.invoiceItems[i];
                        //console.log(item.ProductCode + " - " + item.Description);
                        if (typeof item === 'undefined') {
                            item = {
                                ProductCode: '',
                                Description: '',
                                Price: new Big(0),
                                Quantity: new Big(0),
                                Taxable: true
                            };

                            store.invoiceItems[i] = item;
                        } else {
                            if (item.Price instanceof Big !== true) {
                                if (item.Price !== '') {
                                    item.Price = new Big(item.Price);
                                } else {
                                    item.Price = new Big(0);
                                }
                            }
                            if (item.Quantity instanceof Big !== true) {
                                if (item.Quantity  !== '') {
                                    item.Quantity  = new Big(item.Quantity);
                                } else {
                                    item.Quantity = new Big(0);
                                }
                            }
                        }

                        //Create textfields for the first two rows
                        invoiceItem.ProductCode = new InlineEditBox({
                            editor: TextBox,
                            noValueIndicator: '',
                            value: item.ProductCode
                        }, cells[0]);
                        invoiceItem.Description = new InlineEditBox({
                            editor: TextBox,
                            noValueIndicator: '',
                            value: item.Description
                        }, cells[1]);

                        //Create number fields for the other three fields
                        if (item.Price == 0) {
                            invoiceItem.Price = new InlineEditBox({
                                editor: CurrencyTextBox,
                                noValueIndicator: '',
                                lang: 'en-us',
                                currency: "USD"
                            }, cells[2]);
                        } else {
                            invoiceItem.Price = new InlineEditBox({
                                editor: CurrencyTextBox,
                                noValueIndicator: '',
                                lang: 'en-us',
                                currency: "USD",
                                value: formatMoney(item.Price)
                            }, cells[2]);
                        }

                        if (item.Quantity == 0) {
                            invoiceItem.Quantity = new InlineEditBox({
                                editor: NumberTextBox,
                                noValueIndicator: ''
                            }, cells[3]);
                        } else {
                            invoiceItem.Quantity = new InlineEditBox({
                                editor: NumberTextBox,
                                noValueIndicator: '',
                                value: formatQuantity(item.Quantity)
                            }, cells[3]);
                        }

                        var total = cells[4];
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
                        invoiceItem.ProductCode.startup();
                        invoiceItem.Description.startup();
                        invoiceItem.Quantity.startup();
                        invoiceItem.Price.startup();

                        pf.invoiceItems.push(invoiceItem);
                    });*/

                    //Handle taxes and totals
                    function calculateSubTotal () {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                        });

                        return total;
                    }

                    function calculateTaxes () {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            if (invoiceItem.Taxable) {
                                total = total.plus(invoiceItem.Price.times(invoiceItem.Quantity));
                            }
                        });

                        return total.times(options.taxRate);
                    }

                    function calculateShipping () {
                        var total = new Big(0);
                        _.each(store.invoiceItems, function (invoiceItem, index) {
                            if (invoiceItem.Description === "POPS - Housing, Lighting, Speaker/Mic, & Button") {
                                total = total.plus(invoiceItem.Quantity.times(options.shipping));
                            }
                        });

                        return total;
                    }



                    function calculateTotal () {
                        return calculateSubTotal().plus(calculateTaxes().plus(calculateShipping()));
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
                    pf.Shipping = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateShipping();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('.proforma-totals tbody td.proforma-shipping div:not(.proforma-dollar)').html(formatMoney(calculateShipping()));
                            proforma.find('.proforma-totals tbody td.proforma-shipping div.proforma-dollar').show();
                        }
                    };
                    pf.Taxes = {
                        get: function (type) {
                            if (type === 'value') {
                                return calculateTaxes();
                            }
                            return undefined;
                        },
                        update: function () {
                            proforma.find('.proforma-totals tbody td.proforma-tax div:not(.proforma-dollar)').html(formatMoney(calculateTaxes()));
                            proforma.find('.proforma-totals tbody td.proforma-tax div.proforma-dollar').show();
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
                            proforma.find('.proforma-totals tbody td.proforma-total div.proforma-dollar').show();
                        }
                    };

                    pf.SubTotal.update();
                    pf.Shipping.update();
                    pf.Taxes.update();
                    pf.Total.update();

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