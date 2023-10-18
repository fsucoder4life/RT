define(['app/view/tracker/tracker', 'app/store/combined', 'app/store/construction', "dojo/hash", "dojo/number"], function (view, combined, construction, hash, dNumber) {
    return {
        show: function (target, options, routeCheck) {
            var combinedComplete = false,
                constructionComplete = false,
                stores = [];

            if (moment(options.posStart, 'YYYY-MM-DD', true).isValid() === false) {
                options.start = moment().format('YYYY-MM-DD');
            }
            if (moment(options.posEnd, 'YYYY-MM-DD', true).isValid() === false) {
                options.end = moment().add(4, 'months').format('YYYY-MM-DD');
            }

            //Build combined query
            var combinedQuery = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('Project_x0020_Type').EqualTo("POS Conversion"),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(moment(options.start).add({days: -1}).format('YYYY-MM-DD')),
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo(moment(options.end).add({days: -1}).format('YYYY-MM-DD'))
                    ),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(options.start),
                        CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo(options.end)
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
                    if (store.ProjectType === "POS Conversion") {
                        store.InstallType = "Conversion"
                    } else {
                        store.InstallType = "Construction"
                    }

                });

                //Notify complete
                stores = stores.concat(keepers);
                combinedComplete = true;
                complete();
            });

            //Define Report Columns
            var columns = [
                {key: 'InstallType', title: 'Install Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'Address', title: 'Address'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS', transform: function (value, row, data, index) {
                    if (row.InstallType === "POPS Conversion**") {
                        return "POPS Only"
                    } else {
                        return value;
                    }
                }},
                {key: 'Installer', title: 'Installer'},
                {key: 'PopsDeliveryDate', title: 'POPS Delivery', transform: 'date', editable: true},
                {key: 'GoLiveDate', title: 'Go-Live', transform: 'date', editable: true},
                {key: 'Classification', title: 'Type'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            var sort = {
                key: 'GoLiveDate',
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
                        } else if (options.posSelection && (store.Pos.toUpperCase().indexOf(options.posSelection.toUpperCase()) === -1 || store.InstallType === "POPS Conversion")) {
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
                        posSelection: options.posSelection,
                        columns: columns,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck,
                        callback: function (view) {
                            //Register handler for filter button
                            view.button.on('click', function () {
                                //Get all the values and build a hash
                                var fragment = "openings/openings-by-day/start/" + encodeURIComponent(moment(view.start.get('value')).format('YYYY-MM-DD')) +
                                                                        "/end/" + encodeURIComponent(moment(view.end.get('value')).format('YYYY-MM-DD'));

                                if (view.installer.get('value') !== "") {
                                    fragment += "/installer/" + encodeURIComponent(view.installer.get('value'));
                                }
                                if (view.city.get('value') !== "") {
                                    fragment += "/city/" + encodeURIComponent(view.city.get('value'));
                                }
                                if (view.state.get('value') !== "") {
                                    fragment += "/state/" + encodeURIComponent(view.state.get('value'));
                                }
                                if (view.pos.get('value') !== "") {
                                    fragment += "/posSelection/" + encodeURIComponent(view.pos.get('value'));
                                }

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