define(['app/store/combined','app/brands/services/brandServices'], async function(combined,brandServices){
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    $.support.cors = true;

    //Point towards the sharepoint site
    var webUrl = await brandServices.getSharePointUrlByKey("sharePointBaseUrl");
    $().SPServices.defaults.webURL = webUrl;//  // URL of the target Web
    $().SPServices.defaults.listName = "Combined Construction Extend";  // Name of the list for list
    var today = moment().format('M/D');
    var combinedconstructionextendMapping = {
        ows_ID: { mappedName: "CombinedConstructionExtendId", objectType: "Text" },
        ows_Title: {mappedName: "Title", objectType: "Text"},
        ows_Store_x0020_Number: {mappedName: 'StoreNumber', objectType: "Lookup"},
        ows_Infor_x0020_Server_x0020_HDD_x00: { mappedName: 'InforServerHDDUpgradeType', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x000: { mappedName: 'InforServerHDDUpgradeOrdered', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x001: { mappedName: 'InforServerHDDUpgradeDelivered', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Server_x0020_HDD_x002: { mappedName: 'InforServerHDDUpgradeGoLive', objectType: 'Text', type: 'date' },
        ows_HME_x0020_Integration_x0020_Type: { mappedName: 'HMEIntegrationType', objectType: 'Text' },
        ows_HME_x0020_Integration_x0020_Go_x: { mappedName: 'HMEIntegrationGoLive', objectType: 'Text', type: 'date' },
        ows_HME_x0020_Integration_x0020_Inst: { mappedName: 'HMEIntegrationInstaller', objectType: 'Text' },
        ows_HME_x0020_Integration_x0020_IT_x: { mappedName: 'HMEIntegrationITPM', objectType: 'Text' },

        ows_VP6800_x0020_Go_x0020_Live: { mappedName: 'VP6800GoLive', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Remediation_x0020_D: { mappedName: 'VP6800RemediationDate', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Num_x0020_Of_x0020_: { mappedName: 'VP6800NumOfTerminals', objectType: 'Text' },
        ows_VP6800_x0020_Num_x0020_Of_x0020_0: { mappedName: 'VP6800NumOf45Units', objectType: 'Text' },
        ows_VP6800_x0020_Num_x0020_Of_x0020_1: { mappedName: 'VP6800NumOf90Units', objectType: 'Text' },
        ows_VP6800_x0020_DT_x0020_Window: { mappedName: 'VP6800DTWindow', objectType: 'Text' },
        ows_VP6800_x0020_Sunshield: { mappedName: 'VP6800Sunshield', objectType: 'Text' },
        ows_VP6800_x0020_Ordered: { mappedName: 'VP6800Ordered', objectType: 'Text', type: 'date' },
        
        ows_VP6800_x0020_Delivery: { mappedName: 'VP6800Delivery', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Tracking_x0020_Num: { mappedName: 'VP6800TrackingNum', objectType: 'Text' },
        ows_Level_x0020_10_x0020_Tracking_x0: { mappedName: 'VP6800Level10TrackingNum', objectType: 'Text' },
        ows_VP6800_x0020_Installer: { mappedName: 'VP6800Installer', objectType: 'Text', type: 'select', options: ['SELF', 'AVIT', 'ATI', 'MIRA', 'BUCHANAN', 'ITFORP', 'MSIT', 'RH', 'MCG'] },
        ows_VP6800_x0020_Installer_x0020_Lea: { mappedName: 'VP6800InstallerLead', objectType: 'Text' },
        ows_VP6800_x0020_PO_x0020_Num: { mappedName: 'VP6800PONum', objectType: 'Text' },
        ows_VP6800_x0020_IT_x0020_PM: { mappedName: 'VP6800ITPM', objectType: 'Text' },
        
        ows_Hughes_x0020_Switch_x0020_Upgrad: { mappedName: 'HughesSwitchUpgradeOrdered2', objectType: 'Text' },

        ows_VP6800_x0020_Project_x0020_Site_: { mappedName: 'VP6800ProjectSiteSurveyDate', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Project_x0020_Site_0: { mappedName: 'VP6800ProjectSiteSurveyCompany', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Sign_: { mappedName: 'VP6800ProjectSignOffsComplete', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Switc: { mappedName: 'VP6800ProjectSwitchSerialNum', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Switc0: { mappedName: 'VP6800ProjectSwitchSerialNumTwo', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Switc1: { mappedName: 'VP6800ProjectSwitchUPSSerialNum', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme: { mappedName: 'VP6800ProjectPaymentSerialNum1', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_: { mappedName: 'VP6800ProjectLaneNum1', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme0: { mappedName: 'VP6800ProjectPaymentSerialNum2', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_0: { mappedName: 'VP6800ProjectLaneNum2', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme1: { mappedName: 'VP6800ProjectPaymentSerialNum3', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_1: { mappedName: 'VP6800ProjectLaneNum3', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme2: { mappedName: 'VP6800ProjectPaymentSerialNum4', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_2: { mappedName: 'VP6800ProjectLaneNum4', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme3: { mappedName: 'VP6800ProjectPaymentSerialNum5', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_3: { mappedName: 'VP6800ProjectLaneNum5', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme4: { mappedName: 'VP6800ProjectPaymentSerialNum6', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_4: { mappedName: 'VP6800ProjectLaneNum6', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme5: { mappedName: 'VP6800ProjectPaymentSerialNum7', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_5: { mappedName: 'VP6800ProjectLaneNum7', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme6: { mappedName: 'VP6800ProjectPaymentSerialNum8', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_6: { mappedName: 'VP6800ProjectLaneNum8', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme7: { mappedName: 'VP6800ProjectPaymentSerialNum9', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_7: { mappedName: 'VP6800ProjectLaneNum9', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Payme8: { mappedName: 'VP6800ProjectPaymentSerialNum10', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Lane_8: { mappedName: 'VP6800ProjectLaneNum10', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Notes: { mappedName: 'VP6800ProjectNotes', objectType: 'Text', type: 'textarea' },
        ows_VP6800_x0020_Server_x0020_Cabine: { mappedName: 'VP6800ServerCabinet', objectType: 'Text', type: 'select', options: ['6u', '12u', 'both'] },
        ows_VP6800_x0020_Server_x0020_Cabine0: { mappedName: 'VP6800ServerCabinetShelf', objectType: 'Text' },
        ows_VP6800_x0020_Server_x0020_Cabine1: { mappedName: 'VP6800ServerCabinetNumber', objectType: 'Text' },
        ows_VP6800_x0020_Project_x0020_Servi: { mappedName: 'VP6800ProjectServiceNowNum', objectType: 'Text' },
        ows_VP6800_x0020_Server_x0020_Cabine2: { mappedName: 'VP6800ServerCabinet12uNumber', objectType: 'Text' },


        ows_VP6800_x0020_Intro_x0020_Call_x0: { mappedName: 'VP6800IntroCallToFee', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Site_x0020_Survey_x: { mappedName: 'VP6800SiteSurveyRequested', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Hughes_x0020_Doc_x0: { mappedName: 'VP6800HughesDoctoFEE', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Hughes_x0020_Doc_x00: { mappedName: 'VP6800HughesDoctoHughes', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Site_x0020_Survey_x0: { mappedName: 'VP6800SiteSurveyConfirmedbyInstaller', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Site_x0020_Survey_x1: { mappedName: 'VP6800SiteSurveyDateCommtoFEE', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_SS_x0020_Tech: { mappedName: 'VP6800SSTech', objectType: 'Text' },
        ows_VP6800_x0020_Parts_x0020_Call: { mappedName: 'VP6800PartsCall', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Order_x0020_Doc_x00: { mappedName: 'VP6800OrderDocSenttoFee', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Signature_x0020_Pag: { mappedName: 'VP6800SignaturePageReceived', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Install_x0020_Sched: { mappedName: 'VP6800InstallScheduled', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_30_x0020_Day_x0020_: { mappedName: 'VP680030DayComm', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_2_x0020_Week_x0020_: { mappedName: 'VP68002WeekComm', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Action_x0020_Item_x: { mappedName: 'VP6800ActionItemCalltoFEEfromSS', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_1_x0020_Week_x0020_: { mappedName: 'VP68001WeekComm', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Day_x0020_Before_x0: { mappedName: 'VP6800DayBeforeInstallComm', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Review_x0020_Sign_x: { mappedName: 'VP6800ReviewSignOffs', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Remediation_x0020_D: { mappedName: 'VP6800RemediationDate', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Deliverables_x0020_: { mappedName: 'VP6800DeliverablestoFEE', objectType: 'Text', type: 'date' },
        ows_VP6800_x0020_Store_x0020_Close_x: { mappedName: 'VP6800StoreCloseTime', objectType: 'Text' },
        ows_VP6800_x0020_SITE_x0020_SURVEY_x2: { mappedName: 'VP6800SiteSurveyCompleted', objectType: 'Text', type:'date' },
        ows_VP6800_x0020_Site_x0020_Survey_x3: { mappedName: 'VP6800SiteSurveyResultsReviewed', objectType: 'Text', type: 'date' },
        ows_RMA_x0020_OR_x0020_OPEN_x0020_IT: { mappedName: 'RMAOrOpen', objectType: 'Text' },
        

        ows_AddressBillTo: { mappedName: 'AddressBillTo', objectType: 'Text' },
        ows_CompanyBillTo: { mappedName: 'CompanyBillTo', objectType: 'Text' },
        ows_CityBillTo: { mappedName: 'CityBillTo', objectType: 'Text' },
        ows_StateBillTo: { mappedName: 'StateBillTo', objectType: 'Text' },
        ows_ZipBillTo: { mappedName: 'ZipBillTo', objectType: 'Text' },
        ows_EmailBillTo: { mappedName: 'EmailBillTo', objectType: 'Text' },

        ows_PaymentTerminalAndInfoLane50Faci: { mappedName: 'PaymentTerminalAndInfoLane50Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane91Faci: { mappedName: 'PaymentTerminalAndInfoLane91Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane92Faci: { mappedName: 'PaymentTerminalAndInfoLane92Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane93Faci: { mappedName: 'PaymentTerminalAndInfoLane93Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane94Faci: { mappedName: 'PaymentTerminalAndInfoLane94Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane95Faci: { mappedName: 'PaymentTerminalAndInfoLane95Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane96Faci: { mappedName: 'PaymentTerminalAndInfoLane96Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane97Faci: { mappedName: 'PaymentTerminalAndInfoLane97Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane98Faci: { mappedName: 'PaymentTerminalAndInfoLane98Facing', objectType: 'Text' },
        ows_PaymentTerminalAndInfoLane99Faci: { mappedName: 'PaymentTerminalAndInfoLane99Facing', objectType: 'Text' }


        

    };
    var listName = 'Combined Construction Extend';

    //Build the fields request xml
    var constructionFields = "<ViewFields>";

    _.forIn(combinedconstructionextendMapping, function (val, key) {
        constructionFields += '<FieldRef Name="' + key.substr(4) + '" />'
    });

    constructionFields += "</ViewFields>";

    function loadData(options, callback) {

        function insert(str, index, value) {
            return str.substr(0, index) + value + str.substr(index);
        }
        //-------------------------------------------------------Report Build
        //Set construction to empty string if both queries are blank
        console.log("loadData options:" + options.query);
        
        $.each(options, function (key, valueObj) {
            console.log("loop:" + key + "/" + valueObj);
        });
        
        var constructionQuery = options.constructionQuery || options.query || (options.combinedQuery ? undefined : '');
        var combinedQuery = options.combinedQuery;

        //Search the list//Get the construction call list - defaults to current view
        var data;
        console.log("In loadData of combinedConExt");
        console.log("constructionQuery222 : " + constructionQuery);
        //console.log("constructionFields: " + constructionFields);
        //Load the construction items if a query exists
        if (constructionQuery) {
            console.log("In loadData of constructionQuery: " + constructionQuery);
            $().SPServices({
                operation: "GetListItems",
                async: false,
                listName: "Combined Construction Extend",
                CAMLViewFields: constructionFields,
                CAMLQuery: constructionQuery,
                CAMLRowLimit: 0,
                completefunc: function (xData, Status) {
                    //console.log(xData);
                    console.log("status: " + Status);
                    console.log("completefunc1");
                    //Convert to JSON object for easier access
                    var construction = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        mapping: combinedconstructionextendMapping,
                        includeAllAttrs: false
                    });

                    //Fix the looked up store number & remove items with undefined store numbers - not sure why these exist, looks like someone deleted some values in a strange way

                    _.forEach(construction, function (store, i) {
                        if (typeof store.StoreNumber === 'undefined') delete store;
                        store.StoreNumber = store.StoreNumber.lookupValue;
                    });
                    
                    if (typeof options.combinedQuery !== 'undefined') {
                        query = options.combinedQuery;
                    } else {
                        query = "<Query>" + new CamlBuilder().Where().TextField('Title').In(_.map(construction, function (store) {return store.StoreNumber})).ToString() + "</Query>";
                    }
                    console.log("combined.loadData - query: " + query);

                    if (query.length > 3000)
                    {
                        query = query.replace("<Where><In>", "<Where><Or><In>");
                        query = query.replace("</In></Where>", "</In></Or></Where>");

                        var query1 = query.substring(0, query.length / 2);
                        var query2 = query.substring(query.length / 2);

                        query1loc = query1.lastIndexOf("</Value>") + "</Value>".length;
                        query = insert(query1, query1loc, '</Values></In><In><FieldRef Name="ID" /><Values>') + query2;
                    }
                    combined.loadData({ query: query }, function (combined) {
                        console.log("combined.loadData: ");
                        //Combine data
                        _.forEach(construction, function (item, index) {
                            //Merge returned data
                            $().extend(true, combined[item.StoreNumber], item);
                        });
                        //notify complete
                        data = combined;
                        complete();
                    });
                }
            });
        } else if (combinedQuery) {
            combined.loadData({query: combinedQuery}, function (combined) {
                console.log("In loadData of combinedQuery: " + combinedQuery);
                //Create query
                var query = "<Query>" + new CamlBuilder().Where().TextField('Store_x0020_Number').In(_.map(combined, function (store) {return store.StoreNumber})).ToString() + "</Query>";

                //Lookup construction list info by store number
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Construction Extend",
                    CAMLViewFields: constructionFields,
                    //TODO update this with city and state searches on the lookup fields
                    CAMLQuery: query,
                    completefunc: function(xData, Status) {
                        //Notify complete
                        constructionLoaded = true;

                        //Convert to JSON object for easier access
                        var construction = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            mapping: combinedconstructionextendMapping,
                            includeAllAttrs: false
                        });

                        //Combine data
                        _.forEach(construction, function (item, index) {
                            //Fix the referenced store number and id
                            item.StoreNumber = item.StoreNumber.lookupValue;

                            //Merge returned data
                            $().extend(true, combined[item.StoreNumber], item);
                        });

                        data = combined;
                        complete();
                    }
                });
            });
        }


        //Called when all data is loaded from a search query
        function complete () {
            data = _.toArray(data);
             //Filter the array
            if (typeof options.filter === "function") {
                data = options.filter(data);
            }

            //Sort the array
            if (typeof options.sort === "object") {
                if (options.sort.direction === "DESC") {
                    data = _(data).map().sortBy(data, options.sort.key).reverse().valueOf();
                } else {
                    data = _(data).map().sortBy(data, options.sort.key).valueOf();
                }
            } else if (typeof options.sort === "function") {
                data = options.sort(data);
            }



            //Call the callback function
            callback(data);
        }
    }

    function lookupKey (key) {
        //find the key
        var internalName = false;
        _.forIn(combinedconstructionextendMapping, function (v, k) {
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
        _.forIn(combinedconstructionextendMapping, function (v, k) {
            if (v.mappedName == key) {
                //Grab the field object
                field = v;
                //stop loop
                return false;
            }
        });

        //Check combined if it's not found yet
        if (field === false) {
            field = combined.getField(key);
        }

        return field;
    }

    function changeFactory (key, store, callback) {
        return function (value, revertBackground, oldValue, el) {
            changeValue(key, value, store, function (response) {
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

    function changeValue(key, value, store, callback) {
        console.log("changeValue CCE");
        var internalName = lookupKey(key);
        if (internalName) {
            //Convert date if necessary
            if (combinedconstructionextendMapping["ows_" + internalName].type === "date" && value !== "") {
                value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
            }

            if (isNaN(parseFloat(value))) {
                if (internalName === "DMB_x0020_Quantity") { value = 0; }
                else if (internalName === "TV_x0020_Quantity") { value = 0; }
                else if (internalName === "PAYS_x0020_Quantity") { value = 0; }
            }
            
            $().SPServices({
                operation: "UpdateListItems",
                listName: "Combined Construction Extend",
                ID: store.CombinedConstructionExtendId,
                async: true,
                batchCmd: "Update",
                valuepairs: [[internalName, value]],
                completefunc: function (xData, status) {
                    //Notify if web service call failed in transport
                    if (status == "Error") {
                        alert ("Unable to communicate with Sharepoint Server!");
                        return;
                    } else if (status == 'parsererror') {
                        alert ("Parser Error! Something went very wrong - please refresh the page to verify that you are logged in.");
                        return;
                    }

                    //Check for Errors in returned XML
                    var spErrCode = $(xData.responseText).find("ErrorCode").first(),
                        error = false,
                        errorMessage = "ERROR: Call to SharePoint Web Services failed.";
                    if (spErrCode.length > 0 && spErrCode.text() !== "0x00000000") {
                        error = true;
                        errorMessage += "\n\n" + $(xData.responseText).find("ErrorCode").first().text()
                            +	": " + $(xData.responseText).find("ErrorText").first().text();
                    } else if($(xData.responseText).find("faultcode").length > 0) {
                        error = true;
                        errorMessage += "\n\n" + $(xData.responseText).find("faultstring").first().text()
                            + "\n" + $(xData.responseText).find("errorstring").first().text();
                    }

                    //Notify of failed update operation
                    if (error) {
                        alert("Something went wrong!\n\n" + errorMessage);
                    } else {
                        //Call the passed callback if it's a function and we made it past the error checks!
                        if (typeof callback === 'function') callback(arguments);
                    }
                }
            });
        } else {
            combined.changeValue(key, value, store.CombinedId, callback);
        }
    }

    function deleteItem (store, callback) {
        $().SPServices({
            operation: "UpdateListItems",
            listName: "Combined Construction Extend",
            ID: store.CombinedConstructionExtendId,
            async: true,
            batchCmd: "Delete",
            completefunc: callback
        });
    }

    //Utility function
    //TODO put this somewhere more practical as a utility function
    function displayObject(obj) {
        _.forIn(obj, function (val, key) {
            console.log(key + ": ", val);
        });
    }

    function logFields () {
        $().SPServices({
            operation: "GetListAndView",
            listName: "Combined Construction Extend",
            viewName: '9DC9C184-AC0F-427C-9AF3-93D79A503A97',
            completefunc: function(xData, Status) {
                $(xData.responseXML).find("Fields > Field").each(function() {
                    var $node = $(this);
                    console.log( "Type: " + $node.attr("Type") + " StaticName: " + $node.attr("StaticName") + " Name: " + $node.attr("DisplayName") );
                });
            }
        });
    }
  
    function create (store, callback) {
      var pairs = [];
  
      _.forOwn(store, function(value, key) {
        if (key.substr(0,4) === 'ows_') {
          pairs.push([key.substr(4), value]);
        } else {
          pairs.push([lookupKey(key), value]);
        }
      });
      
      $().SPServices({
        operation: "UpdateListItems",
        async: true,
        batchCmd: "New",
        listName: listName,
        valuepairs: pairs,
        completefunc: function(xData, Status) {
          //Convert to JSON object for easier access 
          var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
              mapping: combinedconstructionextendMapping,
            includeAllAttrs: false
          });
          
          callback(data[0]);
        }
      });
    }


    return {
        loadData: loadData,
        logFields: logFields,
        changeFactory: changeFactory,
        changeValue: changeValue,
        getField: getField,
        delete: deleteItem,
      create: create
    }
});
