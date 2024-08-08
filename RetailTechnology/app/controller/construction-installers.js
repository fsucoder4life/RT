define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {

            var stores2 = [];

            options = options || {};
            //Build query
            

            //console.log(query);

            var CSquery = "<Query><Where><In><FieldRef Name='Store_x0020_Number' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                CAMLRowLimit: 990,
                listName: "Combined Schedule",
                CAMLQuery: "<Query><Where><And><Geq><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><Value IncludeTimeValue='False' Type='DateTime'>2016-04-01T05:00:00.000Z</Value></Geq><Or><Eq><FieldRef Name='Project_x0020_Type' /><Value Type='Text'>New</Value></Eq><Or><Eq><FieldRef Name='Project_x0020_Type' /><Value Type='Text'>Remodel</Value></Eq><Or><Eq><FieldRef Name='Project_x0020_Type' /><Value Type='Text'>Relocation</Value></Eq><Eq><FieldRef Name='Project_x0020_Type' /><Value Type='Text'>Rebuild</Value></Eq></Or></Or></Or></And></Where><OrderBy><FieldRef Name='GO_x0020_LIVE_x0020_DATE' Ascending='False' /></OrderBy></Query>",
                CAMLViewFields: "<ViewFields><FieldRef Name='ID'/><FieldRef Name='Installation_x0020_Company' /><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><FieldRef Name='Title' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /><FieldRef Name='POPS_x0020_Install_x0020_Date' /><FieldRef Name='Lead_x0020_Technician' /><FieldRef Name='POPS_x0020_Installer' /><FieldRef Name='IT_x0020_Project_x0020_Manager' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var storeId = $(this).attr("ows_ID");
                        store.ID = storeId;
                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;

                        store.ProjectType = $(this).attr("ows_Project_x0020_Type");
                        if (!store.ProjectType)
                            store.ProjectType = "";

                        store.GoLiveDate = $(this).attr("ows_GO_x0020_LIVE_x0020_DATE");
                        if (!store.GoLiveDate)
                            store.GoLiveDate = "";

                        store.Pos = $(this).attr("ows_POS_x0020_Selection");
                        if (!store.Pos)
                            store.Pos = "";

                        store.City = $(this).attr("ows_City");
                        if (!store.City)
                            store.City = "";

                        store.State = $(this).attr("ows_State_x0020_");
                        if (!store.State)
                            store.State = "";

                        store.InstallDate = $(this).attr("ows_POPS_x0020_Install_x0020_Date");
                        if (!store.InstallDate)
                            store.InstallDate = "";

                        store.LeadTechnician = $(this).attr("ows_Lead_x0020_Technician");
                        if (!store.LeadTechnician)
                            store.LeadTechnician = "";

                        store.Installer = $(this).attr("ows_Installation_x0020_Company");
                        if (!store.Installer)
                            store.Installer = "";

                        store.ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        if (!store.ProjectManager)
                            store.ProjectManager = "";

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
                listName: "Construction_Calls",
                CAMLQuery: CSquery,
                CAMLViewFields: "<ViewFields><FieldRef Name='ID'/><FieldRef Name='Store_x0020_Number' /><FieldRef Name='Installer_x0020_Arrival_x0020_Da' /><FieldRef Name='Project_x0020_Status' /><FieldRef Name='Test_x0020_Transaction_x0020_Sta' /><FieldRef Name='Install_x0020_Signoff_x0020_Stat' /><FieldRef Name='POS_x0020_Quote_x0020_Status' /><FieldRef Name='Installation_x0020_Status' /><FieldRef Name='Overnight_x0020_Install' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        const rowId = extractRowId($(this).attr("ows_Store_x0020_Number"));
                       // console.log("rowId: " + rowId + " | store Number: " + storeNum);                        
                        for (var i = 0; i < stores2.length; i++) {
                            //console.log("inside for: StoreNumber" + stores2[i].StoreNumber)
                            if (stores2[i].StoreNumber == storeNum) {
                                //console.log("StoreNumber match found: " + stores2[i].StoreNumber + " - " + storeNum + " - " + $(this).attr("POS_x0020_Type"));
                               
                                stores2[i].CombinedId = rowId;
                                stores2[i].InstallDate = $(this).attr("ows_Installer_x0020_Arrival_x0020_Da");
                                if (!stores2[i].InstallDate)
                                    stores2[i].InstallDate = "";

                                stores2[i].ProjectStatus = $(this).attr("ows_Project_x0020_Status");
                                if (!stores2[i].ProjectStatus)
                                    stores2[i].ProjectStatus = "";

                                stores2[i].TestTransactionStatus = $(this).attr("ows_Test_x0020_Transaction_x0020_Sta");
                                if (!stores2[i].TestTransactionStatus)
                                    stores2[i].TestTransactionStatus = "";

                                stores2[i].InstallSignoffStatus = $(this).attr("ows_Install_x0020_Signoff_x0020_Stat");
                                if (!stores2[i].InstallSignoffStatus)
                                    stores2[i].InstallSignoffStatus = "";

                                stores2[i].InstallationStatus = $(this).attr("ows_Installation_x0020_Status");
                                if (!stores2[i].InstallationStatus)
                                    stores2[i].InstallationStatus = "";

                                stores2[i].OvernightInstall = $(this).attr("ows_Overnight_x0020_Install");
                                if (!stores2[i].OvernightInstall)
                                    stores2[i].OvernightInstall = "";

                                
                                
                                

                                
                                break;
                            }
                        }
                    });
                }
            });

            function extractRowId(storeNumberString) {
                // Find the position of the first occurrence of "'"
                const start = storeNumberString.indexOf("'") + 1;
                // Find the position of the first occurrence of ";#"
                const end = storeNumberString.indexOf(";#");
                // Extract the substring between the start and end positions
                const rowId = storeNumberString.substring(start, end);
                return rowId;
            }
            function replaceAll(str, find, replace) {
                return str.replace(new RegExp(find, 'g'), replace);
            }

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS'},
                {key: 'InstallationStatus', title: 'Quote<br/>Status', editable: true},
                {key: 'InstallSignoffStatus', title: 'Signoffs', editable: true},
                {key: 'TestTransactionStatus', title: 'Test<br/>Transactions', editable: true},
                {key: 'ProjectStatus', title: 'Project<br/>Status', editable: true},
                {key: 'OvernightInstall', title: 'Install<br/>Time', editable: true},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                {key: 'LeadTechnician', title: 'Lead Tech', editable: true},
                {key: 'Installer', title: 'Installer', editable: true},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Construction Installers  - Upcoming Projects';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define passed sorting values
            if (typeof options.sort !== 'undefined') {
                sort.key = options.sort;
            }
            //Custom sort for install date
            if (typeof options.sort !== 'undefined' && options.sort === "InstallDate") {
                sort = function (arr) {
                    arr.sort(function (a, b) {
                        //Create a fake date of 10 days before openig if it doesn't exists
                        if (a.InstallDate === '') {
                            a = moment(a.GoLiveDate).add(-10, 'days').toISOString();
                        } else {
                            a = a.InstallDate;
                        }

                        if (b.InstallDate === '') {
                            b = moment(b.GoLiveDate).add(-10, 'days').toISOString();
                        } else {
                            b = b.InstallDate;
                        }

                        if (a > b) {
                            return 1;
                        } else if (a < b) {
                            return -1;
                        }

                        return 0;
                    });
                    return arr;
                }
            }

            //Define filtering - remove stores after both signoffs and project are complete
            var filter = function (arr) {
                var keepers = [];
                // _.forEach(arr, function (store, index) {
                //     console.log(store.StoreNumber, (typeof store.ProjectStatus !== 'undefined' ? store.ProjectStatus : 'ERROR'));
                // });
                _.forEach(arr, function (store, index) {
                    if (store.ProjectStatus)
                    if (store.ProjectStatus.toUpperCase().indexOf('COMPLETE') === -1 || (store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') === -1 && store.InstallSignoffStatus.toUpperCase().indexOf('FAILURE TO SUBMIT') === -1 && store.TestTransactionStatus.toUpperCase().indexOf('YES') === -1)){
                        keepers.push(store);
                    }
                });

                return keepers;
            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

            //Show report
            report.render({
                data: stores2,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});