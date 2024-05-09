define(['app/utility/sp-utility', 'dojo/number'], function (utility, dNumber) {
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    var listName = 'Purchase Order';

    //Point towards the sharepoint site
    $().SPServices.defaults.webURL = "https://www.sonicpartnernet.com/Scoop/Information%20Services/PMT/Roll%20Out/";  // URL of the target Web

    //Request fields mapping from internal names,
    var today = moment().format('M/D');
    var mapping = {
        ows_ID: { mappedName: 'PurchaseOrderId', objectType: "Text" },
        ows_StoreNumber: { mappedName: 'StoreNumber', objectType: 'Lookup' },
        ows_BillingName: { mappedName: 'BillingName', objectType: 'Text' },
        ows_BillingAddress: { mappedName: 'BillingAddress', objectType: 'Text' },
        ows_BillingPhone: { mappedName: 'BillingPhone', objectType: 'Text' },
        ows_BillingEmail: { mappedName: 'BillingEmail', objectType: 'Text' },
        ows_BillingZip: { mappedName: 'BillingZip', objectType: 'Text' },
        ows_BillingCity: { mappedName: 'BillingCity', objectType: 'Text' },
        ows_BillingState: { mappedName: 'BillingState', objectType: 'Text' },
        ows_ShippingName: { mappedName: 'ShippingName', objectType: 'Text' },
        ows_ShippingAddress: { mappedName: 'ShippingAddress', objectType: 'Text' },
        ows_ShippingCity: { mappedName: 'ShippingCity', objectType: 'Text' },
        ows_ShippingState: { mappedName: 'ShippingState', objectType: 'Text' },
        ows_ShippingZip: { mappedName: 'ShippingZip', objectType: 'Text' },
        ows_BillingStatus: { mappedName: 'BillingStatus', objectType: 'Text', type: 'select', options: ['Pending FabCon Invoices', 'Need to Create ID Tech Invoices', 'ID Tech Invoice Created', 'Invoice Packet to Franchisee ' + today] },
        ows_ActualShippingCost: { mappedName: 'ActualShippingCost', objectType: 'Text', type: 'number', format: function (val) { return val } },
        ows_ActualTaxCost: { mappedName: 'ActualTaxCost', objectType: 'Text', type: 'number', format: function (val) { return val } },
        ows_FabConTotal: { mappedName: 'FabConTotal', objectType: 'Text', type: 'number', format: function (val) { return val } },
        ows_IdTechTotal: { mappedName: 'IdTechTotal', objectType: 'Text', type: 'number', format: function (val) { return val } },
        ows_DeliveryDate: { mappedName: 'DeliveryDate', objectType: 'Text', type: 'date' },
        ows_PoType: { mappedName: 'PoType', objectType: 'Text' },
        ows_Notes: { mappedName: 'Notes', objectType: 'Text' },
        ows_Franchisee: { mappedName: 'Franchisee', objectType: 'Text' },
        // ows_Items: {mappedName: 'Items', objectType: 'Text', type: 'json'},
        ows_EncodedAbsUrl: { mappedName: 'EncodedAbsoluteUrl', objectType: 'Text' },
        ows_Author: { mappedName: 'CreatedBy', objectType: 'Lookup' },
        ows_Editor: { mappedName: 'ModifiedBy', objectType: 'Lookup' },
        ows_Created: { mappedName: 'CreatedOn', objectType: 'Text', type: 'date' },
        ows_Modified: { mappedName: 'ModifiedOn', objectType: 'Text', type: 'date' }
    };

    //Build the fields request xml
    var fields = "<ViewFields>";

    _.forIn(mapping, function (val, key) {
        fields += '<FieldRef Name="' + key.substr(4) + '" />'
    });

    fields += "</ViewFields>";

    function loadData(callback, options) {
        //-------------------------------------------------------Report Build
        //Empty query to load all if not passed
        options = options || {}
        var query = options.query || '';

        if (query === '' && typeof options.PurchaseOrderId !== 'undefined') {
            query = new CamlBuilder().Where().TextField('ID').EqualTo(options.PurchaseOrderId);
            query = "<Query>" + query.ToString() + "</Query>";
        } else if (query === '' && typeof options.StoreNumber !== 'undefined') {
            query = new CamlBuilder().Where().LookupField('StoreNumber').Value().EqualTo(options.StoreNumber);
            query = "<Query>" + query.ToString() + "</Query>";
        }

        //Load the items
        $().SPServices({
            operation: "GetListItems",
            listName: listName,
            CAMLViewFields: fields,
            CAMLQuery: query,
            CAMLRowLimit: 0,
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                //Convert to JSON object for easier access
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: mapping,
                    includeAllAttrs: false
                });

                utility.fixLookups(mapping, data);

                //Filter the array
                if (typeof options.filter === "function") {
                    data = options.filter(data);
                }

                //Sort the array
                if (typeof options.sort === "object") {
                    if (options.sort.direction === "DESC") {
                        _(data).map().sortBy(data, options.sort.key).reverse();
                    } else {
                        _(data).map().sortBy(data, options.sort.key);
                    }
                } else if (typeof options.sort === "function") {
                    data = options.sort(data);
                }

                //Call the passed callback function
                callback(data);
            }
        });
    }

    function create(store, callback) {
        var pairs = [];
        _.forOwn(store, function (value, key) {
            pairs.push([lookupKey(key), value]);
        });

        $().SPServices({
            operation: "UpdateListItems",
            async: true,
            batchCmd: "New",
            listName: listName,
            valuepairs: pairs,
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                //Convert to JSON object for easier access
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: mapping,
                    includeAllAttrs: false
                });

                utility.fixLookups(mapping, data);

                callback(data[0]);
            }
        });
    }


    function destroy(id, callback) {
        $().SPServices({
            operation: "UpdateListItems",
            listName: listName,
            batchCmd: "Delete",
            ID: id,
            completefunc: callback
        });
    }

    function logFields() {
        $().SPServices({
            operation: "GetListAndView",
            listName: listName,
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                $(xData.responseXML).find("Fields > Field").each(function () {
                    var $node = $(this);
                    console.log("Type: " + $node.attr("Type") + " StaticName: " + $node.attr("StaticName") + " Name: " + $node.attr("DisplayName"));
                });
            }
        });
    }

    function lookupKey(key) {
        //find the key
        var internalName = false;
        _.forIn(mapping, function (v, k) {
            if (v.mappedName == key) {
                //Set key without the ows_ precursor
                internalName = k.substring(4);
                //stop loop
                return false;
            }
        });

        return internalName;
    }

    function getField(key) {
        //find key
        var field = false;
        _.forIn(mapping, function (v, k) {
            if (v.mappedName == key) {
                //Grab the field object
                field = v;
                //stop loop
                return false;
            }
        });

        return field;
    }

    function changeFactory(key, store, callback) {
        return function (newValue, enable, el) {
            changeValue(key, newValue, store["PurchaseOrderId"], function (response) {
                //Update store
                store[key] = newValue;

                //Callback
                if (callback) {
                    callback(key, newValue, store, enable, response);
                } else {
                    enable();
                }
            });
        }
    }

    function changeValue(key, value, id, callback) {
        var internalName = lookupKey(key);

        //Convert date if necessary
        if (mapping["ows_" + internalName].type === "date" && value !== "") {
            value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD', 'YYYY-MM-DD H:mm:ss']).format('YYYY-MM-DD H:mm:ss');
        } else if (mapping["ows_" + internalName].type === "json" && typeof value === "object") {
            //Convert json if necessary
            value = JSON.stringify(value);
        }

        $().SPServices({
            operation: "UpdateListItems",
            listName: listName,
            ID: id,
            async: true,
            batchCmd: "Update",
            valuepairs: [[internalName, value]],
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);
                callback.apply(this, arguments);
            }
        });
    }

    function changeValues(values, id, callback) {
        //Convert to an array of values
        var valuePairs = [];
        _.each(values, function (value, key) {
            var internalName = lookupKey(key);

            //Convert date if necessary
            if (mapping["ows_" + internalName].type === "date" && value !== "") {
                value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD', 'YYYY-MM-DD H:mm:ss']).format('YYYY-MM-DD H:mm:ss');
            } else if (mapping["ows_" + internalName].type === "json" && typeof value === "object") {
                //Convert json if necessary
                value = JSON.stringify(value);
            }

            valuePairs.push([internalName, value]);
        });

        $().SPServices({
            operation: "UpdateListItems",
            listName: listName,
            ID: id,
            async: true,
            batchCmd: "Update",
            valuepairs: valuePairs,
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                //Convert to JSON object for easier access 
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: mapping,
                    includeAllAttrs: false
                });

                utility.fixLookups(mapping, data);

                callback(data[0]);
            }
        });
    }

    function getDocuments(store, callback) {
        store.Documents = [];

        //Get construction documents
        $().SPServices({
            operation: "GetAttachmentCollection",
            listName: listName,
            ID: store["PurchaseOrderId"],
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                $(xData.responseXML).find("Attachments > Attachment").each(function (i, el) {
                    var $node = $(this),
                      filePath = $node.text(),
                      arrString = filePath.split("/"),
                      fileName = arrString[arrString.length - 1];
                    var version = 0;

                    if (fileName.indexOf("revision") > -1) {
                        version = fileName.substr(fileName.indexOf("revision ") + "revision ".length);
                        version = version.replace(".pdf", "");
                    }
                    else
                        version = 0;

                    store.Documents.push({ FileName: fileName, FilePath: filePath, Version: version });
                });

                callback(store);
            }
        });
    }

    function uploadDocument(store, file, name, callback) {
        $().SPServices({
            operation: "AddAttachment",
            listName: listName,
            listItemID: store["PurchaseOrderId"],
            fileName: name,
            async: true,
            attachment: file,
            completefunc: function (xData, Status) {
                var test = utility.errorCheck(xData, Status); if (test.success === false) return callback(test.message);

                //TODO - find a way to add the document to the store.Documents list (FileName & FilePath) - this doesn't quite work!
                store.Documents = (typeof store.Documents !== 'undefined' ? store.Documents : []);

                var filePath = "https://www.sonicpartnernet.com/Scoop/Information Services/PMT/Roll Out/" + $(xData.responseXML).find("AddAttachmentResult").text(),
                  arrString = filePath.split("/"),
                  fileName = arrString[arrString.length - 1];

                store.Documents.push({ FileName: fileName, FilePath: filePath });

                if (typeof callback !== 'undefined') {
                    callback(store);
                }
            }
        });
    }

    function getTotal(po) {
        var total = Big('0');
        _.each(po.purchaseOrderItems, function (item) {
            var price = Big(item.Price),
              qty = Big(item.Quantity);

            total = total.plus(price.times(qty));
        });

        return total.toString();
    }

    return {
        loadData: loadData,
        logFields: logFields,
        changeFactory: changeFactory,
        changeValue: changeValue,
        changeValues: changeValues,
        getField: getField,
        getDocuments: getDocuments,
        uploadDocument: uploadDocument,
        create: create,
        destroy: destroy,
        getTotal: getTotal
    };
});
