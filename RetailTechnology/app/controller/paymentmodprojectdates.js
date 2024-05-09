async function ApplyFilters() {

    var startDate = "";
    var endDate = "";
    var itpm = "";
    var sortByGoLiveDate = "";
    var franchisee = "";
    var sitesurveycompleted = "";
    var orderdocsent = "";

    if ($("#start-date").val().length > 0) {
        var m = moment($("#start-date").val(), 'MM/DD/YYYY');
        startDate = "/start/" + m.format('YYYY-MM-DD');
    }

    if ($("#end-date").val().length > 0) {
        var m = moment($("#end-date").val(), 'MM/DD/YYYY');
        endDate = "/end/" + m.format('YYYY-MM-DD');
    }
    if ($("#itpm option:selected").val() !== "ALL")
        itpm = "/itpm/" + $("#itpm option:selected").val();

    if ($("input[name='golivedate']:checked").val() === "descending")
        sortByGoLiveDate = "/golivedate/" + "descending";

    if ($("#Franchisee").val().length > 0)
        franchisee = "/franchisee/" + $("#Franchisee").val();

    if ($("input[name='sitesurveycompleted']:checked").val() !== "ALL")
        sitesurveycompleted = "/sitesurveycompleted/" + $("input[name='sitesurveycompleted']:checked").val();

    if ($("input[name='orderdocsent']:checked").val() !== "ALL")
        orderdocsent = "/orderdocsent/" + $("input[name='orderdocsent']:checked").val();


    window.location.href = "https://www.sonicpartnernet.com/Scoop/Information%20Services/PMT/Roll%20Out/SitePages/RetailTechnology/index.aspx#reports/paymentmodprojectdates" + itpm + startDate + endDate + sortByGoLiveDate + franchisee + sitesurveycompleted + orderdocsent;
    window.location.reload();
}

define(['app/view/reportPaymentmodprojectdates', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend', 'app/rules/paymentmod'], function (report, combined, construction, combinedconstructionextend, paymentmodRules) {
    return {
        show: function (target, routeCheck, options) {
            var stores2 = [];

            var startDate = "";
            var endDate = "";
            var itpm = "";
            var sortByGoLiveDate = "";
            var franchisee = "";
            var sitesurveycompleted = "";
            var orderdocsent = "";
            var hashURL = window.location.hash.substr(1);
            var hashes = hashURL.split('/');

            if (hashes.length > 1) {

                // Typical For loop. We start at 1 and not 0 since the array length starts counting at 1 but the array counts positions starting at 0
                for (var i = 1; i < hashes.length; i++) {

                    // Run the function. We run the # value through the window to grab the function. This is a bit harder to explain so just take my word for it
                    if (hashes[i] === "start")
                        startDate = hashes[i + 1];
                    else if (hashes[i] === "end")
                        endDate = hashes[i + 1];
                    else if (hashes[i] === "itpm")
                        itpm = hashes[i + 1];
                    else if (hashes[i] === "golivedate")
                        sortByGoLiveDate = hashes[i + 1];
                    else if (hashes[i] === "franchisee")
                        franchisee = hashes[i + 1];
                    else if (hashes[i] === "sitesurveycompleted")
                        sitesurveycompleted = hashes[i + 1];
                    else if (hashes[i] === "orderdocsent")
                        orderdocsent = hashes[i + 1];
                }
            }

            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            var CAMLQuery = "";
            if (startDate.length > 0 && endDate.length > 0)
                CAMLQuery = "<Query><Where><And><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + startDate + "</Value></Geq><Leq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + endDate + "</Value></Leq></And></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live'  /></OrderBy></Query>";
            else if (startDate.length > 0)
                CAMLQuery = "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + startDate + "</Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live'  /></OrderBy></Query>";
            else if (endDate.length > 0)
                CAMLQuery = "<Query><Where><Leq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + endDate + "</Value></Leq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live'  /></OrderBy></Query>";
            else
                CAMLQuery = "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live'  /></OrderBy></Query>";

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLRowLimit: 990,
                CAMLQuery: CAMLQuery,
                CAMLViewFields: "<ViewFields Properties='True' />",
                //CAMLQuery: "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live'  /></OrderBy></Query>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};
                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;


                        store.VP6800Delivery = $(this).attr("ows_VP6800_x0020_Delivery");
                        if (!store.VP6800Delivery)
                            store.VP6800Delivery = "";

                        store.VP6800SiteSurveyRequested = $(this).attr("ows_VP6800_x0020_Site_x0020_Survey_x");
                        if (!store.VP6800SiteSurveyRequested)
                            store.VP6800SiteSurveyRequested = "";


                        store.VP6800SiteSurveyResultsReviewed = $(this).attr("ows_VP6800_x0020_Site_x0020_Survey_x3");
                        if (!store.VP6800SiteSurveyResultsReviewed)
                            store.VP6800SiteSurveyResultsReviewed = "";

                        store.VP6800SiteSurveyCompleted = $(this).attr("ows_VP6800_x0020_SITE_x0020_SURVEY_x2");
                        if (!store.VP6800SiteSurveyCompleted)
                            store.VP6800SiteSurveyCompleted = "";

                        
                        

                        store.VP6800GoLive = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");
                        if (!store.VP6800GoLive)
                            store.VP6800GoLive = "";

                        store.VP6800ITPM = $(this).attr("ows_VP6800_x0020_IT_x0020_PM");
                        if (!store.VP6800ITPM)
                            store.VP6800ITPM = "";

                        store.VP6800Installer = $(this).attr("ows_VP6800_x0020_Installer");
                        if (!store.VP6800Installer)
                            store.VP6800Installer = "";

                        store.VP6800IntroCallToFee = $(this).attr("ows_VP6800_x0020_Intro_x0020_Call_x0");
                        if (!store.VP6800IntroCallToFee)
                            store.VP6800IntroCallToFee = "";

                        store.VP6800ProjectSiteSurveyCompany = $(this).attr("ows_VP6800_x0020_Project_x0020_Site_0");
                        if (!store.VP6800ProjectSiteSurveyCompany)
                            store.VP6800ProjectSiteSurveyCompany = "";

                        store.VP6800HughesDoctoFEE = $(this).attr("ows_VP6800_x0020_Hughes_x0020_Doc_x0");
                        if (!store.VP6800HughesDoctoFEE)
                            store.VP6800HughesDoctoFEE = "";

                        store.VP6800HughesDoctoHughes = $(this).attr("ows_VP6800_x0020_Hughes_x0020_Doc_x00");
                        if (!store.VP6800HughesDoctoHughes)
                            store.VP6800HughesDoctoHughes = "";

                        store.VP6800SiteSurveyConfirmedbyInstaller = $(this).attr("ows_VP6800_x0020_Site_x0020_Survey_x0");
                        if (!store.VP6800SiteSurveyConfirmedbyInstaller)
                            store.VP6800SiteSurveyConfirmedbyInstaller = "";

                        store.VP6800ProjectSiteSurveyDate = $(this).attr("ows_VP6800_x0020_Project_x0020_Site_");
                        if (!store.VP6800ProjectSiteSurveyDate)
                            store.VP6800ProjectSiteSurveyDate = "";

                        store.VP6800ReviewSignOffs = $(this).attr("ows_VP6800_x0020_Review_x0020_Sign_x");
                        if (!store.VP6800ReviewSignOffs)
                            store.VP6800ReviewSignOffs = "";

                        store.VP6800OrderDocSenttoFee = $(this).attr("ows_VP6800_x0020_Order_x0020_Doc_x00");
                        if (!store.VP6800OrderDocSenttoFee)
                            store.VP6800OrderDocSenttoFee = "";

                        store.VP6800Ordered = $(this).attr("ows_VP6800_x0020_Ordered");
                        if (!store.VP6800Ordered)
                            store.VP6800Ordered = "";

                        store.VP6800InstallScheduled = $(this).attr("ows_VP6800_x0020_Install_x0020_Sched");
                        if (!store.VP6800InstallScheduled)
                            store.VP6800InstallScheduled = "";

                        store.VP680030DayComm = $(this).attr("ows_VP6800_x0020_30_x0020_Day_x0020_");
                        if (!store.VP680030DayComm)
                            store.VP680030DayComm = "";

                        store.VP68002WeekComm = $(this).attr("ows_VP6800_x0020_2_x0020_Week_x0020_");
                        if (!store.VP68002WeekComm)
                            store.VP68002WeekComm = "";

                        store.VP68001WeekComm = $(this).attr("ows_VP6800_x0020_1_x0020_Week_x0020_");
                        if (!store.VP68001WeekComm)
                            store.VP68001WeekComm = "";

                        store.VP6800DayBeforeInstallComm = $(this).attr("ows_VP6800_x0020_Day_x0020_Before_x0");
                        if (!store.VP6800DayBeforeInstallComm)
                            store.VP6800DayBeforeInstallComm = "";

                        store.RMAOrOpen = $(this).attr("ows_RMA_x0020_OR_x0020_OPEN_x0020_IT");
                        if (!store.RMAOrOpen)
                            store.RMAOrOpen = "";

                        store.VP6800Level10TrackingNum = $(this).attr("ows_Level_x0020_10_x0020_Tracking_x0");
                        if (!store.VP6800Level10TrackingNum)
                            store.VP6800Level10TrackingNum = "";

                        if (options == null) { }
                        else
                        {
                            if (typeof options.itpm !== 'undefined') {
                                if (store.VP6800ITPM.toUpperCase().indexOf(options.itpm.toUpperCase()) > -1)
                                { }
                                else
                                    return true;
                            }
                            if (typeof options.sitesurveycompleted !== 'undefined') {
                                if (options.sitesurveycompleted.toUpperCase() === "YES") {
                                    //if not blank, show record
                                    if (store.VP6800ProjectSiteSurveyDate.length > 0)
                                    { }
                                    else
                                        return true;
                                }
                                else if (options.sitesurveycompleted.toUpperCase() === "NO") {
                                    if (store.VP6800ProjectSiteSurveyDate.length > 0)
                                        return true;
                                }
                            }
                            if (typeof options.orderdocsent !== 'undefined') {
                                if (options.orderdocsent.toUpperCase() === "YES") {
                                    //if not blank, show record
                                    if (store.VP6800OrderDocSenttoFee.length > 0)
                                    { }
                                    else
                                        return true;
                                }
                                else if (options.orderdocsent.toUpperCase() === "NO") {
                                    if (store.VP6800OrderDocSenttoFee.length > 0)
                                        return true;
                                }
                            }

                        }

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
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Market_x0020_DMA_x0020_Name_x002' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /></ViewFields>",
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

                                if (options == null) { }
                                else
                                {
                                    if (typeof options.franchisee !== 'undefined') {
                                        if (stores2[i].FranchiseGroup.toUpperCase().indexOf(options.franchisee.toUpperCase()) > -1)
                                        { }
                                        else
                                            stores2[i].StoreNumber = "XXXX"; //later this will remove the record from array
                                    }
                                }

                                stores2[i].DMA = $(this).attr("ows_Market_x0020_DMA_x0020_Name_x002");
                                if (!stores2[i].DMA)
                                    stores2[i].DMA = "";

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

            var i = stores2.length
            while (i--) {
                if (stores2[i].StoreNumber === "XXXX") {
                    stores2.splice(i, 1);
                }
            }

            //Define Report Columns
            var columns = [
                {
                    key: 'StoreNumber', title: 'Store', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>" + value + "</a>"
                    }
                },
                {
                    key: 'VP6800GoLive', title: 'Scheduled Go-Live', transform: function (value, row, data, index) {
                        if (value)
                            return moment(value).format('MM/DD/YYYY');
                        else
                            return "";
                    }, editable: true
                },
                { key: 'FranchiseGroup', title: 'FranchiseGroup' },
                { key: 'DMA', title: 'DMA' },

                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'VP6800ITPM', title: 'PM' },
                { key: 'VP6800Installer', title: 'Install Team' },


                { key: 'VP6800IntroCallToFee', title: 'Intro Call', transform: 'date', editable: true },
                { key: 'VP6800SiteSurveyRequested', title: 'Site Survey Requested (Installation Company Assigned)', transform: 'date', editable: true },
                { key: 'VP6800HughesDoctoFEE', title: 'Hughes Document sent to FRAN', transform: 'date', editable: true },
                { key: 'VP6800HughesDoctoHughes', title: 'Hughes Document sent to Hughes', transform: 'date', editable: true },
                { key: 'VP6800SiteSurveyConfirmedbyInstaller', title: 'Site Survey Schedule Confirmed by Installation Company', transform: 'date', editable: true },

                { key: 'VP6800SiteSurveyCompleted', title: 'SITE SURVEY COMPLETED', transform: 'date', editable: true },
                { key: 'VP6800SiteSurveyResultsReviewed', title: 'Site Survey Results Reviewed with FRAN', transform: 'date', editable: true },
                { key: 'VP6800OrderDocSenttoFee', title: 'Order Documents sent to FRAN', transform: 'date', editable: true },

                { key: 'VP6800InstallScheduled', title: 'INSTALL SCHEDULED', transform: 'date', editable: true },

                { key: 'VP6800Ordered', title: 'ORDER PLACED', transform: 'date', editable: true },

                { key: 'VP680030DayComm', title: '30 DAYS COMMS', transform: 'date', editable: true },
                { key: 'VP68002WeekComm', title: '2 WEEK COMMS', transform: 'date', editable: true },
                { key: 'VP68001WeekComm', title: '1 WEEK COMMS', transform: 'date', editable: true },
                { key: 'VP6800DayBeforeInstallComm', title: '1 DAY COMMS', transform: 'date', editable: true },

                { key: 'VP6800Level10TrackingNum', title: 'Level 10 Tracking #', editable: true },
                { key: 'VP6800Delivery', title: 'DELIVERY<br />DATE', transform: 'date', editable: true },

                { key: 'VP6800ReviewSignOffs', title: 'REVIEW<br />SIGN-OFFS', transform: 'date', editable: true },
                { key: 'RMAOrOpen', title: 'RMA OR<br />OPEN ITEMS', editable: true },







            ];

            //Define report title
            var title = 'Next Gen Pays Readiness Report';

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
            
            else if (hashLoc.indexOf("golivedate") > -1) {
                hashSort = hashLoc.substring(hashLoc.indexOf("golivedate") + 5);
                sort = {
                    key: 'VP6800GoLive',
                    direction: 'ASC'
                };
            }
            else
                sort = {
                    key: 'VP6800GoLive',
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