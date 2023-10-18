define(['app/view/sync/commworks', 'app/view/report', 'app/store/combined', 'app/store/notes', 'dijit/registry'], function (view, report, combined, noteStore, registry) {
    var compareData = [];
    var fieldMapping;

    function autoUpdate () {
        _.forEach(compareData, function (store, number) {
            console.log(number);
        });
        _.forEach(compareData, function (store, number) {
            if (typeof stores[number] === 'undefined') {
                console.log("store #" + number + " doesn't exist in sharepoint");
            }
        });
        _.forEach(compareData, function (store, number) {
            if (typeof stores[number] === 'undefined') {

            } else if (stores[number].Pos !== "Infor") {
                console.log("store #" + number + " has incorrect POS in sharepoint, live on " + store[5]);
            }
        });
        _.forEach(compareData, function (store, number) {
            if (typeof stores[number] === 'undefined') {

            } else if (stores[number].Pos !== "Infor") {

            } else if (moment(store[5]).format('YYYY-MM-DD').difference(moment(stores[number].GoLiveDate).format('YYYY-MM-DD'))) {
                console.log("store #" + number + " has incorrect live date - went live on " + store[5]);
            }
        });
    };

    function compare(routeCheck) {
        //Get all the conversions
        var query = new CamlBuilder().Where().All(
            CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
        ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

        query = "<Query>" + query.ToString() + "</Query>";

        //Get the construction data
        combined.loadData({
            query: query
        }, function (stores) {
            //Go through all of our stores, keep a list of things that don't have a match
            var diff = {
                missingC3: [],      //on sonic, not on C3
                missingSonic: [],   //on C3, not on sonic
                diff: {}            //fields don't match, grouped by store number
            };

            function diffAdd(storeNumber, field, sonic, c3, title, store, type) {
                //Set type to text if not set
                if (typeof type === 'undefined') {
                    type = 'text';
                }
                //Make sure the store exists
                if (typeof diff.diff[storeNumber] === 'undefined') {
                    diff.diff[storeNumber] = [];
                }
                //Add the difference
                diff.diff[storeNumber].push({
                    storeNumber: storeNumber,
                    field: field,
                    sonic: sonic,
                    c3: c3,
                    title: title,
                    type: type,
                    store: store
                });
            }

            function diffCheck(field, store, title, type) {
                var c3 = compareData[store.StoreNumber][fieldMapping[field]],
                    sonic = store[field];
                //Defaults
                type = type || 'text';

                //Format as needed and check
                if (type === 'date') {
                    c3 = moment(c3, 'MM/DD/YYYY').format('YYYY-MM-DD');

                    if (c3 !== moment(sonic).format('YYYY-MM-DD')){
                        diffAdd(store.StoreNumber, field, sonic, c3, title, store, type)
                    }
                } else if (type === 'integer') {
                    if ((c3 === "" ? 0 : parseInt(c3)) !== (sonic === "" ? 0 : parseInt(sonic))) {
                        diffAdd(store.StoreNumber, field, sonic, c3, title, store, type)
                    }
                } else if (type === 'text') {
                    if (c3 !== sonic) {
                        diffAdd(store.StoreNumber, field, sonic, c3, title, store, type)
                    }
                }
            }

            _.forEach(stores, function (store) {
                //Check to see if it's in C3 (ignore sonic 1/1/2020 dates and dates before today
                if (    typeof compareData[store.StoreNumber] === 'undefined' &&
                        moment(store.GoLiveDate).format('YYYY-MM-DD') !== '2020-01-01' &&
                        moment(store.GoLiveDate).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD') &&
                        store.ProjectType === 'POS Conversion'
                ) {
                    diff.missingC3.push(store);
                } else if (typeof compareData[store.StoreNumber] !== 'undefined') {
                    //Check Fields:
                    diffCheck('GoLiveDate', store, 'Go Live', 'date');
                    diffCheck('PopsDeliveryDate', store, 'POPS Delivery', 'date');
                    diffCheck('AudioInstallDate', store, 'Audio Install', 'date');
                    diffCheck('TotalStalls', store, 'Pops Count', 'integer');
                    diffCheck('ExtensionBrackets', store, 'Extension Brackets', 'integer');
                    diffCheck('CChannelBrackets', store, 'C Channel Brackets', 'integer');
                    diffCheck('ProjectManager', store, 'Project Manager');
                    diffCheck('Installer', store, 'Installer');
                    diffCheck('PopsInstaller', store, 'POPS Installer');
                    diffCheck('AudioInstaller', store, 'Audio Installer');
//                    diffCheck('HughesTempStatus', store, 'Hughes');
//                    diffCheck('HughesTempDate', store, 'Hughes Date', 'date');
                }
            });

            //Go through C3, looking for stores not in the sonic database
            var myStores = _.indexBy(stores, 'StoreNumber');
            _.forIn(compareData, function (store, storeNumber) {
                if (typeof myStores[storeNumber] === "undefined" && storeNumber !== "" && store.GoLiveDate >= moment().format('YYYY-MM-DD')) {
                    diff.missingSonic.push({
                        GoLiveDate: moment(store[fieldMapping.GoLiveDate], 'MM/DD/YYYY').format('YYYY-MM-DD'),
                        PopsDeliveryDate: moment(store[fieldMapping.PopsDeliveryDate], 'MM/DD/YYYY').format('YYYY-MM-DD'),
                        StoreNumber: storeNumber
                    });
                }
            });

            //Build and display three reports, one for new stores, one for deleted stores, and one for stores with different go live dates
            view.results({
                results: diff,
                routeCheck: routeCheck,
                callback: afterRender
            });

            //Event handling for view controls
            function afterRender(view) {
                view.autoUpdateButton.on('click', function () {
                    _.forEach(view.results.diff, function (differences, storeNumber) {
                        _.forEach(differences, function (difference, index) {
                            //Automatically updates project manager, POS pre-cable,
                            var counter = 0;
                            if (difference.field === 'ExtensionBrackets' || difference.field === 'CChannelBrackets' || difference.field === 'ProjectManager' /*|| difference.field === 'Installer' || difference.field === 'PopsInstaller' || difference.field === 'AudioInstaller'*/) {
                                //Update it via the store and add a new note
                                combined.changeValue(difference.field, difference.c3, difference.store.CombinedId, complete);
                                noteStore.create(difference.store, {
                                    Source: 'Comm Works Sync',
                                    NoteType: 'General',
                                    Note: difference.title + ' updated from ' + difference.sonicFormatted + ' to ' + difference.c3Formatted + ' during sync with Comm-Works C3 Database'
                                }, complete);
                            }

                            function complete () {
                                if (++counter >= 2) {
                                    //Delete the cell contents of the table
                                    $('#differences').find('#DifferenceRow-' + storeNumber).find('#DifferenceTable-' + difference.field + '-' + storeNumber).fadeOut(400, function () {
                                        this.remove();
                                    });
                                }
                            }
                        });
                    });
                });

                //Create a Difference Update Event (Sonic -> CommWorks)
                _.forEach(view.results.diff, function (differences, storeNumber) {
                    _.forEach(differences, function (difference, index) {
                        function complete () {
                            if (++counter >= 2) {
                                //Delete the cell contents of the table
                                $('#differences').find('#DifferenceRow-' + storeNumber).find('#DifferenceTable-' + difference.field + '-' + storeNumber).fadeOut(400, function () {
                                    this.remove();
                                });
                            }
                        }

                        //Get button
                        var button = registry.byId('Difference-' + difference.field + '-' + storeNumber);

                        //Create an event handler
                        button.on('click', function () {
                            //Disable the button and change text
                            button.set({disabled: true, label: 'Updating...'});

                            //Update it via the store and add a new note
                            var counter = 0;
                            combined.changeValue(difference.field, difference.c3, difference.store.CombinedId, complete);
                            noteStore.create(difference.store, {
                                Source: 'Comm Works Sync',
                                NoteType: 'General',
                                Note: difference.title + ' updated from ' + difference.sonicFormatted + ' to ' + difference.c3Formatted + ' during sync with Comm-Works C3 Database'
                            }, complete);

                            function complete () {
                                if (++counter >= 2) {
                                    //Delete the cell contents of the table
                                    $('#differences').find('#DifferenceRow-' + storeNumber).find('#DifferenceTable-' + difference.field + '-' + storeNumber).fadeOut(400, function () {
                                        this.remove();
                                    });
                                }
                            }
                        });
                    });
                });
            }
        });
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
                        //Parse and index by store number
                        //Grab data
                        var data = Papa.parse(text, {header: false, delimiter: '\t'}).data;

                        //Find field indexes from the first row
                        fieldMapping = {
                            StoreNumber: _.indexOf(data[0], "STORE ID#"),
                            GoLiveDate: _.indexOf(data[0], "POS GO-LIVE-DATE"),
                            PopsGoLiveDate: _.indexOf(data[0], "POPS GO-LIVE-DATE"),  //This is offset of our delivery date by 1 day
                            AudioDeliveryDate: _.indexOf(data[0], "AUDIO DELIVERY/PRECABLE DATE"),
                            AudioInstallDate: _.indexOf(data[0], "NIGHT 2 AUDIO INSTALL DATE"),
                            Installer: _.indexOf(data[0], "POS INSTALLER"),
                            PopsInstaller: _.indexOf(data[0], "POPS INSTALLER"),
                            AudioInstaller: _.indexOf(data[0], "AUDIO INSTALLER"),
                            ProjectManager: _.indexOf(data[0], "PM Assigned"),
                            //                ElectricalOption: 20,
                            //                SurveyDateTime: 25,
                            //                HasDriveThru: 27,       //True/False Field
                            //                OrderConfirmation: 28,  //Number or null
                            //                AudioType: 31,
                            //                FoPads: 32,         //Count
                            ExtensionBrackets: _.indexOf(data[0], "POPs Brackets Extension"),
                            CChannelBrackets: _.indexOf(data[0], "C/V - Channel Brackets"),
                            HughesTempStatus: _.indexOf(data[0], "HAN Order Status - Fortigate"),
                            HughesTempDate: _.indexOf(data[0], "HAN Commissioned"),
                            PopsDeliveryDate: _.indexOf(data[0], "POPS Delivery Date"),
                            TotalStalls: _.indexOf(data[0], "Total POPS Count"),
                            PosPreCableDate: _.indexOf(data[0], "????"),
                            PopsPreCableDate: _.indexOf(data[0], "Pre-Cable & AP Install"),
                            PatioCount: _.indexOf(data[0], "POPs Brackets Extension"),
                            ExtensionBrackets: _.indexOf(data[0], "POPs Brackets Extension")
                        };

                        //Remove title row
                        data.shift();


                        //Index by store number
                        compareData = _.indexBy(data, function (item, index) {
                            return item[0];
                        });

                        //Compare
                        compare(routeCheck);
                    });
                }
            });
        }
    };
});