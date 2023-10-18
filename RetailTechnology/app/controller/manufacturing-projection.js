define(['app/view/manufacturing-projection', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number"], function (view, combined, construction, hash, dNumber) {
    return {
        show: function (target, options, routeCheck) {
            var combinedComplete = false,
                constructionComplete = false,
                popsCountComplete,
                popsCounts,
                posCountComplete,
                posCounts,
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
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(options.start),
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(options.end)
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(moment(options.start).add({days: 1}).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(moment(options.end).add({days: 1}).format('YYYY-MM-DD'))
                    )
                )
            );

            combinedQuery = "<Query>" + combinedQuery.ToString() + "</Query>";

            //Load combined data
            combined.loadData({query: combinedQuery}, function (data) {
                var keepers = [],
                    copy;


                //Create a new entry for each date within our range
                _.forEach(data, function (store, index) {

                    var posInstall = moment(store.GoLiveDate).subtract({days: 1}).format('YYYY-MM-DD'),
                        popsDelivery = moment(store.PopsDeliveryDate).format('YYYY-MM-DD');
                    if (moment(posInstall).diff(moment(popsDelivery)) == 0) {
                        //Add a combined project if the go live minus one is the same as the install
                        copy = _.clone(store);
                        //Install is the day before go live here
                        copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
                        copy.InstallType = 'POPS & POS Conversion';
                        copy.Installer = store.Installer;
                        keepers.push(copy);
                    } else {
                        //Add the POS project - ignore the POS Projects
//                        if (options.start <= posInstall && posInstall <= options.end) {
//                            copy = _.clone(store);
//                            //Install is the day before go live here
//                            copy.InstallDate = moment(posInstall).format('YYYY-MM-DD');
//                            copy.InstallType = 'POS Conversion';
//                            keepers.push(copy);
//                        }

                        //Add the POPS projects
                        if (options.start <= popsDelivery && popsDelivery <= options.end) {
                            copy = _.clone(store);
                            copy.InstallDate = store.PopsDeliveryDate;
                            copy.Installer = store.PopsInstaller;
                            copy.InstallType = 'POPS Conversion';
                            copy.GoLiveDate = moment(copy.InstallDate).add({days: 1}).format('YYYY-MM-DD');      //go live is the morning after
                            keepers.push(copy);
                        }
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
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').GreaterThanOrEqualTo(moment(options.start).subtract({days: 5}).format('YYYY-MM-DD')),
                    CamlBuilder.Expression().DateField('Installer_x0020_Arrival_x0020_Da').LessThanOrEqualTo(options.end)
                )
            );

            constructionQuery = "<Query>" + constructionQuery.ToString() + "</Query>";

            //Load construction data
            construction.loadData({query: constructionQuery}, function (data) {
                //Give them all the type of construction
                _.forEach(data, function (store) {
                    store.InstallType = 'Construction';
                });

                //Notify complete
                stores = stores.concat(data);
                constructionComplete = true;
                complete();
            });

            //Define Report Columns
            var columns = [
                {key: 'InstallType', title: 'Install Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'Address', title: 'Address'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Zip', title: 'Zip'},
                {key: 'Installer', title: 'Installer'},
                {key: 'StallCount', title: 'POPS', transform: function (stallCount, store, stores, index) {
                    return dNumber.format((store.StallCount !== "" ? parseInt(store.StallCount) : 0) + (store.PatioCount !== "" ? parseInt(store.PatioCount) : 0), {places: 0, locale: 'en-us'});
                }},
                {key: 'ExtensionBrackets', title: 'Patio Brackets', transform: function (patioCount, store, stores, index) {
                    return dNumber.format((store.ExtensionBrackets !== "" ? parseInt(store.ExtensionBrackets) : 0), {places: 0, locale: 'en-us'});
                }},
                {key: 'CChannelBrackets', title: 'C Channels', transform: function (patioCount, store, stores, index) {
                    return dNumber.format((store.CChannelBrackets !== "" ? parseInt(store.CChannelBrackets) : 0), {places: 0, locale: 'en-us'});
                }},
                {key: 'PopsDeliveryDate', title: 'Delivery Date', transform: 'date'},
                {key: 'InstallDate', title: 'Install Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            var sort = {
                key: 'InstallDate',
                direction: 'DESC'
            };

            function complete () {
                if (constructionComplete && combinedComplete) {
                    //Filter both stores
                    var keepers = [];
                    _.forEach(stores, function (store) {
                        if (options.installer && store.Installer.toUpperCase().indexOf(options.installer.toUpperCase()) === -1) {
                            return;
                        } else if (options.city && store.City.toUpperCase().indexOf(options.city.toUpperCase()) === -1){
                            return
                        } else if (options.state && store.State.toUpperCase().indexOf(options.state.toUpperCase()) === -1) {
                            return;
                        } else if (options.projectType) {
                            var test = false;
                            if (typeof options.projectType === "string") options.projectType = [options.projectType];
                            _.each(options.projectType, function (type, i) {
                                switch (type) {
                                    case 'construction':
                                        if (store.InstallType === "Construction") {
                                            test = true;
                                        }
                                        break;
                                    case 'pos-conversion':
                                        if (store.InstallType === "POS Conversion" || store.InstallType === "POPS & POS Conversion") {
                                            test = true;
                                        }
                                        break;
                                    case 'pops-conversion':
                                        if (store.InstallType === "POPS Conversion" || store.InstallType === "POPS & POS Conversion") {
                                            test = true;
                                        }
                                        break;
                                }
                            });
                            if (test === false) {
                                return;
                            }
                        }
                        keepers.push(store);
                    });

                    //Build report if complete
                    view.render({
                        data: keepers,
                        start: options.start,
                        end: options.end,
                        installer: options.installer,
                        city: options.city,
                        state: options.state,
                        projectType: options.projectType,
                        columns: columns,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck,
                        callback: function (view) {
                            //Register handler for filter button
                            view.button.on('click', function () {
                                //Get all the values and build a hash
                                var fragment = "manufacturing-projection/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
                                                                        "/end/" + encodeURIComponent(moment(view.end.get('value')).format('YYYY-MM-DD'));

                                if (view.projectType.get('value').length !== 0) {
                                    var params = view.projectType.get('value');
                                    _.each(params, function (param, i) {
                                        params[i] = encodeURIComponent(param);
                                    });
                                    fragment += "/projectType/" + params.join();
                                }

                                hash(fragment);
                            });
                        }
                    });
                }
            }
        }
    };
});