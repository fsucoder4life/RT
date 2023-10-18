define(['app/view/report', 'app/rules/construction', 'app/email', 'app/store/construction'], function (report, constructionRules, email, construction) {
  return {
    show: function (target, routeCheck, options) {
      options = options || {};
      //Build query
      var query = new CamlBuilder().Where().All(
        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment().toISOString()),
        CamlBuilder.Expression().Any(
          CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
          CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
          CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
          CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
        )
      ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

      query = "<Query>" + query.ToString() + "</Query>";

      construction.loadData({combinedQuery: query}, function (stores) {
        var weeks = [];
        //Create an array to track overall project load
        var overall = {
          AVA: 0,
            "RH TECH": 0,
            IST: 0,
            AVIT: 0,
            MIRA: 0,
            ATI: 0,
            CSI: 0,
            MSIT: 0
        };
        var load = {};

        //Create an array with start/end week dates as well as a 0 count for each installer
        for (var i = 0; i < 16; i++) {
          var date = moment().add(7*i, 'days');

          weeks.push({
            start: date.clone().startOf('week'),
            end: date.clone().endOf('week'),
            installers: {
              AVA: 0,
              "RH TECH": 0,
              IST: 0,
              AVIT: 0,
              MIRA: 0,
              ATI: 0,
              CSI: 0,
              MSIT: 0
            }
          });
        }

        //Sort into weeks by installer
        _.each(stores, function (store, i) {
          var installDate = store.InstallDate !== '' ? moment(store.InstallDate) : moment(store.GoLiveDate).add(-7, 'days');
          _.each(weeks, function (week) {
            //Check if it's in the week
            // if (installDate.isBefore(moment('2017-05-01'))) debugger;

            if (installDate.isAfter(week.start.startOf('day')) && installDate.isBefore(week.end.endOf('day'))) {
              //Check which installer it's with, increment if so
              _.each(week.installers, function (count, installer) {
                if (store.Installer.toUpperCase().indexOf(installer) !== -1) {
                  week.installers[installer]++;
                  overall[installer]++;
                }
              });
            }
          });
        });

        //Calculate project load
        load['AVA'] = '<b>' + Math.round(overall['AVA']/1 * 100) + '%</b>';
        load['RH TECH'] = '<b>' + Math.round(overall['RH TECH']/3 * 100) + '%</b>';
        load['IST'] = '<b>' + Math.round(overall['IST']/15 * 100) + '%</b>';
        load['AVIT'] = '<b>' + Math.round(overall['AVIT']/8 * 100) + '%</b>';
        load['MIRA'] = '<b>' + Math.round(overall['MIRA']/6 * 100) + '%</b>';
        load['ATI'] = '<b>' + Math.round(overall['ATI']/1 * 100) + '%</b>';
        load['CSI'] = '<b>' + Math.round(overall['CSI']/1 * 100) + '%</b>';
        load['MSIT'] = '<b>' + Math.round(overall['MSIT']/1 * 100) + '%</b>';

        //Bold the total load
        _.each(overall, function (count, installer) {
          overall[installer] = '<b>' + count + '</b>';
        });

        weeks.push({
          start: {format: function () {return '';}},
          end: {format: function () {return '<b>Total:</b>';}},
          installers: overall
        });
        weeks.push({
          start: {format: function () {return '';}},
          end: {format: function () {return '<b>Load:</b>';}},
          installers: load
        });

        //Define Report Columns
        var columns = [
          {key: 'start', title: 'Week Start', transform: function (value, store, stores, index) {
            return value.format('l');
          }},
          {key: 'end', title: 'Week End', transform: function (value, store, stores, index) {
            return value.format('l');
          }},
          {key: 'installers', title: 'Skinny IT<br/>15 Teams', transform: function (value, store, stores, index) {
            return value.IST;
          }},
          {key: 'installers', title: 'AVIT<br/>8 Teams', transform: function (value, store, stores, index) {
            return value.AVIT;
          }},
          {key: 'installers', title: 'RH Tech<br/>3 Teams', transform: function (value, store, stores, index) {
            return value['RH TECH'];
          }},
          {key: 'installers', title: 'MIRA<br/>6 Teams', transform: function (value, store, stores, index) {
            return value.MIRA;
          }},
          {key: 'installers', title: 'CSI<br/>1 Teams', transform: function (value, store, stores, index) {
            return value.CSI;
          }},
          {key: 'installers', title: 'ATI<br/>1 Team', transform: function (value, store, stores, index) {
            return value.ATI;
          }},
          {key: 'installers', title: 'AVA<br/>1 Team', transform: function (value, store, stores, index) {
            return value.AVA;
          }}
        ];

        //Define report title
        var title = 'Construction Installers  - Workload';

        //Show report
        report.render({
          data: weeks,
          columns: columns,
          title: title,
          target: target,
          routeCheck: routeCheck
        });
      });
    }
  };
});