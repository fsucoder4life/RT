define(['app/store/combined','app/brands/services/brandServices','app/brands/services/logHelper'], function(combined,brandServices,logHelper){
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    $.support.cors = true;

    //Point towards the sharepoint site
	//console.log("construction.js before webUrl: " );
	
     //var webUrl = brandServices.getsubSitePath();
	 var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
    $().SPServices.defaults.webURL = webUrl;
	logHelper.logDebug("construction.js","webUrl: " +  webUrl);
    //$().SPServices.defaults.webURL = "/sites/SonicRTD";  // URL of the  target Web
    $().SPServices.defaults.listName = "Construction_Calls";  // Name of the list for list
    var today = moment().format('M/D');
	
    var constructionMapping = {
        ows_ID: {mappedName: "ConstructionId", objectType: "Text"},
        ows_Title: {mappedName: "Title", objectType: "Text"},
        ows_Store_x0020_Number: {mappedName: 'StoreNumber', objectType: "Lookup"},
        ows_POS_x0020_list_x0020_given_x0020: {mappedName: 'PosQuoteRequestedDate', objectType: 'Text', type: 'date'},
        ows_POS_x0020_Quote_x0020_Signed_x00: {mappedName: 'PosQuoteSignedDate', objectType: 'Text', type: 'date'},
        ows_POS_x0020_Delivery_x0020_Date: {mappedName: 'PosDeliveryDate', objectType: 'Text', type: 'date'},
        ows_Pays_x0020_Delivery_x0020_Date: {mappedName: 'PaysDeliveryDate', objectType: 'Text', type: 'date'},
        ows_Installer_x0020_Arrival_x0020_Da: {mappedName: 'InstallDate', objectType: 'Text', type: 'date'},
        ows_Install_x0020_End_x0020_Date: {mappedName: 'InstallEndDate', objectType: 'Text', type: 'date'},
        ows_Discussion_x0020_Notes: {mappedName: 'OldNotes', objectType: 'Text', type: 'textarea'},
        ows_DMB_x002f_TV_x0020_Delivery_x002: {mappedName: 'DmbTvDeliveryDate', objectType: 'Text', type: 'date'},
        ows_POS_x0020_Status: {mappedName: 'PosStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Deposit', 'Contract Complete ' + today, 'Shipped ' + today, 'Delivered']},
        ows_POPS_x0020_Status: { mappedName: 'PopsStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Credit Doc to FEE ' + today, 'Credit Doc to ISC ' + today, 'Estimate to FEE ' + today, 'Need Signature', 'Need Payment', 'PO Requested ' + today, 'PO Issued ' + today, 'Shipped ' + today, 'Delivered'] },
        ows_PAYS_x0020_Type: {mappedName: 'PaysType', objectType: 'Text', type: 'select', options: ['VP6800', 'SmartPAYS']},
        ows_Cirronet_x0020_Status: {mappedName: 'CirronetStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Estimate to FEE ' + today, 'Need Signature', 'Need to Order', 'Ordered ' + today, 'Shipped ' + today, 'Delivered']},
        ows_Merchant_x0020_ID_x0020_Status: {mappedName: 'MerchantId', objectType: 'Text', type: 'select', options: ['Not Required', 'Packet to FEE ' + today, 'Submitted ' + today]},
        ows_Server_x0020_EPS_x0020_Status: {mappedName: 'ServerEps', objectType: 'Text', type: 'select', options: ['Not Required', 'Need to Request', 'Pending Merchant ID', 'Requested ' + today, 'Complete']},
        ows_PAYS_x0020_Status: {mappedName: 'PaysStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Use Existing', 'Estimate to FEE ' + today, 'Need Signature', 'Ordered ' + today, 'Shipped ' + today, 'Delivered']},
        ows_DMB_x0020_Quantity: {mappedName: 'DmbQuantity', objectType: 'Text', type: 'number'},
        ows_TV_x0020_Quantity: {mappedName: 'TvQuantity', objectType: 'Text', type: 'number'},
        ows_DMB_x002f_TV_x0020_Status: {mappedName: 'DmbTvStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Contract Completed ' + today, 'Shipped ' + today, 'Delivered']},
        ows_Installation_x0020_Status: {mappedName: 'InstallationStatus', objectType: 'Text', type: 'select', options: ['Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Deposit', 'Contract Complete ' + today, 'Complete']},
        ows_Construction_x0020_Status: {mappedName: 'ConstructionStatus', objectType: 'Text', type: 'select', options: ['Delayed', 'On-Schedule', 'Ahead', 'On-Hold']},
        ows_Construction_x0020_Manager: { mappedName: 'ConstructionManager', objectType: 'Text', type: 'select', options: ['Andrea Trainer', 'Bill Rowan', 'Brenda Brunton', 'Iggy Pipitone', 'Jesse Culbertson', 'John Puente', 'Julieann Chism', 'Nick Rice'] },
        ows_Kitchen_x0020_Install_x0020_Date: {mappedName: 'KitchenInstallDate', objectType: 'Text', type: 'date'},
        ows_Speaker_x002f_Receiver_x0020_Del: {mappedName: 'SpeakerReceiverDeliveryDate', objectType: 'Text', type: 'date'},
        ows_Ground_x0020_Break_x0020_Date : {mappedName: 'GroundBreakDate', objectType: 'Text', type: 'date'},
        ows_POS_x0020_Configuration_x0020_Da: {mappedName: 'PosConfigDate', objectType: 'Text', type: 'date'},
        ows_Date_x0020_of_x0020_Initial_x002: {mappedName: 'InitialCallDate', objectType: 'Text', type: 'date'},
        ows_Speaker_x002f_Receiver_x0020_Sta: {mappedName: 'SpeakerReceiverStatus', objectType: 'Text', type: 'select', options: ['Yes', 'No']},
        ows_POS_x0020_Quote_x0020_Status : {mappedName: 'PosQuoteStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'POX to FEE '  + today, 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Survey', 'Need Deposit', 'Contract Complete ' + today]},
        ows_OCB_x0020_Quantity: {mappedName: 'Ocb', objectType: 'Text', type: 'select', options: ['No', '1', '2', '3']},
        ows_EncodedAbsUrl: {mappedName: 'EncodedAbsoluteUrl', objectType: 'Text'},
        ows_Initial_x0020_Install_x0020_Date: {mappedName: 'InitialInstallDate', objectType: 'Text', type: 'date'},
        ows_Initial_x0020_Go_x002d_Live_x002: {mappedName: 'InitialGoLiveDate', objectType: 'Text', type: 'date'},
        ows_Contractor: {mappedName: 'Contractor', objectType: 'Text'},
        ows_Contractor_x0020_Phone: {mappedName: 'ContractorPhone', objectType: 'Text'},
        ows_Contractor_x0020_Email: {mappedName: 'ContractorEmail', objectType: 'Text'},
        ows_Project_x0020_Status: {mappedName: 'ProjectStatus', objectType: 'Text', type: 'select', options: ['NOC', 'Need to Start', 'On Hold', 'Permitting', 'Active', 'Installing', 'Issues', 'PIM Issues', 'Complete']},
        ows_Install_x0020_Signoff_x0020_Stat: {mappedName: 'InstallSignoffStatus', objectType: 'Text', type: 'select', options: ['Not Submitted', 'Submitted', 'Failure to Submit']},
        ows_Overnight_x0020_Install: {mappedName: 'OvernightInstall', objectType: 'Text', type: 'select', options: ['Daytime', 'Overnight']},
        ows_Morning_x0020_Drink_x0020_Stop_x: {mappedName: 'MorningDrinkStopTime', objectType: 'Text', type: 'select', options: ['Yes', 'No']},
        ows_Digital_x0020_Menu_x0020_Content: {mappedName: 'DmbContentCreated', objectType: 'Text', type: 'select', options: ['Need to Request', 'Requested ' + today, 'Created ' + today]},
        ows_Telecom_x0020_Conduit_x0020_Date: {mappedName: 'TelecomConduitDate', objectType: 'Text', type: 'date'},
        ows_Sonic_x0020_Radio_x0020_Outdoor_: {mappedName: 'SonicRadioOutdoorSpeakerCount', objectType: 'Text', type: 'select', options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
        ows_Sonic_x0020_Radio_x0020_Outdoor_0: {mappedName: 'SonicRadioOutdoorSpeakerColor', objectType: 'Text', type: 'select', options: ['Black', 'White']},
        ows_Sonic_x0020_Radio_x0020_Ceiling_: {mappedName: 'SonicRadioCeilingSpeakerCount', objectType: 'Text', type: 'select', options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
        ows_Sonic_x0020_Radio_x0020_Zones: {mappedName: 'SonicRadioZoneCount', objectType: 'Text', type: 'select', options: [1, 2, 3, 4, 5]},
        ows_Sonic_x0020_Radio_x0020_Rack_x00: {mappedName: 'SonicRadioRackCount', objectType: 'Text', type: 'select', options: [1, 2, 3, 4, 5]},
        ows_Sonic_x0020_Radio_x0020_Delivery: {mappedName: 'SonicRadioDeliveryDate', objectType: 'Text', type: 'date'},
        ows_Sonic_x0020_Radio_x0020_Status: {mappedName: 'SonicRadioStatus', objectType: 'Text', type: 'select', options: ['Installer Provided', 'Not Required', 'Need Requirements', 'Need to Request', 'Estimate to FEE ' + today, 'Need Signature', 'Contract Complete ' + today, 'Shipped ' + today, 'Delivered']},
        ows_Test_x0020_Transaction_x0020_Sta: {mappedName: 'TestTransactionStatus', objectType: 'Text', type: 'select', options: ['No', 'Partial', 'Yes', 'N/A']},
        ows_Signoff_x0020_Submission_x0020_D: { mappedName: 'SignoffDate', objectType: 'Text', type: 'date' },
        ows_Vice_x0020_President: { mappedName: 'VicePresident', objectType: 'Text' },
        ows_HME_x0020_6700_x0020_Go_x002d_Li: { mappedName: 'HME6700GoLive', objectType: 'Text', type: 'date' },
        ows_HME_x0020_6700_x0020_Installer: { mappedName: 'HME6700Installer', objectType: 'Text' },
        ows_HME_x0020_6700_x0020_Project_x00: { mappedName: 'HME6700ProjectManager', objectType: 'Text' },
        ows_HME_x0020_6400_x0020_Go_x002d_Li: { mappedName: 'HME6400GoLive', objectType: 'Text', type: 'date' },
        ows_HME_x0020_6400_x0020_Installer: { mappedName: 'HME6400Installer', objectType: 'Text' },
        ows_HME_x0020_6400_x0020_Project_x00: { mappedName: 'HME6400ProjectManager', objectType: 'Text' },

        ows_Infor_x0020_Server_x0020_HDD_x00: { mappedName: 'InforServerHDDUpgradesServerType', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x000: { mappedName: 'InforServerHDDUpgradesOrdered', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x001: { mappedName: 'InforServerHDDUpgradesDelivered', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x002: { mappedName: 'InforServerHDDUpgradesGoLive', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Server_x0020_HDD_x003: { mappedName: 'InforServerHDDUpgradesHDDType', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x004: { mappedName: 'InforServerHDDUpgradesHDDOrdered', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x005: { mappedName: 'InforServerHDDUpgradesHDDDelivered', objectType: 'Text' },
        ows_Infor_x0020_Server_x0020_HDD_x006: { mappedName: 'InforServerHDDUpgradesHDDGoLive', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Server_x0020_HDD_x007: { mappedName: 'InforServerHDDUpgradesHDDProjectManager', objectType: 'Text' },

        ows_Infor_x0020_Terminal_x0020_Upgra: { mappedName: 'InforTerminalUpgradesNumOfTerminals', objectType: 'Text' },
        ows_Infor_x0020_Terminal_x0020_Upgra0: { mappedName: 'InforTerminalUpgradesNumUpgraded', objectType: 'Text' },
        ows_Infor_x0020_Terminal_x0020_Upgra1: { mappedName: 'InforTerminalUpgradesOrdered', objectType: 'Text' },
        ows_Infor_x0020_Terminal_x0020_Upgra2: { mappedName: 'InforTerminalUpgradesDelivery', objectType: 'Text' },
        ows_Infor_x0020_Terminal_x0020_Upgra3: { mappedName: 'InforTerminalUpgradesGoLive', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Terminal_x0020_Upgra4: { mappedName: 'InforTerminalUpgradesProjectManager', objectType: 'Text' },
        ows_Infor_x0020_Terminal_x0020_Upgra5: { mappedName: 'InforTerminalUpgradesNotes', objectType: 'Text' },

        ows_Oracle_x0020_Server_x0020_Upgrad: { mappedName: 'OracleServerUpgradeServerType', objectType: 'Text', type: 'select', options: ['5800', '5810','Flex Pro'] },
        ows_Oracle_x0020_Server_x0020_Upgrad0: { mappedName: 'OracleServerUpgradeOrdered', objectType: 'Text' },
        ows_Oracle_x0020_Server_x0020_Upgrad1: { mappedName: 'OracleServerUpgradeDelivery', objectType: 'Text', type: 'date' },
        ows_Oracle_x0020_Server_x0020_Upgrad2: { mappedName: 'OracleServerUpgradeGoLive', objectType: 'Text', type: 'date' },
        ows_Oracle_x0020_Server_x0020_Upgrad3: { mappedName: 'OracleServerUpgradeInstaller', objectType: 'Text' },
        ows_Oracle_x0020_Server_x0020_Upgrad4: { mappedName: 'OracleServerUpgradeSerialNum', objectType: 'Text' },
        ows_Oracle_x0020_Server_x0020_Upgrad5: { mappedName: 'OracleServerUpgradeWindowsUpgrade', objectType: 'Text', type: 'select', options: ['7', '10'] },
        ows_Oracle_x0020_Server_x0020_Upgrad6: { mappedName: 'OracleServerUpgradeGoLive2', objectType: 'Text', type: 'date' },
        ows_Oracle_x0020_Server_x0020_Upgrad7: { mappedName: 'OracleServerUpgradePM', objectType: 'Text' },
        ows_InstallerForWindows10Upgrade: { mappedName: 'InstallerForWindows10Upgrade', objectType: 'Text' },

        ows_Hughes_x0020_Switch_x0020_Upgrad: { mappedName: 'HughesSwitchUpgradeOrdered', objectType: 'Text' },
        ows_Hughes_x0020_Switch_x0020_Upgrad0: { mappedName: 'HughesSwitchUpgradeDelivered', objectType: 'Text', type: 'date' },
        ows_Hughes_x0020_Switch_x0020_Upgrad1: { mappedName: 'HughesSwitchUpgradeGoLive', objectType: 'Text', type: 'date' },
        ows_Hughes_x0020_Switch_x0020_Upgrad2: { mappedName: 'HughesSwitchUpgradeInstaller', objectType: 'Text' },
        ows_Hughes_x0020_Switch_x0020_Upgrad3: { mappedName: 'HughesSwitchUpgradePM', objectType: 'Text' },

        ows_HME_x0020_6700_x0020_Software_x0: { mappedName: 'HME6700SoftwareInstall', objectType: 'Text' },
        ows_HME_x0020_6700_x0020_EM_x0020_Go: { mappedName: 'HME6700EMGoLive', objectType: 'Text' },
        ows_HME_x0020_6400_x0020_Software_x0: { mappedName: 'HME6400SoftwareInstall', objectType: 'Text' },
        ows_HME_x0020_6400_x0020_EM_x0020_Go: { mappedName: 'HME6400EMGoLive', objectType: 'Text' },


        ows_OracleServer_x002d_Warranty_x002: { mappedName: 'OracleServerWarrantyExpDate', objectType: 'Text', type: 'date' },
        ows_OracleServer_x002d_Contract_x002: { mappedName: 'OracleServerContractStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Contract_x0020: { mappedName: 'OracleServerContractSubStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Schedule_x002: { mappedName: 'OracleServerScheduleStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Logistics_x00: { mappedName: 'OracleServerLogisticsStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Upgrade_x0020: { mappedName: 'OracleServerUpgradeNightlyStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Upgrade_x00200: { mappedName: 'OracleServerUpgradeFinalStatus', objectType: 'Text' },
        ows_OracleServer_x002d_Source_x0020_: { mappedName: 'OracleServerSourceOfUpgrade', objectType: 'Text' },
        ows_OracleServer_x002d_First_x0020_D: { mappedName: 'OracleServerFirstDateScheduled', objectType: 'Text' },
        ows_OracleServer_x002d_Reason_x0020_: { mappedName: 'OracleServerReasonForScheduleChange', objectType: 'Text' },
        ows_OracleServer_x002d_RFC: { mappedName: 'OracleServerRFC', objectType: 'Text' },
        ows_OracleServer_x002d_Opened_x0020_: { mappedName: 'OracleServerOpenedOnTime', objectType: 'Text' },
        ows_IT_x0020_Project_x0020_Manager: {mappedName: 'ProjectManager', objectType: 'Text'}



        //TODO - Decommission these
//        ows_PAYS_x0020_Quantity: {mappedName: 'PaysQuantity', objectType: 'Text', type: 'number'},
//        ,ows_Drive_x002d_Thru_x0020_Format: {mappedName: 'DriveThruFormat', objectType: 'Text', type: 'select', options: ['No', 'Single', 'Double']},
//        ows_Inside_x0020_Dining: {mappedName: 'InsideDining', objectType: 'Text', type: 'select', options: ['Yes', 'No']},
//        ows_HME_x0020_Ordered: {mappedName: 'AudioOrderedDate', objectType: 'Text'},
//        ows_HME_x0020_Quote_x0020_Delivered_: {mappedName: 'AudioQuoteToFranchiseeDate', objectType: 'Text', type: 'date'},
//        ows_HME_x0020_Quote_x0020_Ordered: {mappedName: 'AudioDeliveryDate', objectType: 'Text', type: 'date'},
//        ows_Audio_x0020_Status: {mappedName: 'AudioStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Ordered', 'Scheduled', 'Shipped', 'Delivered']},
//        ows_Audio_x0020_Quote_x0020_Status: {mappedName: 'AudioQuoteStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested', 'Quote Received', 'Quote to FEE', 'Need Signature', 'Need Payment', 'Need Credit App', 'Contract Complete']},
//        ows_Ground_x0020_Loop_x0020_Status: {mappedName: 'GroundLoopStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Need Contact', 'Ordered', 'Shipped', 'Delivered']},
//        ows_Ground_x0020_Loop_x0020_Delivery: {mappedName: 'GroundLoopDeliveryDate', objectType: 'Text', type: 'date'}
//        ,ows_Primary_x0020_Contact: {mappedName: 'PrimaryContact', objectType: 'Text'},
//        ows_Primary_x0020_Contact_x0020_Phon: {mappedName: 'PrimaryPhone', objectType: 'Text'},
//        ows_Primary_x0020_Contact_x0020_Emai: {mappedName: 'PrimaryEmail', objectType: 'Text'},
//        ows_Hughes_x0020_Equipment_x0020_Del: {mappedName: 'SatelliteDeliveryDate', objectType: 'Text', type: 'date'},
//        ows_Satellite_x0020_Status: {mappedName: 'SatelliteStatus', objectType: 'Text', type: 'select', options: ['Ordered', 'Scheduled', 'Installed']},
//        ows_Wireless_x0020_Date: {mappedName: 'WirelessDate', objectType: 'Text', type: 'date'},
//        ows_DSL_x0020_Install_x0020_Date: {mappedName: 'DslDeliveryDate', objectType: 'Text', type: 'date'},
//        ows_HAN_x0020_Status: {mappedName: 'HanStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Presented to FEE', 'Submitted to Hughes', 'Scheduled', 'Installed']},
//        ows_Project_x0020_Manager: {mappedName: 'ProjectManager', objectType: 'Text'}
    };
    var listName = 'Construction_Calls';

    //Build the fields request xml
    var constructionFields = "<ViewFields>";

    _.forIn(constructionMapping, function (val, key) {
        constructionFields += '<FieldRef Name="' + key.substr(4) + '" />'
    });

    constructionFields += "</ViewFields>";
    logHelper.logDebug("construction.js", "viewFields: " + constructionFields);
    function loadData (options, callback) {
        //-------------------------------------------------------Report Build
        //Set construction to empty string if both queries are blank
        var constructionQuery = options.constructionQuery || options.query || (options.combinedQuery ? undefined : '');
        var combinedQuery = options.combinedQuery;

        //Search the list//Get the construction call list - defaults to current view
        var data;

        //Load the construction items if a query exists
        if (constructionQuery) {
            $().SPServices({
                operation: "GetListItems",
                listName: "Construction_Calls",
                CAMLViewFields: constructionFields,
                CAMLQuery: constructionQuery,
                CAMLRowLimit: 0,
                completefunc: function(xData, Status) {

                    //Convert to JSON object for easier access
                    var construction = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        mapping: constructionMapping,
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
                    

                    //Lookup combined list info by store number list
                    combined.loadData({query: query}, function (combined) {
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

                //Create query
                var query = "<Query>" + new CamlBuilder().Where().TextField('Store_x0020_Number').In(_.map(combined, function (store) {return store.StoreNumber})).ToString() + "</Query>";

                //Lookup construction list info by store number
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Construction_Calls",
                    CAMLViewFields: constructionFields,
                    //TODO update this with city and state searches on the lookup fields
                    CAMLQuery: query,
                    completefunc: function(xData, Status) {
                        //Notify complete
                        constructionLoaded = true;

                        //Convert to JSON object for easier access
                        var construction = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            mapping: constructionMapping,
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
                        logHelper.logDebug('store/construction.js', "data: " + JSON.stringify(data));
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
        _.forIn(constructionMapping, function (v, k) {
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
        _.forIn(constructionMapping, function (v, k) {
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
        
        var internalName = lookupKey(key);
        if (internalName) {
            //Convert date if necessary
            if (constructionMapping["ows_" + internalName].type === "date" && value !== "") {
                value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
            }

            if (isNaN(parseFloat(value))) {
                if (internalName === "DMB_x0020_Quantity") { value = 0; }
                else if (internalName === "TV_x0020_Quantity") { value = 0; }
                else if (internalName === "PAYS_x0020_Quantity") { value = 0; }
            }

            $().SPServices({
                operation: "UpdateListItems",
                listName: "Construction_Calls",
                ID: store.ConstructionId,
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
            listName: "Construction_Calls",
            ID: store.ConstructionId,
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
            listName: "Construction_Calls",
            viewName: '61CFC75E-54BD-406F-8DE7-452BFB5C7CEA',
            completefunc: function(xData, Status) {
                $(xData.responseXML).find("Fields > Field").each(function() {
                    var $node = $(this);
                    console.log( "Type: " + $node.attr("Type") + " StaticName: " + $node.attr("StaticName") + " Name: " + $node.attr("DisplayName") );
                });
            }
        });
    }

    function getDocuments (store, callback) {
        store.Documents = store.Documents || [];
        var constructionLoaded = false,
            combinedLoaded = false;

        //Get construction documents
        $().SPServices({
            operation: "GetAttachmentCollection",
            listName: "Construction_Calls",
            ID: store.ConstructionId,
            completefunc: function(xData, Status) {
                $(xData.responseXML).find("Attachments > Attachment").each(function(i, el) {
                    var $node = $(this),
                        filePath = $node.text(),
                        arrString = filePath.split("/"),
                        fileName = arrString[arrString.length - 1];

                    store.Documents.push({FileName: fileName, FilePath: filePath});
                });

                constructionLoaded = true;
                complete();
            }
        });

        //Get combined documents
        combined.getDocuments(store, function () {
            combinedLoaded = true;
            complete();
        });

        function complete() {
            if (combinedLoaded && constructionLoaded) {
                callback(store);
            }
        }
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
            mapping: constructionMapping,
            includeAllAttrs: false
          });
          
          _.forEach(data, function (item, i) {
            item.PatioCount = (item.PatioCount === "" ? "0" : item.PatioCount);
            item.StallCount = (item.StallCount === "" ? "0" : item.StallCount);
            item.TotalStalls = (item.StallCount !== "" ? parseInt(item.StallCount) : 0) + (item.PatioCount !== "" ? parseInt(item.PatioCount) : 0);
            
            //Create an endpoint count for Micros Audio
            if (item.AudioEndpointCount === '') {
              item.AudioEndpointCount = item.TotalStalls;
              
              if (item.DriveThruFormat === 'Single') {
                item.AudioEndpointCount++;
              } else if (item.DriveThruFormat === 'Double') {
                item.AudioEndpointCount += 2;
              }
            }
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
        getDocuments: getDocuments,
        delete: deleteItem,
      create: create
    }
});
