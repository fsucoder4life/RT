define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];

            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today OffsetDays='-2020' /></Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;


                        store.CompanyBillTo = $(this).attr("ows_CompanyBillTo");
                        if (!store.CompanyBillTo)
                            store.CompanyBillTo = "";


                        store.AddressBillTo = $(this).attr("ows_AddressBillTo");
                        if (!store.AddressBillTo)
                            store.AddressBillTo = "";


                        store.CityBillTo = $(this).attr("ows_CityBillTo");
                        if (!store.CityBillTo)
                            store.CityBillTo = "";


                        store.StateBillTo = $(this).attr("ows_StateBillTo");
                        if (!store.StateBillTo)
                            store.StateBillTo = "";


                        store.ZipBillTo = $(this).attr("ows_ZipBillTo");
                        if (!store.ZipBillTo)
                            store.ZipBillTo = "";


                        store.EmailBillTo = $(this).attr("ows_EmailBillTo");
                        if (!store.EmailBillTo)
                            store.EmailBillTo = "";

                        store.VP6800GoLive = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");
                        if (!store.VP6800GoLive)
                            store.VP6800GoLive = "";

                        store.VP6800StoreCloseTime = $(this).attr("ows_VP6800_x0020_Store_x0020_Close_x");
                        if (!store.VP6800StoreCloseTime)
                            store.VP6800StoreCloseTime = "";

                        store.VP6800Installer = $(this).attr("ows_VP6800_x0020_Installer");

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
            for (var i = 0; i < stores2.length; i++) {
                CSquery += "<Value Type='Text'>" + stores2[i].StoreNumber + "</Value>";
                if (i % 450 === 0 && i > 0) {
                    console.log("i is: " + i + " find this storeNumber in query and add break there:" + stores2[i].StoreNumber);
                    //time to put in break


                    FillStores('<Query><Where><In><FieldRef Name="Title" /><Values>' + CSquery + '</Values></In></Where></Query>');
                    CSquery = "";
                }
            }

            console.log(CSquery);


            function FillStores(CSquery) {
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Schedule",
                    CAMLQuery: CSquery,
                    CAMLViewFields: "<ViewFields><FieldRef Name='Primary_x0020_Contact_x0020_Emai' /><FieldRef Name='Primary_x0020_Contact_x0020_Phon' /><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Address_x0020_Full' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /><FieldRef Name='Primary_x0020_Contact' /></ViewFields>",
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            var storeNum = $(this).attr("ows_Title");

                            for (var i = 0; i < stores2.length; i++) {
                                if (stores2[i].StoreNumber == storeNum) {
                                    stores2[i].CombinedId = $(this).attr("ows_ID");

                                    


                                    stores2[i].PrimaryEmail = $(this).attr("ows_Primary_x0020_Contact_x0020_Emai");
                                    if (!stores2[i].PrimaryEmail)
                                        stores2[i].PrimaryEmail = "";

                                    stores2[i].PrimaryPhone = $(this).attr("ows_Primary_x0020_Contact_x0020_Phon");
                                    if (!stores2[i].PrimaryPhone)
                                        stores2[i].PrimaryPhone = "";

                                    stores2[i].Address = $(this).attr("ows_Address_x0020_Full");
                                    if (!stores2[i].Address)
                                        stores2[i].Address = "";


                                    stores2[i].City = $(this).attr("ows_City");
                                    if (!stores2[i].City)
                                        stores2[i].City = "";

                                    stores2[i].State = $(this).attr("ows_State_x0020_");
                                    if (!stores2[i].State)
                                        stores2[i].State = "";


                                    stores2[i].PrimaryContact = $(this).attr("ows_Primary_x0020_Contact");
                                    if (!stores2[i].PrimaryContact)
                                        stores2[i].PrimaryContact = "";

                                    



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

                {
                    key: 'VP6800GoLive', title: 'VP6800 Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }
                },
                { key: 'StoreNumber', title: 'No.' },
                { key: 'Address', title: 'Address' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'PrimaryContact', title: 'POC Name' },

                { key: 'PrimaryPhone', title: 'POC Phone' },
                { key: 'PrimaryEmail', title: 'POC Email' },

                { key: 'CompanyBillTo', title: 'Bill To Company' },
                { key: 'AddressBillTo', title: 'Bill To Address' },
                { key: 'CityBillTo', title: 'Bill To City' },
                { key: 'StateBillTo', title: 'Bill To State' },
                { key: 'ZipBillTo', title: 'Bill To Zip' },

                { key: 'VP6800Installer', title: 'Next Gen Installer' },


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