define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().TextField('Audio_x0020_Type').EqualTo('HME 6700')
            ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                { key: 'DriveThruFormat', title: 'DT Type' },
                { key: 'StoreNumber', title: 'No.' },
                //{ key: 'PosDeliveryDate', title: 'POS Go-Live' },
                { key: 'GoLiveDate', title: 'POS<br/>Go-Live', transform: 'date' },
                { key: 'FranchiseGroup', title: 'Franchisee' },
                
                { key: 'Address', title: 'Address' },
                {key: 'City', title: 'City'},
                {key: 'State', title: 'State'},
                
                
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];

            //Define report title
            var title = 'HME 6700 - Dual Drive-Ins';

            //Define sorting
            var sort = function (arr) {
                arr.sort(function (a, b) {
                    //Conversions - sort by Audio delivery date, if not present, audio install date less one week
                    if (typeof a.AudioDeliveryDate === 'undefined' || a.AudioDeliveryDate === '') {
                        if ( (typeof a.AudioInstallDate === 'undefined' || a.AudioInstallDate === '') && typeof a.InstallDate !== 'undefined') {
                            a = moment(a.InstallDate).toISOString();
                        } else {
                            a = a.AudioInstallDate;
                        }
                    } else {
                        a = a.AudioDeliveryDate;
                    }

                    if (typeof b.AudioDeliveryDate === 'undefined' || b.AudioDeliveryDate === '') {
                        if ( (typeof b.AudioInstallDate === 'undefined' || b.AudioInstallDate === '') && typeof b.InstallDate !== 'undefined') {
                            b = moment(b.InstallDate).toISOString();
                        } else {
                            b = b.AudioInstallDate;
                        }
                    } else {
                        b = b.AudioDeliveryDate;
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

            var filter = function (arr) {
                var keepers = [],
                    now = moment().hours(0).minutes(0).seconds(0).toISOString();

                _.forEach(arr, function (store, index) {
                    if ( store.AudioType.toUpperCase().indexOf('HME') !== -1 && ( store.AudioGoLiveDate > now || store.AudioInstallDate > now ) )
                    {
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