define(['app/view/weekly-pops/weekly-pops', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number"], function (view, combined, construction, hash, dNumber) {
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
                CamlBuilder.Expression().All(
                    CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(options.start),
                    CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(options.end)
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({query: combinedQuery}, function (data) {
                var keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {
                    var popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD');

                    //Add the POPS projects - includes a special case conditional to include items that delivered on saturday, install sunday, and open monday
                    if ((options.start <= popsDelivery || (options.start <= moment(popsDelivery).add(1, 'days').format('YYYY-MM-DD') && moment(store.PopsDeliveryDate).format('E') === "6")) && popsDelivery <= options.end) {
                        //If on a saturday, install is sunday, go-live is on monday
                        if (moment(store.PopsDeliveryDate).format('E') === "6") {
                            store.InstallDate = moment(store.PopsDeliveryDate).add(1, 'days').toISOString();     //install is sunday
                            store.GoLiveDate = moment(store.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is on monday
                        } else {
                            store.InstallDate = store.PopsDeliveryDate;  //install is the same day
                            store.GoLiveDate = moment(store.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                        }
                        if (store.Pos.toUpperCase().indexOf('MICROS') !== -1) {
                            store.InstallType = 'Micros Conversion';
                        } else {
                            store.InstallType = 'Infor Conversion';
                        }

                        keepers.push(store);
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
                    CamlBuilder.Expression().Any(
                        CamlBuilder.Expression().All(
                            CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(options.start),
                            CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(options.end)
                        ),
                        CamlBuilder.Expression().All(
                            CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment(options.start).add(-9, 'days').format('YYYY-MM-DD')),
                            CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment(options.end).add(-9, 'days').format('YYYY-MM-DD'))
                        )
                    ),
                    CamlBuilder.Expression().Any(
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                    )
                )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({combinedQuery: constructionQuery}, function (data) {
                //Sort into R/R/R vs New, and give artificial delivery date if not set
                var keepers = [];
                _.forEach(data, function (store) {
                    //Sort into new vs. other
                    if (store.ProjectType === 'New') {
                        store.InstallType = "New";
                    } else {
                        store.InstallType = "Relo/Rebuild/Remodel";
                    }

                    //Create artificial delivery date if not present
                    if ((typeof store.InstallDate === 'undefined' || store.InstallDate === '') && (typeof store.PopsDeliveryDate === 'undefined' || store.PopsDeliveryDate === '')) {
                        store.InstallDate = moment(store.GoLiveDate).add(-7, 'days').format('YYYY-MM-DD');
                        store.PopsDeliveryDate = moment(store.GoLiveDate).add(-9, 'days').format('YYYY-MM-DD');
                    } else if (typeof store.PopsDeliveryDate === 'undefined' || store.PopsDeliveryDate === '') {
                        store.PopsDeliveryDate = moment(store.InstallDate).add(-2, 'days').format('YYYY-MM-DD');
                    }

                    //Remove time portion of POPS Delivery date
                    store.PopsDeliveryDate = moment(store.PopsDeliveryDate).format('YYYY-MM-DD');

                    //Add to list if still in the correct range & And the right project type (there's a few construction call list items that are now conversion types
                    if (store.ProjectType !== 'POS Conversion' && store.PopsDeliveryDate >= options.start && store.PopsDeliveryDate <= options.end) {
                        keepers.push(store);
                    }
                });

                //Notify complete
                stores = stores.concat(keepers);
                constructionComplete = true;
                complete();
            });

            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };

            function complete () {
                if (constructionComplete && combinedComplete) {
                    //Build report if complete
                    view.render({
                        data: stores,
                        start: options.start,
                        end: options.end,
                        target: target,
                        routeCheck: routeCheck,
                        callback: function (view) {
                            //Register handler for filter button
                            view.button.on('click', function () {
                                //Get all the values and build a hash
                                var fragment = "weekly-pops/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
                                                                        "/end/" + encodeURIComponent(moment(view.end.get('value')).format('YYYY-MM-DD'));

                                hash(fragment);
                            });
                        }
                    });
                }
            }
        }
    };
});