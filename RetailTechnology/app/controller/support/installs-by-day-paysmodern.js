define(['app/view/support/installs-by-day', 'app/store/combined', 'app/store/construction', 'app/store/combinedconstructionextend', "dojo/hash", "dojo/number", 'app/email'], function (view, combined, construction, combinedconstructionextend, hash, dNumber, email) {
    return {
        show: function (target, options, routeCheck) {
            var combinedComplete = false,
                constructionComplete = false,
                combinedconstructionextendComplete = false,
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
            combined.loadPopsCountToDate({date: options.start}, function (counts) {
                popsCounts = counts;
                popsCountComplete = true;
                complete();
            });

            combined.loadPosCountToDate({date: options.start}, function (counts) {
                posCounts = counts;
                posCountComplete = true;
                complete();
            });

            ///////////////////////////////


            //Build combinedconstructionextend query
            var combinedconstructionextendQuery = new CamlBuilder().Where().Any(
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('VP6800_x0020_Go_x0020_Live').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                    CamlBuilder.Expression().DateField('VP6800_x0020_Go_x0020_Live').LessThanOrEqualTo(moment().add(30, 'days').toISOString())
                )
            );

            combinedconstructionextendQuery = "<Query>" + combinedconstructionextendQuery.ToString() + "</Query>";

            //Load combinedconstructionextend data
            var combinedQuery2;
            combinedconstructionextend.loadData({ query: combinedconstructionextendQuery }, function (data) {

                var today = moment().format('YYYY-MM-DD'),
                quarter = moment().add({ months: 4 }).format('YYYY-MM-DD'),
                keepers = [],
                copy;

                //Give them all the type of construction
                _.forEach(data, function (store) {
                    copy = _.clone(store);
                    combinedQuery2 = combinedQuery2 + "<Value Type='Text'>" + store.StoreNumber + "</Value>";

                    keepers.push(copy);

                });
                //Notify complete

                stores = stores.concat(keepers);
                combinedconstructionextendComplete = true;
                complete();
            });

            ///////////////////////////////
            
            //Build combined query
            var combinedQuery = "<Where><In><FieldRef Name='Title' /><Values>" + combinedQuery2 + "</Values></In></Where>";

            combinedQuery = "<Query>" + combinedQuery + "</Query>";

            //Load combined data
            combined.loadData({query: combinedQuery}, function (data) {
                var keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {
                    var posInstall = moment(store.GoLiveDate).subtract({days: 1}).format('YYYY-MM-DD'),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                        audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                        audioPreCable = moment(store.AudioDeliveryDate).format('YYYY-MM-DD'),
                        audioSurvey = moment(store.AudioSiteSurveyDate).format('YYYY-MM-DD'),
                        posPreCable = moment(store.PosPreCableDate).format('YYYY-MM-DD'),
                        popsSurvey = moment(store.SiteSurvey).format('YYYY-MM-DD'),
                        popsPreCable = moment(store.PopsPreCableDate).format('YYYY-MM-DD'),
                        dtPopsInstall = moment(store.DtPopsInstallDate).format('YYYY-MM-DD'),
                        //Determine the POPS go-Live date based on whether or not it was delivered on saturday which implies a sunday install
                        popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsDelivery).add({days: 2}).format('YYYY-MM-DD') : moment(popsDelivery).add({days: 1}).format('YYYY-MM-DD');



                    if (moment(posInstall).diff(moment(popsDelivery)) == 0 && options.start <= posInstall && posInstall <= options.end) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS Conversion';
                        copy.Installer = store.Installer;
                        keepers.push(copy);
                    } else {
                        //Add the POS project
                        if (options.start <= posInstall && posInstall <= options.end) {
                            copy = _.clone(store);
                            //Install is the day before go live here
                            copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                            copy.InstallType = 'POS Conversion';
                            copy.Installer = store.Installer;
                            keepers.push(copy);
                        }

                        //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                        if ((options.start <= popsDelivery || (options.start <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6")) && popsDelivery <= options.end) {
                            copy = _.clone(store);
                            //If on a saturday, install is sunday, go-live is on monday
                            if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is on monday
                            } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                            }
                            copy.Installer = store.PopsInstaller;
                            copy.InstallType = 'POPS Conversion';

                            keepers.push(copy);
                          
                            if (store.PopsElectrician.toUpperCase().indexOf('STALEY') !== -1) {
                              //Add the staley electrical install if it's marked as them
                              copy = _.clone(store);
                              //If on a saturday, install is sunday, go-live is on monday
                              if (moment(store.PopsDeliveryDate).format('E') === "6") {
                                copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is on monday
                              } else {
                                copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                                copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                              }
                              copy.Installer = store.PopsElectrician;
                              copy.InstallType = 'POPS Electrical';
  
                              keepers.push(copy);
                            }
                        }
                    }

                    //Add audio pre-cable HME projects
                    if (options.start <= audioPreCable && audioPreCable <= options.end && store.AudioType.toUpperCase().indexOf('HME') !== -1 && store.AudioDeliveryDate !== '') {
                        copy = _.clone(store);
                        copy.InstallDate = moment(store.AudioDeliveryDate).toISOString();  //Conversions use this as the audio pre-cable night
                        copy.InstallType = 'Audio Pre-Cable';
                        copy.GoLiveDate = moment(store.AudioInstallDate).add({days: 2}).format('YYYY-MM-DD');      //go live is the morning after
                        copy.Installer = store.AudioInstaller;
                        keepers.push(copy);
                    }

                    //Add the Audio survey projects
                    if (options.start <= audioSurvey && audioSurvey <= options.end) {
                        //Audio Survey
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioSiteSurveyDate;
                        copy.InstallType = 'Audio Survey';
                        copy.GoLiveDate = (store.AudioType.toUpperCase().indexOf('HME') !== -1 ? moment(store.AudioInstallDate).add({days: 2}).format('YYYY-MM-DD') : store.AudioGoLiveDate);      //go live is the morning after
                        copy.Installer = store.AudioInstaller;
                        keepers.push(copy);
                    }

                    //Add the Audio projects
                    if (options.start <= audioInstall && audioInstall <= options.end) {
                        //Audio Install
                        copy = _.clone(store);
                        copy.InstallDate = store.AudioInstallDate;
                        copy.InstallType = 'Audio Conversion';
                        copy.GoLiveDate = (store.AudioType.toUpperCase().indexOf('HME') !== -1 ? moment(store.AudioInstallDate).add({days: 2}).format('YYYY-MM-DD') : store.AudioGoLiveDate);
                        copy.Installer = store.AudioInstaller;
                        keepers.push(copy);
                    }

                    //Add the POS Pre-Cable projects
                    if (options.start <= posPreCable && posPreCable <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PosPreCableDate;
                        copy.InstallType = 'POS Pre-Cable';
                        copy.GoLiveDate = store.GoLiveDate;
                        copy.Installer = store.Installer;
                        keepers.push(copy);
                    }

                    //Add the POPS Pre-Cable projects
                    if (options.start <= popsPreCable && popsPreCable <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.PopsPreCableDate;
                        copy.InstallType = 'POPS Pre-Cable';
                        copy.GoLiveDate = popsGoLive;
                        copy.Installer = store.PopsInstaller;
                        keepers.push(copy);
                    }

                    //Add the POPS Survey projects
                    if (options.start <= popsSurvey && popsSurvey <= options.end) {
                        copy = _.clone(store);
                        copy.InstallDate = store.SiteSurvey;
                        copy.InstallType = 'POPS Survey';
                        copy.GoLiveDate = popsGoLive;
                        copy.Installer = store.PopsInstaller;
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
          combined.loadData({query: dtPopsQuery}, function (data) {
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
                copy.GoLiveDate = moment(store.DtPopsInstallDate).add({days: 1}).format('YYYY-MM-DD');
                copy.Installer = store.DtPopsInstaller;
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
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(moment(options.start).subtract({days: 5}).format('YYYY-MM-DD')),
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').LessThanOrEqualTo(options.end)
                )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({query: constructionQuery}, function (data) {
                //Give them all the type of construction and remove any non-construction items
                var keepers = [];
                _.forEach(data, function (store) {
                    store.InstallType = 'Construction';
                    if (store.ProjectType !== 'POS Conversion') {
                        keepers.push(store);
                    }
                });

                //Notify complete
                stores = stores.concat(keepers);
                constructionComplete = true;
                complete();
            });

            //Define Report Columns
            var columns = [
                {key: 'InstallType', title: 'Install Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'Address', title: 'Address'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'TotalStalls', title: 'POPS'},
                {key: 'Pos', title: 'POS'},
                {key: 'AudioType', title: 'Audio', transform: function (value, row, data, index) {
                    if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1 || row.InstallType.toUpperCase().indexOf('CONSTRUCTION') !== -1) {
                        return row.AudioType;
                    } else {
                        return ''
                    }
                }},
                {key: 'Installer', title: 'Installer'},
                {key: 'InstallDate', title: 'Install Start Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date'},
                {key: 'Classification', title: 'Type'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };

            function complete () {
                if (combinedconstructionextendComplete && combinedComplete && popsCountComplete && posCountComplete && dtPopsComplete) {
                    //Filter both stores
                    var keepers = [];
                    _.forEach(stores, function (store) {
                        if (options.installer && store.Installer.toUpperCase().indexOf(options.installer.toUpperCase()) === -1) {
                            return;
                        } else if (options.city && store.City.toUpperCase().indexOf(options.city.toUpperCase()) === -1){
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
                                var fragment = "support/installs-by-day-paysmodern/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
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