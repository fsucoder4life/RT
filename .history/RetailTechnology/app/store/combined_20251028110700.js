define(['app/store/issues', 'app/store/notes', 'app/store/sp-utility','app/brands/services/brandServices','app/brands/services/logHelper'], function (issues, notes, utility,brandServices,logHelper) {
    //Setup 
    //Turn Cross Origin Resource Sharing On to get  sharepoint data from outside site 
    $.support.cors = true;

    var listName = 'Combined Schedule';
    //Point towards the sharepoint site
	//console.log("combined.js before webUrl: ");
	 //var webUrl = brandServices.getsubSitePath();
    var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
     
    $().SPServices.defaults.webURL = webUrl;
	logHelper.logDebug("combined.js","webUrl: " +  webUrl);
    //$().SPServices.defaults.webURL = "/sites/SonicRTD/";  // URL of the target Web
    $().SPServices.defaults.listName = listName;  // Name of the list for list

    //Request fields mapping from internal names
    var installers = ['ATI', 'AVA', 'AVIT', 'MIRA', 'MSIT', 'RH Tech'],
      today = moment().format('M/D');
    var combinedMapping = {
        ows_ID: { mappedName: "CombinedId", objectType: "Text" },
        ows_Address_x0020_Full: { mappedName: 'Address', objectType: 'Text' },
        ows_City: { mappedName: 'City', objectType: "Text" },
        ows_State_x0020_: { mappedName: 'State', objectType: 'Text' },
        ows_Zipcode: { mappedName: 'Zip', objectType: 'Text' },
        ows_Franchise_x0020_Group: { mappedName: 'FranchiseGroup', objectType: 'Text' },
        ows_Market_x0020_DMA_x0020_Name_x002: { mappedName: 'DMA', objectType: 'Text' },
        ows_Market_x0020_Start_x0020_Date: { mappedName: 'MarketStartDate', objectType: 'Text', type: 'date' },
        ows_Ordermatic_x0020_POS_x0020_Versi: { mappedName: 'OrdermaticPosVersion', objectType: 'Text' },
        ows_Principal_x0020_Name: { mappedName: 'Principal', objectType: 'Text' },
        ows_Senior_x0020_Vice_x0020_Presiden: { mappedName: 'SeniorVicePresident', objectType: 'Text' },
        ows_Regional_x0020_Vice_x0020_Presid: { mappedName: 'RegionalVicePresident', objectType: 'Text' },
        ows_Market_x0020_Leader: { mappedName: 'MarketLeader', objectType: 'Text' },
        ows_SRI_x0020_Market_x0020_Leader: { mappedName: 'SriMarketLeader', objectType: 'Text' },
        ows_SII_x002f_SRI: { mappedName: 'Classification', objectType: 'Text', type: 'select', options: ['SRI', 'SII'] },
        ows_GO_x0020_LIVE_x0020_DATE: { mappedName: 'GoLiveDate', objectType: 'Text', type: 'date' },
        ows_POS_x0020_Pre_x002d_Cable: { mappedName: 'PosPreCableDate', objectType: 'Text', type: 'date' },
        ows_POPS_x0020_Delivery_x0020_Date: { mappedName: 'PopsDeliveryDate', objectType: 'Text', type: 'date' },
        ows_POPS_x0020_Pre_x002d_Cable_x0020: { mappedName: 'PopsPreCableDate', objectType: 'Text', type: 'date' },
        ows_Installation_x0020_Company: { mappedName: 'Installer', objectType: 'Text', type: 'select', options: installers },
        ows_POPS_x0020_Installer: { mappedName: 'PopsInstaller', objectType: 'Text', type: 'select', options: installers },
        ows_POS_x0020_Selection: { mappedName: 'Pos', objectType: 'Text', type: 'select', options: ['Micros', 'Infor', 'OrderMatic'] },
        ows_Project_x0020_Type: { mappedName: 'ProjectType', objectType: 'Text', type: 'select', options: ['POS Conversion', 'New', 'Rebuild', 'Remodel', 'Relocation', 'Server Swap', 'OTI', 'Perm Closed', 'Temp Closed'] },
        ows_POS_x0020_Technician: { mappedName: 'PosTechnician', objectType: 'Text' },
        ows_Title: { mappedName: 'StoreNumber', objectType: 'Text' },
        ows_POS_x0020_Training_x0020_Date_x0: { mappedName: 'PosVendorSupportDate', objectType: 'Text', type: 'date' },
        ows_Implementation_x0020_Coord: { mappedName: 'Coordinator', objectType: 'Text' },
        ows_Store_x0020_Format: { mappedName: 'Format', objectType: 'Text', type: 'select', options: ['Drive Thru', 'No Drive Thru', 'Counter w-DT', 'Counter n-DT'] },
        ows_On_x0020_Site_x0020_Trainer: { mappedName: 'Trainer', objectType: 'Text', type: 'select', options: ['ShaRonda Barker', 'Saleh Ahmed', 'Dean Frost', 'Charles Restko'] },
        ows_A_x002d_Team_x0020_Status: { mappedName: 'ATeamStatus', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_Stall_x0020_Count: { mappedName: 'StallCount', objectType: 'Text', type: 'number' },
        ows_Patio_x0020_Units: { mappedName: 'PatioCount', objectType: 'Text', type: 'number' },
        ows_Flat_x0020_Count: { mappedName: 'FlatCount', objectType: 'Text', type: 'number' },
        ows_Total_x0020_Menu_x0020_Housings: { mappedName: 'PopsCount', objectType: 'Text', type: 'number' },
        ows_POPS_x0020_Type: { mappedName: 'PopsType', objectType: 'Text', type: 'select', options: ['Steel', 'Aluminum'] },
        ows_POPS_x0020_Electrician: { mappedName: 'PopsElectrician', objectType: 'Text', type: 'select', options: ['Local', 'Staley', 'Integra'] },
        ows_Chronically_x0020_Ailing: { mappedName: 'ChronicallyAiling', objectType: 'Text', type: 'select', options: ['Submitted', 'Yes', 'Denied'] },
        //ows_Chronically_x0020_Ailing_x0020_S: {mappedName: 'ChronicallyAilingStatus', objectType: 'Text', type: 'select', options: ['Pending', 'Approved', 'Rejected']}, - removed 10/5 from sharepoint, consolidated status into Chronically Ailing field.
        ows_Site_x0020_Surveys_x0020_POPS: { mappedName: 'SiteSurvey', objectType: 'Text', type: 'date' },
        ows_Site_x0020_Survey_x0020_Timefram: { mappedName: 'SiteSurveyTimeframe', objectType: 'Text', type: 'select', options: ['Morning', 'Afternoon', 'Evening'] },
        ows_Light_x0020_Box_x0020_Replacemen: { mappedName: 'LightBox', objectType: 'Text', type: 'date' },
        ows_IT_x0020_Project_x0020_Manager: { mappedName: 'ProjectManager', objectType: 'Text', type: 'select', options: ['Brittany Bailey', 'Josh Rice', 'Kaitlyn Childers', 'Dylan Gehlbach', 'Emily Boatright'] },
        ows_Primary_x0020_Contact: { mappedName: 'PrimaryContact', objectType: 'Text' },
        ows_Primary_x0020_Contact_x0020_Phon: { mappedName: 'PrimaryPhone', objectType: 'Text' },
        ows_Primary_x0020_Contact_x0020_Emai: { mappedName: 'PrimaryEmail', objectType: 'Text' },
        ows_HAN_x0020_Status: { mappedName: 'HughesTempStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'HAN to FEE ' + today, 'HAN Received ' + today, 'Needs Date', 'Need to Order', 'Tentative', 'Confirmed', 'Complete'] },
        ows_HAN_x0020_Install_x0020_Date: { mappedName: 'HughesTempDate', objectType: 'Text', type: 'date' },
        ows_HAN_x0020_Date_x0020_Type: { mappedName: 'HughesTempDateType', objectType: 'Text', type: 'select', options: ['On', 'Wk Of', 'Before', 'After'] },
        ows_VSAT_x0020_Status: { mappedName: 'HughesVsatStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Pending HAN', 'Needs Date', 'Need to Order', 'Need Service Call', 'Requested', 'Service Call Requested', 'Tentative', 'Service Call Confirmed', 'Confirmed', 'Service Call Confirmed', 'Complete', 'Service Call Complete'] },
        ows_VSAT_x0020_Date: { mappedName: 'HughesVsatDate', objectType: 'Text', type: 'date' },
        ows_VSAT_x0020_Date_x0020_Type: { mappedName: 'HughesVsatDateType', objectType: 'Text', type: 'select', options: ['On', 'Wk Of', 'Before', 'After'] },
        // ows_Primary_x0020_Hughes_x0020_Statu: {mappedName: 'HughesPrimaryStatus', objectType: 'Text', type: 'select', options: function (value, store) {
        //     var arr = ['Not Required', 'HAN to FEE ' + today, 'HAN Received ' + today, 'Requested', 'Service Call Requested', 'Initiate Prequal', 'Pending Prequal', 'Tentative Service Call', 'Tentative VSAT Only', 'Tentative 4G Perm', 'Tentative Cable', 'Tentative DSL', 'Tentative Fiber', 'Confirmed Service Call', 'Confirmed VSAT Only', 'Confirmed 4G Perm', 'Confirmed Cable', 'Confirmed DSL', 'Confirmed Fiber', 'Complete VSAT Only', 'Complete 4G Perm', 'Complete Cable', 'Complete DSL', 'Complete Fiber', 'Complete Service Call'];
        // }},
        ows_Primary_x0020_Hughes_x0020_Statu: { mappedName: 'HughesPrimaryStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'HAN to FEE ' + today, 'HAN Received ' + today, 'Requested', 'Service Call Requested', 'Initiate Prequal', 'Pending Prequal', 'Tentative Service Call', 'Tentative VSAT Only', 'Tentative 4G Perm', 'Tentative Cable', 'Tentative DSL', 'Tentative Fiber', 'Confirmed Service Call', 'Confirmed VSAT Only', 'Confirmed 4G Perm', 'Confirmed Cable', 'Confirmed DSL', 'Confirmed Fiber', 'Complete VSAT Only', 'Complete 4G Perm', 'Complete Cable', 'Complete DSL', 'Complete Fiber', 'Complete Service Call'] },
        ows_Primary_x0020_Hughes_x0020_Date: { mappedName: 'HughesPrimaryDate', objectType: 'Text', type: 'date' },
        ows_Primary_x0020_Hughes_x0020_Date_: { mappedName: 'HughesPrimaryDateType', objectType: 'Text', type: 'select', options: ['On', 'Wk Of', 'Before', 'After', 'As Available'] },
        ows_Hughes_x0020_Deinstall_x0020_Sta: { mappedName: 'HughesDeinstallStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'HAN to FEE ' + today, 'HAN Received ' + today, 'Needs Date', 'Need to Order', 'Tentative', 'Confirmed', 'Complete'] },
        ows_Hughes_x0020_Deinstall_x0020_Dat: { mappedName: 'HughesDeinstallDate', objectType: 'Text', type: 'date' },
        ows_Hughes_x0020_Deinstall_x0020_Dat0: { mappedName: 'HughesDeinstallDateType', objectType: 'Text', type: 'select', options: ['On', 'Wk Of', 'Before', 'After'] },
        ows_Hughes_x0020_Notes: { mappedName: 'HughesNotes', objectType: 'Text', type: 'textarea' },
        ows_Hughes_x0020_Project_x0020_Type: { mappedName: 'HughesProjectType', objectType: 'Text', type: 'select', options: ['New Construction', 'Existing Structure', 'De-Install before Re-Install', 'Install before De-Install', 'Relocation/Same Day', 'Existing Sonic/Same Equipment', 'Existing Sonic/Equipment Changes'] },
        ows_Franchisee_x0020_Billing_x0020_S: { mappedName: 'BillingAddress', objectType: 'Text' },
        ows_Franchisee_x0020_Billing_x0020_C: { mappedName: 'BillingCity', objectType: "Text" },
        ows_Franchisee_x0020_Billing_x0020_S0_: { mappedName: 'BillingState', objectType: 'Text' },
        ows_Franchisee_x0020_Billing_x0020_Z: { mappedName: 'BillingZip', objectType: 'Text' },
        ows_Franchisee_x0020_Legal_x0020_Ent: { mappedName: 'LegalEntity', objectType: 'Text' },
        ows_PAYS_x0020_Quantity: { mappedName: 'PaysQuantity', objectType: 'Text', type: 'number' },
        ows__x0034_5_x0020_Degree_x0020_PAYS: { mappedName: 'PaysEnclosureIndoor', objectType: 'Text', type: 'number' },
        ows__x0039_0_x0020_Degree_x0020_PAYS: { mappedName: 'PaysEnclosureOutdoor', objectType: 'Text', type: 'number' },
        ows_Drive_x0020_Thru_x0020_PAYS_x002: { mappedName: 'PaysEnclosureDriveThru', objectType: 'Text', type: 'number' },
        ows__x0031_5_x0020_Degree_x0020_Sun_: { mappedName: 'DegreeSunShield', objectType: 'Text', type: 'number' },
        ows_PaysRackMountUPS: { mappedName: 'PaysRackMountUPS', objectType: 'Text', type: 'number' },
        ows_PaysRackMountShelf: { mappedName: 'PaysRackMountShelf', objectType: 'Text', type: 'number' },
        ows_Extension_x0020_Brackets: { mappedName: 'ExtensionBrackets', objectType: 'Text', type: 'number' },
        ows_C_x0020_Channel_x0020_Brackets: { mappedName: 'CChannelBrackets', objectType: 'Text', type: 'number' },
        ows_Audio_x0020_Type: { mappedName: 'AudioType', objectType: 'Text', type: 'select', options: ['HME 6700', 'Micros', 'Ordermatic', 'Not Required'] },
        ows_Micros_x0020_Audio_x0020_Endpoin: { mappedName: 'AudioEndpointCount', objectType: 'Text', type: 'text' },
        ows_Audio_x0020_Vendor_x0020_Status: { mappedName: 'AudioVendorStatus', objectType: 'Text', type: 'text' },
        ows_Audio_x0020_Status: { mappedName: 'AudioStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Payment', 'Need Credit App', 'Contract Complete ' + today, 'Shipped ' + today, 'Delivered'] },
        ows_Audio_x0020_Configuration: { mappedName: 'AudioConfiguration', objectType: 'Text', type: 'select', options: ['Internal Switches', 'Stall Switches', 'ADSL', '4 Up + 3 Trainers', '3 Up + 2 Trainers', '2 Up + 1 Trainer', 'Need Requirements'] },
        ows_Audio_x0020_Ground_x0020_Loop_x0: { mappedName: 'GroundLoopStatus', objectType: 'Text', type: 'select', options: ['Not Required', '1x Required', '1x Shipped', '1x Delivered', '2x Required', '2x Shipped', '2x Delivered'] },
        ows_Audio_x0020_Loop_x0020_Type: { mappedName: 'AudioLoopType', objectType: 'Text', type: 'select', options: ['Prefabricated', 'Sawcut'] },
        ows_Audio_x0020_Ground_x0020_Loop_x00: { mappedName: 'GroundLoopDelivery', objectType: 'Text', type: 'date' },
        ows_Audio_x0020_Installer: { mappedName: 'AudioInstaller', objectType: 'Text', type: 'select', options: installers },
        ows_Audio_x0020_Delivery_x0020_Date: { mappedName: 'AudioDeliveryDate', objectType: 'Text', type: 'date' },
        ows_Audio_x0020_Install_x0020_Date: { mappedName: 'AudioInstallDate', objectType: 'Text', type: 'date' },
        ows_Audio_x0020_Site_x0020_Survey_x0: { mappedName: 'AudioSiteSurveyDate', objectType: 'Text', type: 'date' },
        ows_Audio_x0020_Go_x0020_Live_x0020_: { mappedName: 'AudioGoLiveDate', objectType: 'Text', type: 'date' },
        ows_Inside_x0020_Dining: { mappedName: 'InsideDining', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_Drive_x002d_Thru_x0020_Format: { mappedName: 'DriveThruFormat', objectType: 'Text', type: 'select', options: ['No', 'Single', 'Double'] },
        ows_Enterprise_x0020_Management_x002: { mappedName: 'EnterpriseManagementStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need to Send', 'Sent to FEE ' + today, 'Sent to EM ' + today, 'EM Received ' + today, 'Building Pricing ' + today, 'Finalizing ' + today, 'QA ' + today, 'Need Questionnaire', 'Need Pricing', 'Need Stall Layout', 'Complete ' + today] },
        ows_Lead_x0020_Technician: { mappedName: 'LeadTechnician', objectType: 'Text' },
        ows_DT_x0020_POPS_x0020_Installer: { mappedName: 'DtPopsInstaller', objectType: 'Text', type: 'select', options: ['Staley', 'Wachter'] },
        ows_DT_x0020_POPS_x0020_Survey_x0020: { mappedName: 'DtPopsSurveyStatus', objectType: 'Text', type: 'select', options: ['Need to Send', 'Sent to FEE', 'Complete'] },
        ows_DT_x0020_POPS_x0020_Status: { mappedName: 'DtPopsStatus', objectType: 'Text', type: 'select', options: ['Need Requirements', 'Need Signature', 'PO Issued', 'Shipped', 'Delivered'] },
        ows_DT_x0020_POPS_x0020_Quantity: { mappedName: 'DtPopsQuantity', objectType: 'Text', type: 'number' },
        ows_DT_x0020_Menu_x0020_Boards_x0020: { mappedName: 'DtMenuBoardsQuantity', objectType: 'Text', type: 'number' },
        ows_DT_x0020_POPS_x0020_Construction: { mappedName: 'DtPopsConstructionDate', objectType: 'Text', type: 'date' },
        ows_DT_x0020_POPS_x0020_Install_x002: { mappedName: 'DtPopsInstallDate', objectType: 'Text', type: 'date' },
        ows_DT_x0020_POPS_x0020_Delivery_x00: { mappedName: 'DtPopsDeliveryDate', objectType: 'Text', type: 'date' },
        ows_DT_x0020_POPS_x0020_Base_x0020_D: { mappedName: 'DtPopsBaseDeliveryDate', objectType: 'Text', type: 'date' },
        ows_DT_x0020_POPS_x0020_Base_x0020_K: { mappedName: 'DtPopsBaseStatus', objectType: 'Text', type: 'select', options: ['Need Requirements', 'Need Signature', 'Need Date', 'Requested ' + today, 'PO Issued ' + today, 'Shipped ' + today, 'Delivered', 'Not Required'] },
        ows_POPS_x0020_Welder_x0020_Required: { mappedName: 'PopsWelder', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_Conversion_x0020_Upgrading_x0020: { mappedName: 'ConversionUpgradingPays', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_MarketingInDcp: { mappedName: 'MarketingInDcp', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_MarketingUpdated: { mappedName: 'MarketingUpdated', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_POPS_x0020_Experience: { mappedName: 'DdiVersion', objectType: 'Text' },
        ows_ServerEpsMid: { mappedName: 'ServerEpsMid', objectType: 'Text' },
        ows_OADate: { mappedName: 'OADate', objectType: 'Text', type: 'date' },
        ows_WinEpsMid: { mappedName: 'WinEpsMid', objectType: 'Text' },
        ows_ImplementationNotes: { mappedName: 'ImplementationNotes', objectType: 'Text', type: 'textarea' },
        ows_EncodedAbsUrl: { mappedName: 'CombinedAbsoluteUrl', objectType: 'Text' },
        ows_Oracle_x0020_5810_x0020_Server_x: { mappedName: 'Oracle5810ServerDelivery', objectType: 'Text', type: 'date' },
        ows_Oracle_x0020_5810_x0020_Server_x0: { mappedName: 'Oracle5810ServerGoLive', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Workstation_x0020_HD: { mappedName: 'InforWorkstationHDDDelivery', objectType: 'Text', type: 'date' },
        ows_Infor_x0020_Workstation_x0020_HD0: { mappedName: 'InforWorkstationHDDGoLive', objectType: 'Text', type: 'date' },
        ows_Audio_x0020_Include_x0020_Cable: { mappedName: 'AudioIncludeCable', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_Include_x0020_Speakers_x0020__x0: { mappedName: 'IncludeSpeakersMics', objectType: 'Text', type: 'select', options: ['Yes', 'No'] },
        ows_Store_x0020_Phone: { mappedName: 'StorePhone', objectType: 'Text' },
        ows_Store_x0020_Manager: { mappedName: 'StoreManager', objectType: 'Text' },


        ows_AudioCost: { mappedName: 'AudioCost', objectType: 'Text' },
        ows_DmbCost: { mappedName: 'DmbCost', objectType: 'Text' },
        ows_FABCONCost: { mappedName: 'FABCONCost', objectType: 'Text' },
        ows_InstallationCost: { mappedName: 'InstallationCost', objectType: 'Text' },
        ows_PaysCost: { mappedName: 'PaysCost', objectType: 'Text' },
        ows_PosHardwareSoftwareCost: { mappedName: 'PosHardwareSoftwareCost', objectType: 'Text' },
        ows_PosProServicesSupportCost: { mappedName: 'PosProServicesSupportCost', objectType: 'Text' },
        ows_SonicRadioCost: { mappedName: 'SonicRadioCost', objectType: 'Text' },
        ows_StoreConfigurationCost: { mappedName: 'StoreConfigurationCost', objectType: 'Text' },

        ows_IDTECHCost: { mappedName: 'IDTECHCost', objectType: 'Text' },
        ows_FabConTotalCost: { mappedName: 'FabConTotalCost', objectType: 'Text' },

        ows_OracleCEMicros1: { mappedName: 'OracleCEMicros1', objectType: 'Text', type: 'number' },
        ows_OracleCEMicros2: { mappedName: 'OracleCEMicros2', objectType: 'Text', type: 'number' },
        ows_OracleCEController: { mappedName: 'OracleCEController', objectType: 'Text', type: 'number' },
        ows_OracleCEInstaller: { mappedName: 'OracleCEInstaller', objectType: 'Text' },
        ows_OracleCEPM: { mappedName: 'OracleCEPM', objectType: 'Text' },
        ows_OracleCEDelivery: { mappedName: 'OracleCEDelivery', objectType: 'Text', type: 'date' },
        ows_OracleCEGoLive: { mappedName: 'OracleCEGoLive', objectType: 'Text', type: 'date' }

    };

    var combinedconstructionextendMapping = {
        ows_ID: { mappedName: "CombinedConstructionExtendId", objectType: "Text" },
        ows_Title: { mappedName: "Title", objectType: "Text" },
        ows_Store_x0020_Number: { mappedName: 'StoreNumber', objectType: "Lookup" },
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
        ows_VP6800_x0020_Ordered2: { mappedName: 'VP6800Ordered2', objectType: 'Text', type: 'date' },
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
        ows_VP6800_x0020_SITE_x0020_SURVEY_x2: { mappedName: 'VP6800SiteSurveyCompleted', objectType: 'Text', type: 'date' },
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
        ows_PaymentTerminalAndInfoLane99Faci: { mappedName: 'PaymentTerminalAndInfoLane99Facing', objectType: 'Text' },

        ows_FirewallInstaller: { mappedName: 'FirewallInstaller', objectType: 'Text' },
        ows_FirewallGoLive: { mappedName: 'FirewallGoLive', objectType: 'Text', type: 'date' },
        ows_FirewallITPM: { mappedName: 'FirewallITPM', objectType: 'Text' },
        ows_FirewallNotes: { mappedName: 'FirewallNotes', objectType: 'Text' }
    };


    //Build the fields request xml
    var combinedFields = "<ViewFields>",
      constructionFields = "<ViewFields>";

    _.forIn(combinedMapping, function (val, key) {
        combinedFields += '<FieldRef Name="' + key.substr(4) + '" />'
    });

    combinedFields += "</ViewFields>";

    function loadPopsCountToDate(options, callback) {
        var constructionLoaded = false,
          conversionLoaded = false,
          storeCount = 0,
          unitCount = 0;

        //Request fields mapping from internal names
        var combinedMapping = {
            //            ows_GO_x0020_LIVE_x0020_DATE: {mappedName: 'GoLiveDate', objectType: 'Text', type: 'date'},
            //            ows_POPS_x0020_Delivery_x0020_Date: {mappedName: 'PopsDeliveryDate', objectType: 'Text', type: 'date'},
            //            ows_POS_x0020_Selection: {mappedName: 'Pos', objectType: 'Text', type: 'select', options: ['Micros', 'Infor', 'OrderMatic']},
            ows_Stall_x0020_Count: { mappedName: 'StallCount', objectType: 'Text', type: 'number' },
            ows_Patio_x0020_Units: { mappedName: 'PatioCount', objectType: 'Text', type: 'number' }
        };

        //Build the fields request xml
        var combinedFields = "<ViewFields>";

        _.forIn(combinedMapping, function (val, key) {
            combinedFields += '<FieldRef Name="' + key.substr(4) + '" />'
        });

        combinedFields += "</ViewFields>";

        var query = new CamlBuilder().Where().All(
          CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThan(options.date || moment().format('YYYY-MM-DD')),
          CamlBuilder.Expression().TextField('Project_x0020_Type').NotEqualTo('POS Conversion'),
          CamlBuilder.Expression().TextField('Menus_x0020_Ordered').Contains('POPS')
        );

        query = "<Query>" + query.ToString() + "</Query>";

        //Load the combined items
        $().SPServices({
            operation: "GetListItems",
            listName: "Combined Schedule",
            CAMLViewFields: combinedFields,
            CAMLQuery: query,
            completefunc: function (xData, Status) {
                //Notify complete
                constructionLoaded = true;

                //Convert to JSON object for easier access
                var combined = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: combinedMapping,
                    includeAllAttrs: false
                });

                //Count stalls and stores
                _.forEach(combined, function (store, i) {
                    //Add the count
                    var count = (store.StallCount !== "" ? parseInt(store.StallCount) : 0) + (store.PatioCount !== "" ? parseInt(store.PatioCount) : 0);
                    unitCount += count;
                    if (count > 0) {
                        storeCount++;
                    }
                });


                //Call the passed callback function
                complete();
            }
        });

        query = new CamlBuilder().Where().All(
          CamlBuilder.Expression().Any(
            CamlBuilder.Expression().All(
              CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThan(options.date || moment().format('YYYY-MM-DD')),
              CamlBuilder.Expression().TextField('Menus_x0020_Ordered').Contains('POPS')
            ),
            CamlBuilder.Expression().All(
              CamlBuilder.Expression().TextField('Target_x0020_POPS_x0020_Software').IsNotNull(),
              CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo("2014-05-01")
            )
          ),
          CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
        );

        query = "<Query>" + query.ToString() + "</Query>";

        //Load the combined items
        $().SPServices({
            operation: "GetListItems",
            listName: "Combined Schedule",
            CAMLViewFields: combinedFields,
            CAMLQuery: query,
            completefunc: function (xData, Status) {
                //Notify complete
                conversionLoaded = true;

                //Convert to JSON object for easier access
                var combined = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: combinedMapping,
                    includeAllAttrs: false
                });

                //Count stalls and stores
                _.forEach(combined, function (store, i) {
                    //Add the count
                    var count = (store.StallCount !== "" ? parseInt(store.StallCount) : 0) + (store.PatioCount !== "" ? parseInt(store.PatioCount) : 0);
                    unitCount += count;
                    if (count > 0) {
                        storeCount++;
                    }
                });

                //Call the passed callback function
                complete();
            }
        });

        function complete() {
            if (constructionLoaded && conversionLoaded) {
                callback({
                    stores: storeCount,
                    units: unitCount
                });
            }
        }
    }

    function loadPosCountToDate(options, callback) {
        var total = 0,
          micros = 0,
          infor = 0;

        //Request fields mapping from internal names
        var combinedMapping = {
            ows_POS_x0020_Selection: {
                mappedName: 'Pos',
                objectType: 'Text',
                type: 'select',
                options: ['Micros', 'Infor', 'OrderMatic']
            }
        };

        //Build the fields request xml
        var combinedFields = "<ViewFields>",
          constructionFields = "<ViewFields>";

        _.forIn(combinedMapping, function (val, key) {
            combinedFields += '<FieldRef Name="' + key.substr(4) + '" />'
        });

        combinedFields += "</ViewFields>";

        var query = new CamlBuilder().Where().All(
          CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThan(options.date || moment().format('YYYY-MM-DD')),
          CamlBuilder.Expression().Any(
            CamlBuilder.Expression().TextField('POS_x0020_Selection').Contains('Infor'),
            CamlBuilder.Expression().TextField('POS_x0020_Selection').Contains('Micros')
          )
        );

        query = "<Query>" + query.ToString() + "</Query>";

        //Load the combined items
        $().SPServices({
            operation: "GetListItems",
            listName: "Combined Schedule",
            CAMLViewFields: combinedFields,
            CAMLQuery: query,
            completefunc: function (xData, Status) {
                //Convert to JSON object for easier access
                var combined = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: combinedMapping,
                    includeAllAttrs: false
                });

                //Count stalls and stores
                _.forEach(combined, function (store, i) {
                    //Add the count
                    total++;
                    if (store.Pos == "Micros") {
                        micros++;
                    } else if (store.Pos == "Infor") {
                        infor++;
                    }
                });

                //Call the passed callback function
                callback({
                    micros: micros,
                    infor: infor,
                    total: total
                });
            }
        });
    }

    function loadData(options, callback) {
        //-------------------------------------------------------Report Build
        //Empty query to load all if not passed
        var combinedQuery = options.combinedQuery || options.query || '';

        //Search the list//Get the construction call list - defaults to current view
        var combinedLoaded = false,
          combinedData = {};

        //TODO add an optin to load the notes and a seperate option to load notes
        //        if (options.load)

        //Load the combined items if a query exists
        if (combinedQuery) {
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: combinedFields,
                CAMLQuery: combinedQuery,
                CAMLRowLimit: 0,
                completefunc: function (xData, Status) {
                    //Notify complete
                    combinedLoaded = true;

                    //Convert to JSON object for easier access
                    var combined = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        mapping: combinedMapping,
                        includeAllAttrs: false
                    });

                    //Notify complete
                    combinedLoaded = true;

                    _.forEach(combined, function (combinedItem, i) {
                        //Get the store number
                        var storeNumber = combinedItem.StoreNumber;

                        //Set the total pops stalls
                        combinedItem.PatioCount = (combinedItem.PatioCount === "" ? "0" : combinedItem.PatioCount);
                        combinedItem.StallCount = (combinedItem.StallCount === "" ? "0" : combinedItem.StallCount);
                        combinedItem.TotalStalls = (combinedItem.StallCount !== "" ? parseInt(combinedItem.StallCount) : 0) + (combinedItem.PatioCount !== "" ? parseInt(combinedItem.PatioCount) : 0);

                        //Create an endpoint count for Micros Audio
                        if (combinedItem.AudioEndpointCount === '') {
                            combinedItem.AudioEndpointCount = combinedItem.TotalStalls;

                            if (combinedItem.DriveThruFormat === 'Single') {
                                combinedItem.AudioEndpointCount++;
                            } else if (combinedItem.DriveThruFormat === 'Double') {
                                combinedItem.AudioEndpointCount += 2;
                            }
                        }

                        //Create an object by store number, used later to match up to combined list data
                        combinedData[storeNumber] = combinedItem;
                    });

                    //Filter the array
                    if (typeof options.filter === "function") {
                        combinedData = options.filter(combinedData);
                    }

                    //Sort the array
                    if (typeof options.sort === "object") {
                        if (options.sort.direction === "DESC") {
                            _(combinedData).map().sortBy(combinedData, options.sort.key).reverse();
                        } else {
                            _(combinedData).map().sortBy(combinedData, options.sort.key);
                        }
                    } else if (typeof options.sort === "function") {
                        combinedData = options.sort(combinedData);
                    }

                    //Call the passed callback function
                    callback(combinedData);
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

    function getGoLiveChangesExtend(store, callback) {
        //GET CCE record ID using store #

        $().SPServices({
            operation: "GetListItems",
            listName: "Combined Construction Extend",
            CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
            CAMLRowLimit: 1,
            async: false,
            completefunc: function (xData, Status) {
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    store.CombinedConstructionExtendId = $(this).attr("ows_ID");
                });
            }
        });

        if (store.CombinedConstructionExtendId) {
            //console.log("CCE found: " + store.CombinedConstructionExtendId);
            $().SPServices({
                operation: "GetVersionCollection",
                strlistID: "Combined Construction Extend",
                strlistItemID: store.CombinedConstructionExtendId,
                strFieldName: "VP6800_x0020_Go_x0020_Live",
                completefunc: function (xData, Status) {
                    var changes = [],
                      lastDate = '';
                    $($(xData.responseText).find("Version").get().reverse()).each(function (i) {
                        var date = $(this).attr("VP6800_x0020_Go_x0020_Live"),
                          modified = $(this).attr("Modified"),
                          modifiedBy = $(this).attr("Editor").replace(/.*;#/, '').replace(/,.*/, '');

                        if (date !== lastDate) {
                            //console.log("found new:" + date, modified, modifiedBy);
                            changes.push({ date: date, modified: modified, modifiedBy: modifiedBy });
                            lastDate = date;
                        }
                    });
                    callback(changes);
                }
            });
        }
    }

    function getPMChanges(store, callback) {

        $().SPServices({
            operation: "GetVersionCollection",
            strlistID: "Combined Schedule",
            strlistItemID: store.CombinedId,
            strFieldName: "IT_x0020_Project_x0020_Manager",
            completefunc: function (xData, Status) {
                var changes = [],
                  lastDate = '';
                $($(xData.responseText).find("Version").get().reverse()).each(function (i) {
                    var date = $(this).attr("IT_x0020_Project_x0020_Manager"),
                      modified = $(this).attr("Modified"),
                      modifiedBy = $(this).attr("Editor").replace(/.*;#/, '').replace(/,.*/, '');

                    if (date !== lastDate) {
                        changes.push({ date: date, modified: modified, modifiedBy: modifiedBy });
                        lastDate = date;
                    }
                });

                callback(changes);
            }
        });
    }

    function getPMChangesExtend(store, callback) {

        $().SPServices({
            operation: "GetListItems",
            listName: "Combined Construction Extend",
            CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
            CAMLRowLimit: 1,
            async: false,
            completefunc: function (xData, Status) {
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    store.CombinedConstructionExtendId = $(this).attr("ows_ID");
                });
            }
        });

        if (store.CombinedConstructionExtendId) {

            $().SPServices({
                operation: "GetVersionCollection",
                strlistID: "Combined Construction Extend",
                strlistItemID: store.CombinedConstructionExtendId,
                strFieldName: "VP6800_x0020_IT_x0020_PM",
                completefunc: function (xData, Status) {
                    var changes = [],
                      lastDate = '';
                    $($(xData.responseText).find("Version").get().reverse()).each(function (i) {
                        var date = $(this).attr("VP6800_x0020_IT_x0020_PM"),
                          modified = $(this).attr("Modified"),
                          modifiedBy = $(this).attr("Editor").replace(/.*;#/, '').replace(/,.*/, '');

                        if (date !== lastDate) {
                            changes.push({ date: date, modified: modified, modifiedBy: modifiedBy });
                            lastDate = date;
                        }
                    });

                    callback(changes);
                }
            });
        }
    }

    function getGoLiveChanges(store, callback) {

        $().SPServices({
            operation: "GetVersionCollection",
            strlistID: "Combined Schedule",
            strlistItemID: store.CombinedId,
            strFieldName: "GO_x0020_LIVE_x0020_DATE",
            completefunc: function (xData, Status) {
                var changes = [],
                  lastDate = '';
                $($(xData.responseText).find("Version").get().reverse()).each(function (i) {
                    var date = $(this).attr("GO_x0020_LIVE_x0020_DATE"),
                      modified = $(this).attr("Modified"),
                      modifiedBy = $(this).attr("Editor").replace(/.*;#/, '').replace(/,.*/, '');

                    if (date !== lastDate) {
                        changes.push({ date: date, modified: modified, modifiedBy: modifiedBy });
                        lastDate = date;
                    }
                });

                callback(changes);
            }
        });
    }

    function logFields() {
        $().SPServices({
            operation: "GetListAndView",
            listName: "Combined Schedule",
            viewName: '8C9837B5-A540-4492-8D44-999289491D8A',
            completefunc: function (xData, Status) {
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
        _.forIn(combinedMapping, function (v, k) {
            if (v.mappedName == key) {
                //Set key without the ows_ precursor
                internalName = k.substring(4);
                //stop loop
                return false;
            }
        });

        return internalName;
    }

    function lookupKey2(key) {
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

    function getField(key) {
        //find key
        var field = false;
        _.forIn(combinedMapping, function (v, k) {
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
        return function (value) {
            changeValue(key, value, store.CombinedId, function (response) {
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

    function changeValue(key, value, id, callback) {
        
        var internalName = lookupKey(key);

        if (!internalName) {
            internalName = lookupKey2(key);
            if (combinedconstructionextendMapping["ows_" + internalName].type === "date" && value !== "") {
                value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
            }

            //get ID of CombinedConstructionExtend record
            var cceID;
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' LookupId='TRUE' /><Value Type='Lookup'>" + id + "</Value></Eq></Where></Query>",
                CAMLRowLimit: 0,
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        cceID = $(this).attr("ows_ID");
                    });
                }
            });

            $().SPServices({
                operation: "UpdateListItems",
                listName: "Combined Construction Extend",
                ID: cceID,
                async: true,
                batchCmd: "Update",
                valuepairs: [[internalName, value]],
                completefunc: function (xData, status) {
                    //Notify if web service call failed in transport
                    if (status == "Error") {
                        alert("Unable to communicate with Sharepoint Server!");
                        return;
                    } else if (status == 'parsererror') {
                        alert("Parser Error! Something went very wrong - please refresh the page to verify that you are logged in.");
                        return;
                    }

                    //Check for Errors in returned XML
                    var spErrCode = $(xData.responseText).find("ErrorCode").first(),
                        error = false,
                        errorMessage = "ERROR: Call to SharePoint Web Services failed.";
                    if (spErrCode.length > 0 && spErrCode.text() !== "0x00000000") {
                        error = true;
                        errorMessage += "\n\n" + $(xData.responseText).find("ErrorCode").first().text()
                            + ": " + $(xData.responseText).find("ErrorText").first().text();
                    } else if ($(xData.responseText).find("faultcode").length > 0) {
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

            return;
        }


        //Convert date if necessary
        if (combinedMapping["ows_" + internalName].type === "date" && value !== "") {
            value = moment(value, ['M/D/YYYY', 'YYYY-MM-DD']).toISOString();
        }

        //check if blank value - if number field make 0 instead

        if (isNaN(parseFloat(value))) {
            if (internalName === "_x0034_5_x0020_Degree_x0020_PAYS") { value = 0; }
            else if (internalName === "_x0039_0_x0020_Degree_x0020_PAYS") { value = 0; }
            else if (internalName === "Audio_x0020_SEQ") { value = 0; }
            else if (internalName === "Audio_x0020_Week") { value = 0; }
            else if (internalName === "C_x0020_Channel_x0020_Brackets") { value = 0; }
            else if (internalName === "Canopies") { value = 0; }
            else if (internalName === "Drive_x0020_Thru_x0020_PAYS_x002") { value = 0; }
            else if (internalName === "Extension_x0020_Brackets") { value = 0; }
            else if (internalName === "FZ_x0020_SEQ") { value = 0; }
            else if (internalName === "MKT_x0020_ORDER_x0020__x0023_") { value = 0; }
            else if (internalName === "MUL_x0020_Sequence") { value = 0; }
            else if (internalName === "Patio_x0020_Units") { value = 0; }
            else if (internalName === "PAYS_x0020_Quantity") { value = 0; }
            else if (internalName === "Stall_x0020_Count") { value = 0; }
            else if (internalName === "Store_x0020_Count") { value = 0; }
            else if (internalName === "Week_x0020__x0023_") { value = 0; }

        }


        $().SPServices({
            operation: "UpdateListItems",
            listName: "Combined Schedule",
            ID: id,
            async: true,
            batchCmd: "Update",
            valuepairs: [[internalName, value]],
            completefunc: function (xData, status) {
                //Notify if web service call failed in transport
                if (status == "Error") {
                    alert("Unable to communicate with Sharepoint Server!");
                    return;
                } else if (status == 'parsererror') {
                    alert("Parser Error! Something went very wrong - please refresh the page to verify that you are logged in.");
                    return;
                }

                //Check for Errors in returned XML
                var spErrCode = $(xData.responseText).find("ErrorCode").first(),
                  error = false,
                  errorMessage = "ERROR: Call to SharePoint Web Services failed.";
                if (spErrCode.length > 0 && spErrCode.text() !== "0x00000000") {
                    error = true;
                    errorMessage += "\n\n" + $(xData.responseText).find("ErrorCode").first().text()
                      + ": " + $(xData.responseText).find("ErrorText").first().text();
                } else if ($(xData.responseText).find("faultcode").length > 0) {
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
    }

    function getDocuments(store, callback) {
        store.Documents = store.Documents || [];
        store.CombinedDocuments = [];

        //Get construction documents
        $().SPServices({
            operation: "GetAttachmentCollection",
            listName: "Combined Schedule",
            ID: store.CombinedId,
            completefunc: function (xData, Status) {
                $(xData.responseXML).find("Attachments > Attachment").each(function (i, el) {
                    var $node = $(this),
                      filePath = $node.text(),
                      arrString = filePath.split("/"),
                      fileName = arrString[arrString.length - 1];
                    if (fileName.indexOf("Costfile-") > -1)
                        return true;
                    store.Documents.push({ FileName: fileName, FilePath: filePath });
                    store.CombinedDocuments.push({ FileName: fileName, FilePath: filePath });
                });

                callback(store);
            }
        });
    }

    function uploadDocument(store, file, name, callback) {
        logHelper.logInfo("Store Information: " + JSON.stringify(store));
        $().SPServices({
            operation: "AddAttachment",
            listName: listName,
            listItemID: store.CombinedId,
            fileName: name,
            async: true,
            attachment: file,
            completefunc: function (xData, Status) {
                if (utility.errorCheck(xData, Status) === false) return;

                //TODO - find a way to add the document to the store.Documents list (FileName & FilePath) - this doesn't quite work!
                store.Documents = (typeof store.Documents !== 'undefined' ? store.Documents : []);
                store.CombinedDocuments = (typeof store.CombinedDocuments !== 'undefined' ? store.CombinedDocuments : []);

                var filePath = webUrl + "/" + $(xData.responseXML).find("AddAttachmentResult").text(),
                  arrString = filePath.split("/"),
                  fileName = arrString[arrString.length - 1];

                store.Documents.push({ FileName: fileName, FilePath: filePath });
                store.CombinedDocuments.push({ FileName: fileName, FilePath: filePath });

                if (typeof callback !== 'undefined') {
                    callback(store);
                }
            }
        });
    }

    function deleteDocument(itemId, filePath, callback) {
        // Use SPServices to delete the file.
        $().SPServices({
            operation: "DeleteAttachment",
            listName: listName,
            listItemID: itemId, //list item id
            url: filePath, //url of attachment that needs to be deleted
            completefunc: callback //not sure how to error check this
        });
    }

    //This loads notes and issues
    function getIssuesAndNotes(stores, callback) {
        //Build a query for both with all the store numbers
        var searchBlocks = [];
        _.each(stores, function (store) {
            //Add to the caml query
            searchBlocks.push(CamlBuilder.Expression().TextField('Store_x0020_Number').Contains(store.StoreNumber));
        });
        //Complete Query
        var query = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), searchBlocks);
        query = "<Query><Where>" + query.ToString() + "</Where></Query>";

        //Load issues and notes
        var notesLoaded, issuesLoaded, issueCollection, noteCollection;
        issues.loadData({ query: query }, function (issues) {
            issuesLoaded = true;
            issueCollection = issues;
            complete();
        });

        function complete() {
            if (issuesLoaded && notesLoaded) {
                //Index issues and notes into arrays by store number
                var storeIndex = _.indexBy(stores, 'StoreNumber');

                _.each(issueCollection, function (issue) {
                    //Create array if it doesn't exist
                    storeIndex[issue.StoreNumber].Issues = storeIndex[issue.StoreNumber].Issues || [];
                    //Create an array for notes
                    issue.Notes = [];
                    //Add Issue to index
                    storeIndex[issue.StoreNumber].Issues.push(issue);
                });

                _.each(noteCollection, function (note) {
                    //Attach to issue if it's got a issue id
                    if (typeof note.IssueId !== 'undefined' && note.IssueId !== '') {
                        //Find the issue in the store by it's id, then push the note into it's Notes array
                        _.find(storeIndex[note.StoreNumber].Issues, { IssueId: note.IssueId }).Notes.push(note);
                    } else {
                        //Index it by store number if it doesn't
                        storeIndex[note.StoreNumber].Notes = storeIndex[note.StoreNumber].Notes || [];
                        storeIndex[note.StoreNumber].Notes.push(note);
                    }
                });

                callback(stores);
            }
        }
    }

    function create(store, callback) {
        var pairs = [];

        _.forOwn(store, function (value, key) {
            if (key.substr(0, 4) === 'ows_') {
                pairs.push([key, value]);
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
            completefunc: function (xData, Status) {
                //Convert to JSON object for easier access
                var data = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                    mapping: combinedMapping,
                    includeAllAttrs: false
                });

                _.forEach(data, function (combinedItem, i) {
                    combinedItem.PatioCount = (combinedItem.PatioCount === "" ? "0" : combinedItem.PatioCount);
                    combinedItem.StallCount = (combinedItem.StallCount === "" ? "0" : combinedItem.StallCount);
                    combinedItem.TotalStalls = (combinedItem.StallCount !== "" ? parseInt(combinedItem.StallCount) : 0) + (combinedItem.PatioCount !== "" ? parseInt(combinedItem.PatioCount) : 0);

                    //Create an endpoint count for Micros Audio 1
                    if (combinedItem.AudioEndpointCount === '') {
                        combinedItem.AudioEndpointCount = combinedItem.TotalStalls;

                        if (combinedItem.DriveThruFormat === 'Single') {
                            combinedItem.AudioEndpointCount++;
                        } else if (combinedItem.DriveThruFormat === 'Double') {
                            combinedItem.AudioEndpointCount += 2;
                        }
                    }
                });

                callback(data[0]);
            }
        });
    }

    return {
        loadData: loadData,
        loadPopsCountToDate: loadPopsCountToDate,
        loadPosCountToDate: loadPosCountToDate,
        logFields: logFields,
        changeFactory: changeFactory,
        changeValue: changeValue,
        getField: getField,
        getDocuments: getDocuments,
        uploadDocument: uploadDocument,
        deleteDocument: deleteDocument,
        getGoLiveChanges: getGoLiveChanges,
        getGoLiveChangesExtend: getGoLiveChangesExtend,
        getPMChanges: getPMChanges,
        getPMChangesExtend: getPMChangesExtend,
        create: create
    };
});
