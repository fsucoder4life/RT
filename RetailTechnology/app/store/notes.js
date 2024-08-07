define(['app/brands/services/brandServices', 'app/brands/services/logHelper'], function(brandServices,logHelper){
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    $.support.cors = true;
    var listName = 'Project Notes';

    //Point towards the sharepoint site
    var webUrl = brandServices.getSharePointUrlByKey("siteCollectionUrl");
    $().SPServices.defaults.webURL = webUrl;//  // URL of the target Web
    logHelper.logDebug("issues.js", "webUrl: " + webUrl);
    //Request fields mapping from internal names
    var mapping = {
        ows_ID: {mappedName: "NoteId", objectType: "Text"},
        ows_Store_x0020_Number: {mappedName: 'StoreNumber', objectType: 'Lookup'},
        ows_IssueId: {mappedName: 'IssueId', objectType: 'Lookup'},
        ows_Source: {mappedName: 'Source', objectType: 'Text'},
        ows_Note: {mappedName: 'Note', objectType: 'Text'},
        ows_Note_x0020_Type: {mappedName: 'NoteType', objectType: 'Text', type: 'select', options: ['General', 'Connectivity', 'POS', 'POPS', 'Audio', 'PAYS', 'DMB/TV', 'Installer', 'Construction', 'Site Survey']},
        ows_Author: {mappedName: 'CreatedBy', objectType: 'Lookup'},
        ows_Editor: {mappedName: 'ModifiedBy', objectType: 'Lookup'},
        ows_Created: {mappedName: 'CreatedOn', objectType: 'Text', type: 'date'},
        ows_Modified: {mappedName: 'ModifiedOn', objectType: 'Text', type: 'date'}
    };

    //Build the fields request xml
    var fields = "<ViewFields>";

    _.forIn(mapping, function (val, key) {
        fields += '<FieldRef Name="' + key.substr(4) + '" />'
    });

    fields += "</ViewFields>";

    function loadData (options, callback) {
        //-------------------------------------------------------Report Build
        //Empty query to load all if not passed
        var query = options.query;

        //Create query by store number if not passed
        if (typeof query === "undefined" && options.store) {
            //Build query
            query = new CamlBuilder().Where().LookupField('Store_x0020_Number').Value().EqualTo(options.store.StoreNumber)
                .OrderByDesc('Severity');

            query = "<Query>" + query.ToString() + "</Query>";
        }

        //Load the items if a query exists
        if (query) {
            $().SPServices({
                operation: "GetListItems",
                listName: listName,
                CAMLViewFields: fields,
                CAMLQuery: query,
                completefunc: function(xData, Status) {
                    //Convert to JSON object for easier access
                    var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        mapping: mapping,
                        includeAllAttrs: false
                    });

                    _.forEach(data, function (item, i) {
                        //Fix the store number and ids
                        item.CombinedId = item.StoreNumber.lookupId;
                        item.StoreNumber = item.StoreNumber.lookupValue;
                        item.IssueId = item.IssueId.lookupId;
                        item.CreatedById = item.CreatedBy.lookupId;
                        item.CreatedBy = item.CreatedBy.lookupValue;
                        item.CreatedOnId = item.CreatedOn.lookupId;
                        item.ModifiedBy = item.ModifiedBy.lookupValue;
                    });

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

        //Utility function
        //TODO put this somewhere more practical as a utility function
        function displayObject(obj) {
            _.forIn(obj, function (val, key) {
                console.log(key + ": ", val);
            });
        }
    }

    function create (store, note, callback) {
        var pairs = [
            ["Source", note.Source || ''],
            ["Store_x0020_Number", store.CombinedId + ";#" + store.StoreNumber],
            ["Note_x0020_Type", note.NoteType || ''],
            ["Note", note.Note || '']
        ];

        if (note.IssueId) {
            pairs.push(['IssueId', note.IssueId + ";#" + note.IssueId]);
        }

        $().SPServices({
            operation: "UpdateListItems",
            async: true,
            batchCmd: "New",
            listName: listName,
            valuepairs: pairs,
            completefunc: function(xData, Status) {
                //Convert to JSON object for easier access
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: mapping,
                    includeAllAttrs: false
                });

                _.forEach(data, function (item, i) {
                    //Fix the store number
                    item.CombinedId = item.StoreNumber.lookupId;
                    item.StoreNumber = item.StoreNumber.lookupValue;
                    item.IssueId = item.IssueId.lookupId;
                    item.CreatedById = item.CreatedBy.lookupId;
                    item.CreatedBy = item.CreatedBy.lookupValue;
                    item.ModifiedById = item.ModifiedBy.lookupId;
                    item.ModifiedBy = item.ModifiedBy.lookupValue;
                });

                callback(data[0]);
            }
        });
    }


    function destroy (id, callback) {
        $().SPServices({
            operation: "UpdateListItems",
            listName: listName,
            batchCmd: "Delete",
            ID: id,
            completefunc: callback
        });
    }

    function logFields () {
        $().SPServices({
            operation: "GetListAndView",
            listName: listName,
            viewName: 'A54AF98D-2411-4B71-8B15-F7D21A18F50A',
            completefunc: function(xData, Status) {
                $(xData.responseXML).find("Fields > Field").each(function() {
                    var $node = $(this);
                    console.log( "Type: " + $node.attr("Type") + " StaticName: " + $node.attr("StaticName") + " Name: " + $node.attr("DisplayName") );
                });
            }
        });
    }

    function lookupKey (key) {
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

    function getField (key) {
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

    function changeFactory (key, store, callback) {
        return function (value) {
            changeValue(key, value, store.NoteId, function (response) {
                //Update store
                store[key] = value;

                //Callback
                if (callback) {
                    callback(key, value, store, revertBackground, response);
                } else {
                    revertBackground();
                }
            });
        }
    }

    function changeValue (key, value, id, callback) {
        var internalName = lookupKey(key);

        //Convert date if necessary
        if (mapping["ows_" + internalName].type === "date" && value !== "") {
            value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
        }

        $().SPServices({
            operation: "UpdateListItems",
            listName: listName,
            ID: id,
            async: true,
            batchCmd: "Update",
            valuepairs: [[internalName, value]],
            completefunc: callback
        });
    }

    function changeValues (values, id, callback) {
        //Convert to an array of values
        var valuePairs = [];
        _.each(values, function (value, key) {
            var internalName = lookupKey(key);

            //Convert date if necessary
            if (mapping["ows_" + internalName].type === "date" && value !== "") {
                value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
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
            completefunc: function(xData, Status) {
                //Convert to JSON object for easier access
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: mapping,
                    includeAllAttrs: false
                });

                _.forEach(data, function (item, i) {
                    //Fix the store number
                    item.CombinedId = item.StoreNumber.lookupId;
                    item.StoreNumber = item.StoreNumber.lookupValue;
                    item.IssueId = item.IssueId.lookupId;
                    item.CreatedById = item.CreatedBy.lookupId;
                    item.CreatedBy = item.CreatedBy.lookupValue;
                    item.ModifiedById = item.ModifiedBy.lookupId;
                    item.ModifiedBy = item.ModifiedBy.lookupValue;
                });

                callback(data[0]);
            }
        });
    }

    function getDocuments (store, callback) {
        store.Documents = store.Documents || [];

        //Get construction documents
        $().SPServices({
            operation: "GetAttachmentCollection",
            listName: listName,
            ID: store.NoteId,
            completefunc: function(xData, Status) {
                $(xData.responseXML).find("Attachments > Attachment").each(function(i, el) {
                    var $node = $(this),
                        filePath = $node.text(),
                        arrString = filePath.split("/"),
                        fileName = arrString[arrString.length - 1];

                    store.Documents.push({FileName: fileName, FilePath: filePath});
                });

                callback(store);
            }
        });
    }

    return {
        loadData: loadData,
        logFields: logFields,
        changeFactory: changeFactory,
        changeValue: changeValue,
        changeValues: changeValues,
        getField: getField,
        getDocuments: getDocuments,
        create: create,
        destroy: destroy
    };
});
