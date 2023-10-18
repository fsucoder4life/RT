define([
        'app/store/construction',
        'app/store/combined',
        'dojo/text!app/view/project-assignment/project-assignment.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip'
    ], function (construction, combined, template, TextBox, Button, report, registry, Tooltip) {

        return {
            render: function (options) {
                var me = {};

                //Add the template to the content area
                $(options.target).html(template);
                //innerHTML is making it here - but not showing in template.
                
                //Show Workload
                report.render({
                    data: options.workload,
                    columns: [
                        {key: 'ProjectManager', title: 'IT PM'},
                        {key: 'Active', title: 'Active'},
                        {key: 'Workload', title: 'Total'}
                    ],
                    target: $('#workload'),
                    routeCheck: options.routeCheck
                });
                //Show Quarters
                
                for (var i = 0; i < options.workload.length; i++) {
                    
                    $("div#workload #stores tbody").append("<tr><td>" + options.workload[i].ProjectManager + "</td><td>" + options.workload[i].Active + "</td><td>" + options.workload[i].Workload + "</td></tr>");
                    //Do something
                }
                
                
                $('#quarters-header').html('Fiscal Year ' + options.fiscalYear + ' (New / Total)');
                report.render({
                    data: options.quarters,
                    columns: [
                        {key: 'Quarter', title: 'Quarter'},
                        {key: 'InitialCount', title: 'Initial'},
                        {key: 'Count', title: 'Current'}
                    ],
                    target: $('#quarters'),
                    routeCheck: options.routeCheck
                });

                for (var i = 0; i < options.quarters.length; i++) {
                    $("div#quarters #stores tbody").append("<tr><td>" + options.quarters[i].Quarter + "</td><td>" + options.quarters[i].Count + "</td><td>" + options.quarters[i].InitialCount + "</td></tr>");
                    //Do something
                }

                //Show the reports - first the next 90 days
                construction.loadData({combinedQuery: options.start}, function (stores) {
                  report.render({
                    data: stores,
                    columns: [
                      {key: 'ProjectType', title: 'Type'},
                      {key: 'StoreNumber', title: 'No.'},
                      {key: 'ProjectStatus', title: 'Status', editable: true},
                      {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                        return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                      }},
                      {key: 'ProjectManager', title: 'IT PM', editable: true, minWidth: '100px'},
                      {key: 'FranchiseGroup', title: 'Franchisee'},
                      {key: 'InitialCallDate', title: 'Initial Call', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'InitialInstallDate', title: 'Initial<br/>Install', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'InitialGoLiveDate', title: 'Initial<br/>Go-Live', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'InstallDate', title: 'Install<br/>Start', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'InstallEndDate', title: 'Install<br/>End', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'GoLiveDate', title: 'Go Live', transform: 'date', editable: true, minWidth: '100px'},
                      {key: 'GoLiveChanges', title: 'Changes', transform: function (changes, store, stores, index) {
                        if (typeof changes !== 'undefined' && typeof changes.length !== 'undefined') {
                          return changes.length;
                        } else {
                          return "";
                        }
                      }},
                      {key: 'GoLiveQuarter', title: 'Quarter', transform: function (value, row, data, index) {
                        var month = parseInt(moment(row.GoLiveDate).format('M')),
                          fyEndYear = (month >= 9 && month <= 12) ? moment().add(1, 'year').format('YYYY') : moment(value).format('YYYY'),
                          fyEndYearAbbreviation = (month >= 9 && month <= 12) ? moment().add(1, 'year').format('YY') : moment(value).format('YY'),
                          quarter = '';
        
                        if (month >= 9 && month <= 11) quarter = 'Q1';
                        else if (month == 12 || month <= 2) quarter = 'Q2';
                        else if (month >= 3 && month <= 5) quarter = 'Q3';
                        else if (month >= 6 && month <= 8) quarter = 'Q4';
        
                        return quarter + " '" + fyEndYearAbbreviation;
                      }}
                    ],
                    sort: {
                      key: 'GoLiveDate',
                      direction: 'DESC'
                    },
                    target: $('#start'),
                    routeCheck: options.routeCheck
                  });
                  
                    //request version info for the change count
                    var versionRequests = 0;
                    _.each(stores, function (store) {
                        //Request all the go-live changes
                        versionRequests++;
                        combined.getGoLiveChanges(store, function(changes) {
                            versionRequests--;
                            store.GoLiveChanges = changes;
                            $('#store-' + store.StoreNumber + '-GoLiveChanges').html(changes.length);
                            if (versionRequests <= 0) complete();
                        });
                    });
                    if (versionRequests <= 0) complete();   //just in case the query returns no results

                    function complete() {
                    
                    }
                });


                //And show the range to assign
                report.render({
                    combinedQuery: options.assign,
                    columns: [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'ProjectStatus', title: 'Status', editable: true},
                        {key: 'City', title: 'Location', transform: function (value, row, data, index) {
                            return "<a class='link' href='#summary/" + row.StoreNumber+ "'>" + row.City + ", " + row.State + "</a>";
                        }},
                        {key: 'ProjectManager', title: 'IT PM', editable: true, minWidth: '100px'},
                        {key: 'FranchiseGroup', title: 'Franchisee'},
                        {key: 'InitialCallDate', title: 'Initial Call', transform: 'date', editable: true, minWidth: '100px'},
                        {key: 'InitialInstallDate', title: 'Initial<br/>Install', transform: 'date', editable: true, minWidth: '100px'},
                        {key: 'InitialGoLiveDate', title: 'Initial<br/>Go-Live', transform: 'date', editable: true, minWidth: '100px'},
                        {key: 'InstallDate', title: 'Install<br/>Date', transform: 'date'},
                        {key: 'GoLiveDate', title: 'Go Live', transform: 'date'},
                        {key: 'Quarter', title: 'Quarter', transform: function (value, row, data, index) {
                            var month = parseInt(moment(value).format('M')),
                                fyEndYear = (month >= 9 && month <= 12) ? moment().add(1, 'year').format('YYYY') : moment(value).format('YYYY'),
                                fyEndYearAbbreviation = (month >= 9 && month <= 12) ? moment().add(1, 'year').format('YY') : moment(value).format('YY'),
                                quarter = '';

                            if (month >= 9 && month <= 11) quarter = 'Q1';
                            else if (month == 12 || month <= 2) quarter = 'Q2';
                            else if (month >= 3 && month <= 5) quarter = 'Q3';
                            else if (month >= 6 && month <= 8) quarter = 'Q4';

                            return quarter + " '" + fyEndYearAbbreviation;
                        }}
                    ],
                    sort: {
                        key: 'GoLiveDate',
                        direction: 'DESC'
                    },
                    target: $('#assign'),
                    routeCheck: options.routeCheck
                });

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
    }
);