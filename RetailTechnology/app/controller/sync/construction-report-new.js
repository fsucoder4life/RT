define(['app/view/sync/construction-report-new', 'app/view/report', 'app/store/combined', 'app/store/construction', 'app/store/notes', 'dijit/registry'], function (view, report, combined, construction, noteStore, registry) {
    var compareData = [];
    var mapping = {
        entityName: -1,
        projectStatus: -1,
        storeNumber: -1,
        constructionStatus: -1,
        franchisee: -1,
        city: -1,
        state: -1,
        crossStreet: -1,
        address: -1,
        dma: -1,
        constructionManager: -1,
        projectType: -1,
        groundBreak: -1,
        goLive: -1,
        notes: -1
    };
    //var mapping = {
    //    entityName: 1,
    //    projectStatus: 4,
    //    storeNumber: 5,
    //    constructionStatus: 6,
    //    franchisee: 7,
    //    city: 8,
    //    state: 5,
    //    crossStreet: 10,
    //    address: 3,
    //    dma: 11,
    //    constructionManager: 14,
    //    projectType: 15,
    //    groundBreak: 22,
    //    goLive: 24,
    //    notes: 26
    //};

    function compare(routeCheck) {
        //Get all our current stores
        var query = new CamlBuilder().Where().All(
            CamlBuilder.Expression().DateField('GO_x0020_LIVE_x0020_DATE').GreaterThanOrEqualTo(CamlBuilder.CamlValues.Today),
            CamlBuilder.Expression().Any(
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
            )
        ).OrderByDesc('GO_x0020_LIVE_x0020_DATE');

        query = "<Query>" + query.ToString() + "</Query>";

        //Get the construction data
        construction.loadData({
            combinedQuery: query
        }, function (stores) {
            //Go through all of our stores, keep a list of things that don't have a match
            var diff = {
                new: [],
                missing: [],
                goLive: [],
                groundBreak: [],
                constructionManager: []
            };


            stores = [];

            //fill array
            $().SPServices({
                async: false,
                operation: "GetListItems",
                listName: "Combined Schedule",
                CAMLViewFields: "<ViewFields><FieldRef Name='Title' /><FieldRef Name='Address_x0020_Full' /><FieldRef Name='City' /><FieldRef Name='State_x0020_' /><FieldRef Name='Zipcode' /><FieldRef Name='Store_x0020_Phone' /><FieldRef Name='Store_x0020_Manager' /><FieldRef Name='Primary_x0020_Contact' /><FieldRef Name='Primary_x0020_Contact_x0020_Emai' /><FieldRef Name='Primary_x0020_Contact_x0020_Phon' /><FieldRef Name='GO_x0020_LIVE_x0020_DATE' /><FieldRef Name='Project_x0020_Type' /><FieldRef Name='Franchise_x0020_Group' /><FieldRef Name='IT_x0020_Project_x0020_Manager' /></ViewFields>",
                CAMLQuery: "<Query><Where><Geq><FieldRef Name='ID' /><Value Type='Counter'>0</Value></Geq></Where><OrderBy><FieldRef Name='Title' Ascending='True' /></OrderBy></Query>",
                completefunc: function (xData, Status) {
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var store = {};
                        var storeNum = $(this).attr("ows_Title");
                        var goLiveDate = $(this).attr("ows_GO_x0020_LIVE_x0020_DATE");
                        var projectType = $(this).attr("ows_Project_x0020_Type");
                        var franchiseGroup = $(this).attr("ows_Franchise_x0020_Group");
                        var projectManager = $(this).attr("ows_IT_x0020_Project_x0020_Manager");
                        var address = $(this).attr("ows_Address_x0020_Full");
                        var city = $(this).attr("ows_City");
                        var state = $(this).attr("ows_State_x0020_");
                        var zip = $(this).attr("ows_Zipcode");
                        var storePhone = $(this).attr("ows_Store_x0020_Phone");
                        var storeManager = $(this).attr("ows_Store_x0020_Manager");
                        var primaryContact = $(this).attr("ows_Primary_x0020_Contact");
                        var primaryContactEmail = $(this).attr("ows_Primary_x0020_Contact_x0020_Emai");
                        var primaryContactPhone = $(this).attr("ows_Primary_x0020_Contact_x0020_Phon");

                        //storeNum = storeNum.substring(storeNum.indexOf(";#") + ";#".length);
                        store.StoreNumber = storeNum;
                        store.Address = address;
                        store.City = city;
                        store.State = state;
                        store.Zip = zip;
                        store.storePhone = storePhone;
                        store.storeManager = storeManager;
                        store.primaryContact = primaryContact;
                        store.primaryContactEmail = primaryContactEmail;
                        store.primaryContactPhone = primaryContactPhone;
                        store.GoLiveDate = goLiveDate;
                        store.ProjectType = projectType;
                        store.FranchiseGroup = franchiseGroup;
                        store.ProjectManager = projectManager;
                        stores.push(store);
                    });
                }
            });







            _.forEach(stores, function (store) {
                console.log("store found: " + store.StoreNumber);
                //Check to see if it's still in the development report
                if (typeof compareData[store.StoreNumber] === 'undefined') {
                    diff.missing.push(store);
                } else {
                    //If it exists, check the go-live date
                    //store.ConstructionStatus = compareData[store.StoreNumber][mapping.constructionStatus].toString().substr(compareData[store.StoreNumber][mapping.constructionStatus].length - 4);
                    store.NewGoLiveDate = moment(compareData[store.StoreNumber][mapping.goLive], 'M/D/YYYY').format('YYYY-MM-DD');
                    //store.NewGroundBreakDate = (compareData[store.StoreNumber][mapping.groundBreak] === '' ? '' : moment(compareData[store.StoreNumber][mapping.groundBreak], 'M/D/YYYY').format('YYYY-MM-DD'));
                    //store.DevelopmentNote = compareData[store.StoreNumber][mapping.notes];
                    //store.NewProjectType = compareData[store.StoreNumber][mapping.projectType];
                    //store.NewConstructionManager = compareData[store.StoreNumber][mapping.constructionManager];

                    if (window.console)
                        console.log(" store num:" + store.StoreNumber + " NewGoLiveDate: " + store.NewGoLiveDate + " OLD GoLiveDate:" + store.GoLiveDate);
                    if (store.NewGoLiveDate !== moment(store.GoLiveDate).format('YYYY-MM-DD')) {
                        diff.goLive.push(store); console.log("go live date mismatch:" + store.StoreNumber);
                    }

                    //Then check the ground break
                    //if (store.NewGroundBreakDate !== moment(store.GroundBreakDate).format('YYYY-MM-DD')) {
                    //    diff.groundBreak.push(store);
                    //}

                    //Then check the construction PM
                    //if (window.console)
                    //    console.log(" store num:" + store.StoreNumber + " NewConstructionManager: " + store.NewConstructionManager + " OLD ConstructionManager:" + store.ConstructionManager);
                    if (store.NewConstructionManager !== store.ConstructionManager) {
                        diff.constructionManager.push(store);
                    }
                }
            });

            //Go through the development report looking for new stores
            var myStores = _.indexBy(stores, 'StoreNumber');
            _.forIn(compareData, function (store, storeNumber) {
                var contractStatus = store[mapping.constructionStatus];
                var type = 'New';
                //if (store[mapping.constructionStatus].toUpperCase().indexOf('RL') === 0) {
                //    type = 'Relocation';
                //} else if (store[mapping.constructionStatus].toUpperCase().indexOf('RB') === 0) {
                //    type = 'Rebuild'
                //}


                if (typeof myStores[storeNumber] === "undefined" && storeNumber !== "" && /^[0-9]{4}$/.test(storeNumber)) { //&& contractStatus.toUpperCase().indexOf('OPEN') === -1) {
                    diff.new.push({
                        GoLiveDate: moment(store[mapping.goLive], 'M/D/YYYY').format('YYYY-MM-DD'),
                        StoreNumber: storeNumber,
                        ConstructionStatus: store[mapping.constructionStatus],
                        City: store[mapping.city],
                        State: store[mapping.state],
                        Address: store[mapping.address],
                        DMA: store[mapping.dma],
                        FranchiseGroup: store[mapping.franchisee],
                        DevelopmentNote: store[mapping.notes],
                        ProjectType: type,
                        ConstructionManager: store[mapping.constructionManager]
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
                //Handle add click
                view.onAddProjectClick = function (store, deleteRow, updateModal, closeModal) {

                    //Check to see if the store already exists
                    updateModal('Confirming Record Doesn\'t Exist in Combined Schedule');
                    var query = new CamlBuilder().Where().TextField('Title').EqualTo(store.StoreNumber);

                    combined.loadData({ query: '<Query>' + query.ToString() + '</Query>' }, function (stores) {
                        var stores = _.toArray(stores);
                        if (stores.length === 1) {
                            var combinedStore = stores[0];
                            //Check to see if it is already open, notify and remove if so
                            if (moment().toISOString() > moment(combinedStore.GoLiveDate).toISOString() && store.ProjectType === combinedStore.ProjectType) {
                                updateModal('Store is in Retail as the correct project type, shows already open');
                                deleteRow();
                                setTimeout(function () {
                                    closeModal();
                                }, 1500);
                                return;
                            }

                            //Check to see if it already exists in construction calls
                            updateModal('Record found in Combined, Confirming Record Doesn\'t Exist in Construction Calls');
                            query = new CamlBuilder().Where().LookupField('Store_x0020_Number').ValueAsText().EqualTo(store.StoreNumber);

                            construction.loadData({ query: '<Query>' + query.ToString() + '</Query>' }, function (stores) {
                                if (stores.length === 1) {
                                    updateModal('Record found in construction calls, Notating old project data');
                                    var note =
                                      'Changing project type from ' + combinedStore.ProjectType + ' to ' + store.ProjectType + ' per development report on ' + moment().format('l') + '&lt;br/&gt;&lt;br/&gt;' +
                                      'Project Manager: ' + combinedStore.ProjectManager + '&lt;br/&gt;&lt;br/&gt;' +
                                      '&lt;b&gt;POS:&lt;/b&gt;&lt;br/&gt;' +
                                      'Go-Live: ' + (combinedStore.GoLiveDate !== '' ? moment(combinedStore.GoLiveDate).format('l') : '') + '&lt;br/&gt;' +
                                      'Installer: ' + combinedStore.Installer + '&lt;br/&gt;&lt;br/&gt;' +
                                      '&lt;b&gt;POPS:&lt;/b&gt;&lt;br/&gt;' +
                                      'Delivery: ' + (combinedStore.PopsDeliveryDate !== '' ? moment(combinedStore.PopsDeliveryDate).format('l') : '') + '&lt;br/&gt;' +
                                      'Installer: ' + combinedStore.PopsInstaller + '&lt;br/&gt;&lt;br/&gt;' +
                                      '&lt;b&gt;Audio:&lt;/b&gt;&lt;br/&gt;' +
                                      'Delivery: ' + (combinedStore.AudioDeliveryDate !== '' ? moment(combinedStore.AudioDeliveryDate).format('l') : '') + '&lt;br/&gt;' +
                                      'Installer: ' + combinedStore.AudioInstaller + '&lt;br/&gt;&lt;br/&gt;';
                                    //Make a note with old data
                                    noteStore.create(combinedStore, {
                                        Source: 'Development Report',
                                        NoteType: 'General',
                                        Note: note
                                    }, function () {
                                        updateModal('Updating Project Type');
                                        combined.changeValue('ProjectType', store.ProjectType, combinedStore.CombinedId, function () {
                                            updateModal('Updating Go-Live');
                                            combined.changeValue('GoLiveDate', store.GoLiveDate, combinedStore.CombinedId, function () {
                                                updateModal('Done');
                                                deleteRow();
                                                setTimeout(function () {
                                                    closeModal();
                                                }, 1500);
                                            });
                                        });
                                    });
                                } else {
                                    //Create the construction calls entry and notate the change
                                    updateModal("Record found in combined schedule, Creating store in construction calls");
                                    construction.create({
                                        ows_Store_x0020_Number: combinedStore.CombinedId + ";#" + store.StoreNumber,
                                        ConstructionManager: store.ConstructionManager
                                    }, function (constructionStore) {
                                        updateModal('Creating note with old project data');
                                        var note =
                                          'Changing project type from ' + combinedStore.ProjectType + ' to ' + store.ProjectType + ' per development report on ' + moment().format('l') + '&lt;br/&gt;&lt;br/&gt;' +
                                          'Project Manager: ' + combinedStore.ProjectManager + '&lt;br/&gt;&lt;br/&gt;' +
                                          '&lt;b&gt;POS:&lt;/b&gt;&lt;br/&gt;' +
                                          'Go-Live: ' + (combinedStore.GoLiveDate !== '' ? moment(combinedStore.GoLiveDate).format('l') : '') + '&lt;br/&gt;' +
                                          'Installer: ' + combinedStore.Installer + '&lt;br/&gt;&lt;br/&gt;' +
                                          '&lt;b&gt;POPS:&lt;/b&gt;&lt;br/&gt;' +
                                          'Delivery: ' + (combinedStore.PopsDeliveryDate !== '' ? moment(combinedStore.PopsDeliveryDate).format('l') : '') + '&lt;br/&gt;' +
                                          'Installer: ' + combinedStore.PopsInstaller + '&lt;br/&gt;&lt;br/&gt;' +
                                          '&lt;b&gt;Audio:&lt;/b&gt;&lt;br/&gt;' +
                                          'Delivery: ' + (combinedStore.AudioDeliveryDate !== '' ? moment(combinedStore.AudioDeliveryDate).format('l') : '') + '&lt;br/&gt;' +
                                          'Installer: ' + combinedStore.AudioInstaller + '&lt;br/&gt;&lt;br/&gt;';
                                        //Make a note with old data
                                        noteStore.create(combinedStore, {
                                            Source: 'Development Report',
                                            NoteType: 'General',
                                            Note: note
                                        }, function () {
                                            updateModal('Updating Project Type');
                                            combined.changeValue('ProjectType', store.ProjectType, combinedStore.CombinedId, function () {
                                                updateModal('Updating Go-Live');
                                                combined.changeValue('GoLiveDate', store.GoLiveDate, combinedStore.CombinedId, function () {
                                                    updateModal('Done');
                                                    deleteRow();
                                                    setTimeout(function () {
                                                        closeModal();
                                                    }, 1500);
                                                });
                                            });
                                        });
                                    });
                                }
                            });


                        } else {
                            //Create the project
                            updateModal('Creating New Store in combined schedule');
                            //Create the entry in combined and construction
                            combined.create({
                                StoreNumber: store.StoreNumber,
                                DMA: store.DMA,
                                City: store.City,
                                State: store.State,
                                Address: store.Address,
                                FranchiseGroup: store.FranchiseGroup,
                                GoLiveDate: store.GoLiveDate,
                                ProjectType: store.ProjectType
                            }, function (combinedStore) {
                                debugger;
                                construction.create({
                                    ows_Store_x0020_Number: combinedStore.CombinedId + ";#" + store.StoreNumber,
                                    ConstructionManager: store.ConstructionManager
                                }, function (store) {
                                    updateModal('Done');
                                    deleteRow();
                                    setTimeout(function () {
                                        closeModal();
                                    }, 1500);
                                });
                            })
                        }
                    });
                };

                //Create a Missing Delete event
                _.forEach(view.results.missing, function (store) {
                    //Get button
                    var button = registry.byId('MissingDeleteButton-' + store.StoreNumber);

                    //Create an event handler
                    button.on('click', function () {
                        //Disable the button and change text
                        button.set({ disabled: true, label: 'Deleting...' });

                        //Set the project type to nothing, then delete it via the store
                        construction.changeValue('ProjectType', '', store, function () {
                            construction.delete(store, function () {
                                $('#removed').find('tr#number' + store.StoreNumber).fadeOut(400, function () {
                                    this.remove();
                                });
                            });
                        });
                    });
                });

                //Create a Go Live Update event
                _.forEach(view.results.goLive, function (store) {
                    //Get button
                    var button = registry.byId('GoLiveUpdateButton-' + store.StoreNumber);

                    //Create an event handler
                    button.on('click', function () {
                        //Disable the button and change text
                        button.set({ disabled: true, label: 'Updating...' });

                        //Update it via the store and add a new note
                        var counter = 0;
                        construction.changeValue('GoLiveDate', store.NewGoLiveDate, store, complete);
                        noteStore.create(store, {
                            Source: 'Development Report',
                            NoteType: 'General',
                            Note: 'Go Live Date updated from ' + moment(store.GoLiveDate).format('l') + ' to ' + moment(store.NewGoLiveDate).format('l') + ' per the development report&lt;br/&gt;Development Note: ' + store.DevelopmentNote
                        }, complete);

                        function complete() {
                            if (++counter >= 2) {
                                //Delete the row of the table
                                $('#go-live').find('tr#number' + store.StoreNumber).fadeOut(400, function () {
                                    this.remove();
                                });
                            }
                        }
                    });
                });

                //Create a CM Update event
                _.forEach(view.results.constructionManager, function (store) {
                    //Get button
                    var button = registry.byId('ConstructionManagerUpdateButton-' + store.StoreNumber);

                    //Create an event handler
                    button.on('click', function () {
                        //Disable the button and change text
                        button.set({ disabled: true, label: 'Updating...' });

                        //Update it via the store
                        construction.changeValue('ConstructionManager', store.NewConstructionManager, store, function () {
                            //Delete the row of the table
                            $('#construction-manager').find('tr#number' + store.StoreNumber).fadeOut(400, function () {
                                this.remove();
                            });
                        });
                    });
                });

                //Create a Ground Break Update event
                //_.forEach(view.results.groundBreak, function (store) {
                //    //Get button
                //    var button = registry.byId('GroundBreakUpdateButton-' + store.StoreNumber);

                //    //Create an event handler
                //    button.on('click', function () {
                //        //Disable the button and change text
                //        button.set({disabled: true, label: 'Updating...'});

                //        //Update it via the store
                //        construction.changeValue('GroundBreakDate', store.NewGroundBreakDate, store, function () {
                //            //Delete the row of the table
                //            $('#ground-break').find('tr#number' + store.StoreNumber).fadeOut(400, function () {
                //                this.remove();
                //            });
                //        });
                //    });
                //});
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

                        //Try and update the column mappings dynamically
                        var results = $.parse(text, { header: false, delimiter: '	' }).results;
                        _.each(results[0], function (val, index) {
                            //whatever was previously using this index, it needs to be changed - project status is reset to 4, but the default for city is 4

                            if (val === 'Project Status') { mapping.projectStatus = index; }
                            if (val === 'RestaurantNumber') { mapping.storeNumber = index; }
                            if (val === 'Status') { mapping.constructionStatus = index; }
                            if (val === 'Franchisee') { mapping.franchisee = index; }
                            if (val === 'Lucernex Name') { mapping.city = index; }
                            if (val === 'Lucernex Name') { mapping.state = index; }
                            if (val === 'Open') { mapping.goLive = index; }
                            /*
                            if (val === 'Project Status') { mapping.GoLiveDate = index; }
                            if (val === 'Store Number') { mapping.storeNumber = index; }
                            if (val === 'Status') { mapping.constructionStatus = index; }
                            if (val === 'Principal Partner') { mapping.franchisee = index; }
                            if (val === 'City') { mapping.city = index; }
                            if (val === 'State') { mapping.state = index; }
                            if (val === 'Address') { mapping.crossStreet = index; }
                            if (val === 'DMA') { mapping.dma = index; }
                            if (val === 'CM') { mapping.constructionManager = index; }
                            if (val === 'Project Type') { mapping.projectType = index; }
                            if (val === 'Entity Name') { mapping.entityName = index; }
                            if (val === 'Ground Breaking Actual') { mapping.groundBreak = index; }
                            if (val === 'Open Store' || val === 'Open Store Forecasted' || val === 'Open Store Date Forecasted') { mapping.goLive = index; }
                            if (val === 'Comments') { mapping.notes = index; }
                            */
                        });

                        //if (window.console)
                        //    console.log("project status:" + mapping.projectStatus + " store Number: " + mapping.storeNumber + " Status:  " + mapping.constructionStatus + " Principal Partner: " + mapping.franchisee + " city: " + mapping.city + " state: " + mapping.state + " address: " + mapping.crossStreet + " dma: " + mapping.dma + " CM: " + mapping.constructionManager + " project Type: " + mapping.projectType + " entity name: " + mapping.entityName + " Ground Breaking Actual: " + mapping.groundBreak + " Open Store Forecasted or Open Store Date Forecasted: " + mapping.goLive + " Comments: " + mapping.notes);

                        //Parse and index by store number
                        compareData = _.indexBy(results, function (item, index) {
                            return item[mapping.storeNumber].toString().substr(item[mapping.storeNumber].length - 4);
                        });

                        //Compare
                        compare(routeCheck);
                    });
                }
            });
        }
    };
});