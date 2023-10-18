define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];
            var CCEcount = 0;
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        CCEcount++;
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;

                        store.OracleCEGoLive = $(this).attr("ows_OracleCEGoLive");
                        if (!store.OracleCEGoLive)
                            store.OracleCEGoLive = "";

                        store.OracleCEMicros1 = $(this).attr("ows_OracleCEMicros1");
                        if (!store.OracleCEMicros1)
                            store.OracleCEMicros1 = "";

                        store.OracleCEMicros2 = $(this).attr("ows_OracleCEMicros2");
                        if (!store.OracleCEMicros2)
                            store.OracleCEMicros2 = "";

                        store.OracleCEController = $(this).attr("ows_OracleCEController");
                        if (!store.OracleCEController)
                            store.OracleCEController = "";

                        store.OracleCEInstaller = $(this).attr("ows_OracleCEInstaller");
                        if (!store.OracleCEInstaller)
                            store.OracleCEInstaller = "";

                        store.OracleCEPM = $(this).attr("ows_OracleCEPM");
                        if (!store.OracleCEPM)
                            store.OracleCEPM = "";

                        store.OracleCEDelivery = $(this).attr("ows_OracleCEDelivery");
                        if (!store.OracleCEDelivery)
                            store.OracleCEDelivery = "";


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
            console.log("stores2.length = " + stores2.length + " - CCEcount = " + CCEcount);
            for (var i = 0; i < stores2.length; i++) {
                CSquery += "<Value Type='Text'>" + stores2[i].StoreNumber + "</Value>";
                if (i % 50 === 0 && i > 0) {
                    //console.log("i is: " + i + " find this storeNumber in query and add break there:" + stores2[i].StoreNumber);
                    //time to put in break




                }
                else {
                    //console.log("i is not disible:" + stores2[i].StoreNumber);
                }
            }
            console.log(CSquery);
            FillStores('<Query><Where><In><FieldRef Name="Title" /><Values>' + CSquery + '</Values></In></Where></Query>');



            function FillStores(CSquery) {
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Schedule",
                    CAMLQuery: CSquery,
                    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
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
                {
                    key: 'OracleCEGoLive', title: 'Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                {
                    key: 'OracleCEDelivery', title: 'Delivery', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },

                {
                    key: 'OracleCEMicros1', title: 'Micros WS 625x', transform: function (value, row, data, index) {
                        if (value)
                            if (value.indexOf(".") > -1)
                                return value.substring(0, value.indexOf("."));
                            else return "";
                        else return "";
                    }
                },
                {
                    key: 'OracleCEMicros2', title: 'Micros WS 655x', transform: function (value, row, data, index) {
                        if (value)
                            if (value.indexOf(".") > -1)
                                return value.substring(0, value.indexOf("."));
                            else return "";
                        else return "";
                    }
                },
                {
                    key: 'OracleCEController', title: 'KDS Controller 210', transform: function (value, row, data, index) {
                        if (value)
                            if (value.indexOf(".") > -1)
                                return value.substring(0, value.indexOf("."));
                            else return "";
                        else return "";
                    }
                },



                { key: 'OracleCEInstaller', title: 'Installer ' },
                { key: 'OracleCEPM', title: 'PM' },


                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                },

            ];

            //Define report title
            var title = 'Oracle CE Kitchen POS Replacement';

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