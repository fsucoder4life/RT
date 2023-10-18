define(['app/view/report', 'app/rules/construction', 'app/email', 'app/store/construction', 'app/store/updates'], function (report, constructionRules, email, constructionStore, updateStore) {
    return {
        show: function (target, routeCheck, options) {
            options = options || {};
  
          if (moment(options.start, 'YYYY-MM-DD', true).isValid() === false) {
            options.start = moment().add(-60, 'days').format('YYYY-MM-DD');
          }
          if (moment(options.end, 'YYYY-MM-DD', true).isValid() === false) {
            options.end = moment().format('YYYY-MM-DD');
          }
            
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(options.start),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(options.end),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";
            
            constructionStore.loadData({combinedQuery: query}, function (stores) {
              //Download photo list from daily update list to make sure 10+ have been uploaded
              var updateQuery = "<Query>" + new CamlBuilder().Where().TextField('Store_x0020_Number').In(_.map(stores, function (store) {return store.StoreNumber})).ToString() + "</Query>";
              
              updateStore.loadData({query: updateQuery}, function (updateItems) {
                var requestCount = 0;
                _.each(updateItems, function (updateItem, i) {
                  requestCount++;
                  updateStore.getDocuments(updateItem, function (updateItem) {
                    //Count Photos
                    var photoCount = 0;
                    _.each(updateItem.Documents, function (document) {
                      if (/\.([Pp][Nn][Gg]|[Jj][Pp][Gg]|[Jj][Pp][Ee][Gg]|[Gg][Ii][Ff])$/.test(document.FileName)) {
                        photoCount++;
                      }
                    });
  
                    var store = _.find(stores, {StoreNumber: updateItem.StoreNumber});
                    store.PhotoCount = photoCount;
                    store.DailyUpdate = updateItem;
                    
                    //Count daily updates
                    updateItem.UpdateHistory = updateItem.UpdateHistory === "" ? [] : JSON.parse(updateItem.UpdateHistory);
                    var lastDate = "",
                      updateCount = 0;
                    
                    _.each(updateItem.UpdateHistory, function(submission) {
                      if (submission.UpdateDate.substr(0, 10) !== lastDate) {
                        updateCount++;
                        lastDate = submission.UpdateDate.substr(0, 10);
                      }
                    });
                    
                    store.UpdateCount = updateCount;
    
                    complete();
                  });
                });
  
                //Call complete if no requests
                if (requestCount <= 0) complete();

                function complete() {
                  requestCount--;
                  if (requestCount <= 0) {
                    //Define Report Columns
                    var columns = [
                      {key: 'ProjectType', title: 'Type'},
                      {key: 'StoreNumber', title: 'No.'},
                      {key: 'City', title: 'City'},
                      {key: 'State', title: 'State'},
                      {key: 'Pos', title: 'POS'},
                      {key: 'Installer', title: 'Installer', editable: true},
                      {key: 'InstallDate', title: 'Install<br/>Start Date', transform: 'date', editable: true},
                      {key: 'InstallEndDate', title: 'Install<br/>End Date', transform: 'date', editable: true},
                      {key: 'InstallDuration', title: 'Install<br/>Duration', transform: function (na, store, stores, index) {
                        if (store.InstallEndDate === '' || store.InstallDate === '') {
                          //No install end, display n/a
                          return 'N/A';
                        } else {
                          return moment(store.InstallEndDate).diff(moment(store.InstallDate), 'days') + 1;
                        }
                      }},
                      {key: 'PhotoCount', title: 'Photos<br/>Submitted', transform: function (na, store, stores, index) {
                        //Display the photo count if it exists
                        if (typeof store.PhotoCount !== 'undefined') {
                          return '<a href="https://www.sonicpartnernet.com/Scoop/Information%20Services/PMT/Roll%20Out/SitePages/DailyUpdates/index.aspx#' + store.StoreNumber + '/dailyupdate/gallery">' + store.PhotoCount + '</a>';
                        } else {
                          return '<a href="https://www.sonicpartnernet.com/Scoop/Information%20Services/PMT/Roll%20Out/SitePages/DailyUpdates/index.aspx#' + store.StoreNumber + '/dailyupdate/gallery">N/A</a>';
                        }
                      }},
                      {key: 'UpdateCount', title: 'Updates<br/>Submitted'},
                      {key: 'TestTransactionStatus', title: 'Test<br/>Transactions', editable: true},
                      {key: 'InstallSignoffStatus', title: 'Signoffs', editable: true},
                      {key: 'SignoffDate', title: 'Signoff<br/>Date', editable: true},
                      {key: 'ProjectStatus', title: 'Project<br/>Status', editable: true},
                      {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                      {key: 'LeadTechnician', title: 'Lead Tech', editable: true},
                      {key: 'ProjectManager', title: 'IT PM'},
                      {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                        return "<a href='#summary/" + value + "'>more</a>"
                      }}
                    ];
  
                    //Define report title
                    var title = 'Construction Installers  - Score Card';
  
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
                    // var filter = function (arr) {
                    //     var keepers = [];
                    //     // _.forEach(arr, function (store, index) {
                    //     //     console.log(store.StoreNumber, (typeof store.ProjectStatus !== 'undefined' ? store.ProjectStatus : 'ERROR'));
                    //     // });
                    //     _.forEach(arr, function (store, index) {
                    //         if (store.ProjectStatus.toUpperCase().indexOf('COMPLETE') === -1 || store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') === -1) {
                    //             keepers.push(store);
                    //         }
                    //     });
                    //
                    //     return keepers;
                    // };
  
                    var afterRender = function (view) {
                      constructionRules.tableHelper(view);
    
                      email.afterRenderReport(view, options);
                    };
  
                    //Show report
                    report.render({
                      data: stores,
                      columns: columns,
                      title: title,
                      target: target,
                      sort: sort,
                      // filter: filter,
                      routeCheck: routeCheck,
                      callback: afterRender,
                      afterChange: constructionRules.tableChangeHelper
                    });
                  }
                }
              })
            });
        }
    };
});