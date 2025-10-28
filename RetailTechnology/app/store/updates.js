define(['app/store/sp-utility', 'app/brands/services/brandServices', 'app/brands/services/logHelper'], function (utility, brandServices, logHelper) {
  //Setup
  //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
  $.support.cors = true;
  var listName = 'Construction Install Updates';
  
  //Point towards the sharepoint site
  var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
  $().SPServices.defaults.webURL = webUrl;//  // URL of the target Web
  logHelper.logDebug("updates.js", "webUrl: " + webUrl);
  //Request fields mapping from internal names
  var mapping = {
    ows_ID: {mappedName: "UpdateId", objectType: "Text"},
    ows_Store_x0020_Number: {mappedName: 'StoreNumber', objectType: 'Lookup'},
    ows_Technician_x0020_Name: {mappedName: 'TechnicianName', objectType: 'Text'},
    ows_Technician_x0020_Phone: {mappedName: 'TechnicianPhone', objectType: 'Text'},
    ows_Technician_x0020_Email: {mappedName: 'TechnicianEmail', objectType: 'Text'},
    ows_Inventory_x0020_Performed: {mappedName: 'InventoryPerformed', objectType: 'Text'},
    ows_Walkthrough_x0020_Performed: {mappedName: 'WalkthroughPerformed', objectType: 'Text'},
    ows_Signoff_x0020_Performed: {mappedName: 'SignoffPerformed', objectType: 'Text'},
    ows_Site_x0020_Issues: {mappedName: 'SiteIssues', objectType: 'Text'},
    ows_Equipment_x0020_Issues: {mappedName: 'EquipmentIssues', objectType: 'Text'},
    ows_POS_x0020_Cabling: {mappedName: 'PosCabling', objectType: 'Text'},
    ows_POS_x0020_Monitors: {mappedName: 'PosMonitors', objectType: 'Text'},
    ows_POS_x0020_Workstations: {mappedName: 'PosWorkstations', objectType: 'Text'},
    ows_POS_x0020_Server: {mappedName: 'PosServer', objectType: 'Text'},
    ows_POS_x0020_Overall: {mappedName: 'PosOverall', objectType: 'Text'},
    ows_POS_x0020_Notes: {mappedName: 'PosNotes', objectType: 'Text'},
    ows_POPS_x0020_Hung: {mappedName: 'PopsHung', objectType: 'Text'},
    ows_POPS_x0020_APs_x0020_Authorized: {mappedName: 'PopsApsAuthorized', objectType: 'Text'},
    ows_POPS_x0020_Order_x0020_Confirmat: {mappedName: 'PopsOrderConfirmation', objectType: 'Text'},
    ows_POPS_x0020_Marketing: {mappedName: 'PopsMarketing', objectType: 'Text'},
    ows_POPS_x0020_Test_x0020_Transactio: {mappedName: 'PopsTestTransactions', objectType: 'Text'},
    ows_POPS_x0020_Overall: {mappedName: 'PopsOverall', objectType: 'Text'},
    ows_POPS_x0020_Notes: {mappedName: 'PopsNotes', objectType: 'Text'},
    ows_Audio_x0020_Cable_x0020_Pulled: {mappedName: 'AudioCablePulled', objectType: 'Text'},
    ows_Audio_x0020_Equipment_x0020_Set: {mappedName: 'AudioEquipmentSet', objectType: 'Text'},
    ows_Audio_x0020_Cable_x0020_Terminat: {mappedName: 'AudioCableTerminated', objectType: 'Text'},
    ows_Audio_x0020_Overall: {mappedName: 'AudioOverall', objectType: 'Text'},
    ows_Audio_x0020_Notes: {mappedName: 'AudioNotes', objectType: 'Text'},
    ows_PAYS_x0020_Mounted: {mappedName: 'PaysMounted', objectType: 'Text'},
    ows_PAYS_x0020_Server: {mappedName: 'PaysServer', objectType: 'Text'},
    ows_PAYS_x0020_Programmed: {mappedName: 'PaysProgrammed', objectType: 'Text'},
    ows_PAYS_x0020_Test_x0020_Transactio: {mappedName: 'PaysTestTransactions', objectType: 'Text'},
    ows_PAYS_x0020_Notes: {mappedName: 'PaysNotes', objectType: 'Text'},
    ows_Digital_x0020_Menus_x0020_Mounte: {mappedName: 'DmbMounted', objectType: 'Text'},
    ows_Digital_x0020_Menus_x0020_Config: {mappedName: 'DmbConfigured', objectType: 'Text'},
    ows_Digital_x0020_Menus_x0020_Conten: {mappedName: 'DmbContentLoaded', objectType: 'Text'},
    ows_Digital_x0020_Menus_x0020_Verfie: {mappedName: 'DmbVerified', objectType: 'Text'},
    ows_Digital_x0020_Menu_x0020_Notes: {mappedName: 'DmbNotes', objectType: 'Text'},
    ows_Sonic_x0020_Radio_x0020_Cable_x0: {mappedName: 'SonicRadioCablePulled', objectType: 'Text'},
    ows_Sonic_x0020_Radio_x0020_Equipmen: {mappedName: 'SonicRadioEquipmentSet', objectType: 'Text'},
    ows_Sonic_x0020_Radio_x0020_Playing: {mappedName: 'SonicRadioPlaying', objectType: 'Text'},
    ows_Sonic_x0020_Radio_x0020_Notes: {mappedName: 'SonicRadioNotes', objectType: 'Text'},
    ows_EncodedAbsUrl: {mappedName: 'UpdatesEncodedAbsoluteUrl', objectType: 'Text'},
    ows_Author: {mappedName: 'CreatedBy', objectType: 'Lookup'},
    ows_Editor: {mappedName: 'ModifiedBy', objectType: 'Lookup'},
    ows_Created: {mappedName: 'CreatedOn', objectType: 'Text', type: 'date'},
    ows_Modified: {mappedName: 'ModifiedOn', objectType: 'Text', type: 'date'},
    ows_Update_x0020_History: {mappedName: 'UpdateHistory', objectType: 'Text'}
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
    var query = options.query || '<query></query>';
    
    //Create query by store number if not passed
    if (typeof query === "undefined" && options.store) {
      //Build query
      query = new CamlBuilder().Where().LookupField('Store_x0020_Number').Value().EqualTo(options.store.StoreNumber)
        .OrderByDesc('Store_x0020_Number');
      
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
          if (utility.errorCheck(xData, Status) === false) return;
          
          //Convert to JSON object for easier access
          var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
            mapping: mapping,
            includeAllAttrs: false
          });
          
          _.forEach(data, function (item, i) {
            //Fix the store number and ids
            item.CombinedId = item.StoreNumber.lookupId;
            item.StoreNumber = item.StoreNumber.lookupValue;
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
  
  function create (store, callback) {
    var pairs = [
      ["Store_x0020_Number", store.CombinedId + ";#" + store.StoreNumber]
    ];
    
    $().SPServices({
      operation: "UpdateListItems",
      async: true,
      batchCmd: "New",
      listName: listName,
      valuepairs: pairs,
      completefunc: function(xData, Status) {
        if (utility.errorCheck(xData, Status) === false) return;
        
        //Convert to JSON object for easier access
        var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
          mapping: mapping,
          includeAllAttrs: false
        });
        
        _.forEach(data, function (item, i) {
          //Fix the store number
          item.CombinedId = item.StoreNumber.lookupId;
          item.CombinedId = item.StoreNumber.lookupId;
          item.StoreNumber = item.StoreNumber.lookupValue;
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
      viewName: '5679B3FE-D68C-4039-87DD-049B3537C050',
      completefunc: function(xData, Status) {
        if (utility.errorCheck(xData, Status) === false) return;
        
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
      changeValue(key, value, store.UpdateId, function (response) {
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
        if (utility.errorCheck(xData, Status) === false) return;
        
        //Convert to JSON object for easier access
        var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
          mapping: mapping,
          includeAllAttrs: false
        });
        
        _.forEach(data, function (item, i) {
          //Fix the store number
          item.CombinedId = item.StoreNumber.lookupId;
          item.StoreNumber = item.StoreNumber.lookupValue;
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
    store.Documents = [];
    
    //Get construction documents
    $().SPServices({
      operation: "GetAttachmentCollection",
      listName: listName,
      ID: store.UpdateId,
      completefunc: function(xData, Status) {
        if (utility.errorCheck(xData, Status) === false) return;
        
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
  
  function uploadDocument (store, file, name, callback) {
    $().SPServices({
      operation: "AddAttachment",
      listName: listName,
      listItemID: store.UpdateId,
      fileName: name,
      async: true,
      attachment: file,
      completefunc: function (xData, Status) {
        if (utility.errorCheck(xData, Status) === false) return;
        
        //TODO - find a way to add the document to the store.Documents list (FileName & FilePath) - this doesn't quite work!
        store.Documents = (typeof store.Documents !== 'undefined' ? store.Documents : []);
        
        var filePath = "https://www.sonicpartnernet.com/Scoop/Information Services/PMT/Roll Out/" + $(xData.responseXML).find("AddAttachmentResult").text(),
          arrString = filePath.split("/"),
          fileName = arrString[arrString.length - 1];
        
        store.Documents.push({FileName: fileName, FilePath: filePath});
        
        if (typeof callback !== 'undefined') {
          callback(store);
        }
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
    uploadDocument: uploadDocument,
    create: create,
    destroy: destroy
  };
});
