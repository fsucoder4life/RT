define(['app/view/report', 'app/rules/construction', 'app/email', 'app/store/combined'], function (report, constructionRules, email, combined) {
    return {
        show: function (target, routeCheck, options) {
          options = options || {};
          debugger;
            if (typeof options.start === 'undefined') {
              options.start = moment().format('YYYY-MM-DD');
            }
            if (typeof options.end === 'undefined') {
              options.end = moment().add(2, 'months').format('YYYY-MM-DD');
            }
            
            //Build query
            var combinedQuery = new CamlBuilder().Where().All(
              CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion'),
              CamlBuilder.Expression().Any(
                CamlBuilder.Expression().All(
                  CamlBuilder.Expression().DateField('Audio_x0020_Site_x0020_Survey_x0').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                  CamlBuilder.Expression().DateField('Audio_x0020_Site_x0020_Survey_x0').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                ),
                CamlBuilder.Expression().All(
                  CamlBuilder.Expression().DateField('Audio_x0020_Site_x0020_Survey_x0').EqualTo(''),
                  CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add(4, 'weeks').format('YYYY-MM-DD')),
                  CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').LessThanOrEqualTo(moment(options.end).add(4, 'weeks').format('YYYY-MM-DD'))
                ),
                CamlBuilder.Expression().All(
                  CamlBuilder.Expression().DateField('Site_x0020_Surveys_x0020_POPS').GreaterThanOrEqualTo(moment(options.start).format('YYYY-MM-DD')),
                  CamlBuilder.Expression().DateField('Site_x0020_Surveys_x0020_POPS').LessThanOrEqualTo(moment(options.end).format('YYYY-MM-DD'))
                ),
                CamlBuilder.Expression().All(
                  CamlBuilder.Expression().DateField('Site_x0020_Surveys_x0020_POPS').EqualTo(''),
                  CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add(4, 'weeks').format('YYYY-MM-DD')),
                  CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(moment(options.end).add(4, 'weeks').format('YYYY-MM-DD'))
                )
              )
            ).OrderByDesc('POPS_x0020_Delivery_x0020_Date');

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";
  
          combined.loadData({combinedQuery: combinedQuery}, function (data) {
            var keepers = [],
              copy;
    
    
            //Create a new entry for each date within our range
            _.forEach(data, function (store, index) {
              var popsInstall = moment(store.PopsDeliveryDate).format('YYYY-MM-DD'),
                audioInstall = moment(store.AudioInstallDate).format('YYYY-MM-DD'),
                audioSurvey = moment(store.AudioSiteSurveyDate).format('YYYY-MM-DD'),
                estimatedAudioSurvey = moment(store.AudioInstallDate).add(-4, 'weeks').format('YYYY-MM-DD'),
                estimatedPopsSurvey = moment(store.PopsDeliveryDate).add(-4, 'weeks').format('YYYY-MM-DD'),
                popsSiteSurvey = moment(store.SiteSurvey).format('YYYY-MM-DD'),
                popsGoLive = (moment(store.PopsDeliveryDate).format('E') === "6") ? moment(popsInstall).add({days: 2}).format('YYYY-MM-DD') : moment(popsInstall).add({days: 1}).format('YYYY-MM-DD');
  
  
              //Add the Audio survey projects
              if (store.AudioSiteSurveyDate !== '' && options.start <= audioSurvey && audioSurvey <= options.end) {
                //Audio Survey
                copy = _.clone(store);
                copy.InstallDate = store.AudioInstallDate;
                copy.InstallType = 'Audio Conversion';
                copy.SurveyDate = store.AudioSiteSurveyDate;
                copy.GoLiveDate = moment(store.AudioInstallDate).add({days: 3}).format('YYYY-MM-DD');      //go live is the morning after
                copy.Installer = store.AudioInstaller;
                keepers.push(copy);
              } else if (store.AudioSiteSurveyDate === '' && options.start <= estimatedAudioSurvey && estimatedAudioSurvey <= options.end) {
                copy = _.clone(store);
                copy.InstallDate = store.AudioInstallDate;
                copy.InstallType = 'Audio Conversion';
                copy.SurveyDate = store.AudioSiteSurveyDate;
                copy.GoLiveDate = moment(store.AudioInstallDate).add({days: 3}).format('YYYY-MM-DD');      //go live is the morning after
                copy.Installer = store.AudioInstaller;
                keepers.push(copy);
              }
  
              //Add the POPS survey projects
              if (store.SiteSurvey !== '' && options.start <= popsSiteSurvey && popsSiteSurvey <= options.end) {
                //Audio Survey
                copy = _.clone(store);
                copy.InstallDate = store.PopsDeliveryDate;
                copy.InstallType = 'Audio Conversion';
                copy.SurveyDate = store.SiteSurvey;
                copy.GoLiveDate = popsGoLive;
                copy.Installer = store.PopsInstaller;
                keepers.push(copy);
              } else if (store.AudioSiteSurveyDate === '' && options.start <= estimatedPopsSurvey && estimatedPopsSurvey <= options.end) {
                {
                  copy = _.clone(store);
                  copy.InstallDate = store.PopsDeliveryDate;
                  copy.InstallType = 'Audio Conversion';
                  copy.SurveyDate = store.SiteSurvey;
                  copy.GoLiveDate = popsGoLive;
                  copy.Installer = store.PopsInstaller;
                  keepers.push(copy);
                }
              }
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
              {key: 'SurveyDate', title: 'Site Survey<br/>Date', transform: 'date'},
              {key: 'GoLiveDate', title: 'Go-Live<br/>Date', transform: 'date'},
              {key: 'Classification', title: 'Type'},
              {key: 'FranchiseGroup', title: 'Franchisee'},
              {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                return "<a href='#summary/" + value + "'>more</a>"
              }}
            ];
  
            //Define report title
            var title = 'Fabcon - Upcoming Projects';
  
            //Define sorting
            var sort = {
              key: 'PopsDeliveryDate',
              direction: 'DESC'
            };
  
            //Define filtering
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Pos.toUpperCase() === 'MICROS') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };
  
            var afterRender = function (view) {
              constructionRules.tableHelper(view);
    
              email.afterRenderReport(view, options);
            };
  
            //Load combined data
            //Show report
            report.render({
              data: keepers,
              columns: columns,
              title: title,
              target: target,
              sort: sort,
//                filter: filter,
              routeCheck: routeCheck//,
              // callback: afterRender,
              // afterChange: constructionRules.tableChangeHelper
            });
          });

        }
    };
});