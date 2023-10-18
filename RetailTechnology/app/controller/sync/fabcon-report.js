define(['app/view/sync/fabcon-report', 'app/view/report', 'app/store/combined', 'app/store/construction', 'dijit/registry'], function (view, report, combined, construction, registry) {
    var compareData = [];

    function compare(routeCheck) {
        var stores = [];

        //Build query
        var query = new CamlBuilder().Where().All(
            CamlBuilder.Expression().DateField('POPS_x0020_Delivery_x0020_Date').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today)
        );

        query = "<Query>" + query.ToString() + "</Query>";

        //Load construction data
        construction.loadData({combinedQuery: query}, complete);


        //Scrub the data for invalid/blank/header entries
        var valid = {},
            duplicates = [];
        _.forEach(compareData, function (store, storeIndex) {
            //Check to see if it's even valid as a store number (not a header or blank
            var storeNumber = store[0];
            if (!isNaN(parseInt(storeNumber))) {
                valid[storeNumber] = valid[storeNumber] || [];
                valid[storeNumber].push({
                    StoreNumber: store[0],
                    Address: store[1],
                    City: store[2],
                    State: store[3],
                    Zip: store[4],
                    Pays: store[7] || 0,
                    DriveThruPaysEnclosures: store[8] || 0,
                    CChannels: store[9] || 0,
                    OutdoorPaysEnclosures: store[10] || 0,
                    IndoorPaysEnclosures: store[11] || 0,
                    PatioBrackets: store[12] || 0,
                    TotalStalls: store[13] || 0,
                    PopsDeliveryDate: moment(store[15]).format('YYYY-MM-DD')
                });
            }
        });

        //Check for duplicates and re-index
        //TODO - Why??
        compareData = {};
        _.each(valid, function (store, key) {
            if (store.length !== 1) {
                //Check for duplicates or accuracy
                duplicates.push(store);
                delete valid[key];
            } else {
                //Add the singles back indexed by store number as objects with useful info
                compareData[store[0].StoreNumber] = store[0];
            }
        });

        //Called after combined and construction projects are loaded
        function complete(stores) {
            //TODO continue here - make sure to check the address
            //Go through all of our stores, look for differences, things that have been removed, added, etc
            var diff = {
                delivery: [],
                missing: [], //missing from fabcon
                removed: [], //on fabcon, not
                quantity: {},
            };

            function setQuantity (store, key, sonic, fabCon) {
                if (typeof diff.quantity[store.StoreNumber] === 'undefined') {
                    diff.quantity[store.StoreNumber] = {
                        StoreNumber: store.StoreNumber,
                        ProjectType: store.ProjectType,
                        Pays: '',
                        DriveThruPaysEnclosures: '',
                        CChannels: '',
                        OutdoorPaysEnclosures: '',
                        IndoorPaysEnclosures: '',
                        PatioBrackets: '',
                        TotalStalls: ''
                    }
                }

                diff.quantity[store.StoreNumber][key] = parseInt(fabCon) + " / " + parseInt(sonic);
            }

            _.forEach(stores, function (store) {
                //Only check stuff that has dates, is less than a year out, and hasn't already been delivered
                if (store.PopsDeliveryDate !== "" && moment(store.PopsDeliveryDate).diff(moment(), 'years') < 1 && moment(store.PopsDeliveryDate).diff(moment(), 'days') > 0) {
                    //Check to see if fabcon has it tracked
                    if (typeof compareData[store.StoreNumber] === 'undefined') {
                        diff.missing.push(store);
                    } else {
                        var compareStore = compareData[store.StoreNumber];
                        compareStore.ProjectType = store.ProjectType;
                        //If it exists, check to see if any dates/quantities are mismatchd
                        if (moment(compareStore.PopsDeliveryDate, 'YYYY-MM-DD').diff(moment(store.PopsDeliveryDate), 'days') !== 0) {
                            store.FabConDeliveryDate = compareStore.PopsDeliveryDate;
                            diff.delivery.push(store);
                        }
                        //Stalls
                        if (store.TotalStalls === '') store.TotalStalls = 0;
                        if (compareStore.TotalStalls === '') compareStore.TotalStalls = 0;
                        if (typeof compareStore.TotalStalls === 'undefined') compareStore.TotalStalls = 0;

                        if (parseInt(compareStore.TotalStalls) !== parseInt(store.TotalStalls)) {
                            setQuantity(compareStore, 'TotalStalls', store.TotalStalls, compareStore.TotalStalls);
                        }

                        //Extension
                        if (store.ExtensionBrackets === '') store.ExtensionBrackets = 0;
                        if (compareStore.PatioBrackets === '') compareStore.PatioBrackets = 0;
                        if (typeof compareStore.PatioBrackets === 'undefined') compareStore.PatioBrackets = 0;

                        if (parseInt(compareStore.ExtensionBrackets) !== parseInt(store.PatioBrackets)) {
                            setQuantity(store, 'PatioBrackets', store.ExtensionBrackets, compareStore.PatioBrackets);
                        }
                        //C-Channel
                        if (store.CChannels === '') store.CChannels = 0;
                        if (compareStore.CChannelBrackets === '') compareStore.CChannelBrackets = 0;
                        if (typeof compareStore.CChannelBrackets === 'undefined') compareStore.CChannelBrackets = 0;

                        if (parseInt(compareStore.CChannelBrackets) !== parseInt(store.CChannels)) {
                            setQuantity(compareStore, 'CChannels', store.CChannelBrackets, compareStore.CChannels);
                        }
                    }
                }
            });
            debugger;

            //Check to see if anything has been removed from sonic's report that fabcon was tracking
            stores = _.indexBy(stores, function (store) {return store.StoreNumber;});
            _.forEach(compareData, function (compareStore) {
                if (typeof stores[compareStore.StoreNumber] === 'undefined' && compareStore.PopsDeliveryDate !== '' && compareStore.PopsDeliveryDate > moment().format('YYYY-MM-DD')) {
                    //TODO - verify all these
                    //debugger;
                    diff.removed.push(compareStore);
                }
            });

            //Build and display three reports, one for new stores, one for deleted stores, and one for stores with different go live dates
            view.results({
                results: diff,
                routeCheck: routeCheck,
                callback: afterRender
            });

            //Event handling for view controls
            function afterRender(view) {}
        }
    }

    return {
        show: function (target, routeCheck, options) {
            //Show form
            view.render({
                target: target,
                routeCheck: routeCheck,
                callback: function (form) {
                    //Register a handler for the paste event
                    form.input.on('paste', function (evt) {
                        var text = '';
                        if (window.clipboardData && window.clipboardData.getData) { // IE
                            text = window.clipboardData.getData('Text');
                        } else if (evt.clipboardData && evt.clipboardData.getData) {
                            text = evt.clipboardData.getData('text/plain');
                        }

                        //Parse out of tab delimited data
                        compareData = $.parse(text, {header: false}).results;

                        //Compare
                        compare(routeCheck);
                    });
                }
            });
        }
    };
});