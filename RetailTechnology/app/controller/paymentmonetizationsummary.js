define(['app/view/paymentmonetizationsummary/paymentmonetizationsummary', 'app/store/construction', 'app/store/combined', 'app/store/combinedconstructionextend', 'app/store/user'], function (proforma, construction, combined, combinedconstructionextend, user) {
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
            DtPopsEnclosure: 1353.09,
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

                var vpUnitsQuantity;
                var hughesSwitchUpgradeOrderedQuantity;
                var vp45Quantity;
                var vp90Quantity;
                var sunShieldQuantity;
                var DTWindowQuantity;
                var serverCabinetQuantity;
                var serverCabinetShelfQuantity;
                var serverCabinet12uQuantity;

                var vpUnits;
                var vpUnits45;
                var vpUnits90;
                var hughesSwitchUpgradeOrdered;
                var sunShieldOrdered;
                var DTWindow;
                var serverCabinet;
                var serverCabinetShelf;
                var serverCabinet12uOrdered;

                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Construction Extend",
                    CAMLViewFields: "<ViewFields><FieldRef Name='VP6800_x0020_Server_x0020_Cabine2' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine0' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_0' /><FieldRef Name='VP6800_x0020_Num_x0020_Of_x0020_1' /><FieldRef Name='Hughes_x0020_Switch_x0020_Upgrad' /><FieldRef Name='VP6800_x0020_Sunshield' /><FieldRef Name='VP6800_x0020_DT_x0020_Window' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine' /><FieldRef Name='VP6800_x0020_Server_x0020_Cabine1' /></ViewFields>",
                    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                    CAMLRowLimit: 1,
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            vpUnits = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_");
                            vpUnits45 = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_0");
                            vpUnits90 = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_1");
                            hughesSwitchUpgradeOrdered = $(this).attr("ows_Hughes_x0020_Switch_x0020_Upgrad");
                            sunShieldOrdered = $(this).attr("ows_VP6800_x0020_Sunshield");
                            DTWindow = $(this).attr("ows_VP6800_x0020_DT_x0020_Window");
                            serverCabinet = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine");
                            serverCabinetOrdered = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1");
                            serverCabinetShelf = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine0");
                            serverCabinet12uOrdered = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2");


                            vpUnitsQuantity = (vpUnits === '' ? 0 : parseInt(vpUnits));
                            vp45Quantity = (vpUnits45 === '' ? 0 : parseInt(vpUnits45));
                            vp90Quantity = (vpUnits90 === '' ? 0 : parseInt(vpUnits90));
                            hughesSwitchUpgradeOrderedQuantity = (hughesSwitchUpgradeOrdered === '' ? 0 : parseInt(hughesSwitchUpgradeOrdered));
                            sunShieldQuantity = (sunShieldOrdered === '' ? 0 : parseInt(sunShieldOrdered));;
                            DTWindowQuantity = (DTWindow === '' ? 0 : parseInt(DTWindow));;
                            serverCabinetQuantity = (serverCabinetOrdered === '' ? 0 : parseInt(serverCabinetOrdered));
                            serverCabinetShelfQuantity = (serverCabinetShelf === '' ? 0 : parseInt(serverCabinetShelf));
                            serverCabinet12uQuantity = (serverCabinet12uOrdered === '' ? 0 : parseInt(serverCabinet12uOrdered));

                            if (Number.isNaN(serverCabinet12uQuantity) || serverCabinet12uQuantity === 0) {
                                serverCabinet12uQuantity = 0;
                            }

                            if (Number.isNaN(serverCabinetShelfQuantity) || serverCabinetShelfQuantity === 0) {
                                serverCabinetShelfQuantity = 0;
                            }

                            if (Number.isNaN(serverCabinetQuantity) || serverCabinetQuantity === 0) {
                                serverCabinetQuantity = 0;
                            }

                            if (Number.isNaN(vpUnitsQuantity) || vpUnitsQuantity === 0) {
                                vpUnitsQuantity = 0;

                            }

                            if (Number.isNaN(hughesSwitchUpgradeOrderedQuantity) || hughesSwitchUpgradeOrderedQuantity === 0) {
                                hughesSwitchUpgradeOrderedQuantity = 0;

                            }
                            if (Number.isNaN(vp45Quantity) || vp45Quantity === 0) {
                                vp45Quantity = 0;

                            }
                            if (Number.isNaN(vp90Quantity) || vp90Quantity === 0) {
                                vp90Quantity = 0;

                            }
                            if (Number.isNaN(sunShieldQuantity) || sunShieldQuantity === 0) {
                                sunShieldQuantity = 0;

                            }
                            if (Number.isNaN(DTWindowQuantity) || DTWindowQuantity === 0) {
                                DTWindowQuantity = 0;

                            }


                        });
                    }
                });

                //Shared Items
                var items = [];
                if (vpUnitsQuantity > 0) {

                    try {
                        items.push({
                            ProductCode: 'SON-IDV68-10011-S1',
                            Description: 'Payment Reader (includes Data Encryption Key)',
                            Price: 310,
                            Quantity: vpUnitsQuantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }

                    try {
                        items.push({
                            ProductCode: 'SON-80159241-001',
                            Description: 'POE Cable for VP6800',
                            Price: 35,
                            Quantity: vpUnitsQuantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }
                }

                if (vp45Quantity > 0) {
                    try {
                        items.push({
                            ProductCode: 'SON-FC-6506B',
                            Description: 'Payment Enclosure #23773 (45 Degree)',
                            Price: 47.75,
                            Quantity: vp45Quantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }
                }

                if (vp90Quantity > 0) {
                    try {
                        items.push({
                            ProductCode: 'SON-FC-6506ODB',
                            Description: 'Payment Enclosure VP6800 (90 Degree)',
                            Price: 59.79,
                            Quantity: vp90Quantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }
                }

                if (sunShieldQuantity > 0) {
                    try {
                        items.push({
                            ProductCode: 'SON-FC-6506-005OD',
                            Description: '15 Degree Sun Shield',
                            Price: 18.75,
                            Quantity: sunShieldQuantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }
                }
                if (DTWindowQuantity > 0) {
                    try {
                        items.push({
                            ProductCode: 'SON-FC-654802',
                            Description: 'Drive-Thru Window Enclosure with bracket',
                            Price: 250.88,
                            Quantity: DTWindowQuantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }
                }
                
                if (hughesSwitchUpgradeOrderedQuantity > 0) {


                    try {
                        items.push({
                            ProductCode: 'SON-FS-124E-POE',
                            Description: '24 Port Switch',
                            Price: 573.50,
                            Quantity: hughesSwitchUpgradeOrderedQuantity,
                            Taxable: false
                        });
                    }
                    catch (err) { }

                    try {
                        items.push({
                            ProductCode: 'SON-OR700LCDRM1U',
                            Description: 'CyberPower 700va Rackmountd i UPS',
                            Price: 169.41,
                            Quantity: 1,
                            Taxable: false
                        });
                    }
                    catch (err) { }

                    try {
                        items.push({
                            ProductCode: 'SON-RM-FR-T3',
                            Description: 'Forti RackMount Shelf',
                            Price: 96.80,
                            Quantity: 1,
                            Taxable: false
                        });
                    }
                    catch (err) { }

                    var addInstallOfServerCab = false;
                    if (serverCabinetQuantity) {
                        if (serverCabinetQuantity > 0) {
                            try {
                                addInstallOfServerCab = true;
                                items.push({
                                    ProductCode: 'SON-VMP-ERWEN-6E',
                                    Description: '6u Server Cabinet',
                                    Price: 214.52,
                                    Quantity: serverCabinetQuantity,
                                    Taxable: false
                                });
                            }
                            catch (err) { }
                        }
                    }
                    if (serverCabinet12uQuantity) {
                        if (serverCabinet12uQuantity > 0) {
                            try {
                                addInstallOfServerCab = true;
                                items.push({
                                    ProductCode: 'SON-SRW12USG',
                                    Description: '12u Server Cabinet',
                                    Price: 265,
                                    Quantity: serverCabinet12uQuantity,
                                    Taxable: false
                                });
                                items.push({
                                    ProductCode: 'SON-SRCOOLMVKIT',
                                    Description: 'Magnetic Vinyl Kit for Rack Airflow',
                                    Price: 38,
                                    Quantity: 1,
                                    Taxable: false
                                });
                            }
                            catch (err) { }
                        }
                    }

                    if (serverCabinetQuantity > 0 || serverCabinet12uQuantity > 0) {
                        try {
                            items.push({
                                ProductCode: 'SON-SRFANWM',
                                Description: '2 Fan Kit for Wall Enclosures (Server Cabinet Fan Kit)',
                                Price: 39.75,
                                Quantity: serverCabinetQuantity + serverCabinet12uQuantity,
                                Taxable: false
                            });
                        }
                        catch (err) { }
                    }
                    
                    if (serverCabinetShelfQuantity > 0) {
                        try {
                            items.push({
                                ProductCode: 'SON-SRSHELF2P',
                                Description: 'Rack Shelf for MOR71 (Server Cabinet)',
                                Price: 40,
                                Quantity: serverCabinetShelfQuantity,
                                Taxable: false
                            });
                        }
                        catch (err) { }
                    }
                    if (vpUnitsQuantity > 0) {
                        try {
                            items.push({
                                ProductCode: '',
                                Description: 'Installation',
                                Price: 800,
                                Quantity: 1,
                                Taxable: false
                            });
                        }
                        catch (err) { }
                    }
                    if (vpUnitsQuantity > 3) {
                        try {
                            items.push({
                                ProductCode: '',
                                Description: 'Additional payment unit installation',
                                Price: 75,
                                Quantity: vpUnitsQuantity - 3,
                                Taxable: false
                            });
                        }
                        catch (err) { }
                    }
                    if (addInstallOfServerCab) {
                        try {
                            items.push({
                                ProductCode: '',
                                Description: 'Installation of Server Cabinet',
                                Price: 425,
                                Quantity: 1,
                                Taxable: false
                            });
                        }
                        catch (err) { }


                    }

                }

                try {
                    items.push({
                        ProductCode: '',
                        Description: 'Level 10 Kitting/Staging Fee',
                        Price: 356,
                        Quantity: 1,
                        Taxable: false
                    });
                }
                catch (err) { }

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