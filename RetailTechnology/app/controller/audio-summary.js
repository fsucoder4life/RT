define(['app/view/audio-summary/audio-summary', 'app/store/construction', 'app/store/combined', 'app/store/user'], function (proforma, construction, combined, user) {
    var me = {
        storeData: {}       //this is so other controllers can pass in some data before this controller is hit - right now just POS amounts
    };

    var constants = {
        Installation: 2850,
        ProjectManagement: 500,
        TaxRate:.085
    };

    function afterRender (view) {
        //Register handlers for each line item
        _.each(view.proformas, function (proforma, index) {
            _.each(proforma.invoiceItems, function (item, i) {
                item.Quantity.on('change', function () {
                    var itemData = proforma.store.invoiceItems[i];
                    itemData.Quantity = new Big(item.Quantity.get('value').replace(',', ''));
                    item.Total.update();

                    //Update Totals
                    proforma.SubTotal.update();
                    proforma.Taxes.update();
                    proforma.Total.update();
                    //Hide/Show dollar signs
                    if (itemData.Quantity == new Big(0) && itemData.Price == new Big(0)) {
                        item.Dollars.hide();
                    } else {
                        item.Dollars.show();
                    }
                });
                item.Price.on('change', function () {
                    var itemData = proforma.store.invoiceItems[i];
                    //Fix the formatting of negatives by removing parenthesis and adding a negative
                    if (item.Price.get('value').indexOf('(') !== -1) {
                        item.Price.set('value', '-' + item.Price.get('value').replace('(', '').replace(')', ''));
                    }
                    //Update Item
                    itemData.Price = new Big(item.Price.get('value').replace(',', ''));
                    item.Total.update();
                    //Update Totals
                    proforma.SubTotal.update();
                    proforma.Taxes.update();
                    proforma.Total.update();
                    //Hide/Show dollar signs
                    if (itemData.Quantity == new Big(0) && itemData.Price == new Big(0)) {
                        item.Dollars.hide();
                    } else {
                        item.Dollars.show();
                    }
                });
            });
        });
    }

    me.show = function (target, storeNumbers, routeCheck) {
        //Look up the stores
        //TODO check the search controller for data after making an all stores search
        //Build associative array, grab id, and build CAML Query
        var searchBlocks = [];
        _.forEach(storeNumbers, function (storeNumber, i) {
            //Add to the caml query
            searchBlocks.push(CamlBuilder.Expression().TextField('Title').Contains(storeNumber));
        });

        var query = new CamlBuilder().Where().Any.apply(CamlBuilder.Expression(), searchBlocks);
        query = "<Query><Where>" + query.ToString() + "</Where></Query>";

        combined.loadData({query: query}, function (stores) {
            var showPosDisclaimer = false;

            //Create the line items for each invoice item
            _.each(stores, function (store, index) {
                //Shared Items
                var items = [];
                items.push({
                    ProductCode: 'INSTALL',
                    Description: 'Installation of Micros Audio',
                    Price: constants.Installation,
                    Quantity: 1,
                    Taxable: false
                });

                items.push({
                    ProductCode: 'PROJ-MGMT',
                    Description: 'Project Management & Implementation Fee',
                    Price: constants.ProjectManagement,
                    Quantity: 1,
                    Taxable: false
                });

                items.push({
                    ProductCode: 'EQUIP',
                    Description: 'Micros Audio Equipment',
                    Price: 0,
                    Quantity: 1,
                    Taxable: true
                });

                store.invoiceItems = items;
            });

            //Show summary
            proforma.render({
                stores: stores,
                showPosDisclaimer: showPosDisclaimer,
                taxRate: constants.TaxRate,
                user: user.loadData(),
                target: target,
                routeCheck: routeCheck,
                callback: afterRender
            });
        });
    };

    return me;
});