define(['app/view/project-assignment/project-assignment', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number", 'app/rules/construction','app/brands/services/logHelper'], function (view, combined, construction, hash, dNumber, constructionRules,logHelper) {
    return {
        show: function (target, routeCheck, options) {
            //Pull a list of projects and calculate the workload for each PM
            var workload = [],
                quarters = [],
                fiscalYear = '';

            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment().add({days: 120}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');
            query =  "<Query>" + query.ToString() + "</Query>";

            construction.loadData({combinedQuery: query}, function (stores) {
                var katigan = 0, bryant = 0, stephen = 0, russ = 0, palmer = 0, jason = 0, matt = 0, lauren = 0, dylan = 0, unassigned = 0, liz = 0, laurenActive = 0, dylanActive = 0, katiganActive = 0, bryantActive = 0, russActive = 0, stephenActive = 0, palmerActive = 0, jasonActive = 0, lizActive = 0, mattActive = 0, unassignedActive = 0, active = 0;
                _.forEach(stores, function (store, index) {
                    
                    //if (store.ProjectManager.toUpperCase().indexOf('STEPHEN') === 0) {
                    //    stephen++;
                    //if (store.ProjectStatus !== 'NOC') stephenActive++;
                    //}

                    //console.log("PM: " + store.ProjectManager.ToString());
                    logHelper.logDebug('project-assignment.js','Store: ' + store.StoreNumber + " | ProjectStatus: " + store.ProjectStatus + " | ProjectManager: " + store.ProjectManager);
                    if (store.ProjectManager.toUpperCase().indexOf('BAILEY') > -1) {
                        bailey++;
                        if (store.ProjectStatus !== 'NOC') palmerActive++;
                    } else if (store.ProjectManager.toUpperCase().indexOf('ELIZABETH') === 0) {
                        liz++;
                        if (store.ProjectStatus !== 'NOC') lizActive++;
                    } else if (store.ProjectManager.toUpperCase().indexOf('RICE') > -1) {
                        bryant++;
                        if (store.ProjectStatus !== 'NOC') bryantActive++;
                    }
                    else if (store.ProjectManager.toUpperCase().indexOf('KATIGAN') > -1) {
                        katigan++;
                        if (store.ProjectStatus !== 'NOC') katiganActive++;
                    }
                    else if (store.ProjectManager.toUpperCase().indexOf('EMILY') === 0) {
                        jason++;
                        if (store.ProjectStatus !== 'NOC') jasonActive++;
                    }
                    else if (store.ProjectManager.toUpperCase().indexOf('KAITLYN') > -1) {
                        lauren++;
                        if (store.ProjectStatus !== 'NOC') laurenActive++;
                    }
                    else if (store.ProjectManager.toUpperCase().indexOf('DYLAN') === 0) {
                        dylan++;
                        if (store.ProjectStatus !== 'NOC') dylanActive++;
                    }
                    else {
                        unassigned++;
                        if (store.ProjectStatus !== 'NOC') unassignedActive++;
                    }
                    if (store.ProjectStatus !== 'NOC') active++;
                });
                //workload.push({ ProjectManager: 'Stephen Tremaine', Workload: stephen, Active: stephenActive });
                
                workload.push({ProjectManager: 'Brittany Palmer', Workload: palmer, Active: palmerActive});
                //workload.push({ProjectManager: 'Liz Sannes', Workload: liz, Active: lizActive});
                
                workload.push({ ProjectManager: 'Emily Boatright', Workload: jason, Active: jasonActive });
                workload.push({ ProjectManager: 'Josh Rice', Workload: bryant, Active: bryantActive });
                //workload.push({ ProjectManager: 'Russell Katigan', Workload: katigan, Active: katiganActive });
               // workload.push({ ProjectManager: 'Kaitlyn Childers', Workload: lauren, Active: laurenActive });
                workload.push({ ProjectManager: 'Dylan Gehlbach', Workload: dylan, Active: dylanActive });
                workload.push({ProjectManager: 'Unassigned', Workload: unassigned, Active: unassignedActive});
                workload.push({ProjectManager: '<b>Total:</b>', Workload: '<b>' + stores.length + '</b>', Active: '<b>' + active + '</b>'});

                complete();
            });

            //Break projects into quarters for the year
            //First - Determine quarters:
            var fyStartYear = (parseInt(moment().format('M')) >= 9 && parseInt(moment().format('M')) <= 12) ? moment().format('YYYY') : moment().add(-1, 'year').format('YYYY'),
                fyEndYear = (parseInt(moment().format('M')) >= 9 && parseInt(moment().format('M')) <= 12) ? moment().add(1, 'year').format('YYYY') : moment().format('YYYY'),
                fyAbbreviation = (parseInt(moment().format('M')) >= 9 && parseInt(moment().format('M')) <= 12) ? moment().add(1, 'year').format('YY') : moment().format('YY'),
                fyStart = moment(fyStartYear + '-09-01').format('YYYY-MM-DD'),
                q1 = moment(fyStartYear + '-11-30').format('YYYY-MM-DD'),
                q2 = moment(fyEndYear + '-03-01').add(-1, 'days').format('YYYY-MM-DD'),
                q3 = moment(fyEndYear + '-05-31').format('YYYY-MM-DD'),
                q4 = moment(fyEndYear + '-08-31').format('YYYY-MM-DD'),
                fiscalYear = moment(q4).format('YYYY'),
                q1Count = 0,
                q2Count = 0,
                q3Count = 0,
                q4Count = 0,
                q1NewCount = 0,
                q2NewCount = 0,
                q3NewCount = 0,
                q4NewCount = 0,
                q1InitialCount = 0,
                q2InitialCount = 0,
                q3InitialCount = 0,
                q4InitialCount = 0,
                q1InitialNewCount = 0,
                q2InitialNewCount = 0,
                q3InitialNewCount = 0,
                q4InitialNewCount = 0;

            //Build query to find all construction projects this year
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(fyStart),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(q4),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');
            query =  "<Query>" + query.ToString() + "</Query>";
            //Execute query
            construction.loadData({combinedQuery: query}, function (stores) {
                //Count stores by quarter
                _.forEach(stores, function (store, index) {
                    //Go Live Count
                    var goLive = moment(store.GoLiveDate).format('YYYY-MM-DD');

                    if (goLive >= fyStart && goLive <= q1){
                        q1Count++;
                        if(store.ProjectType === 'New') q1NewCount++;
                    } else if (goLive > q1 && goLive <= q2){
                        q2Count ++;
                        if(store.ProjectType === 'New') q2NewCount++;
                    } else if (goLive > q2 && goLive <= q3) {
                        q3Count ++;
                        if(store.ProjectType === 'New') q3NewCount++;
                    } else if (goLive > q3 && goLive <= q4) {
                        q4Count ++;
                        if(store.ProjectType === 'New') q4NewCount++;
                    }

                    //Projected Go-Live Count
                    var projectedGoLive = (typeof store.InitialGoLiveDate !== 'undefined' && store.InitialGoLiveDate !== '') ? moment(store.InitialGoLiveDate).format('YYYY-MM-DD') : moment(store.GoLiveDate).format('YYYY-MM-DD');
                    var initial = q1InitialCount + q2InitialCount + q3InitialCount + q4InitialCount,
                        initialNew = q1InitialNewCount + q2InitialNewCount + q3InitialNewCount + q4InitialNewCount;

                    if (projectedGoLive >= fyStart && projectedGoLive <= q1){
                        q1InitialCount++;
                        if(store.ProjectType === 'New') q1InitialNewCount++;
                    } else if (projectedGoLive > q1 && projectedGoLive <= q2){
                        q2InitialCount++;
                        if(store.ProjectType === 'New') q2InitialNewCount++;
                    } else if (projectedGoLive > q2 && projectedGoLive <= q3) {
                        q3InitialCount++;
                        if(store.ProjectType === 'New') q3InitialNewCount++;
                    } else if (projectedGoLive > q3 && projectedGoLive <= q4) {
                        q4InitialCount++;
                        if(store.ProjectType === 'New') q4InitialNewCount++;
                    }

                    // if (q1InitialCount + q2InitialCount + q3InitialCount + q4InitialCount === initial || (store.ProjectType === 'New' && q1InitialNewCount + q2InitialNewCount + q3InitialNewCount + q4InitialNewCount === initialNew)) debugger;
                });

                quarters.push({Quarter: 'Q1:', Count: q1NewCount + " / " + q1Count, InitialCount: q1InitialNewCount + " / " + q1InitialCount});
                quarters.push({Quarter: 'Q2:', Count: q2NewCount + " / " + q2Count, InitialCount: q2InitialNewCount + " / " + q2InitialCount});
                quarters.push({Quarter: 'Q3:', Count: q3NewCount + " / " + q3Count, InitialCount: q3InitialNewCount + " / " + q3InitialCount});
                quarters.push({Quarter: 'Q4:', Count: q4NewCount + " / " + q4Count, InitialCount: q4InitialNewCount + " / " + q4InitialCount});
                quarters.push({
                    Quarter: '<b>Total</b>:',
                    Count: '<b>' + (q1NewCount + q2NewCount + q3NewCount + q4NewCount) + " / " + (q1Count + q2Count + q3Count + q4Count) + '</b>',
                    InitialCount: '<b>' + (q1InitialNewCount + q2InitialNewCount + q3InitialNewCount + q4InitialNewCount) + " / " + (q1InitialCount + q2InitialCount + q3InitialCount + q4InitialCount) + '</b>'
                });

                complete();
            });

            //Show the next 90 days to start calls on
            var start = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment().add({days: 90}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            start = "<Query>" + start.ToString() + "</Query>";

            //Show the 90-120 day range to assign project managers
            var assign = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThan(moment().add({days: 90}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment().add({days: 120}).format('YYYY-MM-DD')),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            assign = "<Query>" + assign.ToString() + "</Query>";

            var count = 0;
            function complete () {
                //Wait for two queries to finish
                if (++count >= 2) {
                    
                    view.render({
                        start: start,
                        assign: assign,
                        workload: workload,
                        quarters: quarters,
                        fiscalYear: fiscalYear,
                        routeCheck: routeCheck,
                        target: target,
                        callback: constructionRules.tableHelper,
                        afterChange: constructionRules.tableChangeHelper
                    });
                }
            }
        }
    };
});