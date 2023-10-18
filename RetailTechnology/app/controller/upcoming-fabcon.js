define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
                        CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').LessThanOrEqualTo((moment().add({ days: 180 }).format('YYYY-MM-DD')))
            ).OrderByDesc('POPS_x0020_Delivery_x0020_Date');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'StoreNumber', title: 'Store#', transform: function (value, row, data, index) {
                  return "<a href='#summary/" + value + "'>" + value + "</a>";
                }},
                
                {key: 'City', title: 'City', transform: function (value, store, stores, i) {
                  return store.City + ", " + store.State;
                }},
                { key: 'State', title: 'State' },
                { key: 'PopsStatus', title: 'Status' },
                { key: 'TotalStalls', title: 'Total<br/>POPS', transform: 'number' },
                { key: 'DtPopsQuantity', title: 'DT POPS', transform: 'number' },
                
                { key: 'ExtensionBrackets', title: 'Patio<br/>Brackets', transform: 'number' },

                
            { key: 'PaysEnclosureIndoor', title: 'Indoor PAYS Enclosures', transform: 'number' },
            { key: 'PaysEnclosureOutdoor', title: 'Outdoor PAYS Enclosures', transform: 'number' },
                { key: 'PaysEnclosureDriveThru', title: 'DT PAYS Enclosures', transform: 'number' },

                {
                    key: 'PopsDeliveryDate', title: 'Delivery Date', transform: function (value, store, stores, i) {
                        var deliveryDate = moment(store.PopsDeliveryDate);
                        if (deliveryDate.isValid() && deliveryDate.format('E') === "6") {
                            return deliveryDate.add(1, 'days').format('l');     //install is sunday if delivery is Saturday
                        } else if (deliveryDate.isValid()) {
                            return deliveryDate.format('l');  //install is the same day of delivery
                        } else {
                            return '';
                        }
                    }
                },

                {
                    key: 'DtPopsInstallDate', title: 'Install', transform: function (value, store, stores, i) {
                        var deliveryDate = moment(store.InstallDate);
                        if (deliveryDate.isValid() && deliveryDate.format('E') === "6") {
                            return deliveryDate.add(1, 'days').format('l');     //install is sunday if delivery is Saturday
                        } else if (deliveryDate.isValid()) {
                            return deliveryDate.format('l');  //install is the same day of delivery
                        } else {
                            return '';
                        }
                    }
                },
                
                { key: 'ProjectManager', title: 'PM', editable: true }
                
                
                
                
            ];

            //Define report title
            var title = 'FABCON POPS Consolidation Report';

            //Define sorting
            var sort = {
                key: 'PopsDeliveryDate',
                direction: 'DESC'
            };

            //Define filtering
//            var filter = function (arr) {
//                var keepers = [];
//                _.forEach(arr, function (store, index) {
//                    if (store.Pos.toUpperCase() === 'MICROS') {
//                        keepers.push(store);
//                    }
//                });
//
//                return keepers;
//            };

            var afterRender = function (view) {
                constructionRules.tableHelper(view);

                email.afterRenderReport(view, options);
            };

            //Load combined data
            //Show report
            report.render({
                combinedQuery: query,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
//                filter: filter,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: constructionRules.tableChangeHelper
            });

        }
    };
});