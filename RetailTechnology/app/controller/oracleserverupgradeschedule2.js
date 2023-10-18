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
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad6' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2'  /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.ConstructionId = $(this).attr("ows_ID");

                        
                        
                        store.OracleServerUpgradeGoLive = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad2");
                        if (!store.OracleServerUpgradeGoLive)
                            store.OracleServerUpgradeGoLive = "";

                        //OracleServerUpgradeWindowsUpgrade
                        store.OracleServerUpgradeWindowsUpgrade = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad5");
                        if (!store.OracleServerUpgradeWindowsUpgrade)
                            store.OracleServerUpgradeWindowsUpgrade = "";

                        //OracleServerUpgradeGoLive2
                        store.OracleServerUpgradeGoLive2 = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad6");
                        if (!store.OracleServerUpgradeGoLive2)
                            store.OracleServerUpgradeGoLive2 = "";

                        //OracleServerUpgradeInstaller
                        store.OracleServerUpgradeInstaller = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad3");
                        if (!store.OracleServerUpgradeInstaller)
                            store.OracleServerUpgradeInstaller = "";

                        //InstallerForWindows10Upgrade
                        store.InstallerForWindows10Upgrade = $(this).attr("ows_InstallerForWindows10Upgrade");
                        if (!store.InstallerForWindows10Upgrade)
                            store.InstallerForWindows10Upgrade = "";

                        
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
                
                { key: 'FranchiseGroup', title: 'Franchisee' },
                

                { key: 'OracleServerUpgradeWindowsUpgrade', title: 'Windows Version',  editable: true },

                { key: 'OracleServerUpgradeGoLive2', title: 'Win Upgrade Go Live', transform: 'date', editable: true },
                
                { key: 'InstallerForWindows10Upgrade', title: 'Win 10 Upgrade Installer', editable: true },
                


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
                    key: 'OracleServerUpgradeGoLive2',
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