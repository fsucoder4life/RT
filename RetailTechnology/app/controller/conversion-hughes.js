define(['app/view/report', 'app/rules/construction', 'app/email'], function (report, constructionRules, email) {
    return {
        show: function (target, routeCheck, options) {
            //Build query
            var query = new CamlBuilder().Where().All(
              CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
              CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
            ).OrderByDesc('POPS_x0020_Delivery_x0020_Date');

            query = "<Query>" + query.ToString() + "</Query>";

            //Define Report Columns
            var columns = [
                {key: 'StoreNumber', title: 'Store#', transform: function (value, row, data, index) {
                  return "<a href='#summary/" + value + "'>" + value + "</a>";
                }},
                {key: 'FranchiseGroup', title: 'Franchisee'},
                {key: 'City', title: 'City', transform: function (value, store, stores, i) {
                  return store.City + ", " + store.State;
                }},
                {key: 'State', title: 'State'},
                {key: 'Pos', title: 'POS', editable: true},
                {key: 'HughesTempStatus', title: 'HAN<br/>Status', editable: true},
                {key: 'HughesTempDate', title: 'HAN<br/>Date', editable: true},
                {key: 'GoLiveDate', title: 'POS Live<br/>Date', editable: true},
                {key: 'PopsDeliveryDate', title: 'Delivery<br/>Date', editable: true},
                {key: 'InstallDate', title: 'Install', transform: function (value, store, stores, i) {
                  var deliveryDate = moment(store.PopsDeliveryDate);
                  if (deliveryDate.isValid() && deliveryDate.format('E') === "6") {
                    return deliveryDate.add(1, 'days').format('l');     //install is sunday if delivery is Saturday
                  } else if (deliveryDate.isValid()) {
                    return deliveryDate.format('l');  //install is the same day of delivery
                  } else {
                    return '';
                  }
                }},
                {key: '', title: 'POPS<br/>Go-Live', transform: function (value, store, stores, i) {
                  var deliveryDate = moment(store.PopsDeliveryDate);
                  if (deliveryDate.isValid() && deliveryDate.format('E') === "6") {
                    return moment(store.PopsDeliveryDate).add({days: 2}).format('l');      //go live is on monday if delivery is Saturday
                  } else {
                    return moment(store.PopsDeliveryDate).add({days: 1}).format('l');      //go live is the morning after delivery/install
                  }
                }},
                {key: 'PrimaryContact', title: 'POC', editable: true},
                {key: 'PrimaryPhone', title: 'Phone', editable: true},
                {key: 'PrimaryEmail', title: 'Email', editable: true},
                {key: 'ProjectManager', title: 'PM', editable: true}
            ];

            //Define report title
            var title = 'Fabcon - Upcoming Projects';

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