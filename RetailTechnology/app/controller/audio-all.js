define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            //var query = new CamlBuilder().Where().Any(
            //    CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
            //    CamlBuilder.Expression().DateField('Audio_x0020_Install_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
            //);

            query = "<Query></Query>";

            //Define Report Columns
            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'AudioType', title: 'Audio'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                {key: 'Installer', title: 'Installer', transform: function (installer, store, stores, i) {
                    if (store.ProjectType === 'POS Conversion') {
                        return store.AudioInstaller;
                    } else {
                        return store.Installer;
                    }
                }},
                {key: 'AudioDeliveryDate', title: 'Audio Delivery<br/>Pre-Cable', transform: 'date', minWidth: '100px'},
                {key: 'AudioInstallDate', title: 'Install<br/>Date', transform: function (date, store, stores, i) {
                    if (date === '' && typeof store.InstallDate !== 'undefined' && store.InstallDate !== '') {
                        return moment(store.InstallDate).format('l');
                    } else if (date !== '') {
                        return moment(date).format('l');
                    } else {
                        return '';
                    }
                }},
                {key: 'GoLiveDate', title: 'Go-Live', transform: function (date, store, stores, i) {
                    if (store.ProjectType === 'POS Conversion') {
                        if (store.AudioInstallDate === '' || typeof store.AudioInstallDate === 'undefined') {
                            return '';
                        } else {
                            return moment(store.AudioInstallDate).add(3, 'days').format('l');
                        }
                    } else {
                        if (date === '' || typeof date === 'undefined') {
                            return '';
                        } else {
                            return moment(date).format('l');
                        }
                    }
                }},
                {key: 'Pos', title: 'Pos'},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'Audio - Historical Projects';

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
                    if (store.AudioType !== '') {
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