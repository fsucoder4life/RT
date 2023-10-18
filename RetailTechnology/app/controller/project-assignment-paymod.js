define(['app/view/project-assignment-paymod/project-assignment-paymod', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number", 'app/rules/construction'], function (view, combined, construction, hash, dNumber, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
            //Pull a list of projects and calculate the workload for each PM
            var workload = [],
                quarters = [],
                fiscalYear = '';

            //begin loop using stores array

            var stores = [];

            $().SPServices({
                operation: "GetListItems",
                listName: "Combined Construction Extend",
                
                CAMLQuery: "<Query><Where><And><Geq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today /></Value></Geq><Leq><FieldRef Name='VP6800_x0020_Go_x0020_Live' /><Value IncludeTimeValue='False' Type='DateTime'><Today OffsetDays='90' /></Value></Leq></And></Where><OrderBy><FieldRef Name='VP6800_x0020_Go_x0020_Live' /></OrderBy></Query>",
                CAMLViewFields: "<ViewFields><FieldRef Name='VP6800_x0020_IT_x0020_PM' /></ViewFields>",
                async: false,
                completefunc: function (xData, Status) {

                    $(xData.responseXML).SPFilterNode("z:row").each(function () {
                        //console.log("store num:" + $(this).attr("ows_Store_x0020_Number") + "-go live:" + $(this).attr("ows_VP6800_x0020_Go_x0020_Live"));
                        var store = {};

                        store.VP6800ITPM = $(this).attr("ows_VP6800_x0020_IT_x0020_PM");
                        if (!store.VP6800ITPM)
                            store.VP6800ITPM = "";
                        stores.push(store);

                    });
                }
            });


            var ankita = 0, parish = 0, coffman = 0, desai = 0, wright = 0, sannes = 0, srader = 0, unassigned = 0, ankitaActive = 0, parishActive = 0, coffmanActive = 0, desaiActive = 0, wrightActive = 0, sannesActive = 0, sraderActive = 0, unassignedActive = 0, active = 0;
            _.forEach(stores, function (store, index) {

                if (store.VP6800ITPM.toUpperCase().indexOf('KAITLYN') > -1) {
                    ankita++;
                    ankitaActive++;
                } else if (store.VP6800ITPM.toUpperCase().indexOf('PARISH') > -1) {
                    parish++;
                    parishActive++;
                } else if (store.VP6800ITPM.toUpperCase().indexOf('COFFMAN') > -1) {
                    coffman++;
                    coffmanActive++;
                }
                else if (store.VP6800ITPM.toUpperCase().indexOf('DESAI') > -1) {
                    desai++;
                    desaiActive++;
                }
                else if (store.VP6800ITPM.toUpperCase().indexOf('RICE') > -1) {
                    wright++;
                    wrightActive++;
                }
                else if (store.VP6800ITPM.toUpperCase().indexOf('SANNES') > -1) {
                    sannes++;
                    sannesActive++;
                }
                else if (store.VP6800ITPM.toUpperCase().indexOf('SRADER') > -1) {
                    srader++;
                    sraderActive++;
                }
                else {
                    unassigned++;
                    unassignedActive++;
                }
                active++;
            });
            //workload.push({ ProjectManager: 'Stephen Tremaine', Workload: stephen, Active: stephenActive });

            workload.push({ ProjectManager: 'Kaitlyn Childers', Workload: ankita, Active: ankitaActive });
            workload.push({ ProjectManager: 'Dustin Parish', Workload: parish, Active: parishActive });
            workload.push({ ProjectManager: 'Michele Coffman', Workload: coffman, Active: coffmanActive });
            workload.push({ ProjectManager: 'Neal Desai', Workload: desai, Active: desaiActive });
            workload.push({ ProjectManager: 'Josh Rice', Workload: wright, Active: wrightActive });
            workload.push({ ProjectManager: 'Elizabeth Sannes', Workload: sannes, Active: sannesActive });
            workload.push({ ProjectManager: 'Jason Srader', Workload: srader, Active: sraderActive });
            workload.push({ ProjectManager: 'Unassigned', Workload: unassigned, Active: unassignedActive });
            workload.push({ ProjectManager: '<b>Total:</b>', Workload: '<b>' + stores.length + '</b>', Active: '<b>' + active + '</b>' });


            

            //Show the 90-120 day range to assign project managers
            var assign = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThan(moment().add({ days: 90 }).format('YYYY-MM-DD')),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment().add({ days: 120 }).format('YYYY-MM-DD')),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            assign = "<Query>" + assign.ToString() + "</Query>";

            complete();

            function complete() {
                //Wait for two queries to finish


                view.render({
                    
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
    };
});