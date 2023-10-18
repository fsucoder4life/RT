define(['app/view/openings/openings-by-day', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number"], function (view, combined, construction, hash, dNumber) {
    return {
        show: function (target, options, routeCheck) {
          var combinedComplete = false,
            constructionComplete = false,
            stores = [];
  
          if (moment(options.start, 'YYYY-MM-DD', true).isValid() === false) {
            options.start = moment().startOf('week').format('YYYY-MM-DD');
          }
          if (moment(options.end, 'YYYY-MM-DD', true).isValid() === false) {
            options.end = moment().endOf('week').format('YYYY-MM-DD');
          }
  
          //Build combined query
          var combinedQuery = new CamlBuilder().Where().All(
            CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
            CamlBuilder.Expression().Any(
              CamlBuilder.Expression().All(
                CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add({days: -2}).format('YYYY-MM-DD')),  //subtract an extra day to pull in the POPS deliveries that are special case saturday deliveries, with sunday install, monday go-live
                CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(moment(options.end).add({days: -1}).format('YYYY-MM-DD'))
              ),
              CamlBuilder.Expression().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(options.start),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(options.end)
              ),
              CamlBuilder.Expression().All(
                CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add({days: -2}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').LessThanOrEqualTo(moment(options.end).add({days: -2}).format('YYYY-MM-DD'))
              ),
              CamlBuilder.Expression().All(
                CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').GreaterThanOrEqualTo(moment(options.start).add({days: -1}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().DateField('DT_x0020_POPS_x0020_Install_x002').LessThanOrEqualTo(moment(options.end).add({days: -1}).format('YYYY-MM-DD'))
              )
            )
          );
  
          combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";
  
          //Load combined data
          combined.loadData({query: combinedQuery}, function (data) {
            var keepers = [],
              copy;
    
    
            //Create a new entry for each date within our range
            _.forEach(data, function (store, index) {
      
              var posInstall = moment(store.GoLiveDate).subtract({days: 1}).format('YYYY-MM-DD'),
                popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                audioGoLive = moment(store.AudioInstallDate).add(2, 'days').format('YYYY-MM-DD');
      
              if (moment(posInstall).diff(moment(popsDelivery) && options.start <= posInstall && posInstall <= options.end) === 0) {
                //Add a combined project if the go live minus one is the same as the install
                copy = _.clone(store);
                //Install is the day before go live here
                copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                copy.InstallType = 'POPS & POS Conversion';
                keepers.push(copy);
              } else {
                //Add the POS project
                if (options.start <= posInstall && posInstall <= options.end) {
                  copy = _.clone(store);
                  //Install is the day before go live here
                  copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                  copy.InstallType = 'POS Conversion';
                  keepers.push(copy);
                }
        
                //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                if ((options.start <= popsDelivery || (options.start <= moment(popsDelivery).add(2, 'days').format('YYYY-MM-DD') && moment(popsDelivery).format('E') === "6")) && popsDelivery <= options.end) {
                  copy = _.clone(store);
                  //If on a saturday, install is sunday, go-live is on monday
                  if (moment(store.PopsDeliveryDate).format('E') === "6") {
                    copy.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                    copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is on monday
                  } else {
                    copy.InstallDate = store.PopsDeliveryDate;  //install is the same day
                    copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                  }
                  copy.InstallType = 'POPS Conversion';
          
                  keepers.push(copy);
                }
              }
      
              //Add the Audio projects
              if (options.start <= audioGoLive && audioGoLive <= options.end) {
                copy = _.clone(store);
                copy.InstallDate = store.AudioInstallDate;
                copy.InstallType = 'Audio Conversion';
                copy.GoLiveDate = moment(store.AudioInstallDate).add({days: 2}).format('YYYY-MM-DD');      //go live is the morning after
                keepers.push(copy);
              }
      
              var dtPopsOpen = moment(store.DtPopsInstallDate).add({days: 1}).format('YYYY-MM-DD');
      
              //Add the DT POPS projects
              if (options.start <= dtPopsOpen && dtPopsOpen <= options.end) {
                copy = _.clone(store);
                copy.InstallDate = store.DtPopsInstallDate;
                copy.InstallDate = store.DtPopsInstallDate;
                copy.InstallType = 'DT POPS';
                copy.GoLiveDate = dtPopsOpen;
                copy.Installer = store.DtPopsInstaller;
                keepers.push(copy);
              }
            });
    
            //Notify complete
            stores = stores.concat(keepers);
            combinedComplete = true;
            complete();
          });
  
          //Build construction query
          var constructionQuery = new CamlBuilder().Where().Any(
            CamlBuilder.Expression().All(
              CamlBuilder.Expression().DateField('Store_x0020_Number_x003a_Store_x').GreaterThanOrEqualTo(options.start),
              CamlBuilder.Expression().DateField('Store_x0020_Number_x003a_Store_x').LessThanOrEqualTo(options.end)
            )
          );
  
          constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";
  
          //Load construction data
          construction.loadData({query: constructionQuery}, function (data) {
            //Give them all the type of construction
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
            {
              key: 'AudioType', title: 'Audio', transform: function (value, row, data, index) {
              if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1 || row.InstallType.toUpperCase().indexOf('CONSTRUCTION') !== -1) {
                return row.AudioType;
              } else {
                return ''
              }
            }
            },
            {
              key: 'Pos', title: 'POS', transform: function (value, row, data, index) {
              if (row.InstallType === "POPS Conversion**") {
                return "POPS Only"
              } else {
                return value;
              }
            }
            },
            {
              key: 'Installer', title: 'Installer', transform: function (value, row, data, index) {
              if (row.InstallType.toUpperCase().indexOf('AUDIO') !== -1) {
                return row.AudioInstaller
              } else {
                return row.Installer
              }
            }
            },
            {key: 'InstallDate', title: 'Install Start Date', transform: 'date'},
            {key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date'},
            {key: 'Classification', title: 'Type'},
            {key: 'FranchiseGroup', title: 'Franchisee'},
            {
              key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
              return "<a href='#summary/" + value + "'>more</a>"
            }
            }
          ];
  
          var sort = {
            key: 'GoLiveDate',
            direction: 'DESC'
          };
  
          function complete() {
            if (constructionComplete && combinedComplete) {
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
                      case 'dt-pops':
                        if (store.InstallType === "DT POPS") {
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
                posSelection: options.posSelection,
                columns: columns,
                target: target,
                sort: sort,
                routeCheck: routeCheck,
                callback: function (view) {
                  //Register handler for filter button
                  view.button.on('click', function () {
                    //Get all the values and build a hash
                    var fragment = "openings/openings-by-day/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
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
                }
              });
            }
          }
        }
    };
});