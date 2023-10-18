define(['app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend'], function (report, combined, construction, combinedconstructionextend) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];
            var CCEcount = 0;
            var itpmhash = "";
            var sortKey = "GoLiveDate";
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            if (window.location.hash.indexOf("/sort/InstallDate") > -1) {
                sortKey = "InstallDate";
            }

            if (window.location.hash.indexOf("/itpm/") > -1) {
                itpmhash = window.location.hash.substring(window.location.hash.indexOf("/itpm/") + 6);
                itpmhash = itpmhash.replace('/sort/InstallDate', '');
                console.log(itpmhash + sortKey);
            }

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='Project_x0020_Type' /></ViewFields>",
                CAMLQuery: "<Query><Where><And><Geq><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq><Leq><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><Value Type='DateTime'><Today OffsetDays='122' /></Value></Leq></And></Where><OrderBy><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        CCEcount++;
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Title");

                        var projectType = $(this).attr("ows_Project_x0020_Type");
                        if (typeof(projectType) !== 'undefined') {
                            
                            }
                        else
                            return true;
                        if (projectType.indexOf("New") > -1 || projectType.indexOf("Remodel") > -1 || projectType.indexOf("Relocation") > -1 || projectType.indexOf("Rebuild") > -1)
                        { }
                        else
                        {
                            return true;
                        }

                        var ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        if (itpmhash.length > 0)
                            if (ProjectManager.toLowerCase().indexOf(itpmhash.toLowerCase()) > -1)
                                {}
                            else
                                return true;

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

            if (CSquery.length > 3000) {
                CSquery = CSquery.replace("<Where><In>", "<Where><Or><In>");
                CSquery = CSquery.replace("</In></Where>", "</In></Or></Where>");

                var query1 = CSquery.substring(0, CSquery.length / 2);
                var query2 = CSquery.substring(CSquery.length / 2);

                query1loc = query1.lastIndexOf("</Value>") + "</Value>".length;
                CSquery = insert(query1, query1loc, '</Values></In><In><FieldRef Name="Title" /><Values>') + query2;
            }

            //call individual function each 500 stores:
            CSquery = "";
            //console.log("stores2.length = " + stores2.length + " - CCEcount = " + CCEcount);
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
            //console.log(CSquery);
            FillStores('<Query><Where><In><FieldRef Name="Title" /><Values>' + CSquery + '</Values></In></Where></Query>');



            function FillStores(CSquery) {
                $().SPServices({
                    operation: "GetListItems",
                    listName: "Combined Schedule",
                    CAMLQuery: CSquery,
                    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><FieldRef Name='POS_x0020_Training_x0020_Date_x0' /><FieldRef Name='Audio_x0020_Status' /><FieldRef Name='Audio_x0020_Delivery_x0020_Date' /><FieldRef Name='POPS_x0020_Delivery_x0020_Date' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='HAN_x0020_Status' /><FieldRef Name='HAN_x0020_Install_x0020_Date' /><FieldRef Name='Installation_x0020_Company' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
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

                                    stores2[i].Installer = $(this).attr("ows_Installation_x0020_Company");
                                    if (!stores2[i].Installer)
                                        stores2[i].Installer = "";
                                    //ows_HAN_x0020_Install_x0020_Date: { mappedName: 'HughesTempDate
                                    
                                    stores2[i].HughesTempDate = $(this).attr("ows_HAN_x0020_Install_x0020_Date");
                                    if (!stores2[i].HughesTempDate)
                                        stores2[i].HughesTempDate = "";

                                    //ows_HAN_x0020_Status: { mappedName: 'HughesTempStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'HAN to FEE ' + today, 'HAN Received ' + today, 'Needs Date', 'Need to Order', 'Tentative', 'Confirmed', 'Complete'] },
                                    stores2[i].HughesTempStatus = $(this).attr("ows_HAN_x0020_Status");
                                    if (!stores2[i].HughesTempStatus)
                                        stores2[i].HughesTempStatus = "";

                                    //ows_POS_x0020_Selection: { mappedName: 'Pos', objectType: 'Text', type: 'select', options: ['Micros', 'Infor', 'OrderMatic'] },
                                    stores2[i].Pos = $(this).attr("ows_POS_x0020_Selection");
                                    if (!stores2[i].Pos)
                                        stores2[i].Pos = "";

                                    //PopsDeliveryDate
                                    //ows_POPS_x0020_Delivery_x0020_Date: { mappedName: 'PopsDeliveryDate', objectType: 'Text', type: 'date' },
                                    stores2[i].PopsDeliveryDate = $(this).attr("ows_POPS_x0020_Delivery_x0020_Date");
                                    if (!stores2[i].PopsDeliveryDate)
                                        stores2[i].PopsDeliveryDate = "";

                                    //AudioDeliveryDate
                                    //ows_Audio_x0020_Delivery_x0020_Date: { mappedName: 'AudioDeliveryDate', objectType: 'Text', type: 'date' },
                                    stores2[i].AudioDeliveryDate = $(this).attr("ows_Audio_x0020_Delivery_x0020_Date");
                                    if (!stores2[i].AudioDeliveryDate)
                                        stores2[i].AudioDeliveryDate = "";

                                    //ows_Audio_x0020_Status: { mappedName: 'AudioStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Payment', 'Need Credit App', 'Contract Complete ' + today, 'Shipped ' + today, 'Delivered'] },
                                    stores2[i].AudioStatus = $(this).attr("ows_Audio_x0020_Status");
                                    if (!stores2[i].AudioStatus)
                                        stores2[i].AudioStatus = "";

                                    //ows_POS_x0020_Training_x0020_Date_x0: { mappedName: 'PosVendorSupportDate', objectType: 'Text', type: 'date' },
                                    stores2[i].PosVendorSupportDate = $(this).attr("ows_POS_x0020_Training_x0020_Date_x0");
                                    if (!stores2[i].PosVendorSupportDate)
                                        stores2[i].PosVendorSupportDate = "";

                                    //GoLiveDate
                                    stores2[i].GoLiveDate = $(this).attr("ows_GO_x0020_LIVE_x0020_DATE");
                                    if (!stores2[i].GoLiveDate)
                                        stores2[i].GoLiveDate = "";

                                    //ows_IT_x0020_Project_x0020_Manager: { mappedName: 'ProjectManager', objectType: 'Text', type: 'select', options: ['Barrett Seal', 'Josh Rice', 'Jason Srader', 'Russell Katigan', 'Kaitlyn Childers', 'Dylan Gehlbach', 'Emily Boatright'] },
                                    stores2[i].ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                                    if (!stores2[i].ProjectManager)
                                        stores2[i].ProjectManager = "";

                                    


                                    break;
                                }
                            }
                        });
                    }
                });

                $().SPServices({
                    operation: "GetListItems",
                    listName: "Construction_Calls",
                    CAMLQuery: replaceAll(CSquery, 'Title', 'Store_x0020_Number'),
                    CAMLViewFields: "<ViewFields><FieldRef Name='Store_x0020_Number' /><FieldRef Name='PAYS_x0020_Status' /><FieldRef Name='Server_x0020_EPS_x0020_Status' /><FieldRef Name='Cirronet_x0020_Status' /><FieldRef Name='POS_x0020_Status' /><FieldRef Name='POS_x0020_Delivery_x0020_Date' /><FieldRef Name='POPS_x0020_Status' /><FieldRef Name='Pays_x0020_Delivery_x0020_Date' /><FieldRef Name='Installer_x0020_Arrival_x0020_Da' /><FieldRef Name='Installation_x0020_Status' /><FieldRef Name='POS_x0020_Configuration_x0020_Da' /><FieldRef Name='Construction_x0020_Manager' /></ViewFields>",
                    async: false,
                    completefunc: function (xData, Status) {
                        $(xData.responseXML).SPFilterNode("z:row").each(function () {
                            var storeNum2 = $(this).attr("ows_Store_x0020_Number");
                            storeNum2 = storeNum2.substring(storeNum2.indexOf(";#") + ";#".length);
                            for (var i = 0; i < stores2.length; i++) {
                                if (stores2[i].StoreNumber == storeNum2) {

                                    stores2[i].PosDeliveryDate = $(this).attr("ows_POS_x0020_Delivery_x0020_Date");
                                    if (!stores2[i].PosDeliveryDate)
                                        stores2[i].PosDeliveryDate = "";
                                    //ows_POS_x0020_Status: {mappedName: 'PosStatus', objectType: 'Text', type: 'select', options: ['Not Required', 'Need Requirements', 'Need to Request', 'Quote Requested ' + today, 'Quote Received ' + today, 'Quote to FEE ' + today, 'Need Signature', 'Need Deposit', 'Contract Complete ' + today, 'Shipped ' + today, 'Delivered']},
                                    stores2[i].PosStatus = $(this).attr("ows_POS_x0020_Status");
                                    if (!stores2[i].PosStatus)
                                        stores2[i].PosStatus = "";

                                    stores2[i].PopsStatus = $(this).attr("ows_POPS_x0020_Status");
                                    if (!stores2[i].PopsStatus)
                                        stores2[i].PopsStatus = "";

                                    stores2[i].PaysDeliveryDate = $(this).attr("ows_Pays_x0020_Delivery_x0020_Date");
                                    if (!stores2[i].PaysDeliveryDate)
                                        stores2[i].PaysDeliveryDate = "";
                                    
                                    stores2[i].InstallDate = $(this).attr("ows_Installer_x0020_Arrival_x0020_Da");
                                    if (!stores2[i].InstallDate)
                                        stores2[i].InstallDate = "";

                                    stores2[i].InstallationStatus = $(this).attr("ows_Installation_x0020_Status");
                                    if (!stores2[i].InstallationStatus)
                                        stores2[i].InstallationStatus = "";

                                    stores2[i].PosConfigDate = $(this).attr("ows_POS_x0020_Configuration_x0020_Da");
                                    if (!stores2[i].PosConfigDate)
                                        stores2[i].PosConfigDate = "";

                                    stores2[i].ConstructionManager = $(this).attr("ows_Construction_x0020_Manager");
                                    if (!stores2[i].ConstructionManager)
                                        stores2[i].ConstructionManager = "";

                                    stores2[i].PaysStatus = $(this).attr("ows_PAYS_x0020_Status");
                                    if (!stores2[i].PaysStatus)
                                        stores2[i].PaysStatus = "";

                                    stores2[i].ServerEps = $(this).attr("ows_Server_x0020_EPS_x0020_Status");
                                    if (!stores2[i].ServerEps)
                                        stores2[i].ServerEps = "";

                                    stores2[i].CirronetStatus = $(this).attr("ows_Cirronet_x0020_Status");
                                    if (!stores2[i].CirronetStatus)
                                        stores2[i].CirronetStatus = "";



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
                { key: 'Installer', title: 'Installer' },
                {
                    key: 'HughesTempDate', title: 'Hughes', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                            (store.HughesTempStatus !== "" ? "</br>" + store.HughesTempStatus : '');
                    }
                },
                { key: 'Pos', title: 'POS<br/>Vendor' },
                {
                    key: 'PosDeliveryDate', title: 'POS<br/>Delivery', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                               (store.PosStatus !== "" ? "</br>" + store.PosStatus : '');
                    }
                },
                {
                    key: 'PopsDeliveryDate', title: 'POPS<br/>Delivery', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                               (store.PopsStatus !== "" ? "</br>" + store.PopsStatus : '');
                    }
                },
                {
                    key: 'PaysDeliveryDate', title: 'PAYS<br/>Delivery', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                            (store.PaysStatus !== "" ? "</br>PAYS: " + store.PaysStatus : '') +
                            (store.ServerEps !== "" ? "</br>ServerEPS: " + store.ServerEps : '') +
                            (store.CirronetStatus !== "" ? "</br>PosData: " + store.CirronetStatus : '');
                    }
                },
                {
                    key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                            (store.AudioStatus !== "" ? "</br>" + store.AudioStatus : '');
                    }
                },
                {
                    key: 'InstallDate', title: 'Install<br/>Date', transform: function (date, store, stores, index) {
                        return (date !== '' ? moment(date).format('l') : '') +
                            (store.InstallationStatus !== "" ? "</br>" + store.InstallationStatus : '');
                    }
                },
                { key: 'PosConfigDate', title: 'POS CAL<br/>Date', transform: 'date' },
                { key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', transform: 'date' },
                { key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date' },
                { key: 'ProjectManager', title: 'IT PM' },
                { key: 'ConstructionManager', title: 'Construction PM' },
                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                }

            ];

            //Define report title
            var title = 'Project Review';

            /* Define sorting
                This will first find the lowest date that's greater than today, then compare it to the same in the second date and return the appropriate integer to sort by
             */
            var sort = {
                key: sortKey,
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