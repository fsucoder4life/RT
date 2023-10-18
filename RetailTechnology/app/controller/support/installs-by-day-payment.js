define(['app/view/support/installs-by-day-payment', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number", 'app/email'], function (view, combined, construction, hash, dNumber, email) {
    return {
        show: function (target, options, routeCheck) {
            var combinedComplete = false,
                constructionComplete = false,
                extendComplete = false,
                popsCountComplete,
                popsCounts,
                posCountComplete,
                dtPopsComplete,
                posCounts,
                stores = [];

            if (moment(options.start, 'YYYY-MM-DD', true).isValid() === false) {
                options.start = moment().startOf('week').format('YYYY-MM-DD');
            }
            if (moment(options.end, 'YYYY-MM-DD', true).isValid() === false) {
                options.end = moment().endOf('week').format('YYYY-MM-DD');
            }

            //Get the store counts
            combined.loadPopsCountToDate({ date: options.start }, function (counts) {
                popsCounts = counts;
                popsCountComplete = true;
                complete();
            });

            combined.loadPosCountToDate({ date: options.start }, function (counts) {
                posCounts = counts;
                posCountComplete = true;
                complete();
            });

            //Build combined query
            var combinedQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Pre_x002d_Cable_x0020').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('POPS_x0020_Pre_x002d_Cable_x0020').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add({ days: -1 }).format('YYYY-MM-DD')), //subtract a day to grab the deliveries that deliver on saturday, imply sunday install
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(options.end)
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment(options.start).add({ days: 1 }).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment(options.end).add({ days: 1 }).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('Audio_x0020_Delivery_x0020_Date').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POS_x0020_Pre_x002d_Cable').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('POS_x0020_Pre_x002d_Cable').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Audio_x0020_Site_x0020_Survey_x0').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('Audio_x0020_Site_x0020_Survey_x0').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('Site_x0020_Surveys_x0020_POPS').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('Site_x0020_Surveys_x0020_POPS').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                    )
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({ query: combinedQuery }, function (data) {
                var keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {
                    var posInstall = moment(store.GoLiveDate).subtract({ days: 1 }).format('YYYY-MM-DD'),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                        audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                        audioPreCable = moment(store.AudioDeliveryDate).format('YYYY-MM-DD'),
                        audioSurvey = moment(store.AudioSiteSurveyDate).format('YYYY-MM-DD'),
                        posPreCable = moment(store.PosPreCableDate).format('YYYY-MM-DD'),
                        popsSurvey = moment(store.SiteSurvey).format('YYYY-MM-DD'),
                        popsPreCable = moment(store.PopsPreCableDate).format('YYYY-MM-DD'),
                        dtPopsInstall = moment(store.DtPopsInstallDate).format('YYYY-MM-DD'),
                        //Determine the POPS go-Live date based on whether or not it was delivered on saturday which implies a sunday install
                        popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsDelivery).add({ days: 2 }).format('YYYY-MM-DD') : moment(popsDelivery).add({ days: 1 }).format('YYYY-MM-DD');



                    if (moment(posInstall).diff(moment(popsDelivery)) == 0 && options.start <= posInstall && posInstall <= options.end) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS Conversion';
                        copy.Installer = store.Installer;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (options.start <= posInstall && posInstall <= options.end) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                            copy.InstallType = 'POS Conversion';
                            copy.Installer = store.Installer;
                            copy.VP6800ServerCabinetNumber = "";
                            copy.VP6800NumOfTerminals = "";
                            keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((options.start <= popsDelivery || (options.start <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6")) && popsDelivery <= options.end) {
                            copy = _.clone(store);
                            //If on a saturday, install is sunday, go-live is on monday
                            if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is on monday
                            } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is the morning after
                            }
                            copy.Installer = store.PopsInstaller;
                            copy.InstallType = 'POPS Conversion';
                            copy.VP6800ServerCabinetNumber = "";
                            copy.VP6800NumOfTerminals = "";
                            keepers.push(copy);

                            if (store.PopsElectrician.toUpperCase().indexOf('STALEY') !== -1) {
                                //Add the staley electrical install if it's marked as them
                                copy = _.clone(store);
                                //If on a saturday, install is sunday, go-live is on monday
                                if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                    copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                    copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is on monday
                                } else {
                                    copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                    copy.GoLiveDate = moment(copy.InstallDate).add({ days: 1 }).format('YYYY-MM-DD');      //go live is the morning after
                                }
                                copy.Installer = store.PopsElectrician;
                                copy.InstallType = 'POPS Electrical';
                                copy.VP6800ServerCabinetNumber = "";
                                copy.VP6800NumOfTerminals = "";
                                keepers.push(copy);
                            }
                        }
                    }

                    //Add audio pre-cable HME projects
                    if (options.start <= audioPreCable && audioPreCable <= options.end && store.AudioType.toUpperCase().indexOf('HME') !== -1 && store.AudioDeliveryDate !== '') {
                        copy = _.clone(store);
                        copy.InstallDate = moment(store.AudioDeliveryDate).toISOString();  //Conversions use this as the audio pre-cable night
                        copy.InstallType = 'Audio Pre-Cable';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({ days: 2 }).format('YYYY-MM-DD');      //go live is the morning after
                        copy.Installer = store.AudioInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }

                    //Add the Audio survey projects
                    if (options.start <= audioSurvey && audioSurvey <= options.end) {
                        //Audio Survey
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioSiteSurveyDate;
                        copy.InstallType = 'Audio Survey';
                        copy.GoLiveDate = (store.AudioType.toUpperCase().indexOf('HME') !== -1 ? moment(store.AudioInstallDate).add({ days: 2 }).format('YYYY-MM-DD') : store.AudioGoLiveDate);      //go live is the morning after
                        copy.Installer = store.AudioInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }

                    //Add the Audio projects
                    if (options.start <= audioInstall && audioInstall <= options.end) {
                        //Audio Install
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioInstallDate;
                        copy.InstallType = 'Audio Conversion';
                        copy.GoLiveDate = (store.AudioType.toUpperCase().indexOf('HME') !== -1 ? moment(store.AudioInstallDate).add({ days: 2 }).format('YYYY-MM-DD') : store.AudioGoLiveDate);
                        copy.Installer = store.AudioInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }

                    //Add the POS Pre-Cable projects
                    if (options.start <= posPreCable && posPreCable <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PosPreCableDate;
                        copy.InstallType = 'POS Pre-Cable';
                        copy.GoLiveDate = store.GoLiveDate;
                        copy.Installer = store.Installer;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }

                    //Add the POPS Pre-Cable projects
                    if (options.start <= popsPreCable && popsPreCable <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PopsPreCableDate;
                        copy.InstallType = 'POPS Pre-Cable';
                        copy.GoLiveDate = popsGoLive;
                        copy.Installer = store.PopsInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }

                    //Add the POPS Survey projects
                    if (options.start <= popsSurvey && popsSurvey <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.SiteSurvey;
                        copy.InstallType = 'POPS Survey';
                        copy.GoLiveDate = popsGoLive;
                        copy.Installer = store.PopsInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }
                });

                //Notify complete
                stores = stores.concat(keepers);
                combinedComplete = true;
                complete();
            });

            //Build combined query
            var dtPopsQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
            );

            dtPopsQuery = "<Query>" + dtPopsQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({ query: dtPopsQuery }, function (data) {
                var keepers = [],
                  copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {
                    var dtPopsInstall = moment(store.DtPopsInstallDate).format('YYYY-MM-DD');

                    //Add the DT POPS projects
                    if (options.start <= dtPopsInstall && dtPopsInstall <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.DtPopsInstallDate;
                        copy.InstallDate = store.DtPopsInstallDate;
                        copy.InstallType = 'DT POPS';
                        copy.GoLiveDate = moment(store.DtPopsInstallDate).add({ days: 1 }).format('YYYY-MM-DD');
                        copy.Installer = store.DtPopsInstaller;
                        copy.VP6800ServerCabinetNumber = "";
                        copy.VP6800NumOfTerminals = "";
                        keepers.push(copy);
                    }
                });

                //Notify complete
                stores = stores.concat(keepers);
                dtPopsComplete = true;
                complete();
            });

            //Build construction query
            var constructionQuery = new CamlBuilder().Where().Any(
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(moment(options.start).subtract({ days: 5 }).format('YYYY-MM-DD')),
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').LessThanOrEqualTo(options.end)
                )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({ query: constructionQuery }, function (data) {
                //Give them all the type of construction and remove any non-construction items
                var keepers = [];
                _.forEach(data, function (store) {
                    store.InstallType = 'Construction';
                    if (store.ProjectType !== 'POS Conversion') {
                        store.VP6800ServerCabinetNumber = "";
                        store.VP6800NumOfTerminals = "";
                        keepers.push(store);
                    }
                });

                //Notify complete
                stores = stores.concat(keepers);
                constructionComplete = true;
                complete();
            });

            //load PAYMENT stores
            //get by extend dates first - where VP6800 go-live fits options

            var keepers = [];
            var CSquery = "<Query><Where><In><FieldRef Name='Title' /><Values>";
            var camlQuery = "<Query><Where><And><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + moment(options.start).format('YYYY-MM-DD') + "</Value></Geq><Leq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'>" + moment(options.end).format('YYYY-MM-DD') + "</Value></Leq></And></Where></Query>";
            //console.log('camlQuery:' + camlQuery);
            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",

                CAMLQuery: camlQuery,
                CAMLRowLimit: 0,
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        
                        var paysKeeper = { StoreNumber: '', VP6800ProjectNotes:'', VP6800GoLive: '', VP6800StoreCloseTime: '', VP6800NumOfTerminals: '', VP6800ServerCabinetNumber: '', VP6800ServerCabinet12uNumber: '', InstallType: '', Address: '', City: '', State: '', TotalStalls: '', Pos: '', AudioType: '', Installer: '', InstallDate: '', GoLiveDate: '', Classification: '', FranchiseGroup: '' };
                        paysKeeper.StoreNumber = $(this).attr("ows_Store_x0020_Number");
                        paysKeeper.StoreNumber = paysKeeper.StoreNumber.substring(paysKeeper.StoreNumber.indexOf(";#") + ";#".length);
                        paysKeeper.VP6800GoLive = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");

                        if ($(this).attr("ows_VP6800_x0020_Project_x0020_Notes"))
                            paysKeeper.VP6800ProjectNotes = $(this).attr("ows_VP6800_x0020_Project_x0020_Notes");

                        if ($(this).attr("ows_VP6800_x0020_Store_x0020_Close_x"))
                            paysKeeper.VP6800StoreCloseTime = $(this).attr("ows_VP6800_x0020_Store_x0020_Close_x");

                        if ($(this).attr("ows_VP6800_x0020_IT_x0020_PM"))
                            paysKeeper.VP6800ITPM = $(this).attr("ows_VP6800_x0020_IT_x0020_PM");

                        paysKeeper.VP6800NumOfTerminals = "0";

                        if ($(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_"))
                            if (parseFloat($(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_")))
                                if (parseFloat($(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_")) > 0)
                                    paysKeeper.VP6800NumOfTerminals = $(this).attr("ows_VP6800_x0020_Num_x0020_Of_x0020_");

                        paysKeeper.VP6800ServerCabinetNumber = "NO";

                        if ($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1"))
                            if (parseFloat($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1")))
                                if (parseFloat($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine1")) > 0)
                                    paysKeeper.VP6800ServerCabinetNumber = "YES";
                        if ($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2"))
                            if (parseFloat($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2")))
                                if (parseFloat($(this).attr("ows_VP6800_x0020_Server_x0020_Cabine2")) > 0)
                                    paysKeeper.VP6800ServerCabinetNumber = "YES";
                        
                        paysKeeper.InstallType = "PAYMENT";

                        //paysKeeper.Installer = $(this).attr("ows_VP6800_x0020_Installer");
                        
                        paysKeeper.InstallDate = moment($(this).attr("ows_VP6800_x0020_Go_x0020_Live")).subtract({ days: 1 }).format('MM-DD-YYYY');
                        paysKeeper.GoLiveDate = $(this).attr("ows_VP6800_x0020_Go_x0020_Live");
                        if ($(this).attr("ows_VP6800_x0020_Installer"))
                            paysKeeper.Installer = $(this).attr("ows_VP6800_x0020_Installer");
                        else
                            paysKeeper.Installer = "NONE";
                        
                        
                        keepers.push(paysKeeper);
                        CSquery += "<Value Type='Text'>" + paysKeeper.StoreNumber + "</Value>";

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
            
            console.log(CSquery);
            //go through keepers:

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLQuery: CSquery,
                CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Primary_x0020_Contact' /><FieldRef Name='Primary_x0020_Contact_x0020_Phon' /><FieldRef Name='Primary_x0020_Contact_x0020_Emai' /><FieldRef Name='SII_x002f_SRI' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='POS_x0020_Selection' /><FieldRef Name='Stall_x0020_Count' /><FieldRef Name='Audio_x0020_Type' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /><FieldRef Name='Address_x0020_Full' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        var storeNum = $(this).attr("ows_Title");

                        for (var i = 0; i < keepers.length; i++) {
                            if (keepers[i].StoreNumber == storeNum) {
                                keepers[i].Address = $(this).attr("ows_Address_x0020_Full");
                                keepers[i].City = $(this).attr("ows_City");
                                keepers[i].State = $(this).attr("ows_State_x0020_");
                                if ($(this).attr("ows_Stall_x0020_Count"))
                                    keepers[i].TotalStalls = $(this).attr("ows_Stall_x0020_Count").substring(0, $(this).attr("ows_Stall_x0020_Count").indexOf("."));
                                else
                                    keepers[i].TotalStalls = 0;
                                keepers[i].Pos = $(this).attr("ows_POS_x0020_Selection");
                                keepers[i].AudioType = $(this).attr("ows_Audio_x0020_Type");
                                keepers[i].ProjectType = "PAYMENT";
                                keepers[i].Classification = $(this).attr("ows_SII_x002f_SRI");
                                keepers[i].FranchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                                keepers[i].PrimaryContact = $(this).attr("ows_Primary_x0020_Contact");
                                keepers[i].PrimaryPhone = $(this).attr("ows_Primary_x0020_Contact_x0020_Phon");
                                keepers[i].PrimaryEmail = $(this).attr("ows_Primary_x0020_Contact_x0020_Emai");
                                break;
                            }
                        }
                    });
                }
            });



            stores = stores.concat(keepers);
            extendComplete = true;
            complete();


            //Define Report Columns
            var columns = [
                { key: 'InstallType', title: 'Install Type' },
                { key: 'StoreNumber', title: 'No.' },
                { key: 'Address', title: 'Address' },
                { key: 'City', title: 'City' },
                { key: 'State', title: 'State' },
                { key: 'PrimaryContact', title: 'Point of Contact' },
                { key: 'PrimaryPhone', title: 'POC-Phone' },
                { key: 'PrimaryEmail', title: 'POC-Email' },
                { key: 'VP6800NumOfTerminals', title: '# of PAY<br />Terminals' },
                { key: 'VP6800ServerCabinetNumber', title: 'Server<br />Cabinet' },
                { key: 'TotalStalls', title: 'POPS' },
                { key: 'Pos', title: 'POS' },
                {
                    key: 'AudioType', title: 'Audio', transform: function (value, row, data, index) {
                        if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1 || row.InstallType.toUpperCase().indexOf('CONSTRUCTION') !== -1) {
                            return row.AudioType;
                        } else {
                            return ''
                        }
                    }
                },
                { key: 'Installer', title: 'Installer' },
                { key: 'InstallDate', title: 'Install<br />Start Date', transform: 'date' },
                { key: 'GoLiveDate', title: 'Go-Live<br />Date', transform: 'date' },
                { key: 'Classification', title: 'Type' },
                { key: 'FranchiseGroup', title: 'Franchisee' },
                { key: 'VP6800ITPM', title: 'PM' },
                { key: 'VP6800StoreCloseTime', title: 'Store<br />Close Time' },
                { key: 'VP6800ProjectNotes', title: 'Notes', editable: true },
                
                
                {
                    key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                    }
                }
            ];

            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };

            function complete() {
                if (constructionComplete && combinedComplete && popsCountComplete && posCountComplete && dtPopsComplete && extendComplete) {
                    //Filter both stores
                    var keepers = [];
                    _.forEach(stores, function (store) {
                        if (options.installer && store.Installer.toUpperCase().indexOf(options.installer.toUpperCase()) === -1) {
                            return;
                        } else if (options.city && store.City.toUpperCase().indexOf(options.city.toUpperCase()) === -1) {
                            return
                        } else if (options.state && store.State.toUpperCase().indexOf(options.state.toUpperCase()) === -1) {
                            return;
                        } else if (options.posSelection && (store.Pos.toUpperCase().indexOf(options.posSelection.toUpperCase()) === -1 || store.InstallType === "POPS Conversion")) {
                            return;
                        } else if (options.projectType) {
                            var test = false;
                            if (typeof options.projectType === "string") options.projectType = [options.projectType];
                            _.each(options.projectType, function (type, i) {
                                switch (type) {
                                    case 'construction':
                                        if (store.InstallType === "Construction") {
                                            test = true;
                                        }
                                        break;
                                    case 'pos-conversion':
                                        if (store.InstallType === "POS Conversion" || store.InstallType === "POPS & POS Conversion") {
                                            test = true;
                                        }
                                        break;
                                    case 'pops-electrical':
                                        if (store.InstallType === "POPS Electrical") {
                                            test = true;
                                        }
                                        break;
                                    case 'pops-conversion':
                                        if (store.InstallType === "POPS Conversion" || store.InstallType === "POPS & POS Conversion") {
                                            test = true;
                                        }
                                        break;
                                    case 'audio-conversion':
                                        if (store.InstallType === "Audio Conversion") {
                                            test = true;
                                        }
                                        break;
                                    case 'audio-pre-cable':
                                        if (store.InstallType === "Audio Pre-Cable") {
                                            test = true;
                                        }
                                        break;
                                    case 'pos-pre-cable':
                                        if (store.InstallType === "POS Pre-Cable") {
                                            test = true;
                                        }
                                        break;
                                    case 'pops-pre-cable':
                                        if (store.InstallType === "POPS Pre-Cable") {
                                            test = true;
                                        }
                                        break;
                                    case 'dt-pops':
                                        if (store.InstallType === "DT POPS") {
                                            test = true;
                                        }
                                        break;
                                    case 'pops-survey':
                                        if (store.InstallType === "POPS Survey") {
                                            test = true;
                                        }
                                        break;
                                    case 'audio-survey':
                                        if (store.InstallType === "Audio Survey") {
                                            test = true;
                                        }
                                        break;
                                    case 'pays-payment':
                                        if (store.InstallType === "PAYMENT") {
                                            test = true;
                                        }
                                        break;
                                }
                            });
                            if (test === false) {
                                return;
                            }
                        }
                        keepers.push(store);
                    });

                    //Build report if complete
                    view.render({
                        data: keepers,
                        start: options.start,
                        end: options.end,
                        installer: options.installer,
                        city: options.city,
                        state: options.state,
                        projectType: options.projectType,
                        pops: popsCounts,
                        pos: posCounts,
                        posSelection: options.posSelection,
                        columns: columns,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck,
                        callback: function (view) {
                            //Register handler for filter button
                            view.button.on('click', function () {
                                //Get all the values and build a hash
                                var fragment = "support/installs-by-day-payment/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
                                                                        "/end/" + encodeURIComponent(moment(view.end.get('value')).format('YYYY-MM-DD'));

                                if (view.installer.get('value') !== "") {
                                    fragment += "/installer/" + encodeURIComponent(view.installer.get('value'));
                                }
                                if (view.city.get('value') !== "") {
                                    fragment += "/city/" + encodeURIComponent(view.city.get('value'));
                                }
                                if (view.state.get('value') !== "") {
                                    fragment += "/state/" + encodeURIComponent(view.state.get('value'));
                                }
                                if (view.pos.get('value') !== "") {
                                    fragment += "/posSelection/" + encodeURIComponent(view.pos.get('value'));
                                }

                                if (view.projectType.get('value').length !== 0) {
                                    var params = view.projectType.get('value');
                                    _.each(params, function (param, i) {
                                        params[i] = encodeURIComponent(param);
                                    });
                                    fragment += "/projectType/" + params.join();
                                }
                                hash(fragment);
                            });

                            email.afterRenderReport(view, options);
                        }
                    });
                }
            }
        }
    };
});