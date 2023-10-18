define(['app/view/report', 'app/store/combined', 'app/rules/construction', 'app/email', 'app/widget/widgetHelper', 'app/rules/construction'], function (report, combined, constructionRules, email, widgetHelper, rules) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
            //Build query
            var combinedComplete = false,
    constructionComplete = false,
    otherComplete = false,
    stores = [];


            var combinedQuery = new CamlBuilder().Where().All(

                CamlBuilder.Expression().Any(

                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment().add({ days: -1 }).format('YYYY-MM-DD')) //subtract a day to grab the deliveries that deliver on saturday, imply sunday install

                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POS_x0020_Pre_x002d_Cable').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    )
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({ query: combinedQuery }, function (data) {
                var today = moment().format('YYYY-MM-DD'),

                    keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {

                    var posInstall = moment(store.GoLiveDate).subtract({ days: 1 }),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                        audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                        //audioPreCable = moment(store.AudioDeliveryDate).format('YYYY-MM-DD'),
                        posPreCable = moment(store.PosPreCableDate).format('YYYY-MM-DD'),
                        popsPreCable = moment(store.PopsPreCableDate).format('YYYY-MM-DD'),
                        //Determine the POPS go-Live date based on whether or not it was delivered on saturday which implies a sunday install
                        popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsDelivery).add({ days: 2 }).format('YYYY-MM-DD') : moment(popsDelivery).add({ days: 1 }).format('YYYY-MM-DD');



                    if ((posInstall != 'Invalid date') && (posInstall.diff(moment(store.PopsDeliveryDate)) == 0 && store.GoLiveDate > today)) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = posInstall.format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS';
                        keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (store.GoLiveDate > today) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = posInstall.format('YYYY-MM-DD');
                            copy.InstallType = 'POS';
                            keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((popsDelivery != 'Invalid date') && (today <= popsDelivery || (today <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6"))) {
                            copy = _.clone(store);
                            //If on a saturday, install is sunday, go-live is on monday
                            if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is on monday
                            } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is the morning after
                            }
                            copy.InstallType = 'POPS Conversion';

                            keepers.push(copy);
                        }
                    }

                    //Add audio pre-cable HME projects


                    //Add the Audio projects
                    if ((audioInstall != 'Invalid date') && today <= audioInstall) {
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioInstallDate;
                        copy.InstallType = 'Audio Conversion';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({ days: 3 }).format('YYYY-MM-DD');      //go live is the morning after
                        keepers.push(copy);
                    }



                    //Add the POS Pre-Cable projects
                    if ((posPreCable != 'Invalid date') && (store.PosPreCableDate !== '' && today <= posPreCable)) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PosPreCableDate;
                        copy.InstallType = 'POS Pre-Cable';
                        copy.GoLiveDate = store.GoLiveDate;
                        keepers.push(copy);
                    }

                    //Add the POPS Pre-Cable projects
                    if ((popsPreCable != 'Invalid date') && (today <= popsPreCable)) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PopsPreCableDate;
                        copy.InstallType = 'POPS Pre-Cable';
                        copy.GoLiveDate = popsGoLive;
                        keepers.push(copy);
                    }

                    //add the POS > Delivery Date

                });

                //Notify complete
                stores = stores.concat(keepers);
                combinedComplete = true;
                complete();
            });

            //Build construction query
            var constructionQuery = new CamlBuilder().Where().Any(
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)

                    )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({ query: constructionQuery }, function (data) {
                //Give them all the type of construction
                _.forEach(data, function (store) {
                    store.InstallType = 'Construction';
                });

                //Notify complete
                stores = stores.concat(data);
                constructionComplete = true;
                complete();
            });

            //add stores for: POS > Delivery (POS > Oracle 5810 Server Delivery) (ows_Oracle_x0020_5810_x0020_Server_x)
            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='State_x0020_' /><FieldRef Name='Market_x0020_Leader' /><FieldRef Name='Senior_x0020_Vice_x0020_Presiden' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='City' /><FieldRef Name='State' /><FieldRef Name='Installation_x0020_Company' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Title' /><FieldRef Name='Oracle_x0020_5810_x0020_Server_x' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Oracle_x0020_5810_x0020_Server_x' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Oracle_x0020_5810_x0020_Server_x' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_Oracle_x0020_5810_x0020_Server_x")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "POS - Oracle 5810 Server Delivery - Delivery Date";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_Installation_x0020_Company");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);



                    });

                }
            });

            //For FABCON > Go-Live Date, it uses:
            //ows_GO_x0020_LIVE_x0020_DATE
            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='State_x0020_' /><FieldRef Name='Market_x0020_Leader' /><FieldRef Name='Senior_x0020_Vice_x0020_Presiden' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='City' /><FieldRef Name='State' /><FieldRef Name='Installation_x0020_Company' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Title' /><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='GO_x0020_LIVE_x0020_DATE' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_GO_x0020_LIVE_x0020_DATE")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "Construction / FABCON - Go-Live Date";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_Installation_x0020_Company");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);



                    });

                }
            });

            //for AUdio > Go-Live (conversion stores)
            //ows_Audio_x0020_Go_x0020_Live_x0020_

            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='State_x0020_' /><FieldRef Name='Market_x0020_Leader' /><FieldRef Name='Senior_x0020_Vice_x0020_Presiden' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='City' /><FieldRef Name='State' /><FieldRef Name='Audio_x0020_Installer' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Title' /><FieldRef Name='Audio_x0020_Go_x0020_Live_x0020_' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Audio_x0020_Go_x0020_Live_x0020_' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Audio_x0020_Go_x0020_Live_x0020_' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_Audio_x0020_Go_x0020_Live_x0020_")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "Audio - Go-Live Date";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_Audio_x0020_Installer");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);



                    });

                }
            });

            //ows_DT_x0020_POPS_x0020_Install_x002

            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='State_x0020_' /><FieldRef Name='Market_x0020_Leader' /><FieldRef Name='Senior_x0020_Vice_x0020_Presiden' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='City' /><FieldRef Name='State' /><FieldRef Name='DT_x0020_POPS_x0020_Installer' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Title' /><FieldRef Name='DT_x0020_POPS_x0020_Install_x002' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='DT_x0020_POPS_x0020_Install_x002' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='DT_x0020_POPS_x0020_Install_x002' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_DT_x0020_POPS_x0020_Install_x002")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Title");
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "DT POPS - Install Date";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_DT_x0020_POPS_x0020_Installer");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);



                    });

                }
            });

            //OracleServerUpgradeGoLive
            //Oracle Server Upgrade (actual upgrade of server)
            //ows_Oracle_x0020_Server_x0020_Upgrad2

            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Construction_Calls",
                CAMLViewFields: "<ViewFields><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2' /><FieldRef Name='Store_x0020_Number' /><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad3' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad2' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad2")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + 2);
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "Oracle Server Upgrade (actual upgrade of server)";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad3");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);

                    });

                }
            });


            //OracleServerUpgradeGoLive2 
            //Oracle Server Windows Upgrade (actual upgrade of server)
            //ows_Oracle_x0020_Server_x0020_Upgrad6

            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Construction_Calls",
                CAMLViewFields: "<ViewFields><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad6' /><FieldRef Name='Store_x0020_Number' /><FieldRef Name='InstallerForWindows10Upgrade' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad6' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='Oracle_x0020_Server_x0020_Upgrad6' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_Oracle_x0020_Server_x0020_Upgrad6")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + 2);
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "Oracle Server Upgrade (win10 upgrade date)";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_InstallerForWindows10Upgrade");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);

                    });

                }
            });

            //OracleServerUpgradeGoLive2 
            //Oracle Server Windows Upgrade (actual upgrade of server)
            //ows_Oracle_x0020_Server_x0020_Upgrad6

            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                CAMLViewFields: "<ViewFields><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><FieldRef Name='Store_x0020_Number' /><FieldRef Name='VP6800_x0020_Installer' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value Type='DateTime'><Today /></Value></Geq></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var today = moment().format('YYYY-MM-DD');

                        var popsDeliveryDate = moment($(this).attr("ows_VP6800_x0020_Go_x0020_Live")).format('YYYY-MM-DD');

                        var storeNum = $(this).attr("ows_Store_x0020_Number");
                        storeNum = storeNum.substring(storeNum.indexOf(";#") + 2);
                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.GoLiveDate = popsDeliveryDate;
                        store.InstallDate = popsDeliveryDate;
                        store.InstallType = "Next Gen Pays - Go-Live";
                        store.FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        store.City = $(this).attr("ows_City");
                        store.State = $(this).attr("ows_State_x0020_");
                        store.Installer = $(this).attr("ows_VP6800_x0020_Installer");
                        if (!store.Installer)
                            store.Installer = "";

                        store.MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                        store.SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                        store.RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                        stores.push(store);

                    });
                    var CAMLIn = "";
                    var storeCounter = 0;
                    var stoppedati = 0;
                    for (var i = 0; i < stores.length; i++) {
                        if (!stores[i].State) {
                            storeCounter++;
                            CAMLIn += "<Value Type='Number'>" + stores[i].StoreNumber + "</Value>";
                            if (storeCounter >= 499) {
                                stoppedati = i;
                                break;
                            }

                        }
                    }
                    FillUndefined(CAMLIn);

                    if (storeCounter >= 499) {
                        //console.log("first " + storeCounter);
                        CAMLIn = "";
                        var storeCounter = 0;
                        for (var i = stoppedati + 1; i < stores.length; i++) {
                            if (!stores[i].State) {
                                storeCounter++;
                                CAMLIn += "<Value Type='Number'>" + stores[i].StoreNumber + "</Value>";
                                if (storeCounter >= 499) {
                                    stoppedati = i;
                                    break;
                                }

                            }
                        }
                        FillUndefined(CAMLIn);
                        //console.log("second " + storeCounter);
                    }

                    function FillUndefined(CAMLIn2) {
                        //lookup all stores that have undefined state and fill them in using Combined Schedule

                        $().SPServices({
                            async: false,
                            operation: "GetListItems",
                            listName: "Combined Schedule",
                            CAMLViewFields: "<ViewFields><FieldRef Name='IT_x0020_Project_x0020_Manager' /><FieldRef Name='State_x0020_' /><FieldRef Name='Market_x0020_Leader' /><FieldRef Name='Senior_x0020_Vice_x0020_Presiden' /><FieldRef Name='Regional_x0020_Vice_x0020_Presid' /><FieldRef Name='City' /><FieldRef Name='State' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='Title' /></ViewFields>",
                            CAMLQuery: "<Query><Where><In><FieldRef Name='Title' /><Values>" + CAMLIn2 + "</Values></In></Where></Query>",
                            completefunc: function (xData, Status) {
                                $(xData.responseXML).SPFilterNode("z:row").each(function () {


                                    for (var i = 0; i < stores.length; i++) {
                                        if (stores[i].StoreNumber === $(this).attr("ows_Title")) {
                                            stores[i].FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                                            stores[i].ProjectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                                            stores[i].City = $(this).attr("ows_City");
                                            stores[i].State = $(this).attr("ows_State_x0020_");

                                            stores[i].MarketLeader = $(this).attr("ows_Market_x0020_Leader");
                                            stores[i].SeniorVicePresident = $(this).attr("ows_Senior_x0020_Vice_x0020_Presiden");
                                            stores[i].RegionalVicePresident = $(this).attr("ows_Regional_x0020_Vice_x0020_Presid");
                                        }

                                    }

                                });

                            }
                        });
                    }

                    otherComplete = true;

                }
            });

            //Define Report Columns
            //Define Report Columns
            var columns = [

                { key: 'InstallType', title: 'Type of Install' },
                { key: 'StoreNumber', title: 'No.' },
                { key: 'GoLiveDate', title: 'Go-Live / Install / Delivery Date', transform: 'date' },
                {
                    key: 'Installer', title: 'Installer', transform: function (value, row, data, index) {

                        if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1 && row.InstallType.toUpperCase().indexOf('DATE') === -1) {
                            return row.AudioInstaller;
                        } else if (row.InstallType.toUpperCase().indexOf('POPS') !== -1 && row.PopsInstaller !== '' && row.InstallType.toUpperCase().indexOf('DATE') === -1) {
                            return row.PopsInstaller;
                        } else {
                            return row.Installer;
                        }
                    }
                },
                { key: 'FranchiseGroup', title: 'Franchisee' },


                { key: 'City', title: 'City' },
    { key: 'State', title: 'State' },
        { key: 'MarketLeader', title: 'Market Leader' },
        { key: 'ProjectManager', title: 'PM' },




                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                }
            ];

            //Define report title
            var title = 'Upcoming Projects - All - New';


            //Define sorting - optional sort by install date by parameter
            //Define sorting

            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };
    
            

            var afterRender = function (view) {
                //constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

            function complete() {
                if (constructionComplete && combinedComplete && otherComplete) {

                    var afterRender = function (view) {
                        //constructionRules.tableHelper(view);
                        email.afterRenderReport(view, options);
                    };

                    //Build report if complete
                    report.render({
                        data: stores,
                        columns: columns,
                        title: title,
                        target: target,

                        sort: sort,
                        routeCheck: routeCheck,
                        callback: afterRender
                    });
                }
            }

            //Load combined data
            //Show report
            report.render({
                data: stores,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});