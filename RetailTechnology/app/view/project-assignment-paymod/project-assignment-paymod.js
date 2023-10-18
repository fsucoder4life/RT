define([
        'app/store/construction',
        'app/store/combined',
        'dojo/text!app/view/project-assignment-paymod/project-assignment-paymod.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip'
], function (construction, combined, template, TextBox, Button, report, registry, Tooltip) {

    return {
        render: function (options) {
            var me = {};

            //Add the template to the content area
            $(options.target).html(template);
            //innerHTML is making it here - but not showing in template.

            //Show Workload
            report.render({
                data: options.workload,
                columns: [
                    { key: 'ProjectManager', title: 'IT PM' },
                    { key: 'Active', title: 'Active' },
                    { key: 'Workload', title: 'Total' }
                ],
                target: $('#workload'),
                routeCheck: options.routeCheck
            });
            //Show Quarters

            for (var i = 0; i < options.workload.length; i++) {

                $("div#workload #stores tbody").append("<tr><td>" + options.workload[i].ProjectManager + "</td><td>" + options.workload[i].Active + "</td><td>" + options.workload[i].Workload + "</td></tr>");
                //Do something
            }


            $('#quarters-header').html('Fiscal Year ' + options.fiscalYear + ' (New / Total)');
            report.render({
                data: options.quarters,
                columns: [
                    { key: 'Quarter', title: 'Quarter' },
                    { key: 'InitialCount', title: 'Initial' },
                    { key: 'Count', title: 'Current' }
                ],
                target: $('#quarters'),
                routeCheck: options.routeCheck
            });

            for (var i = 0; i < options.quarters.length; i++) {
                $("div#quarters #stores tbody").append("<tr><td>" + options.quarters[i].Quarter + "</td><td>" + options.quarters[i].Count + "</td><td>" + options.quarters[i].InitialCount + "</td></tr>");
                //Do something
            }

            //Show the reports - first the next 90 days

            //START

            var stores = [];
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            $().SPServices({
                operation: "GetListItems",
                CAMLRowLimit: 990,
                listName: "Combined Construction Extend",
                CAMLQuery: "<Query><Where><And><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq><Leq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today OffsetDays='90' /></Value></Leq></And></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live' /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};

                        store.VP6800ITPM = $(this).attr("ows_VP6800_x0020_IT_x0020_PM");
                        if (!store.VP6800ITPM)
                            store.VP6800ITPM = "";
                        store.ProjectType = "PAYMENT";

                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.ProjectStatus = "Active";
                        
                        store.VP6800GoLive = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");
                        store.VP6800IntroCallToFee = $(this).attr("ows_VP6800_x0020_Intro_x0020_Call_x0");
                        store.VP6800InstallScheduled = $(this).attr("ows_VP6800_x0020_Install_x0020_Sched");
                        store.VP680030DayComm = $(this).attr("ows_VP6800_x0020_30_x0020_Day_x0020_");
                        store.VP68002WeekComm = $(this).attr("ows_VP6800_x0020_2_x0020_Week_x0020_");
                        store.VP68001WeekComm = $(this).attr("ows_VP6800_x0020_1_x0020_Week_x0020_");
                        store.VP6800DayBeforeInstallComm = $(this).attr("ows_VP6800_x0020_Day_x0020_Before_x0");

                        stores.push(store);
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
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var storeNum = $(this).attr("ows_Title");

                        for (var i = 0; i < stores.length; i++) {
                            if (stores[i].StoreNumber == storeNum) {

                                stores[i].CombinedId = $(this).attr("ows_ID");

                                stores[i].FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                                if (!stores[i].FranchiseGroup)
                                    stores[i].FranchiseGroup = "";



                                stores[i].City = $(this).attr("ows_City");
                                if (!stores[i].City)
                                    stores[i].City = "";

                                stores[i].State = $(this).attr("ows_State_x0020_");
                                if (!stores[i].State)
                                    stores[i].State = "";



                                break;
                            }
                        }
                    });
                }
            });

            //load up stores, then complete following:
            report.render({
                data: stores,
                columns: [
                  { key: 'ProjectType', title: 'Type' },
                  { key: 'StoreNumber', title: 'No.' },
                  { key: 'ProjectStatus', title: 'Status' },
                  {
                      key: 'City', title: 'Location', transform: function (value, row, data, index) {
                          return "<a class='link' href='#summary/" + row.StoreNumber + "'>" + row.City + ", " + row.State + "</a>";
                      }
                  },
                  { key: 'VP6800ITPM', title: 'IT PM',  minWidth: '100px', editable:true },
                  { key: 'FranchiseGroup', title: 'Franchisee' },
                  { key: 'VP6800GoLive', title: 'Go Live', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP6800IntroCallToFee', title: 'Intro Call', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP6800InstallScheduled', title: 'Install Scheduled', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP680030DayComm', title: '30 Day Comm', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP68002WeekComm', title: '2 Week Comm', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP68001WeekComm', title: '1 Week Comm', transform: 'date', minWidth: '100px', editable: true },
                  { key: 'VP6800DayBeforeInstallComm', title: 'Day Before Comm', transform: 'date', minWidth: '100px', editable: true }
                  

                ],
                sort: {
                    key: 'VP6800GoLive',
                    direction: 'DESC'
                },
                target: $('#start'),
                routeCheck: options.routeCheck
            });



            //Fire callback if passed
            if (options.callback) {
                options.callback(me);
            }
        }
    };
}
);