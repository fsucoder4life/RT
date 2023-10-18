define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];
            var CCEcount = 0;
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        CCEcount++;
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;

                        store.VP6800GoLive = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");
                        if (!store.VP6800GoLive)
                            store.VP6800GoLive = "";

                        store.VP6800StoreCloseTime = $(this).attr("ows_VP6800_x0020_Store_x0020_Close_x");
                        if (!store.VP6800StoreCloseTime)
                            store.VP6800StoreCloseTime = "";

                        store.HughesSwitchUpgradeOrdered2 = $(this).attr("ows_Hughes_x0020_Switch_x0020_Upgrad");
                        if (!store.HughesSwitchUpgradeOrdered2)
                            store.HughesSwitchUpgradeOrdered2 = "";

                        store.VP6800NumOfTerminals = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_");
                        if (!store.VP6800NumOfTerminals)
                            store.VP6800NumOfTerminals = "";

                        store.VP6800NumOf45Units = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_0");
                        if (!store.VP6800NumOf45Units)
                            store.VP6800NumOf45Units = "";

                        store.VP6800NumOf90Units = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_1");
                        if (!store.VP6800NumOf90Units)
                            store.VP6800NumOf90Units = "";

                        store.VP6800DTWindow = $(this).attr("ows_VP6800_x0020_DT_x0020_Window");
                        if (!store.VP6800DTWindow)
                            store.VP6800DTWindow = "";

                        store.VP6800Sunshield = $(this).attr("ows_VP6800_x0020_Sunshield");
                        if (!store.VP6800Sunshield)
                            store.VP6800Sunshield = "";

                        store.VP6800Ordered = $(this).attr("ows_VP6800_x0020_Ordered");
                        if (!store.VP6800Ordered)
                            store.VP6800Ordered = "";

                        store.VP6800Delivery = $(this).attr("ows_VP6800_x0020_Delivery");
                        if (!store.VP6800Delivery)
                            store.VP6800Delivery = "";

                        store.VP6800TrackingNum = $(this).attr("ows_VP6800_x0020_Tracking_x0020_Num");
                        if (!store.VP6800TrackingNum)
                            store.VP6800TrackingNum = "";

                        store.VP6800Installer = $(this).attr("ows_VP6800_x0020_Installer");
                        if (!store.VP6800Installer)
                            store.VP6800Installer = "";

                        store.VP6800PONum = $(this).attr("ows_VP6800_x0020_PO_x0020_Num");
                        if (!store.VP6800PONum)
                            store.VP6800PONum = "";

                        store.VP6800ITPM = $(this).attr("ows_VP6800_x0020_IT_x0020_PM");
                        if (!store.VP6800ITPM)
                            store.VP6800ITPM = "";

                        store.VP6800ServerCabinetNumber = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1");
                        if (!store.VP6800ServerCabinetNumber)
                            store.VP6800ServerCabinetNumber = "";

                        store.VP6800ServerCabinet12uNumber = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2");
                        if (!store.VP6800ServerCabinet12uNumber)
                            store.VP6800ServerCabinet12uNumber = "";

                        store.VP6800ServerCabinetShelf = $(this).attr("ows_VP6800_x0020_Server_x0020_Cabine0");
                        if (!store.VP6800ServerCabinetShelf)
                            store.VP6800ServerCabinetShelf = "";

                        store.VP6800ProjectSiteSurveyDate = $(this).attr("ows_VP6800_x0020_Project_x0020_Site_");
                        if (!store.VP6800ProjectSiteSurveyDate)
                            store.VP6800ProjectSiteSurveyDate = "";

                        store.VP6800ProjectSiteSurveyCompany = $(this).attr("ows_VP6800_x0020_Project_x0020_Site_0");
                        if (!store.VP6800ProjectSiteSurveyCompany)
                            store.VP6800ProjectSiteSurveyCompany = "";

                        store.VP6800ProjectSignOffsComplete = $(this).attr("ows_VP6800_x0020_Project_x0020_Sign_");
                        if (!store.VP6800ProjectSignOffsComplete)
                            store.VP6800ProjectSignOffsComplete = "";

                        store.VP6800ProjectSwitchSerialNum = $(this).attr("ows_VP6800_x0020_Project_x0020_Switc");
                        if (!store.VP6800ProjectSwitchSerialNum)
                            store.VP6800ProjectSwitchSerialNum = "";

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
                else
                {
                    //console.log("i is not disible:" + stores2[i].StoreNumber);
                }
            }
            FillStores('<Query><Where><In><FieldRef Name="Title" /><Values>' + CSquery + '</Values></In></Where></Query>');
            //console.log(CSquery);


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

                { key: 'ProjectType', title: 'Type' },

                { key: 'StoreNumber', title: 'No.' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                {
                    key: 'VP6800GoLive', title: 'VP6800 Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'VP6800StoreCloseTime', title: 'Store Close Time' },
                { key: 'VP6800NumOfTerminals', title: '# Of Terminals' },
                { key: 'VP6800NumOf45Units', title: '#&nbsp;of&nbsp;45 Units' },
                { key: 'VP6800NumOf90Units', title: '#&nbsp;of&nbsp;90 Units' },
                { key: 'VP6800DTWindow', title: 'DT Window' },
                { key: 'VP6800Sunshield', title: 'Sunshield' },
                {
                    key: 'VP6800Ordered', title: 'Ordered', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'VP6800Delivery', title: 'Delivery', transform: 'date' },
                { key: 'VP6800TrackingNum', title: 'Tracking #' },
                { key: 'VP6800Installer', title: 'Installer' },

                {
                    key: 'VP6800PONum', title: 'PO Number', transform: function (value, row, data, index) {
                        if (value)
                            if (value.indexOf(".") > -1)
                                return value.substring(0, value.indexOf("."));
                            else return "";
                        else return "";
                    }
                },
                { key: 'VP6800ITPM', title: 'IT PM' },
                { key: 'HughesSwitchUpgradeOrdered2', title: 'Hughes Switch Upgrade Ordered' },

                { key: 'VP6800ServerCabinetNumber', title: 'Server Cabinet 6u&nbsp;QTY' },

                {
                    key: 'VP6800ServerCabinet12uNumber', title: 'Server Cabinet 12u&nbsp;QTY', transform: function (value, row, data, index) {
                        if (value)
                            return value;
                        else
                            return "";
                    }
                },
                { key: 'VP6800ServerCabinetShelf', title: 'Server Cabinet Shelf' },
                { key: 'VP6800ProjectSiteSurveyDate', title: 'Site Survey Date', transform: 'date' },
                { key: 'VP6800ProjectSiteSurveyCompany', title: 'Site Survey Company' },
                { key: 'VP6800ProjectSignOffsComplete', title: 'Sign Offs Complete' },

                { key: 'VP6800ProjectSwitchSerialNum', title: 'Switch Serial #' },



                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                },

            ];

            //Define report title
            var title = 'Next Gen Pays - Upcoming Projects';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: 'VP6800GoLive',
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