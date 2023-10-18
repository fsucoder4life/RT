define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];

            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                CAMLRowLimit: 499,
                listName: "Combined Construction Extend",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='FirewallGoLive' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='FirewallGoLive' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;

                        store.FirewallGoLive = $(this).attr("ows_FirewallGoLive");
                        if (!store.FirewallGoLive)
                            store.FirewallGoLive = "";

                        store.FirewallInstaller = $(this).attr("ows_FirewallInstaller");
                        if (!store.FirewallInstaller)
                            store.FirewallInstaller = "";

                        store.FirewallITPM = $(this).attr("ows_FirewallITPM");
                        if (!store.FirewallITPM)
                            store.FirewallITPM = "";

                        store.FirewallNotes = $(this).attr("ows_FirewallNotes");
                        if (!store.FirewallNotes)
                            store.FirewallNotes = "";


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
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='Title' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var storeNum = $(this).attr("ows_Title");

                        for (var i = 0; i < stores2.length; i++) {
                            if (stores2[i].StoreNumber == storeNum) {
                                stores2[i].CombinedId = $(this).attr("ows_ID");

                                stores2[i].ProjectType = $(this).attr("ows_Project_x0020_Type");
                                if (!stores2[i].ProjectType)
                                    stores2[i].ProjectType = "";



                                stores2[i].City = $(this).attr("ows_City");
                                if (!stores2[i].City)
                                    stores2[i].City = "";

                                stores2[i].State = $(this).attr("ows_State_x0020_");
                                if (!stores2[i].State)
                                    stores2[i].State = "";

                                stores2[i].FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                                if (!stores2[i].FranchiseGroup)
                                    stores2[i].FranchiseGroup = "";

                                stores2[i].Pos = $(this).attr("ows_POS_x0020_Selection");
                                if (!stores2[i].Pos)
                                    stores2[i].Pos = "";



                                break;
                            }
                        }
                    });
                }
            });
            function replaceAll(str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            }



            //Define Report Columns
            var columns = [

                { key: 'StoreNumber', title: 'No.' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                {
                    key: 'FirewallGoLive', title: 'Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'FranchiseGroup', title: 'FEE' },
                { key: 'Pos', title: 'POS' },
                { key: 'FirewallInstaller', title: 'Installer' },
                { key: 'FirewallITPM', title: 'PM' },
                { key: 'FirewallNotes', title: 'Notes' },
                
                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                },

            ];

            //Define report title
            var title = 'Firewall/AP/VSAT Replacement';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'FirewallGoLive',
                direction: 'DESC'
            };
            complete();
            function complete() {

                //Build report if complete
                report.render({
                    data: stores2,
                    columns: columns,
                    title: title,
                    target: target,
                    sort: sort,
                    routeCheck: routeCheck
                });

            }
        }
    };
});