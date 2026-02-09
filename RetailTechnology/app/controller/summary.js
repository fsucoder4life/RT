define(['app/view/summary/summary', 'app/store/construction', 'app/store/issues', 'app/store/notes', 'app/store/combined', 'app/rules/construction','app/brands/services/brandServices','app/brands/services/logHelper'], function (summary, construction, issueStore, noteStore, combined, constructionRules,brandServices,logHelper) {


    var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
    $().SPServices.defaults.webURL = webUrl;
    const overrideDebugForFile = false;
    function applyIssueEventListeners(view) {
        var store = view.store;
        var promotionOrderDisplaySize = 55;
        //Issue create
        view.Issues.Create.on('click', function () {
            //Disable
            view.Issues.Create.setDisabled(true);
            //Create editor
            require(['app/view/workflow/issue'], function (editor) {
                //Show the editor
                editor.render({
                    store: store,
                    Title: 'Create Issue',
                    Label: 'Create',
                    onHide: function () {
                        //Turn the button back on
                        view.Issues.Create.setDisabled(false);
                    },
                    callback: function (issueEditor) {
                        issueEditor.submit.on('click', function () {
                            //Disable the button
                            issueEditor.submit.setDisabled(true);

                            //Get the escaped body with no breaks 
                            var description = issueEditor.Description.getData()
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&apos;')
                              .replace(/(\r\n|\n|\r)/gm, "");

                            var issue = {
                                Title: issueEditor.Title.get('value'),
                                Assigned: issueEditor.Assigned.get('value'),
                                WaitingOn: issueEditor.WaitingOn.get('value'),
                                Severity: issueEditor.Severity.get('value'),
                                IssueType: issueEditor.IssueType.get('value'),
                                Status: issueEditor.Status.get('value'),
                                Description: description
                            };

                            issueStore.create(store, issue, function (newIssue) {
                                //Enable buttons
                                view.Issues.Create.setDisabled(false);
                                //Add the issue to the main view by refreshing that view
                                store.Issues.push(newIssue);
                                view.Issues = view.Issues.updateIssues(store);
                                applyIssueEventListeners(view);
                                //Hide view
                                issueEditor.Dialog.hide();
                            });
                        });
                    }
                });
            });
        });

        //Issue type select
        view.Issues.Type.on('change', function () {
            view.Issues = view.Issues.updateIssues(store);
            applyIssueEventListeners(view);
        });

        //Create listeners for the drop down actions button
        if (!_.isEmpty(view.Issues.items)) {
            _.each(view.Issues.items, function (issue, issueId) {
                //Handle all the drop down menus
                _.each(issue.Edit.dropDown.getChildren(), function (menuItem, menuIndex) {
                    menuItem.on('click', function () {
                        var issueId = issue.Data.IssueId,
                          editButton = issue.Edit;
                        switch (menuItem.get('label')) {
                            case 'Edit':
                                //Disable
                                editButton.setDisabled(true);
                                //Create editor
                                require(['app/view/workflow/issue'], function (editor) {
                                    //Show the editor
                                    editor.render({
                                        store: store,
                                        issue: issue.Data,
                                        Title: 'Edit Issue',
                                        Label: 'Save',
                                        onHide: function () {
                                            //Turn the button back on
                                            editButton.setDisabled(false);
                                        },
                                        callback: function (issueEditor) {
                                            issueEditor.submit.on('click', function () {
                                                //Disable the button
                                                issueEditor.submit.setDisabled(true);

                                                //Get the escaped body with no breaks
                                                var description = issueEditor.Description.getData()
                                                  .replace(/&/g, '&amp;')
                                                  .replace(/</g, '&lt;')
                                                  .replace(/>/g, '&gt;')
                                                  .replace(/"/g, '&quot;')
                                                  .replace(/'/g, '&apos;')
                                                  .replace(/(\r\n|\n|\r)/gm, "");

                                                //Check for changes
                                                var values = {};
                                                if (issueEditor.Title.get('value') !== issue.Data.Title) {
                                                    values.Title = issueEditor.Title.get('value');
                                                }
                                                if (issueEditor.Assigned.get('value') !== issue.Data.Assigned) {
                                                    values.Assigned = issueEditor.Assigned.get('value');
                                                }
                                                if (issueEditor.WaitingOn.get('value') !== issue.Data.WaitingOn) {
                                                    values.WaitingOn = issueEditor.WaitingOn.get('value');
                                                }
                                                if (issueEditor.Severity.get('value') !== issue.Data.Severity) {
                                                    values.Severity = issueEditor.Severity.get('value');
                                                }
                                                if (issueEditor.IssueType.get('value') !== issue.Data.IssueType) {
                                                    values.IssueType = issueEditor.IssueType.get('value');
                                                }
                                                if (issueEditor.Status.get('value') !== issue.Data.Status) {
                                                    values.Status = issueEditor.Status.get('value');
                                                }
                                                if (description !== issue.Data.Description) {
                                                    values.Description = description;
                                                }

                                                issueStore.changeValues(values, issueId, function (newIssue) {
                                                    //Enable buttons
                                                    editButton.setDisabled(false);
                                                    //Find and update the issue
                                                    store.Issues[_.findIndex(store.Issues, { IssueId: issueId })] = newIssue;
                                                    issue.updateIssue(newIssue);
                                                    //                                                    view.Issues = view.Issues.updateIssues(store);
                                                    //                                                    applyIssueEventListeners(view);
                                                    //Hide view
                                                    issueEditor.Dialog.hide();
                                                });
                                            });
                                        }
                                    });

                                    //Hide Type/Source since we don't need them
                                    var dom = $($('#note-editor'));
                                    dom.find('#note-edit-type-row').hide();
                                });
                                break;
                            case 'New Note':
                                //Disable
                                editButton.setDisabled(true);
                                //Create editor
                                require(['app/view/workflow/note'], function (editor) {
                                    //Show the editor
                                    editor.render({
                                        store: store,
                                        Title: 'Create Note',
                                        Label: 'Create',
                                        onHide: function () {
                                            //Turn the button back on
                                            editButton.setDisabled(false);
                                        },
                                        callback: function (noteEditor) {
                                            noteEditor.submit.on('click', function () {
                                                //Disable the button
                                                noteEditor.submit.setDisabled(true);

                                                //Get the escaped body with no breaks
                                                var noteText = noteEditor.Note.getData()
                                                  .replace(/&/g, '&amp;')
                                                  .replace(/</g, '&lt;')
                                                  .replace(/>/g, '&gt;')
                                                  .replace(/"/g, '&quot;')
                                                  .replace(/'/g, '&apos;')
                                                  .replace(/(\r\n|\n|\r)/gm, "");

                                                var note = {
                                                    Source: noteEditor.Source.get('value'),
                                                    IssueId: issueId,
                                                    NoteType: noteEditor.NoteType.get('value'),
                                                    Note: noteText
                                                };

                                                noteStore.create(store, note, function (newNote) {
                                                    //Enable buttons
                                                    editButton.setDisabled(false);
                                                    //Add the issue to the main view by refreshing that view
                                                    store.Notes.push(newNote);
                                                    var note = issue.addNote(newNote);
                                                    applyNoteIssueEventListener(note, store);
                                                    //Push back into issues
                                                    issue.notes[issueId] = note;
                                                    //Hide view
                                                    noteEditor.Dialog.hide();
                                                });
                                            });
                                        }
                                    });

                                    //Hide Type/Source since we don't need them
                                    var dom = $($('#note-editor'));
                                    dom.find('#note-edit-type-row').hide();
                                });
                                break;
                            case 'Close':
                                //Disable
                                editButton.setDisabled(true);
                                //Create editor
                                require(['app/view/workflow/note'], function (editor) {
                                    //Show the editor
                                    editor.render({
                                        store: store,
                                        Title: 'Close Issue',
                                        Label: 'Close Issue',
                                        onHide: function () {
                                            //Turn the button back on
                                            editButton.setDisabled(false);
                                        },
                                        callback: function (noteEditor) {
                                            noteEditor.submit.on('click', function () {
                                                //Disable the button
                                                noteEditor.submit.setDisabled(true);

                                                //Get the escaped body with no breaks
                                                var noteText = ("Issue Closed:<br/>" + noteEditor.Note.getData())
                                                  .replace(/&/g, '&amp;')
                                                  .replace(/</g, '&lt;')
                                                  .replace(/>/g, '&gt;')
                                                  .replace(/"/g, '&quot;')
                                                  .replace(/'/g, '&apos;')
                                                  .replace(/(\r\n|\n|\r)/gm, "");

                                                var note = {
                                                    Source: noteEditor.Source.get('value'),
                                                    IssueId: issueId,
                                                    NoteType: noteEditor.NoteType.get('value'),
                                                    Note: noteText
                                                };

                                                var issueUpdated = false,
                                                  noteCreated = false;
                                                issueStore.changeValue('Status', 'Closed', issueId, function () {
                                                    store.Issues[_.findIndex(store.Issues, { IssueId: issueId })].Status = 'Closed';
                                                    issueUpdated = true;
                                                    complete();
                                                });

                                                var theNewNote;
                                                noteStore.create(store, note, function (newNote) {
                                                    //Add the issue to the main view by refreshing that view
                                                    store.Notes.push(newNote);
                                                    noteCreated = true;
                                                    theNewNote = newNote;
                                                    complete();
                                                });

                                                function complete() {
                                                    if (issueUpdated && noteCreated) {
                                                        //Enable buttons
                                                        editButton.setDisabled(false);
                                                        //Add note
                                                        var note = issue.addNote(theNewNote);
                                                        applyNoteIssueEventListener(note, store);
                                                        //Push back into issues
                                                        issue.notes[issueId] = note;
                                                        //Update Issue
                                                        issue.updateIssue(_.find(store.Issues, { IssueId: issueId }));
                                                        //Hide view
                                                        noteEditor.Dialog.hide();
                                                    }
                                                }
                                            });
                                        }
                                    });

                                    //Hide Type/Source since we don't need them
                                    var dom = $($('#note-editor'));
                                    dom.find('#note-edit-type-row').hide();
                                });
                                break;
                            case 'Delete':
                                //Warn, then delete
                                issue.warnDelete(function (dialog) {
                                    issueStore.destroy(issueId, function () {
                                        //Remove from issues
                                        _.remove(store.Issues, { IssueId: issueId });
                                        //Remove all notes (cascade delete on sharepoint)
                                        _.remove(store.Notes, { IssueId: issueId });
                                        //Update the issue view
                                        view.Issues = view.Issues.updateIssues(store);
                                        applyIssueEventListeners(view);
                                        //Hide self
                                        dialog.hide();
                                    });
                                });
                                break;
                        }
                    });
                });

                _.each(issue.notes, function (note, noteIndex) {
                    applyNoteIssueEventListener(note, store);
                });
            });
        }
    }

    function applyNoteIssueEventListener(note, store) {
        //Handle the note edit links
        createNoteEditListener(note, function (newNote, noteEditor) {
            //Find and update the issue
            store.Notes[_.findIndex(store.Notes, { NoteId: note.Data.NoteId })] = newNote;
            note.updateNote(newNote);
            //Hide view
            noteEditor.Dialog.hide();
        }, function () {
            //Hide Type since we don't need them
            var dom = $($('#note-editor'));
            dom.find('#note-edit-type-row').hide();
        });

        createNoteDeleteListener(note, function (dialog) {
            var noteId = note.Data.NoteId;
            noteStore.destroy(noteId, function () {
                //Remove all notes (cascade delete on sharepoint)
                _.remove(store.Notes, { NoteId: noteId });
                //Update the issue view
                note.deleteNote();
                //Hide self
                dialog.hide();
            });
        });
    }

    function applyNoteEventListeners(view) {
        var store = view.store;

        //Note create handler
        view.Notes.Create.on('click', function () {
            //Disable
            view.Notes.Create.setDisabled(true);
            //Create editor
            require(['app/view/workflow/note'], function (editor) {
                //Show the editor
                editor.render({
                    store: store,
                    Title: 'Create Note',
                    Label: 'Create',
                    onHide: function () {
                        //Turn the button back on
                        view.Notes.Create.setDisabled(false);
                    },
                    callback: function (noteEditor) {
                        noteEditor.submit.on('click', function () {
                            //Disable the button
                            noteEditor.submit.setDisabled(true);

                            //Get the escaped body with no breaks
                            var noteText = noteEditor.Note.getData()
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&apos;')
                              .replace(/(\r\n|\n|\r)/gm, "");

                            var note = {
                                Source: noteEditor.Source.get('value'),
                                NoteType: noteEditor.NoteType.get('value'),
                                Note: noteText
                            };

                            noteStore.create(store, note, function (newNote) {
                                //Enable buttons
                                view.Notes.Create.setDisabled(false);
                                //Add the issue to the main view by refreshing that view
                                store.Notes.push(newNote);
                                view.Notes = view.Notes.updateNotes(store);
                                applyNoteEventListeners(view);
                                //Hide view
                                noteEditor.Dialog.hide();
                            });
                        });
                    }
                });
            });
        });

        //Create listeners for all the edit/delete buttons
        if (!_.isEmpty(view.Notes.items)) {
            _.each(view.Notes.items, function (note, noteId) {
                createNoteEditListener(note, function (newNote, noteEditor) {
                    //Find and update the issue
                    store.Notes[_.findIndex(store.Notes, { NoteId: note.Data.NoteId })] = newNote;
                    //Update if category stays the same, refresh if note
                    if (newNote.NoteType === note.NoteType) {
                        note.updateNote(newNote);
                    } else {
                        view.Notes = view.Notes.updateNotes(store);
                        applyNoteEventListeners(view);
                    }
                    //Hide view
                    noteEditor.Dialog.hide();
                });

                createNoteDeleteListener(note, function (dialog) {
                    var noteId = note.Data.NoteId;
                    noteStore.destroy(noteId, function () {
                        //Remove all notes (cascade delete on sharepoint)
                        _.remove(store.Notes, { NoteId: noteId });
                        //Update the issue view
                        note.deleteNote();
                        //Hide self
                        dialog.hide();
                    });
                });
            });
        }
    }

    var creatingNoteEditor = false;

    function createNoteEditListener(note, callback, afterRender) {

        //Create an editor
        $(note.EditNote).on('click', function (e) {
            e.preventDefault();

            //If already clicked, then ignore
            if (creatingNoteEditor) return;

            creatingNoteEditor = true;
            //Create editor
            require(['app/view/workflow/note'], function (editor) {
                //Show the editor
                editor.render({
                    note: note.Data,
                    Title: 'Edit Note',
                    Label: 'Save',
                    onHide: function () {

                    },
                    callback: function (noteEditor) {
                        creatingNoteEditor = false;

                        if (afterRender) afterRender();

                        noteEditor.submit.on('click', function () {
                            //Disable the button
                            noteEditor.submit.setDisabled(true);

                            //Get the escaped body with no breaks
                            var noteText = noteEditor.Note.getData()
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&apos;')
                              .replace(/(\r\n|\n|\r)/gm, "");

                            //Check for changes
                            var values = {};
                            if (noteEditor.NoteType.get('value') !== note.Data.NoteType) {
                                values.NoteType = noteEditor.NoteType.get('value');
                            }
                            if (noteEditor.Source.get('value') !== note.Data.Source) {
                                values.Source = noteEditor.Source.get('value');
                            }
                            if (noteText !== note.Data.Note) {
                                values.Note = noteText;
                            }

                            noteStore.changeValues(values, note.Data.NoteId, function (newNote) {
                                callback(newNote, noteEditor);
                            });
                        });
                    }
                });
            });
        });
    }

    var creatingNoteDelete = false;

    function createNoteDeleteListener(note, callback) {
        $(note.DeleteNote).on('click', function (e) {
            e.preventDefault();

            if (creatingNoteDelete) return;

            creatingNoteDelete = true;

            note.warnDelete(callback, function () {
                creatingNoteDelete = false;
            });
        });
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-indexed)
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        const formattedDate = date.toLocaleDateString();
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
      }

    function triggerWorkflow(store,workFlowType,hasAttachment,fileName) {
       
        try {
            
            logHelper.logDebug("controller/summary.js","Inside triggerWorkFlow: " + workFlowType,  overrideDebugForFile);
                
                var currentUser = localStorage.getItem("currentUser_userEmail");
                prodWebUrl = "https://irbpartners.sharepoint.com/sites/RetailTechDeployment";
                logHelper.logDebug("controller/summary.js","webUrl: " + prodWebUrl);
                var clientContext = new SP.ClientContext(prodWebUrl);
                var oList = clientContext.get_web().get_lists().getByTitle('WorkFlowTriggerRequest');
                    
                var itemCreateInfo = new SP.ListItemCreationInformation();
                this.oListItem = oList.addItem(itemCreateInfo);
                
                const newDate = new Date();
                const formattedDate = formatDate(newDate);
                
            
                var title = store + '-' + workFlowType + '-' + formattedDate;

                oListItem.set_item('Title', title);
                oListItem.set_item('Store', store);
                oListItem.set_item('WFType', workFlowType);
                oListItem.set_item('RequestBy', currentUser);
                oListItem.set_item('DateRequested', new Date());
                if (hasAttachment === true){
                     this.oListItem.set_item('HasAttachment',hasAttachment);
                     this.oListItem.set_item('AttachmentFileName',fileName);
                }
               
                logHelper.logDebug("controller/summary.js","Before updating the list:" + oList,  overrideDebugForFile);
                oListItem.update();
            
                clientContext.load(oListItem);

        clientContext.executeQueryAsync(
            //Success callback
            () => {
                $(".modal").remove();
                logHelper.logDebug("controller/summary.js","Successfully created trigger request",  overrideDebugForFile);        
                let message = `The ${workFlowType} workflow request has been sent to the queue.`;         
                alert(message);
                //update.renderWorkflowUpdate(message);
                
               
            },
            //Error callback
            (sender, args) => {
                logHelper.logError("An error occured:", args.get_message());
                $(".modal").remove();
                //alert(`Error queueing the ${workFlowType} workflow, please try again.`);
                let message = `Error queueing the ${workFlowType} workflow, please try again.`;
                alert(message);
               // update.renderWorkflowUpdate(message);
            }
            // Function.createDelegate(this, this.onQuerySucceeded), 
            // Function.createDelegate(this, this.onQueryFailed)
        );
    // function onQuerySucceeded() {
    //     alert('Item created: ' + oListItem.get_id());
    // }
    
    //  function onQueryFailed(sender, args) {
    //     alert('Request failed. ' + args.get_message() + 
    //         '\n' + args.get_stackTrace());
    // }
            return true;
        } catch (error) {
            return false;
        }
     
     
    }
    
  


    function afterRender(view) {
        var store = view.store;
		var overrideDebugForFile = false;

        var statusFormConfig = {
            createPurchaseOrder: {
                poTitle: 'Create Purchase Order',
                poType: 'ISC',
                loadProducts: true,
                vendorMatches: ['FABCON']
            },
            createPromotionOrder: {
                poTitle: 'Create Promotion Order',
                poType: 'ProMotion',
                loadProducts: true,
                vendorMatches: ['PROMOTION']
            },
            hmeAudioQuote: {
                poTitle: 'HME Audio Quote',
                poType: 'HMEAudioQuote',
                loadProducts: false,
                defaults: {
                    Notes: 'HME Audio Quote Request'
                }
            },
            sonicRadioOrder: {
                poTitle: 'Sonic Radio Order',
                poType: 'SonicRadio',
                loadProducts: false,
                defaults: {
                    Notes: 'Sonic Radio Order Request'
                }
            }
        };

        function showStatusForm(formType) {
            var config = statusFormConfig[formType];
            if (!config) {
                return;
            }

            require(['app/store/products', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems'], function (productStore, purchaseOrderStore, purchaseOrderItemStore) {
                var mask = $('<div>Creating ' + config.poTitle + '</div>');
                mask.modal({
                    escapeClose: false,
                    clickClose: false,
                    showClose: false
                });

                function createOrder(products) {
                    var purchaseOrderDefaults = {
                        StoreNumber: store.CombinedId + ';#' + store.StoreNumber,
                        BillingName: store.PrimaryContact,
                        BillingAddress: store.AddressBillTo,
                        BillingPhone: store.PrimaryPhone,
                        BillingEmail: store.PrimaryEmail,
                        BillingZip: store.ZipBillTo,
                        BillingCity: store.CityBillTo,
                        BillingState: store.StateBillTo,
                        Franchisee: store.FranchiseGroup,
                        ShippingName: store.PrimaryContact,
                        ShippingAddress: store.Address,
                        ShippingZip: store.Zip,
                        ShippingCity: store.City,
                        ShippingState: store.State,
                        DeliveryDate: store.PopsDeliveryDate,
                        PoType: config.poType
                    };

                    if (config.defaults) {
                        _.assign(purchaseOrderDefaults, config.defaults);
                    }

                    purchaseOrderStore.create(purchaseOrderDefaults, function (po) {
                        if (!config.loadProducts || products.length === 0) {
                            $.modal.close();
                            mask.remove();
                            location.hash = '#purchase-order/' + po.PurchaseOrderId;
                            return;
                        }

                        store.TotalStalls = (store.StallCount !== '' ? parseInt(store.StallCount) : 0) + (store.PatioCount !== '' ? parseInt(store.PatioCount) : 0);
                        store.TotalStalls = store.TotalStalls.toString();

                        var filteredProducts = _.filter(products, function (product) {
                            if (!product.Vendor) {
                                return false;
                            }

                            var vendor = product.Vendor.toUpperCase();
                            return _.some(config.vendorMatches || [], function (match) {
                                return vendor.indexOf(match) !== -1;
                            });
                        });

                        var requestCount = 0;
                        _.each(filteredProducts, function (product) {
                            var quantity = 0;
                            try {
                                quantity = parseFloat(eval(product.DefaultQuantityFieldSource));
                                store = store;
                            } catch (e) {
                                quantity = 0;
                            }

                            if (quantity > 0) {
                                requestCount++;
                                purchaseOrderItemStore.create({
                                    ProductId: product.ProductId + ';#' + product.ProductId,
                                    PurchaseOrderId: po.PurchaseOrderId + ';#' + po.PurchaseOrderId,
                                    Description: product.Description,
                                    Price: product.Price,
                                    PartNumber: product.PartNumber,
                                    Quantity: quantity,
                                    Vendor: product.Vendor
                                }, complete);
                            }
                        });

                        var originalCount = requestCount;
                        mask.html('Creating PO Line Items - (0/' + requestCount + ') Complete');
                        if (requestCount === 0) { complete(); }

                        function complete() {
                            requestCount--;
                            mask.html('Creating PO Line Items - (' + (originalCount - requestCount) + '/' + originalCount + ') Complete');
                            if (requestCount <= 0) {
                                $.modal.close();
                                mask.remove();
                                location.hash = '#purchase-order/' + po.PurchaseOrderId;
                            }
                        }
                    });
                }

                if (!config.loadProducts) {
                    createOrder([]);
                    return;
                }

                productStore.loadData(function (products) {
                    createOrder(products);
                });
            });
        }

        //Create workflow actions
        view.Workflows.on('change', function (e) {
            switch (view.Workflows.val()) {
                
                case 'audio-quote-request':
                    logHelper.logDebug("controller/summary.js","Inside audio quote status form:",  overrideDebugForFile);
                    showStatusForm('hmeAudioQuote');
                    break;
                case 'audio-quote-request-workflow':
                    logHelper.logDebug("controller/summary.js","Inside audio-quote-request-workflow:",  overrideDebugForFile);
                    triggerWorkflow(store.StoreNumber,"HMEAudioQuote",false, null);
                    break;
                case 'promotion-order':
                    logHelper.logDebug("controller/summary.js","Inside promotion order status form:",  overrideDebugForFile);
                    showStatusForm('createPromotionOrder');
                    break;
                case 'promotion-order-workflow':
                    logHelper.logDebug("controller/summary.js","Inside promotion-order-workflow:",  overrideDebugForFile);
                    triggerWorkflow(store.StoreNumber,"ProMotion",false, null);
                    break;
                case 'hughes-request-workflow':
					logHelper.logDebug("controller/summary.js","Inside hughes-request-workflow:",  overrideDebugForFile);
					 triggerWorkflow(store.StoreNumber,"ComcastRequest",false, null);
					break;
                case 'installer-quote-request':
                    window.open('#quotegen/' + store.StoreNumber);
                    break;
                case 'payment-monetization-summary':
                    window.open('#paymentmonetizationsummary/' + store.StoreNumber);
                    break;
                case 'generate-pro-forma':

                    if (store.ProjectType == "Remodel") {
                        require(['app/view/workflow/pro-forma-request'], function (quote) {
                            //Show address warning
                            var warning = quote.renderAddressWarning({ store: store });

                            warning.Yes.click(function (e) {
                                $.modal.close();
                                window.open('?rebate=1#proforma/' + store.StoreNumber);
                            });
                            warning.No.click(function (e) {
                                //Hide the modal
                                $.modal.close();
                                window.open('#proforma/' + store.StoreNumber);
                            });

                        });
                    }
                    else if (store.ProjectType === "POS Conversion") {
                        require(['app/view/workflow/pro-forma-request-conversion'], function (quote) {
                            //Show address warning
                            var warning = quote.renderAddressWarning({ store: store });

                            warning.Yes.click(function (e) {
                                $.modal.close();
                                window.open('?rebate=1#proforma/' + store.StoreNumber);
                            });
                            warning.No.click(function (e) {
                                //Hide the modal
                                $.modal.close();
                                window.open('#proforma/' + store.StoreNumber);
                            });

                        });
                    }
                    else {
                        window.open('#proforma/' + store.StoreNumber);
                    }

                    break;
                case 'generate-audio-pro-forma':
                    window.open('#audio-summary/' + store.StoreNumber);
                    break;
                case 'payment-monetization-order':
                    //VP6800Delivery validation
                    if (store.VP6800Delivery)
                    { }
                    else
                    {
                        alert('You must enter a Delivery Date.');
                        break;
                    }
                    if (store.VP6800Delivery.indexOf("/") > -1)
                    { }
                    else
                    {
                        alert('You must enter a Delivery Date.');
                        break;
                    }

                    //bill to company validation:

                    if (store.CompanyBillTo && store.AddressBillTo && store.CityBillTo && store.StateBillTo && store.ZipBillTo)
                    {
                        if (store.CompanyBillTo.length > 0 && store.AddressBillTo.length > 0 && store.CityBillTo.length > 0 && store.StateBillTo.length > 0 && store.ZipBillTo.length > 0)
                        {
                        }
                        else
                        {
                            alert('In the Bill To section, the following fields are required: Company, Address, City, State, Zip');
                            break;
                        }
                    }
                    else
                    {
                        alert('In the Bill To section, the following fields are required: Company, Address, City, State, Zip');
                        break;
                    }



                    require(['app/view/workflow/payment-modernization-order'], function (quote) {
                        //Show the quote
                        quote.render({
                            store: store,
                            callback: function (mailView) {
                                mailView.submit.on('click', function () {
                                    //Disable the button
                                    mailView.submit.setDisabled(true);

                                    //Get the escaped body with no breaks
                                    var msg = mailView.message.getData()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var subject = mailView.subject.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");


                                    var to = mailView.to.getValue();
                                    var cc = mailView.cc.getValue();

                                    var showAlert = false;
                                    if (store.EncodedAbsoluteUrl === undefined) {

                                        $().SPServices({
                                            operation: "GetListItems",
                                            listName: "Construction_Calls",
                                            CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
                                            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                                            CAMLRowLimit: 1,
                                            async: false,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).SPFilterNode("z:row").each(function () {

                                                    store.EncodedAbsoluteUrl = webUrl + "/Lists/Construction%20Calls/" + $(this).attr("ows_ID") + "_.000";
                                                    showAlert = true;

                                                });
                                            }
                                        });
                                    }

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.EncodedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "Payment Monetization Order") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
                                                        var level10CSS = "&lt;style&gt;.PMOTable{width:100%;vertical-align:top}.PMOTableTR{vertical-align:top}.PMOTableMessage{min-height:450px}.PMOTableDiv{font-family:Arial,Helvetica,sans-serif}.PMOTableSpan{font-weight:700}.PMOTableQuote{font-family:Arial,Helvetica,sans-serif}.PMOTableDelivery{font-weight:700}.TablePMOOrderItems{border:1px solid #000!important;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif}.TablePMOOrderItemsTR{background-color:#333;color:#ddd}.TablePMOOrderItemsTD1{border-top:1px solid #000!important;width:45px!important;text-align:center!important}.TablePMOOrderItemsTD2{border-top:1px solid #000!important;width:250px;text-align:center}.TablePMOOrderItemsTD3{border-top:1px solid #000!important;text-align:center}.TablePMORemoveRow{display:none}.TablePMOCenter{text-align:center}&lt;/style&gt;";
                                                        //Fire the workflow on the construction list
                                                        $().SPServices({
                                                            operation: "StartWorkflow",
                                                            item: store.EncodedAbsoluteUrl,
                                                            templateId: "{" + guid + "}",
                                                            workflowParameters: "<Data>" +
                                                                "<eTo>" + to + "</eTo>" +
                                                                "<eCC>" + cc + "</eCC>" +
                                                            "<eSubject>" + subject + "</eSubject>" +
                                                            "<eBody>" + level10CSS + msg + "</eBody>" +
                                                            "</Data>",
                                                            completefunc: function () {
                                                                //Update the Status
                                                                //var status = 'Requested ' + moment().format('M/D');
                                                                //$('div[data-editable="CirronetStatus"] div[contenteditable="true"]').html(status);
                                                                ////Rerun the business rules on change to update the view
                                                                //constructionRules.helper(view.el, store);
                                                                ////Hide the view

                                                                //update the PO and Ordered Date:

                                                                //get the PO number to increment:


                                                                mailView.dialog.hide();
                                                                if (showAlert)
                                                                    alert('Email Sent');
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                    break;
               
                case 'submit-em-survey-workflow':
                    logHelper.logDebug("controller/summary.js","Inside submit-em-survey-workflow:",  overrideDebugForFile);
                    require(['app/view/workflow/submit-em-survey'], function (quote) {
                            
                            //Show the upload form
                            var upload = quote.renderFileUpload({ store: store });

                            //Start file upload if changed to a file/user selects file
                            upload.Upload.change(function (e) {
                                if (this.files.length > 0) {
                                    //Disable the button
                                    upload.UploadLabel.attr('disabled', true);
                                    upload.UploadLabel.html('Uploading...');
                                    
                                    uploadFile();

                                    //Then upload the new file after deleting old/confirm doesn't exist
                                    function uploadFile() {
                                        //Convert to Base 64
                                        var file = upload.Upload[0].files[0];
                                        var reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = function () {
                                            var n = reader.result.indexOf(";base64,") + 8;
                                            var b64 = reader.result.substring(n);
                                            var extension = file.name.substr(file.name.lastIndexOf('.') + 1);

                                            //Upload the base 64 file
                                            combined.uploadDocument(store, b64, file.name, function () {
                                                //Go to the normal view

                                                triggerWorkflow(store.StoreNumber,"SubmitEMSurvey",true,file.name);
                                                $.modal.close();
                                                
                                                
                                            });
                                        };
                                        reader.onerror = function (error) {
                                            alert('Error Uploading File during base 64 conversion!')
                                        };
                                    }
                                } else {
                                    upload.UploadButton.attr('disabled', true);
                                }
                            });


                        


                        
                    });
                      
                    break;
                // case 'hme-loop-request':
                    require(['app/view/workflow/hme-loop-request'], function (quote) {
                        //Show the quote
                        quote.render({
                            store: store,
                            callback: function (mailView) {
                                mailView.submit.on('click', function () {
                                    //Disable the button
                                    mailView.submit.setDisabled(true);

                                    //Get the escaped body with no breaks
                                    var msg = mailView.message.getData()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var subject = mailView.subject.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");


                                    var to = mailView.to.getValue();
                                    var cc = mailView.cc.getValue();

                                    var showAlert = false;
                                    if (store.EncodedAbsoluteUrl === undefined) {

                                        $().SPServices({
                                            operation: "GetListItems",
                                            listName: "Construction_Calls",
                                            CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
                                            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                                            CAMLRowLimit: 1,
                                            async: false,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).SPFilterNode("z:row").each(function () {

                                                    store.EncodedAbsoluteUrl = webUrl + "/Lists/Construction%20Calls/" + $(this).attr("ows_ID") + "_.000";
                                                    showAlert = true;

                                                });
                                            }
                                        });
                                    }

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.EncodedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "HME Loop Request") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {

                                                        //Fire the workflow on the construction list
                                                        $().SPServices({
                                                            operation: "StartWorkflow",
                                                            item: store.EncodedAbsoluteUrl,
                                                            templateId: "{" + guid + "}",
                                                            workflowParameters: "<Data>" +
                                                                "<eTo>" + to + "</eTo>" +
                                                                "<eCC>" + cc + "</eCC>" +
                                                            "<eSubject>" + subject + "</eSubject>" +
                                                            "<eBody>" + msg + "</eBody>" +
                                                            "</Data>",
                                                            completefunc: function () {
                                                                //Update the Status
                                                                //var status = 'Requested ' + moment().format('M/D');
                                                                //$('div[data-editable="CirronetStatus"] div[contenteditable="true"]').html(status);
                                                                ////Rerun the business rules on change to update the view
                                                                //constructionRules.helper(view.el, store);
                                                                ////Hide the view

                                                                //update the PO and Ordered Date:

                                                                //get the PO number to increment:


                                                                mailView.dialog.hide();
                                                                if (showAlert)
                                                                    alert('Email Sent');
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                    break;
                case 'hme-loop-request-workflow':
                    logHelper.logDebug("controller/summary.js","Inside loop-request-workflow:",  overrideDebugForFile);
                        triggerWorkflow(store.StoreNumber,"HMELoopRequest",false,null);
                    break;
                case 'pos-data-order':
                    require(['app/view/workflow/pos-data-order'], function (quote) {
                        //Show the quote
                        quote.render({
                            store: store,
                            callback: function (mailView) {
                                mailView.submit.on('click', function () {
                                    //Disable the button
                                    mailView.submit.setDisabled(true);

                                    //Get the escaped body with no breaks
                                    var msg = mailView.message.getData()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var subject = mailView.subject.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");

                                    var showAlert = false;
                                    if (store.EncodedAbsoluteUrl === undefined) {

                                        $().SPServices({
                                            operation: "GetListItems",
                                            listName: "Construction_Calls",
                                            CAMLViewFields: "<ViewFields><FieldRef Name='ID' /></ViewFields>",
                                            CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                                            CAMLRowLimit: 1,
                                            async: false,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).SPFilterNode("z:row").each(function () {

                                                    store.EncodedAbsoluteUrl = webUrl + "/Lists/Construction%20Calls/" + $(this).attr("ows_ID") + "_.000";
                                                    showAlert = true;

                                                });
                                            }
                                        });
                                    }

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.EncodedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "POS Data Order") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
                                                        //Fire the workflow on the construction list
                                                        $().SPServices({
                                                            operation: "StartWorkflow",
                                                            item: store.EncodedAbsoluteUrl,
                                                            templateId: "{" + guid + "}",
                                                            workflowParameters: "<Data>" +
                                                            "<eSubject>" + subject + "</eSubject>" +
                                                            "<eBody>" + msg + "</eBody>" +
                                                            "</Data>",
                                                            completefunc: function () {
                                                                //Update the Status
                                                                var status = 'Requested ' + moment().format('M/D');
                                                                $('div[data-editable="CirronetStatus"] div[contenteditable="true"]').html(status);
                                                                //Rerun the business rules on change to update the view
                                                                constructionRules.helper(view.el, store);
                                                                //Hide the view
                                                                mailView.dialog.hide();
                                                                if (showAlert)
                                                                    alert('Email Sent');
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                    break;
                
                case 'updated-dates-workflow':
                    logHelper.logDebug("controller/summary.js","Inside updated-dates-workflow:",  overrideDebugForFile);
                        triggerWorkflow(store.StoreNumber,"NotifyDateChange",false,null);
                    break;
               
                case 'sonic-radio-order':
                    logHelper.logDebug("controller/summary.js","Inside sonic radio status form:",  overrideDebugForFile);
                    showStatusForm('sonicRadioOrder');
                    break;
                case 'sonic-radio-order-workflow':
                    logHelper.logDebug("controller/summary.js","Inside sonic-radio-order-workflow:",  overrideDebugForFile);
                    triggerWorkflow(store.StoreNumber,"SonicRadio",false, null);
                    break;
                
                case 'servereps-setup-workflow':
                     logHelper.logDebug("controller/summary.js","Inside servereps-setup-workflow:",  overrideDebugForFile);
                    triggerWorkflow(store.StoreNumber,"ServerEPSSetup",false, null);
                    break;       
                case 'fabcon-create-purchase-order':
                    logHelper.logDebug("controller/summary.js","Inside fabcon-create-purchase-order:",  overrideDebugForFile);
                    showStatusForm('createPurchaseOrder');
                    break;
                case 'fabcon-create-purchase-order-workflow':
                         logHelper.logDebug("controller/summary.js","Inside fabcon-create-purchase-order-workflow:",  overrideDebugForFile);
                        triggerWorkflow(store.StoreNumber,"FabconCPO",false, null);
                    break; 
                case 'idtech-create-purchase-order':
                    require(['app/store/products', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems', 'app/view/workflow/fabcon-create-purchase-order'], function (productStore, purchaseOrderStore, purchaseOrderItemStore, quote) {


                        ////Show the upload form
                        //var upload = quote.renderFileUpload({ store: store });

                        ////Start file upload if changed to a file/user selects file
                        //upload.Upload.change(function (e) {
                        //    if (this.files.length > 0) {
                        //        //Disable the button
                        //        upload.UploadLabel.attr('disabled', true);
                        //        upload.UploadLabel.html('Uploading...');
                        //        //First make sure there aren't pre-existing uploaded files
                        //        combined.getDocuments(store, function (store) {
                        //            var exists = false;
                        //            _.each(store.CombinedDocuments, function (document, i) {
                        //                if (document.FileName.indexOf('ISC Credit Packet.') !== -1) {
                        //                    exists = true;
                        //                    //Delete the file before uploading a new one
                        //                    combined.deleteDocument(store.CombinedId, document.FilePath, uploadFile);
                        //                }
                        //            });

                        //            if (!exists) {
                        //                uploadFile();
                        //            }
                        //        });

                        //        //Then upload the new file after deleting old/confirm doesn't exist
                        //        function uploadFile() {
                        //            //Convert to Base 64
                        //            var file = upload.Upload[0].files[0];
                        //            var reader = new FileReader();
                        //            reader.readAsDataURL(file);
                        //            reader.onload = function () {
                        //                var n = reader.result.indexOf(";base64,") + 8;
                        //                var b64 = reader.result.substring(n);
                        //                var extension = file.name.substr(file.name.lastIndexOf('.') + 1);

                        //                //Upload the base 64 file
                        //                combined.uploadDocument(store, b64, store.StoreNumber + ' - ISC Credit Packet.' + extension, function () {
                        //                    //Go to the normal view
                        //                    showStatusForm();
                        //                    upload.UploadButton.attr('disabled', true);
                        //                    upload.SendWithout.attr('disabled', true);
                        //                });
                        //            };
                        //            reader.onerror = function (error) {
                        //                alert('Error Uploading File during base 64 conversion!')
                        //            };
                        //        }
                        //    } else {
                        //        upload.UploadButton.attr('disabled', true);
                        //    }
                        //});

                        ////Send Without
                        //upload.SendWithout.click(function (e) {
                        //    //Show the normal email form
                        //    showStatusForm();
                        //    upload.UploadButton.attr('disabled', true);
                        //    upload.SendWithout.attr('disabled', true);
                        //});

                        showStatusForm();

                        function showStatusForm() {

                            productStore.loadData(function (products) {
                                var mask = $('<div>Creating Purchase Order</div>');
                                mask.modal({
                                    escapeClose: false,
                                    clickClose: false,
                                    showClose: false
                                });
                                //Create the new purchase order with data from retail tech as defaults
                                purchaseOrderStore.create({
                                    StoreNumber: store.CombinedId + ';#' + store.StoreNumber,
                                    BillingName: store.PrimaryContact,
                                    BillingAddress: store.AddressBillTo,
                                    BillingPhone: store.PrimaryPhone,
                                    BillingEmail: store.PrimaryEmail,
                                    BillingZip: store.ZipBillTo,
                                    BillingCity: store.CityBillTo,
                                    BillingState: store.StateBillTo,
                                    Franchisee: store.FranchiseGroup,
                                    ShippingName: store.PrimaryContact,
                                    ShippingAddress: store.Address,
                                    ShippingZip: store.Zip,
                                    ShippingCity: store.City,
                                    ShippingState: store.State,
                                    DeliveryDate: store.PopsDeliveryDate,
                                    PoType: 'IDTech'
                                }, function (po) {
                                    //Recalculate total stalls in case it's been updated since the request
                                    store.TotalStalls = (store.StallCount !== '' ? parseInt(store.StallCount) : 0) + (store.PatioCount !== '' ? parseInt(store.PatioCount) : 0);
                                    store.TotalStalls = store.TotalStalls.toString();

                                    //Add a line item for each fabcon part
                                    var requestCount = 0;

                                    $().SPServices({
                                        operation: "GetListItems",
                                        listName: "Construction_Calls",
                                        CAMLViewFields: "<ViewFields><FieldRef Name='PAYS_x0020_Type' /></ViewFields>",
                                        CAMLQuery: "<Query><Where><Eq><FieldRef Name='Store_x0020_Number' /><Value Type='Text'>" + store.StoreNumber + "</Value></Eq></Where></Query>",
                                        CAMLRowLimit: 1,
                                        async: false,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).SPFilterNode("z:row").each(function () {

                                                store.PaysType = $(this).attr("ows_PAYS_x0020_Type");


                                            });
                                        }
                                    });

                                    _.each(products, function (product) {

                                        
                                        if (product.Vendor.toUpperCase().indexOf('ID TECH') > -1) {
                                            //Determine quantity

                                            //shows 5 products in dropdown - but should show 13


                                            var quantity = 0;

                                            try {
                                                quantity = parseFloat(eval(product.DefaultQuantityFieldSource));
                                                store = store; //note - this is to ensure the store is available in the eval scope and doesn't get garbage collected

                                            } catch (e) {
                                                quantity = 0;
                                            }

                                            //Create each line item
                                            if (quantity > 0) {
                                                requestCount++;
                                                purchaseOrderItemStore.create({
                                                    ProductId: product.ProductId + ';#' + product.ProductId,
                                                    PurchaseOrderId: po.PurchaseOrderId + ';#' + po.PurchaseOrderId,
                                                    Description: product.Description,
                                                    Price: product.Price,
                                                    PartNumber: product.PartNumber,
                                                    Quantity: quantity,
                                                    Vendor: product.Vendor
                                                }, complete);
                                            }
                                        }
                                    });

                                    var originalCount = requestCount;
                                    mask.html('Creating PO Line Items - (0/' + requestCount + ') Complete');
                                    if (requestCount === 0) { complete(); }

                                    function complete() {
                                        requestCount--;
                                        mask.html('Creating PO Line Items - (' + (originalCount - requestCount) + '/' + originalCount + ') Complete');
                                        if (requestCount <= 0) {
                                            $.modal.close();
                                            mask.remove();
                                            location.hash = '#idtech-purchase-order/' + po.PurchaseOrderId;
                                        }
                                    }
                                });
                            });
                        }

                    });
                    break;
                case 'fabcon-dtpops-create-purchase-order':
                    require(['app/store/products', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems'], function (productStore, purchaseOrderStore, purchaseOrderItemStore) {
                        productStore.loadData(function (products) {
                            var mask = $('<div>Creating Purchase Order</div>');
                            mask.modal({
                                escapeClose: false,
                                clickClose: false,
                                showClose: false
                            });
                            //Create the new purchase order with data from retail tech as defaults
                            purchaseOrderStore.create({
                                StoreNumber: store.CombinedId + ';#' + store.StoreNumber,
                                BillingName: store.PrimaryContact,
                                BillingAddress: store.AddressBillTo,
                                BillingPhone: store.PrimaryPhone,
                                BillingEmail: store.PrimaryEmail,
                                BillingZip: store.ZipBillTo,
                                BillingCity: store.CityBillTo,
                                BillingState: store.StateBillTo,
                                ShippingName: store.PrimaryContact,
                                ShippingAddress: store.Address,
                                ShippingZip: store.Zip,
                                ShippingCity: store.City,
                                ShippingState: store.State,
                                DeliveryDate: store.DtPopsBaseDeliveryDate,
                                PoType: 'ISC - DT POPS'
                            }, function (po) {
                                //Add a line item for each fabcon part
                                var requestCount = 0;

                                //products contains items already in the invoice
                                //not those in the dropdown
                                _.each(products, function (product) {
                                    if (product.Vendor.toUpperCase().indexOf('FABCON') !== -1 && product.PartNumber.indexOf('FC-6632P-300') !== -1) {
                                        //Determine quantity

                                        //shows 13 products in dropdown - but should show 5


                                        var quantity = 0;
                                        if (product.DefaultQuantityFieldSource !== '') {
                                            try {
                                                quantity = parseFloat(eval(product.DefaultQuantityFieldSource));
                                                store = store; //note - this is to ensure the store is available in the eval scope and doesn't get garbage collected
                                                if (window.console)
                                                    logHelper.logDebug("controller/summary.js","ADDED - fabcon-dtpops-create-purchase-order: " + product.Description,  overrideDebugForFile);
                                            } catch (e) {
                                                quantity = 0;
                                                if (window.console)
                                                    logHelper.logDebug("controller/summary.js","NOT ADDED - fabcon-dtpops-create-purchase-order: " + product.Description,  overrideDebugForFile);
                                            }

                                            if (window.console)
                                                logHelper.logDebug("controller/summary.js","QTY fabcon-dtpops-create-purchase-order: " + product.Description + " QTY:" + quantity,  overrideDebugForFile);
                                        }

                                        //Create each line item
                                        if (quantity > 0) {
                                            requestCount++;
                                            purchaseOrderItemStore.create({
                                                ProductId: product.ProductId + ';#' + product.ProductId,
                                                PurchaseOrderId: po.PurchaseOrderId + ';#' + po.PurchaseOrderId,
                                                Description: product.Description,
                                                Price: product.Price,
                                                PartNumber: product.PartNumber,
                                                Quantity: quantity,
                                                Vendor: product.Vendor
                                            }, complete);
                                        }
                                    }
                                });

                                var originalCount = requestCount;
                                mask.html('Creating PO Line Items - (0/' + requestCount + ') Complete');
                                if (requestCount === 0) { complete(); }

                                function complete() {
                                    requestCount--;
                                    mask.html('Creating PO Line Items - (' + (originalCount - requestCount) + '/' + originalCount + ') Complete');
                                    if (requestCount <= 0) {
                                        $.modal.close();
                                        mask.remove();
                                        location.hash = '#purchase-order/' + po.PurchaseOrderId;
                                    }
                                }
                            });
                        });
                    });
                    break;
                
                case 'select-workflow':
                default:
                    //it's back on the default, do nothing
                    return;
            }

            view.Workflows.val('select-workflow');
        });

        //Handle file uploads
        view.onUploadDocuments = function (e) {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                var items = e.dataTransfer.items,
                  filesLoaded = 0,
                  modal = $('<div>Uploading Files...</div>'),
                  files = [];
                modal.modal({
                    escapeClose: false,
                    clickClose: false,
                    showClose: false
                });

                //Recursively go through the tree
                var count = 0;
                _.each(items, function (item) {
                    count++;
                    traverseFileTree(function () {
                        if (--count <= 0) {
                            _.asyncLoop({
                                collection: files,
                                each: function (next, item) {
                                    uploadFile(item.file, item.fileName, next);
                                },
                                complete: function () {
                                    //Notify complete, update the tree, and close
                                    view.Documents.updateDocuments();
                                    // uploadFile(file, fileName, next);
                                    modal.html('Files Uploaded!  Have a nice Day :-)');
                                    setTimeout(function () {
                                        $.modal.close();
                                        modal.remove();
                                    }, 1500);
                                }
                            });
                        }
                    }, item.webkitGetAsEntry());
                });

                //Recursive function to find and upload files
                function traverseFileTree(next, item, path) {
                    path = path || "";
                    if (item.isFile) {
                        // Get file
                        item.file(function (file) {
                            //Strip any illegal characters
                            var fileName = path + file.name.replace(/[\\~#%&*{}/:<>?|"-]/g, ' ').replace(/\s+/g, ' ');
                            files.push({ file: file, fileName: fileName });
                            next();
                        });
                    } else if (item.isDirectory) {
                        // Get folder contents
                        var dirReader = item.createReader();
                        dirReader.readEntries(function (entries) {
                            _.asyncLoop({
                                collection: entries,
                                each: function (next, entry) {
                                    traverseFileTree(next, entry, path + item.name.replace(/[\\~#%&*{}/:<>?|"-]/g, ' ').replace(/\s+/g, ' ') + "[`]");
                                },
                                complete: next
                            });
                        });
                    } else {
                        //Call next in case someone drops a non file/folder object
                        next();
                    }
                }

                function uploadFile(file, fileName, next) {
                     logHelper.logDebug("controller/summary.js",file + ", " + fileName + ", ",  overrideDebugForFile);
                    //Convert to Base 64
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        var n = reader.result.indexOf(";base64,") + 8;
                        var b64 = reader.result.substring(n);

                        //Upload the base 64 file
                        combined.uploadDocument(store, b64, fileName, function () {
                            modal.html(++filesLoaded + ' Files Uploaded');
                            next();
                        });
                    };
                    reader.onerror = function (error) {
                        alert('Error Uploading File during base 64 conversion!')
                    };
                }
            }
        };

        //Handle file renames
        view.onRenameFile = function (oldFilePath, newFilename, modal) {
            modal.html('Renaming file...');

            //Figure out the new filename if there is any additional path
            var filepath = oldFilePath.split('/'),
              filename = filepath.pop();
            oldFilename = filename;

            //Remove the last item in our sudo-file system
            filename = filename.split(encodeURIComponent('[`]'));
            filename.pop();
            filename.push(encodeURIComponent(newFilename));
            filename = filename.join(encodeURIComponent('[`]'));
            filepath.push(filename);
            filepath = filepath.join('/');

            $.ajax('https://irbpartners.sharepoint.com/sites/RetailTechDeployment/SiteAssets/RenameListFileAttachment.aspx?listname=Combined%20Schedule&ID=' + store.CombinedId + '&filename=' + oldFilename + '&new=' + filename, {
                success: function () {
                    $.modal.close();
                    modal.remove();

                    //Update the view
                    var document = _.find(store.Documents, { FilePath: decodeURIComponent(oldFilePath) });
                    document.FileName = decodeURIComponent(filename);
                    document.FilePath = decodeURI(filepath);
                    view.Documents.updateDocuments();
                },
                fail: function () {
                    alert('Error updating filename!');
                }
            });
        };

        //Delete files
        view.onDeleteFile = function (filePath, modal) {
            combined.deleteDocument(store.CombinedId, decodeURIComponent(filePath), function () {
                debugger;
                _.remove(store.Documents, { FilePath: decodeURIComponent(filePath) });
                view.Documents.updateDocuments();
                $.modal.close();
                modal.remove();
            });
        };

        //Apply business rules (0 = Green/Good, 1 = White/incomplete but not at risk, 2 = Yellow/warning, 3 = Red/immediate attention
        //Stop if not a construction project
        if (store.ProjectType === 'POS Conversion') return;

        //Check each rule - apply CSS rules based on these
        constructionRules.helper(view.el, store);
    }

    function afterChange(view, key, value, store, revertBackground, response) {
        //Revert the background/unlock the field
        revertBackground();

        //Rerun the business rules on change to update the view
        constructionRules.helper(view.el, store);
    }

    return {
        show: function (target, storeNumber, routeCheck) {
            logHelper.logDebug("controller/summary.js"," target : " + JSON.stringify(target) + ", storeNumber: " + storeNumber + ", routeCheck: " + routeCheck,  overrideDebugForFile);
            //Show summary
            summary.render({
                storeNumber: storeNumber,
                target: target,
                routeCheck: routeCheck,
                callback: afterRender,
                afterChange: afterChange,
                afterRenderNotes: applyNoteEventListeners,
                afterRenderIssues: applyIssueEventListeners
            });
        }
    };
});