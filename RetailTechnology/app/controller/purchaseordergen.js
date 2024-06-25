require(['app/store/products', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems', 'app/view/workflow/fabcon-create-purchase-order'], function (productStore, purchaseOrderStore, purchaseOrderItemStore, quote) {


   

    showStatusForm();

    function showStatusForm ()
    {

        productStore.loadData(function (products) {
            var mask = $('<div>Creating Purchase Order</div>');
            mask.modal({
                escapeClose: false,
                clickClose: false,
                showClose: false
            });
            //Create the new purchase order with data from retail tech as defaults
            purchaseOrderStore.create({
                StoreNumber: store.CombinedId + ';#' + store.StoreNumber,
                BillingName: store.PrimaryContact,
                BillingAddress: store.AddressBillTo,
                BillingPhone: store.PrimaryPhone,
                BillingEmail: store.PrimaryEmail,
                BillingZip: store.ZipBillTo,
                BillingCity: store.CityBillTo,
                BillingState: store.StateBillTo,
                ShippingName: store.PrimaryContact,
                ShippingAddress: store.Address,
                ShippingZip: store.Zip,
                ShippingCity: store.City,
                ShippingState: store.State,
                DeliveryDate: store.PopsDeliveryDate,
                PoType: 'FabCon'
            }, function (po) {
                //Recalculate total stalls in case it's been updated since the request
                store.TotalStalls = (store.StallCount !== '' ? parseInt(store.StallCount) : 0) + (store.PatioCount !== '' ? parseInt(store.PatioCount) : 0);
                store.TotalStalls = store.TotalStalls.toString();

                //Add a line item for each fabcon part
                var requestCount = 0;

                $().SPServices({
                    operation: "GetListItems",
                    listName: "Construction_Calls",
                    CAMLViewFields: "<ViewFields><FieldRef Name='PAYS_x0020_Type' /></ViewFields>",
                    CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                    CAMLRowLimit: 1,
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {

                            store.PaysType = $(this).attr("ows_PAYS_x0020_Type");
                            

                        });
                    }
                });
                
                _.each(products, function (product) {

                    if (store.PaysType === 'VP6800')
                    {
                        if (product.PartNumber === 'FC-65060D X' || product.PartNumber === 'FC-6506 X2' || product.PartNumber === 'FC-6548')
                            return;
                        
                    }
                    
                    if (product.Vendor.toUpperCase().indexOf('FABCON') !== -1 && product.PartNumber.indexOf('FC-6632P-300') === -1) {
                        //Determine quantity

                        //shows 5 products in dropdown - but should show 13


                        var quantity = 0;

                        try {
                            quantity = parseFloat(eval(product.DefaultQuantityFieldSource));
                            store = store; //note - this is to ensure the store is available in the eval scope and doesn't get garbage collected

                        } catch (e) {
                            quantity = 0;
                        }

                        //Create each line item
                        if (quantity > 0) {
                            requestCount++;
                            purchaseOrderItemStore.create({
                                ProductId: product.ProductId + ';#' + product.ProductId,
                                PurchaseOrderId: po.PurchaseOrderId + ';#' + po.PurchaseOrderId,
                                Description: product.Description,
                                Price: product.Price,
                                PartNumber: product.PartNumber,
                                Quantity: quantity,
                                Vendor: product.Vendor
                            }, complete);
                        }
                    }
                });

                var originalCount = requestCount;
                mask.html('Creating PO Line Items - (0/' + requestCount + ') Complete');
                if (requestCount === 0) { complete(); }

                function complete() {
                    requestCount--;
                    mask.html('Creating PO Line Items - (' + (originalCount - requestCount) + '/' + originalCount + ') Complete');
                    if (requestCount <= 0) {
                        $.modal.close();
                        mask.remove();
                        location.hash = '#purchase-order/' + po.PurchaseOrderId;
                    }
                }
            });
        });
    }

});