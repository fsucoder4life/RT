define(['app/view/report', 'app/store/construction', 'app/store/combined', 'app/rules/construction'], function (report, constructionStore, combinedStore, constructionRules) {
    return {
        show: function (target, routeCheck, options) {
            query = "<Query></Query>";

            combinedStore.loadData({query: query}, function (stores) {
                var keepers = [];
                _.forEach(stores, function (store, index) {
                    if (store.AudioType.toUpperCase().indexOf('MICROS') !== -1) {
                        keepers.push(store);
                    }
                });
                stores = keepers;

                var constructionQuery = "<Query>" + new CamlBuilder().Where().TextField('Store_x0020_Number').In(_.map(stores, function (store) {return store.StoreNumber})).ToString() + "</Query>";

                constructionStore.loadData({query: constructionQuery}, function (constructionStores) {
                    _.each(constructionStores, function (constructionStore) {
                        _.merge(_.find(stores, {StoreNumber: constructionStore.StoreNumber}), constructionStore);
                    });

                    //Define Report Columns
                    var columns = [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'AudioType', title: 'Type', minWidth: '100px'},
                        {key: 'AudioEndpointCount', title: 'Endpoints', editable: true, minWidth: '100px'},
                        {key: 'DriveThruFormat', title: 'Drive-Thru', editable: true, minWidth: '100px'},
                        {key: 'GroundLoopStatus', title: 'Loop<br/>Note', editable: true, minWidth: '100px'},
                        {key: 'AudioStatus', title: 'Quote<br/>Status', editable: true, minWidth: '175px'},
                        // {key: 'AudioConfiguration', title: 'Config', editable: true, minWidth: '175px'},
                        {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', transform: 'date', minWidth: '100px'},
                        {key: 'AudioInstallDate', title: 'Install<br/>Date', transform: function (date, store, stores, i) {
                            if ((date === '' || typeof date === 'undefined') && typeof store.InstallDate !== 'undefined' && store.InstallDate !== '') {
                                return moment(store.InstallDate).format('l');
                            } else if (date !== '') {
                                return moment(date).format('l');
                            } else {
                                return '';
                            }
                        }},
                        {key: 'AudioGoLiveDate', title: 'Go-Live', transform: function (date, store, stores, i) {
                            if (date === '' && store.GoLiveDate !== '' && store.ProjectType !== 'POS Conversion') {
                                return moment(store.GoLiveDate).format('l');
                            } else if (date !== '') {
                                return moment(date).format('l');
                            } else {
                                return '';
                            }
                        }},
                        {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='#summary/" + value + "'>more</a>"
                        }}
                    ];

                    //Define report title
                    var title = 'Micros Audio - Historical & Future';

                    //Define sorting
                    var sort = function (arr) {
                        arr.sort(function (a, b) {
                            if ( (typeof a.AudioInstallDate === 'undefined' || a.AudioInstallDate === '') && typeof a.InstallDate !== 'undefined') {
                                a = moment(a.InstallDate).toISOString();
                            } else {
                                a = a.AudioInstallDate;
                            }
                            if ( (typeof b.AudioInstallDate === 'undefined' || b.AudioInstallDate === '') && typeof b.InstallDate !== 'undefined') {
                                b = moment(b.InstallDate).toISOString();
                            } else {
                                b = b.AudioInstallDate;
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
                                if (store.AudioType.toUpperCase().indexOf('MICROS') !== -1) {
                                    keepers.push(store);
                                }
                            });

                            return keepers;
                        };

                    //Show report
                    report.render({
                        data: stores,
                        columns: columns,
                        title: title,
                        target: target,
                        sort: sort,
                        routeCheck: routeCheck//,
                        // filter: filter
                    });
                });
            });
        }
    };
});