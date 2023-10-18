define(['app/view/report'], function (report) {
  return {
    show: function (target, routeCheck, options) {
      //Build query
      var query = new CamlBuilder().Where().Any(
        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
        CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
      );
      
      query = "<Query>" + query.ToString() + "</Query>";
      
      //Define Report Columns
      var columns = [
        {key: 'ProjectType', title: 'Type'},
        {key: 'StoreNumber', title: 'No.'},
        {key: 'City', title: 'City'},
        {key: 'State', title: 'State'},
        {
          key: 'Installer', title: 'Installer', transform: function (installer, store, stores, i) {
          if (store.ProjectType === 'POS Conversion') {
            return store.AudioInstaller;
          } else {
            return store.Installer;
          }
        }
        },
        {key: 'GroundLoopStatus', title: 'Loop<br/>Note', editable: true, minWidth: '100px'},
        {key: 'AudioStatus', title: 'Quote<br/>Status', editable: true, minWidth: '175px'},
        {key: 'AudioVendorStatus', title: 'Vendor<br/>Status', editable: true, minWidth: '175px'},
        {key: 'AudioDeliveryDate', title: 'Audio Delivery<br/>Pre-Cable', transform: 'date', minWidth: '100px'},
        {
          key: 'AudioInstallDate', title: 'Install<br/>Date', transform: function (date, store, stores, i) {
          if (date === '' && typeof store.InstallDate !== 'undefined' && store.InstallDate !== '') {
            return moment(store.InstallDate).format('l');
          } else if (date !== '') {
            return moment(date).format('l');
          } else {
            return '';
          }
        }
        },
        {
          key: 'GoLiveDate', title: 'HME<br/>Go-Live', transform: function (date, store, stores, i) {
          if (store.ProjectType === 'POS Conversion') {
            if (store.AudioInstallDate === '' || typeof store.AudioInstallDate === 'undefined') {
              return '';
            } else {
              return moment(store.AudioInstallDate).add(2, 'days').format('l');
            }
          } else {
            if (date === '' || typeof date === 'undefined') {
              return '';
            } else {
              return moment(date).format('l');
            }
          }
        }
        },
        {key: 'GoLiveDate', title: 'POS<br/>Go-Live', transform: 'date'},
        {
          key: 'PopsDeliveryDate',
          title: 'POPS<br/>Go-Live',
          transform: function (popsDelivery, store, stores, i) {
            if (store.ProjectType === 'POS Conversion')
              return (moment(popsDelivery).format('E') === "6") ? moment(popsDelivery).add({days: 2}).format('l') : moment(popsDelivery).add({days: 1}).format('l')
            else
              return moment(store.GoLiveDate).format('l');
          }
        },
        {key: 'Pos', title: 'Pos'},
        {key: 'FranchiseGroup', title: 'Franchisee'},
        {key: 'ProjectManager', title: 'IT PM'},
        {
          key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
          return "<a href='#summary/" + value + "'>more</a>"
        }
        }
      ];
      
      //Define report title
      var title = 'HME - Upcoming Projects';
      
      //Define sorting
      var sort = function (arr) {
        arr.sort(function (a, b) {
          //Conversions - sort by Audio delivery date, if not present, audio install date less one week
          if (typeof a.AudioDeliveryDate === 'undefined' || a.AudioDeliveryDate === '') {
            if ((typeof a.AudioInstallDate === 'undefined' || a.AudioInstallDate === '') && typeof a.InstallDate !== 'undefined') {
              a = moment(a.InstallDate).toISOString();
            } else {
              a = a.AudioInstallDate;
            }
          } else {
            a = a.AudioDeliveryDate;
          }
          
          if (typeof b.AudioDeliveryDate === 'undefined' || b.AudioDeliveryDate === '') {
            if ((typeof b.AudioInstallDate === 'undefined' || b.AudioInstallDate === '') && typeof b.InstallDate !== 'undefined') {
              b = moment(b.InstallDate).toISOString();
            } else {
              b = b.AudioInstallDate;
            }
          } else {
            b = b.AudioDeliveryDate;
          }
          
          if (a > b) {
            return 1;
          } else if (a < b) {
            return -1;
          }
          
          return 0;
        });
        return arr;
      };
      
      //Define Filtering
      var filter = function (arr) {
        var keepers = [];
        _.forEach(arr, function (store, index) {
          if (
            //Verify it's an HME project
          store.AudioType.toUpperCase().indexOf('HME') !== -1 &&
          (
            store.ProjectType !== 'POS Conversion' ||
            store.AudioInstallDate > moment().hours(0).minutes(0).seconds(0).toISOString()
          )
          ) {
            keepers.push(store);
          }
        });
        
        return keepers;
      };
      
      //Show report
      report.render({
        combinedQuery: query,
        columns: columns,
        title: title,
        target: target,
        sort: sort,
        routeCheck: routeCheck,
        filter: filter
      });
      
    }
  };
});