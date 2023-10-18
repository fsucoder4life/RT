define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];
            var CCEcount = 0;
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='POS_x0020_Selection' /></ViewFields>",
                CAMLQuery: "<Query><Where><Contains><FieldRef Name='Franchise_x0020_Group' /><Value Type='Text'>sonic</Value></Contains></Where><OrderBy><FieldRef Name='Title' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        CCEcount++;
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        
                        var storeNum = $(this).attr("ows_Title");
                       
                        var posSelection = $(this).attr("ows_POS_x0020_Selection")
                        if (!posSelection)
                            posSelection = "";

                        if (posSelection.toLowerCase().indexOf("oracle") > -1 || posSelection.toLowerCase().indexOf("micros") > -1)
                        { }
                        else
                        {
                            
                            return;
                        }

                        var store = {};
                        
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;

                        


                        stores2.push(store);
                        CSquery += "<Value Type='Text'>" + storeNum + "</Value>";

                    });
                }
            });
            CSquery += "</Values></In></Where></Query>";

            function insert(str, index, value) {
                return str.substr(0, index) + value + str.substr(index);
            }

            //if (CSquery.length > 3000) {
            //    CSquery = CSquery.replace("<Where><In>", "<Where><Or><In>");
            //    CSquery = CSquery.replace("</In></Where>", "</In></Or></Where>");

            //    var query1 = CSquery.substring(0, CSquery.length / 2);
            //    var query2 = CSquery.substring(CSquery.length / 2);

            //    query1loc = query1.lastIndexOf("</Value>") + "</Value>".length;
            //    CSquery = insert(query1, query1loc, '</Values></In><In><FieldRef Name="Title" /><Values>') + query2;
            //}

            //call individual function each 500 stores:
            CSquery = "";
            //console.log("stores2.length = " + stores2.length + " - CCEcount = " + CCEcount);
            for (var i = 0; i < stores2.length; i++) {
                CSquery += "<Value Type='Text'>" + stores2[i].StoreNumber + "</Value>";
                if (i % 50 === 0 && i > 0) {
                    //console.log("i is: " + i + " find this storeNumber in query and add break there:" + stores2[i].StoreNumber);
                    //time to put in break


                    
                    
                }
                else
                {
                    //console.log("i is not disible:" + stores2[i].StoreNumber);
                }
            }
            //console.log(CSquery);
            FillStores('<Query><Where><In><FieldRef Name="Title" /><Values>' + CSquery + '</Values></In></Where></Query>');
            


            function FillStores(CSquery) {
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Schedule",
                    CAMLQuery: CSquery,
                    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Primary_x0020_Contact_x0020_Phon' /><FieldRef Name='Primary_x0020_Contact_x0020_Emai' /><FieldRef Name='Primary_x0020_Contact' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
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

                                    stores2[i].PrimaryContact = $(this).attr("ows_Primary_x0020_Contact");
                                    if (!stores2[i].PrimaryContact)
                                        stores2[i].PrimaryContact = "";

                                    stores2[i].PrimaryPhone = $(this).attr("ows_Primary_x0020_Contact_x0020_Phon");
                                    if (!stores2[i].PrimaryPhone)
                                        stores2[i].PrimaryPhone = "";

                                    stores2[i].PrimaryEmail = $(this).attr("ows_Primary_x0020_Contact_x0020_Emai");
                                    if (!stores2[i].PrimaryEmail)
                                        stores2[i].PrimaryEmail = "";

                                    
                                    

                                    break;
                                }
                            }
                        });
                    }
                });
            }
            function replaceAll(str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            }



            //Define Report Columns
            var columns = [

                

                { key: 'StoreNumber', title: 'No.' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'PrimaryContact', title: 'POC' },
                { key: 'PrimaryPhone', title: 'POC - Phone' },
                { key: 'PrimaryEmail', title: 'POC - Email' },
                
                
                
                
                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                },

            ];

            //Define report title
            var title = 'Franchisee Owned Oracle/Micros POS';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'OracleCEGoLive',
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