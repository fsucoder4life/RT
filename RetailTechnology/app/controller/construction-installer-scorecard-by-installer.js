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
                    //Sort into installer array
                    var data = {};
                    _.each(stores, function (store) {
                      if (typeof data[store.Installer] === 'undefined') {
                        data[store.Installer] = {stores: []};
                      }
                      
                      data[store.Installer].stores.push(store);
                    });
                    
                    //Aggregate information per column
                    
                    _.each(data, function (item, installer) {
                      //Aggregate values
                      var installDuration = 0,
                        installDurationItems = 0,
                        testTransactions = 0,
                        signoffDateItems = 0,
                        signoffDays = 0,
                        signoffsComplete = 0,
                        photos = 0,
                        updateRate = 0;
                      
                      //Go through each store the installer has done
                      _.each(item.stores, function (store) {
                        //Calculate number of install days
                        var duration;
                        if (store.InstallEndDate !== '' && store.InstallDate !== '') {
                          duration = moment(store.InstallEndDate).diff(moment(store.InstallDate), 'days') + 1;
                          installDurationItems++;
                          installDuration += duration;
                        }
                        
                        //Add test transactions based on status
                        if (store.TestTransactionStatus.toUpperCase().indexOf('YES') !== -1) {
                          testTransactions += 1;
                        } else if (store.TestTransactionStatus.toUpperCase().indexOf('PARTIAL') !== -1) {
                          testTransactions += .5;
                        }
                        
                        //Add signoff days if install end and signoff date are filled out
                        if (store.SignoffDate !== '' && store.InstallEndDate !== '') {
                          signoffDays += moment(store.SignoffDate).startOf('day').diff(moment(store.InstallEndDate).startOf('day'), 'days');
                          signoffDateItems++;
                        }
                        
                        //Add up number of signoffs complete
                        if (store.InstallSignoffStatus.toUpperCase().indexOf('SUBMITTED') !== -1 || store.InstallSignoffStatus.toUpperCase().indexOf('NEEDS PM REVIEW') !== -1 ) {
                          signoffsComplete++;
                        }
                        
                        //Add up total number of photos
                        if (typeof store.PhotoCount !== 'undefined') {
                          photos += store.PhotoCount;
                        }
                        
                        //Add up percent of updates that were sent in
                        if (store.InstallEndDate === '' || store.InstallDate === '') {
                          duration = 5;
                        } else {
                          if (duration > 5) duration = 5;
                        }
                        //Calculate the rate for the project and add to total, making sure we don't get over 100% on long installs with lots of updates
                        if (typeof store.UpdateCount !== 'undefined') {
                          var updateAmount = store.UpdateCount/duration;
                          if (updateAmount > 1) updateAmount = 1;
                          updateRate += updateAmount;
                        }
                      });
  
                      item.AverageInstallDuration = (installDurationItems === 0 ? 0 : installDuration/installDurationItems);
                      item.TestTransactionRate = testTransactions/item.stores.length;
                      item.AverageSignoffDays = (signoffDateItems === 0 ? 0 : signoffDays/signoffDateItems);
                      item.SignoffCompletionRate = signoffsComplete/item.stores.length;
                      item.AveragePhotoCount = photos/item.stores.length;
                      item.UpdateSubmissionRate = updateRate/item.stores.length;
                      item.Installer = installer;
                    });
                    
                    
                    //Define Report Columns
                    var columns = [
                      {key: 'Installer', title: 'Installer'},
                      {key: 'AverageInstallDuration', title: 'Average<br/>Install<br/>Duration', transform: function(value, values, index) {
                        return value.toFixed(0) + ' days';
                      }},
                      {key: 'TestTransactionRate', title: 'Test-Transaction<br/>Completion Rate', transform: function(value, values, index) {
                        return (value*100).toFixed(0) + '%';
                      }},
                      {key: 'AverageSignoffDays', title: 'Average<br/>Signoff<br/>Delay', transform: function(value, values, index) {
                        return value.toFixed(0) + ' days';
                      }},
                      {key: 'SignoffCompletionRate', title: 'Signoff<br/>Completion<br/>Rate', transform: function(value, values, index) {
                        return (value*100).toFixed(0) + '%';
                      }},
                      {key: 'AveragePhotoCount', title: 'Average<br/>Photo<br/>Count', transform: function(value, values, index) {
                        return value.toFixed(0);
                      }},
                      {key: 'UpdateSubmissionRate', title: 'Update<br/>Submission<br/>Rate', transform: function(value, values, index) {
                        return (value*100).toFixed(0) + '%';
                      }},
                      {key: 'ProjectCount', title: 'Project<br/>Count', transform: function(value, values, index) {
                        return values.stores.length;
                      }}
                    ];
  
                    //Define report title
                    var title = 'Construction Installers  - Score Card';
  
                    // //Define sorting
                    // var sort = {
                    //   key: 'GoLiveDate',
                    //   direction: 'DESC'
                    // };
                    //
                    // //Define passed sorting values
                    // if (typeof options.sort !== 'undefined') {
                    //   sort.key = options.sort;
                    // }
                    // //Custom sort for install date
                    // if (typeof options.sort !== 'undefined' && options.sort === "InstallDate") {
                    //   sort = function (arr) {
                    //     arr.sort(function (a, b) {
                    //       //Create a fake date of 10 days before openig if it doesn't exists
                    //       if (a.InstallDate === '') {
                    //         a = moment(a.GoLiveDate).add(-10, 'days').toISOString();
                    //       } else {
                    //         a = a.InstallDate;
                    //       }
                    //
                    //       if (b.InstallDate === '') {
                    //         b = moment(b.GoLiveDate).add(-10, 'days').toISOString();
                    //       } else {
                    //         b = b.InstallDate;
                    //       }
                    //
                    //       if (a > b) {
                    //         return 1;
                    //       } else if (a < b) {
                    //         return -1;
                    //       }
                    //
                    //       return 0;
                    //     });
                    //     return arr;
                    //   }
                    // }
  
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
                      // constructionRules.tableHelper(view);
    
                      email.afterRenderReport(view, options);
                    };
  
                    //Show report
                    report.render({
                      data: data,
                      columns: columns,
                      title: title,
                      target: target,
                      // sort: sort,
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