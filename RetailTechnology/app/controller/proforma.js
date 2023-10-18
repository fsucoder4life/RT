define(['app/view/proforma/proforma', 'app/store/construction', 'app/store/combined', 'app/store/user'], function (proforma, construction, combined, user) {
    var me = {
        storeData: {}       //this is so other controllers can pass in some data before this controller is hit - right now just POS amounts
    };

    var constants = {
        //        StallPrice: 2559.26, - now specified by all fabcon/wireless/idtech parts
        ExtensionPrice: 29.00,
        BracketPrice: 17.96,
        BaseInstall: 2750.00,
        AdditionalInstall: 70.00,
        Electrical: 4200.00,
        ElectricalSiteSurvey: 300.00,
        Shipping: 60.00,   //updated from 40 to 100 per Bradley Gentry 9/4/2014, from 100 to 60 per Charles Cease/Matt Spessard 7/31/2015
        //        Antenna: 67.50,
        //        AccessPoint: 300,
        //        PowerOverEthernet: 4.24,
        TaxRate: 0.085,
        StallRebate: -1275,
        //        ProjectManagementFee: 1500, - pending update from Christina
        CommWorksPopsFee: 750,
        CommWorksPosFee: 750,
        CommWorksAudioFee: 500,
        SonicTrainingFee: 240,
        PosInstall: 4075,
        Wireless: {
            AccessPoint: 187.85,            //2 of these
            AccessPointWarranty: 55.56,     //2 of these
            Antenna: 76.56,                 //4 of these needed
            PowerOverEthernet: 42.71,       //2 of these
            MaterialHandling: 65.89
        },
        FabCon: {
            MenuBoard: 710.34,         //formerly 642, adding $17 per Charles Cease 7/14
            AluminumMenuBoard: 738.25,   //Per Jason 10/11/2017 - only aluminum POPS for all future construction orders
            //Per charles - 8/4/2015, total fabcon price = 693.34 + 17 = 710.34, UPDATING ABOVE, ZEROING OUT BELOW and no longer using.  Leaving for historical record
            Speaker: 0/*2.55*/,                 //2 of these
            Button: 0/*9.55*/,
            USB: 0/*.46*/,
            EngineeringChangeOrder: 0/*3.94*/,
            Sonar: 0/*30.01*/,
            MaterialHandling: 0/*4.98*/,
            MaterialAdjustment: 0/*14.30*/,
            Pays45Enclosure: 49.50,
            Pays90Enclosure: 76.50,
            PaysDtEnclosure: 196.41,
            DtPopsEnclosure: 1396.40,
            DtPopsBase: 42.95,
            PaintPen: 17.95
        },
        PosData: {
            PaysClientRadio: 87.50,
            PaysClientAntenna: 15.00,
            PaysServerRadio: 95.00,
            PaysServerAntenna: 19.00,
            PaysServerPowerSupply: 8.00,
            SerialCable: 6.30,
            PaysAntennaCable: 50.00,
            Pays: 385.00
        },
        Hughes: {
            Wireless: 799.00,
            Revisit: 250.00
        },
        IdTech: {
            Display: 1559.60,       //formerly 1536.60, adding $3 per Christina Vaughn 4/21, adding $20 per Charles Cease now 1556.60 7/14
            CardReader: 69.80,
            KeyInjection: 3,
            UsbCable: 5,
            UsbPower: 9.80,
            DisplayWarranty: 250,
            DtPopsDisplay: 1809.60
        },
        PamDistributing: {
            SpeakerCable: 99.46,
            Amplifier: 299.00,
            ZoneControl: 23.25,
            OutdoorSpeaker: 54.5,
            CeilingSpeaker: 58.735,
            ServerRack: 220.00,
            ServerFanKit: 35.00
        }
    };

    function GetQueryStringParams(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    function afterRender(view) {
        //Register handlers for each line item
        _.each(view.proformas, function (proforma, index) {
            //Hide the Support Document for new stores
            if (proforma.store.ProjectType === 'New') {
                $($('.funding')[index]).hide()
            }
            _.each(proforma.invoiceItems, function (item, i) {
                item.Quantity.on('change', function () {
                    var itemData = proforma.store.invoiceItems[i];
                    itemData.Quantity = new Big(item.Quantity.get('value').replace(',', ''));
                    item.Total.update();
                    //Update install if it's an update to the pops amount
                    if (itemData.ProductCode === "POPS") {
                        _.each(proforma.invoiceItems, function (it, x) {
                            if (it.ProductCode.get('value') === "EXTRA INSTALL") {
                                //TODO update the quantity if over 15 or to 0 then update the total and other totals
                                if (itemData.Quantity > 15) {
                                    it.Quantity.set('value', itemData.Quantity.minus("15").toString());
                                    proforma.store.invoiceItems[x].Quantity = itemData.Quantity.minus("15");
                                }
                            }
                        });
                    }
                    //Update Totals
                    proforma.SubTotal.update();
                    proforma.Shipping.update();
                    proforma.Taxes.update();
                    proforma.Total.update();
                    //Hide/Show dollar signs
                    if (itemData.Quantity == new Big(0) && itemData.Price == new Big(0)) {
                        item.Dollars.hide();
                    } else {
                        item.Dollars.show();
                    }
                });
                item.Price.on('change', function () {
                    var itemData = proforma.store.invoiceItems[i];
                    //Fix the formatting of negatives by removing parenthesis and adding a negative
                    if (item.Price.get('value').indexOf('(') !== -1) {
                        item.Price.set('value', '-' + item.Price.get('value').replace('(', '').replace(')', ''));
                    }
                    //Update Item
                    itemData.Price = new Big(item.Price.get('value').replace(',', ''));
                    item.Total.update();
                    //Update Totals
                    proforma.SubTotal.update();
                    proforma.Shipping.update();
                    proforma.Taxes.update();
                    proforma.Total.update();
                    //Hide/Show dollar signs
                    if (itemData.Quantity == new Big(0) && itemData.Price == new Big(0)) {
                        item.Dollars.hide();
                    } else {
                        item.Dollars.show();
                    }
                });
            });
        });
    }

    me.show = function (target, storeNumbers, routeCheck) {
        //Look up the stores
        //TODO check the search controller for data after making an all stores search
        //Build associative array, grab id, and build CAML Query
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

                console.log("PaysType:" + store.PaysType);

                var items = [];
                if (store.TotalStalls > 0) {
                    items.push({
                        ProductCode: 'ID Tech',
                        Description: 'POPS - PC, Display, Card Reader',
                        //Price: constants.IdTech.Display + constants.IdTech.CardReader + constants.IdTech.KeyInjection + constants.IdTech.UsbCable + constants.IdTech.UsbPower + constants.IdTech.DisplayWarranty,
                        Price: 2308.48,
                        Quantity: store.TotalStalls,
                        Taxable: true
                    });

                    if (store.ProjectType == "Remodel"  && GetQueryStringParams("rebate")) {
                        //Rebate
                        items.push({
                            ProductCode: 'Coke/Dr Pepper',
                            Description: 'Coca Cola/Dr Pepper/Sonic Rebate*',
                            Price: constants.StallRebate,
                            Quantity: store.TotalStalls,
                            Taxable: false
                        });
                    }
                    if (store.ProjectType == "POS Conversion" && GetQueryStringParams("rebate")) {
                        //Rebate
                        if (store.DtPopsQuantity)
                        {
                            if (parseInt(store.DtPopsQuantity) > 0)
                            {

                            }
                        }
                        items.push({
                            ProductCode: 'Coke/Dr Pepper',
                            Description: 'Coca Cola/Dr Pepper/Sonic Rebate*',
                            Price: constants.StallRebate,
                            Quantity: parseInt(store.TotalStalls) + parseInt(store.DtPopsQuantity),
                            Taxable: false
                        });
                    }

                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'POPS - Housing, Lighting, Speaker/Mic, & Button',
                        //Price: (store.ProjectType === "POS Conversion" && store.PopsType !== "Aluminum" ? constants.FabCon.MenuBoard : constants.FabCon.AluminumMenuBoard),
                        Price: 1219,
                        Quantity: store.TotalStalls,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Wall Mount Flat POPS Assembly',
                        Price: 2749,
                        Quantity: store.FlatCount,
                        Taxable: true
                    });

                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'POPS - Paint Pen (Yellow & Black)',
                        Price: constants.FabCon.PaintPen,
                        Quantity: 2,
                        Taxable: true
                    });

                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Wireless Access Points & Antennas',
                        //Price: (4 * constants.Wireless.Antenna) + (2 * (constants.Wireless.AccessPoint + constants.Wireless.AccessPointWarranty + constants.Wireless.PowerOverEthernet)) + constants.Wireless.MaterialHandling,
                        Price: 1605.74,
                        Quantity: 1,
                        Taxable: true
                    });
                }

                if (store.ProjectType === 'POS Conversion' && parseInt(store.DtPopsQuantity) > 0) {
                    items.push({
                        ProductCode: 'ID Tech',
                        Description: 'Drive-Thru POPS - Display',
                        //Price: constants.IdTech.DtPopsDisplay,
                        Price: 2288.00,
                        Quantity: store.DtPopsQuantity,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Drive-Thru POPS - Housing, Lighting, Speaker/Mic',
                        Price: constants.FabCon.DtPopsEnclosure,
                        Quantity: store.DtPopsQuantity,
                        Taxable: true
                    });
                    
                }

                if (store.ProjectType !== 'POS Conversion' && parseInt(store.DtPopsQuantity) > 0) {
                    items.push({
                        ProductCode: 'ID Tech',
                        Description: 'Drive-Thru POPS - Display',
                        //Price: constants.IdTech.DtPopsDisplay,
                        Price: 2288.00,
                        Quantity: store.DtPopsQuantity,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Drive-Thru POPS - Housing, Lighting, Speaker/Mic',
                        Price: constants.FabCon.DtPopsEnclosure,
                        Quantity: store.DtPopsQuantity,
                        Taxable: true
                    });
                    /*items.push({
                        ProductCode: 'FabCon',
                        Description: 'Drive-Thru POPS - Mounting Base Kit',
                        Price: constants.FabCon.DtPopsBase,
                        Quantity: store.DtPopsQuantity,
                        Taxable: true
                    });*/

                    //Rebate
                    if (store.ProjectType == 'Remodel' && GetQueryStringParams("rebate")) {
                        //Find the rebate item if it exists
                        var rebateItem = _.find(items, { Description: 'Coca Cola/Dr Pepper/Sonic Rebate*' });

                        if (rebateItem) {
                            rebateItem.Quantity = parseInt(rebateItem.Quantity) + parseInt(store.DtPopsQuantity);
                        } else {
                            items.push({
                                ProductCode: 'Coke/Dr Pepper',
                                Description: 'Coca Cola/Dr Pepper/Sonic Rebate*',
                                Price: constants.StallRebate,
                                Quantity: store.DtPopsQuantity,
                                Taxable: false
                            });
                        }
                    }
                    
                }

                if (store.ProjectType !== 'POS Conversion' && parseInt(store.DtMenuBoardsQuantity) > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Drive-Thru Digital Menu Display w/ LED Light Box',
                        Price: 1687.90,
                        Quantity: store.DtMenuBoardsQuantity,
                        Taxable: true
                    });
                }

                if (store.ExtensionBrackets > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'Patio Extension Bracket',
                        Price: constants.ExtensionPrice,
                        Quantity: store.ExtensionBrackets,
                        Taxable: true
                    });
                }

                if (store.CChannelBrackets > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: 'POPS Mounting Bracket',
                        Price: constants.BracketPrice,
                        Quantity: store.CChannelBrackets,
                        Taxable: true
                    });
                }

                //Conditional on project type
                if (store.ProjectType === "POS Conversion1") {
                    //PAYS
                    items.push({
                        ProductCode: 'POS Data',
                        Description: 'Standalone SmartPAYS Terminals',
                        Price: constants.PosData.Pays,
                        Quantity: 3,
                        Taxable: true
                    });
                    //Install
                    var popsInstaller = store.ProjectType === 'POS Conversion' ? store.PopsInstaller : store.Installer;
                    popsInstaller = popsInstaller === '' ? store.Installer : popsInstaller;
                    items.push({
                        ProductCode: popsInstaller,
                        Description: 'Installation of up to 15 Digital POPS Units**',
                        Price: constants.BaseInstall,
                        Quantity: 1,
                        Taxable: false
                    });
                    items.push({
                        ProductCode: popsInstaller,
                        Description: 'Installation of Digital POPS over 15 Units**',
                        Price: constants.AdditionalInstall,
                        Quantity: (store.TotalStalls > 15 ? (store.TotalStalls - 15) : 0),
                        Taxable: false
                    });

                    //                    items.push({
                    //                        ProductCode: 'ELECTRICAL',
                    //                        Description: 'Electrical site survey and additional circuits',
                    //                        Price: constants.Electrical + constants.ElectricalSiteSurvey,
                    //                        Quantity: 1,
                    //                        Taxable: false
                    //                    });

                    var commWorksAmount = 0;

                    //Add POS fee if the date is between now and never
                    if (moment(store.GoLiveDate).diff(moment('2020-01-01'), 'days') < 0 && moment(store.GoLiveDate).diff(moment('2014-09-01'), 'days') >= 0) {
                        commWorksAmount += constants.CommWorksPosFee;
                    }

                    //Add POPS fee if the date is between now and never
                    if (moment(store.PopsDeliveryDate).diff(moment('2020-01-01'), 'days') < 0 && moment(store.PopsDeliveryDate).diff(moment('2014-09-01'), 'days') >= 0) {
                        commWorksAmount += constants.CommWorksPopsFee;
                    }

                    //Add Audio fee if the date is between now and never
                    if (moment(store.AudioInstallDate).diff(moment('2020-01-01'), 'days') < 0 && moment(store.AudioInstallDate).diff(moment('2014-09-01'), 'days') >= 0) {
                        commWorksAmount += constants.CommWorksAudioFee;

                        items.push({
                            ProductCode: 'AUDIO',
                            Description: store.AudioType + ' Audio Equipment',
                            Price: 0.00,
                            Quantity: 1,
                            Taxable: true
                        });
                    }

                    //CommWorks project management fee
                    if (commWorksAmount !== 0) {
                        items.push({
                            ProductCode: 'Sonic',
                            Description: 'Technology Project Management Fee',
                            Price: commWorksAmount,
                            Quantity: 1,
                            Taxable: false
                        });
                    }
                }

                if (store.ProjectType === "Relocation" || store.ProjectType === "Remodel" || store.ProjectType === "Rebuild" || store.ProjectType === "POS Conversion") {
                    var commWorksAmount = 0;

                    //Add POS fee if the date is between now and never
                    if (moment(store.GoLiveDate).diff(moment('2020-01-01'), 'days') < 0 && moment(store.GoLiveDate).diff(moment('2014-09-01'), 'days') >= 0) {
                        commWorksAmount += constants.CommWorksPosFee;
                    }

                    //Add POPS fee if the date is between now and never
                    if (moment(store.PopsDeliveryDate).diff(moment('2020-01-01'), 'days') < 0 && moment(store.PopsDeliveryDate).diff(moment('2014-09-01'), 'days') >= 0) {
                        commWorksAmount += constants.CommWorksPopsFee;
                    }

                    //CommWorks project management fee
                    if (commWorksAmount !== 0) {
                        items.push({
                            ProductCode: 'Sonic',
                            Description: 'Technology Project Management Fee',
                            Price: commWorksAmount,
                            Quantity: 1,
                            Taxable: false
                        });
                    }
                }

                //Micros training fee
                if (store.Pos.toUpperCase().indexOf('MICROS') !== -1) {
                    items.push({
                        ProductCode: 'Sonic',
                        Description: 'Sonic Field Training and Support of POS and POPS',
                        Price: constants.SonicTrainingFee,
                        Quantity: 1,
                        Taxable: false
                    });
                }

                if (store.ProjectType === "POS Conversion") {
                    //POS - Check if it was passed first
                    var posAmount = 0;
                    if (typeof me.storeData[store.StoreNumber] !== "undefined" && typeof me.storeData[store.StoreNumber].PosAmount !== "undefined") {
                        posAmount = me.storeData[store.StoreNumber].PosAmount;
                    }
                    //items.push({
                    //    ProductCode: store.Pos,
                    //    Description: 'POS Equipment ****',
                    //    Price: posAmount,
                    //    Quantity: 1,
                    //    Taxable: false
                    //});

                    //Only add install cost if Micros, Infor charges install cost in contract
                    if (store.Pos.toUpperCase().indexOf('MICROS') !== -1) {
                        items.push({
                            ProductCode: store.Installer,
                            Description: 'POS Installation**',
                            Price: constants.PosInstall,
                            Quantity: 1,
                            Taxable: false
                        });
                    }
                }
                //Any new store specific logic goes here

                //PAYS, added conditionally
                var Pays45EnclosureDesc = '45 Degree/Counter PAYS Enclosure';
                var Pays90EnclosureDesc = '90 Degree/Wall PAYS Enclosure';
                var PaysDTEnclosureDesc = 'Drive-Thru PAYS Enclosure';
                if (store.PaysType === 'VP6800') {
                    Pays45EnclosureDesc = '45 Degree Payment Enclosure';
                    constants.FabCon.Pays45Enclosure = 47.75;
                    Pays90EnclosureDesc = '90 Degree Payment Enclosure';
                    constants.FabCon.Pays90Enclosure = 59.79;
                    PaysDTEnclosureDesc = 'Drive Thru Payment Enclosure';
                    constants.FabCon.PaysDtEnclosure = 250.88;
                }
                if (store.PaysEnclosureIndoor > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: Pays45EnclosureDesc,
                        Price: constants.FabCon.Pays45Enclosure,
                        Quantity: store.PaysEnclosureIndoor,
                        Taxable: true
                    });
                }
                if (store.PaysEnclosureOutdoor > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: Pays90EnclosureDesc,
                        Price: constants.FabCon.Pays90Enclosure,
                        Quantity: store.PaysEnclosureOutdoor,
                        Taxable: true
                    });
                }
                if (store.PaysType === 'VP6800' && store.DegreeSunShield > 0) {

                    items.push({
                        ProductCode: 'FabCon',
                        Description: '15 Degree Sun Shield',
                        Price: 18.75,
                        Quantity: store.DegreeSunShield,
                        Taxable: true
                    });


                }
                if (store.PaysEnclosureDriveThru > 0) {
                    items.push({
                        ProductCode: 'FabCon',
                        Description: PaysDTEnclosureDesc,
                        Price: constants.FabCon.PaysDtEnclosure,
                        Quantity: store.PaysEnclosureDriveThru,
                        Taxable: true
                    });
                }
                var unitReaderDesc = 'PAYS Unit';
                if (store.PaysType === 'VP6800') {
                    unitReaderDesc = 'Payment Reader (VP6800)';
                    constants.PosData.Pays = 364.71;
                }
                if (store.PaysQuantity > 0) {
                    items.push({
                        ProductCode: 'PosData',
                        Description: unitReaderDesc,
                        Price: constants.PosData.Pays,
                        Quantity: store.PaysQuantity,
                        Taxable: true
                    });
                }

                if (store.PaysType === 'VP6800') {
                    items.push({
                        ProductCode: 'ID Tech',
                        Description: 'POE Cable for VP6800',
                        Price: 41.18,
                        Quantity: store.PaysQuantity,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'CyberPower',
                        Description: 'RackMount UPS',
                        Price: 180.00,
                        Quantity: store.PaysRackMountUPS,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'RackMount',
                        Description: 'RackMount Shelf',
                        Price: 177.55,
                        Quantity: store.PaysRackMountShelf,
                        Taxable: true
                    });
                    items.push({
                        ProductCode: 'Level 10',
                        Description: 'Level 10 Kitting Fee',
                        Price: 356,
                        Quantity: 1,
                        Taxable: true
                    });
                }


                if (store.PaysQuantity > 0 && store.PaysType !== 'VP6800') {
                    items.push({
                        ProductCode: 'PosData',
                        Description: 'PAYS Client Radio & Antenna',
                        Price: constants.PosData.PaysClientRadio + constants.PosData.PaysClientAntenna,
                        Quantity: store.PaysQuantity,
                        Taxable: true
                    });

                    items.push({
                        ProductCode: 'PosData',
                        Description: 'PAYS Server Radio, Antennas, and Cables',
                        Price: constants.PosData.PaysServerRadio + constants.PosData.PaysServerPowerSupply + (constants.PosData.PaysServerAntenna * 2) + (constants.PosData.PaysAntennaCable * 2) + constants.PosData.SerialCable,
                        Quantity: 1,
                        Taxable: true
                    });
                }

                //Sonic Radio
                var outdoorSpeakers = (store.SonicRadioOutdoorSpeakerCount !== '' ? parseInt(store.SonicRadioOutdoorSpeakerCount.replace(/[^0-9]+/g, '')) : 0),
                    ceilingSpeakers = (store.SonicRadioCeilingSpeakerCount !== '' ? parseInt(store.SonicRadioCeilingSpeakerCount.replace(/[^0-9]+/g, '')) : 0),
                    zoneControls = (store.SonicRadioZoneCount !== '' ? parseInt(store.SonicRadioZoneCount.replace(/[^0-9]+/g, '')) : 0),
                    racks = (store.SonicRadioRackCount !== '' ? parseInt(store.SonicRadioRackCount.replace(/[^0-9]+/g, '')) : 0);
                if (outdoorSpeakers > 0 || ceilingSpeakers > 0 || zoneControls > 0) {
                    var description = 'Sonic Radio Amp, 1000 ft cable, ' +
                                      (outdoorSpeakers > 0 ? store.SonicRadioOutdoorSpeakerColor + ' Outdoor Speakers(' + outdoorSpeakers + '), ' : '') +
                                      (ceilingSpeakers > 0 ? 'Ceiling Speakers(' + ceilingSpeakers + '), ' : '') +
                                      (zoneControls > 0 ? 'Zones (' + zoneControls + ')' : '');
                    items.push({
                        ProductCode: 'PAM Distribution',
                        Description: description,
                        Price: constants.PamDistributing.Amplifier + constants.PamDistributing.SpeakerCable + constants.PamDistributing.OutdoorSpeaker * outdoorSpeakers + constants.PamDistributing.CeilingSpeaker * ceilingSpeakers + constants.PamDistributing.ZoneControl * zoneControls,
                        Quantity: 1,
                        Taxable: true
                    });
                }
                if (racks > 0) {
                    items.push({
                        ProductCode: 'PAM  Distribution',
                        Description: 'Sonic Radio Racks (' + racks + '), Dual Fan Kits (' + racks + ')',
                        Price: constants.PamDistributing.ServerRack * racks + constants.PamDistributing.ServerFanKit * racks,
                        Quantity: 1,
                        Taxable: true
                    });
                }

                //HUGHES
                items.push({
                    ProductCode: 'Hughes',
                    Description: 'Hughes Internet & Networking Equipment',
                    Price: 2400,
                    Quantity: 1,
                    Taxable: false
                });


                store.invoiceItems = items;
            });

            //Show summary
            proforma.render({
                stores: stores,
                showPosDisclaimer: true,
                taxRate: constants.TaxRate,
                shipping: constants.Shipping,
                user: user.loadData(),
                target: target,
                routeCheck: routeCheck,
                callback: afterRender
            });
        });
    };

    return me;
});