function sortBy(field) {
    window.location = window.location.hash + "/sort/" + field;
}

define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend', 'app/rules/oracleserverupgradeschedule'], function (report, combined, construction, combinedconstructionextend, paymentmodRules) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];

            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                listName: "Construction_Calls",
                CAMLRowLimit: 990,
                CAMLViewFields: "<ViewFields Properties='True' />",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2'  /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.ConstructionId = $(this).attr("ows_ID");

                        store.OracleServerUpgradeServerType = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad");
                        if (!store.OracleServerUpgradeServerType)
                            store.OracleServerUpgradeServerType = "";

                        store.OracleServerWarrantyExpDate = $(this).attr("ows_OracleServer_x002d_Warranty_x002");
                        if (!store.OracleServerWarrantyExpDate)
                            store.OracleServerWarrantyExpDate = "";

                        store.OracleServerContractStatus = $(this).attr("ows_OracleServer_x002d_Contract_x002");
                        if (!store.OracleServerContractStatus)
                            store.OracleServerContractStatus = "";

                        store.OracleServerContractSubStatus = $(this).attr("ows_OracleServer_x002d_Contract_x0020");
                        if (!store.OracleServerContractSubStatus)
                            store.OracleServerContractSubStatus = "";

                        store.OracleServerScheduleStatus = $(this).attr("ows_OracleServer_x002d_Schedule_x002");
                        if (!store.OracleServerScheduleStatus)
                            store.OracleServerScheduleStatus = "";

                        store.OracleServerLogisticsStatus = $(this).attr("ows_OracleServer_x002d_Logistics_x00");
                        if (!store.OracleServerLogisticsStatus)
                            store.OracleServerLogisticsStatus = "";

                        store.OracleServerUpgradeDelivery = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad1");
                        if (!store.OracleServerUpgradeDelivery)
                            store.OracleServerUpgradeDelivery = "";
                        
                        store.OracleServerUpgradeGoLive = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad2");
                        if (!store.OracleServerUpgradeGoLive)
                            store.OracleServerUpgradeGoLive = "";

                        store.OracleServerUpgradeNightlyStatus = $(this).attr("ows_OracleServer_x002d_Upgrade_x0020");
                        if (!store.OracleServerUpgradeNightlyStatus)
                            store.OracleServerUpgradeNightlyStatus = "";

                        store.OracleServerUpgradeFinalStatus = $(this).attr("ows_OracleServer_x002d_Upgrade_x00200");
                        if (!store.OracleServerUpgradeFinalStatus)
                            store.OracleServerUpgradeFinalStatus = "";

                        store.OracleServerSourceOfUpgrade = $(this).attr("ows_OracleServer_x002d_Source_x0020_");
                        if (!store.OracleServerSourceOfUpgrade)
                            store.OracleServerSourceOfUpgrade = "";

                        store.OracleServerFirstDateScheduled = $(this).attr("ows_OracleServer_x002d_First_x0020_D");
                        if (!store.OracleServerFirstDateScheduled)
                            store.OracleServerFirstDateScheduled = "";

                        store.OracleServerReasonForScheduleChange = $(this).attr("ows_OracleServer_x002d_Reason_x0020_");
                        if (!store.OracleServerReasonForScheduleChange)
                            store.OracleServerReasonForScheduleChange = "";

                        store.OracleServerRFC = $(this).attr("ows_OracleServer_x002d_RFC");
                        if (!store.OracleServerRFC)
                            store.OracleServerRFC = "";

                        store.OracleServerUpgradeInstaller = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad3");
                        if (!store.OracleServerUpgradeInstaller)
                            store.OracleServerUpgradeInstaller = "";

                        store.OracleServerOpenedOnTime = $(this).attr("ows_OracleServer_x002d_Opened_x0020_");
                        if (!store.OracleServerOpenedOnTime)
                            store.OracleServerOpenedOnTime = "";

                        stores2.push(store);
                        CSquery += "<Value Type='Text'>" + storeNum + "</Value>";

                    });
                }
            });
            CSquery += "</Values></In></Where></Query>";

            function insert(str, index, value) {
                return str.substr(0, index) + value + str.substr(index);
            }

            if (CSquery.length > 3000) {
                CSquery = CSquery.replace("<Where><In>", "<Where><Or><In>");
                CSquery = CSquery.replace("</In></Where>", "</In></Or></Where>");

                var query1 = CSquery.substring(0, CSquery.length / 2);
                var query2 = CSquery.substring(CSquery.length / 2);

                query1loc = query1.lastIndexOf("</Value>") + "</Value>".length;
                CSquery = insert(query1, query1loc, '</Values></In><In><FieldRef Name="Title" /><Values>') + query2;
            }

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLQuery: CSquery,
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Store_x0020_Phone' /><FieldRef Name='Address_x0020_Full' /><FieldRef Name='Zipcode' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Market_x0020_DMA_x0020_Name_x002' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var storeNum = $(this).attr("ows_Title");

                        for (var i = 0; i < stores2.length; i++) {
                            if (stores2[i].StoreNumber == storeNum) {
                                stores2[i].CombinedId = $(this).attr("ows_ID");

                                stores2[i].FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                                if (!stores2[i].FranchiseGroup)
                                    stores2[i].FranchiseGroup = "";

                                stores2[i].DMA = $(this).attr("ows_Market_x0020_DMA_x0020_Name_x002");
                                if (!stores2[i].DMA)
                                    stores2[i].DMA = "";

                                stores2[i].City = $(this).attr("ows_City");
                                if (!stores2[i].City)
                                    stores2[i].City = "";

                                stores2[i].State = $(this).attr("ows_State_x0020_");
                                if (!stores2[i].State)
                                    stores2[i].State = "";

                                stores2[i].Address = $(this).attr("ows_Address_x0020_Full");
                                if (!stores2[i].Address)
                                    stores2[i].Address = "";

                                stores2[i].Zip = $(this).attr("ows_Zipcode");
                                if (!stores2[i].Zip)
                                    stores2[i].Zip = "";

                                stores2[i].StorePhone = $(this).attr("ows_Store_x0020_Phone");
                                if (!stores2[i].StorePhone)
                                    stores2[i].StorePhone = "";

                                

                                break;
                            }
                        }
                    });
                }
            });





            //Define Report Columns
            var columns = [



                {
                    key: 'StoreNumber', title: 'Store', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>" + value + "</a>"
                    }
                },
                { key: 'Address', title: 'Street Address' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'Zip', title: 'Zip Code' },
                { key: 'StorePhone', title: 'Phone Number' },
                { key: 'FranchiseGroup', title: 'Current Ownership' },

                { key: 'OracleServerUpgradeServerType', title: 'Server Model', editable: true },

                { key: 'OracleServerWarrantyExpDate', title: 'Warranty Exp. Date', transform: 'date', editable: true },
                { key: 'OracleServerContractStatus', title: 'Contract Status', editable: true },
                { key: 'OracleServerContractSubStatus', title: 'Contract Sub-Status', editable: true },
                { key: 'OracleServerScheduleStatus', title: 'Schedule Status', editable: true },
                { key: 'OracleServerLogisticsStatus', title: 'Logistics Status', editable: true },
                { key: 'OracleServerUpgradeDelivery', title: 'Delivery Date', transform: 'date', editable: true },
                { key: 'OracleServerUpgradeNightlyStatus', title: 'Upgrade Nightly Status', editable: true },
                { key: 'OracleServerUpgradeFinalStatus', title: 'Upgrade Final Status', editable: true },
                { key: 'OracleServerSourceOfUpgrade', title: 'Source of Upgrade', editable: true },
                { key: 'OracleServerFirstDateScheduled', title: 'First Date Scheduled', editable: true },
                { key: 'OracleServerReasonForScheduleChange', title: 'Reason for Schedule Change', editable: true },
                { key: 'OracleServerUpgradeGoLive', title: 'Upgrade Go Live Date', transform: 'date', editable: true },
                
                { key: 'OracleServerRFC', title: 'RFC', editable: true },
                { key: 'OracleServerUpgradeInstaller', title: 'Resource', editable: true },
                { key: 'OracleServerOpenedOnTime', title: 'Opened on Time', editable: true },


            ];

            //Define report title
            var title = 'Oracle Server Upgrade Schedule';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */

            var sort;
            var hashLoc = window.location.hash;
            if (hashLoc.indexOf("sort") > -1) {
                hashSort = hashLoc.substring(hashLoc.indexOf("sort") + 5);
                sort = {
                    key: hashSort,
                    direction: 'DESC'
                };
            }
            else
                sort = {
                    key: 'OracleServerUpgradeGoLive',
                    direction: 'DESC'
                };
            complete();
            function complete() {


                var afterRender = function (view) {
                    paymentmodRules.tableHelper(view);
                };
                //Build report if complete
                report.render({
                    data: stores2,
                    columns: columns,
                    title: title,
                    target: target,
                    sort: sort,
                    routeCheck: routeCheck,
                    callback: afterRender
                });

            }
        }
    };
});