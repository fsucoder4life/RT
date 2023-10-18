define(['app/view/project-quarters/project-quarters', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number", 'app/rules/construction'], function (view, combined, construction, hash, dNumber, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
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
                fiscalYearShort = 'FY ' + moment(q4).format('YY') + "'";

            //Build query to find all construction projects this fiscal year
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
                view.render({
                    fiscalYear: fiscalYear,
                    fiscalYearShort : fiscalYearShort,
                    routeCheck: routeCheck,
                    target: target,
                    stores: _.sortBy(stores, 'GoLiveDate')
                });
            });

            setTimeout(window.location.reload, 9000);
        }
    };  
});