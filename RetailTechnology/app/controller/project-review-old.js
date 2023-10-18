define(['app/view/report'], function (report) {
    return {
        show: function (target, routeCheck, options) {
            //Make sure options is an object
            options = options || {};

            //Build query
            var query = new CamlBuilder().Where().All(
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').LessThanOrEqualTo((moment().add({months: 3}).format('YYYY-MM-DD'))),
                CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                )
            ).OrderByDesc('Store_x0020_Number_x003a_Store_x');

            query = "<Query>" + query.ToString() + "</Query>";
            
            //Define Report Columns

            var columns = [
                {key: 'ProjectType', title: 'Type'},
                {key: 'StoreNumber', title: 'No.'},
                {key: 'City', title: 'City'},
                {key: 'Installer', title: 'Installer'},
                {key: 'HughesTempDate', title: 'Hughes', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                        (store.HughesTempStatus !== "" ? "</br>" + store.HughesTempStatus : '');
                }},
                {key: 'Pos', title: 'POS<br/>Vendor'},
                {key: 'PosDeliveryDate', title: 'POS<br/>Delivery', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                           (store.PosStatus !== "" ? "</br>" + store.PosStatus : '');
                }},
                {key: 'PopsDeliveryDate', title: 'POPS<br/>Delivery', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                           (store.PopsStatus !== "" ? "</br>" + store.PopsStatus : '');
                }},
                {key: 'PaysDeliveryDate', title: 'PAYS<br/>Delivery', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                        (store.PaysStatus !== "" ? "</br>PAYS: " + store.PaysStatus : '') +
                        (store.ServerEps !== "" ? "</br>ServerEPS: " + store.ServerEps : '') +
                        (store.CirronetStatus !== "" ? "</br>PosData: " + store.CirronetStatus: '');
                }},
                {key: 'AudioDeliveryDate', title: 'Audio<br/>Delivery', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                        (store.AudioStatus !== "" ? "</br>" + store.AudioStatus : '');
                }},
                {key: 'InstallDate', title: 'Install<br/>Date', transform: function (date, store, stores, index) {
                    return (date !== '' ? moment(date).format('l') : '' )+
                        (store.InstallationStatus !== "" ? "</br>" + store.InstallationStatus : '');
                }},
                {key: 'PosConfigDate', title: 'POS CAL<br/>Date', transform: 'date'},
                {key: 'PosVendorSupportDate', title: 'POS Support<br/>Date', transform: 'date'},
                {key: 'GoLiveDate', title: 'GO-LIVE', transform: 'date'},
                {key: 'ProjectManager', title: 'IT PM'},
                {key: 'ConstructionManager', title: 'Construction PM'},
                {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                    return "<a href='#summary/" + value + "'>more</a>"
                }}
            ];
            //Define report title
            var title = 'Project Review';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                var keepers = [];
                if (_.isEmpty(options)) {
                    return arr;
                } else {
                    _.forEach(arr, function (store, index) {
                        if (typeof options.itpm !== 'undefined' && store.ProjectManager.toUpperCase().indexOf(options.itpm.toUpperCase()) !== -1) {
                            keepers.push(store);
                        }
                    });

                    return keepers;
                }
            };

            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                routeCheck: routeCheck
            });
            

        }

        
    };
});