define(['app/view/summary/summary', 'app/store/construction', 'app/store/issues', 'app/store/notes', 'app/store/combined', 'app/rules/construction','app/brands/services/brandServices','app/brands/services/logHelper'], function (summary, construction, issueStore, noteStore, combined, constructionRules,brandServices,logHelper) {


    var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
    $().SPServices.defaults.webURL = webUrl;

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
var siteUrl2
      var currentUser;
      function getCurrentUser(){
        console.log("Inside getCurrentUser: ");
        var ctx= new SP.ClientContext.get_current();
        console.log("Inside getCurrentUser: 2" + ctx);
        var web = ctx.get_web();
        console.log("Inside getCurrentUser: 3 " + web);
        currentUser = web.get_currentUser();
        console.log("Current User: " + currentUser.UserName);
        // ctx.load(currentUser);
        // ctx.executeQueryAsync(onSuccess, onFailure);
        }
    function triggerWorkflow(store,workFlowType,hasAttachment,fileName) {
        try {
            console.log("Inside triggerWorkFlow: " + workFlowType);
                var siteUrl = "https://irbpartners.sharepoint.com/sites/RetailTechDeployment/";
                getCurrentUser();
                
                console.log("siteUrl2: " + siteUrl2);
                var clientContext = new SP.ClientContext(siteUrl);
                var oList = clientContext.get_web().get_lists().getByTitle('WorkFlowTriggerRequest');
                    
                var itemCreateInfo = new SP.ListItemCreationInformation();
                this.oListItem = oList.addItem(itemCreateInfo);
                
                const newDate = new Date();
                const formattedDate = formatDate(newDate);
                
            
                var title = store + '-' + workFlowType + '-' + formattedDate;

                oListItem.set_item('Title', title);
                oListItem.set_item('Store', store);
                oListItem.set_item('WFType', workFlowType);
                oListItem.set_item('RequestBy', currentUser.UserName);
                oListItem.set_item('DateRequested', new Date());
                if (hasAttachment === true){
                     this.oListItem.set_item('HasAttachment',hasAttachment);
                     this.oListItem.set_item('AttachmentFileName',fileName);
                }
               
                console.log("Before updating the list:" + oList);
                oListItem.update();
            
                clientContext.load(oListItem);

        clientContext.executeQueryAsync(
            //Success callback
            () => {
                console.log("Successfully created trigger request");                 
                alert(`The ${workFlowType} workflow has been sent to the queue.`);
            },
            //Error callback
            (sender, args) => {
                console.error("An error occured:", args.get_message());
                alert(`Error queueing the ${workFlowType} workflow, please try again.`);
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
        //Create workflow actions
        view.Workflows.on('change', function (e) {
            switch (view.Workflows.val()) {
                case 'audio-quote-request':
                    require(['app/view/workflow/hme-quote'], function (quote) {
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



                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.EncodedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "HME Quote Request") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
                                                        //Fire the workflow on the construction list
                                                        $().SPServices({
                                                            operation: "StartWorkflow",
                                                            item: store.EncodedAbsoluteUrl,
                                                            templateId: "{" + guid + "}",
                                                            workflowParameters: "<Data>" +
                                                            "<eSubject>" + subject + "</eSubject>" +
                                                            "<eFrom>clayton.gause@inspirebrands.com</eFrom>" +
                                                            "<eBody>" + msg + "</eBody>" +
                                                            "</Data>",
                                                            completefunc: function () {
                                                                //Update the Status to PO Requested [current date]
                                                                var status = 'Quote Requested ' + moment().format('M/D');
                                                                $('div[data-editable="AudioStatus"] div[contenteditable="true"]').html(status);
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
                case 'audio-quote-request-workflow':
                    console.log("Inside audio-quote-request-workflow:");
                     triggerWorkflow(store.StoreNumber,"HMEAudioQuote",false, null);
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
                case 'submit-em-survey':
                    
                    require(['app/view/workflow/submit-em-survey'], function (quote) {
                        //Show address warning
                        
                        
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

                                                $().SPServices({
                                                    operation: "GetTemplatesForItem",
                                                    item: store.EncodedAbsoluteUrl,
                                                    async: true,
                                                    completefunc: function (xData, Status) {
                                                        $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                            if ($(this).attr("Name") == "Submit EM Docu") {
                                                                var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                                if (guid != null) {

                                                                    //Fire the workflow on the construction list
                                                                    $().SPServices({
                                                                        operation: "StartWorkflow",
                                                                        item: store.EncodedAbsoluteUrl,
                                                                        templateId: "{" + guid + "}",
                                                                        workflowParameters: "<Data>" +
                                                                            "<storenumber>" + store.StoreNumber + "</storenumber>" +
                                                                            "<city>" + store.City + "</city>" +
                                                                        "<state>" + store.State + "</state>" +
                                                                        "<POSdeliverydate>" + store.PosDeliveryDate + "</POSdeliverydate>" +
                                                                        "<installstartdate>" + store.InstallDate + "</installstartdate>" +
                                                                        "<eFile>" + file.name + "</eFile>" +
                                                                        "<CombinedId>" + store.CombinedId + "</CombinedId>" +
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


                                                                            
                                                                            
                                                                                alert('Email Sent');
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                                
                                                $('<div>We did It!  Have a nice Day :-)</div>').modal({
                                                    escapeClose: false,
                                                    clickClose: false,
                                                    showClose: false
                                                });
                                                setTimeout(function () {
                                                    $.modal.close();
                                                }, 1500);
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
                case 'submit-em-survey-workflow':
                    console.log("Inside submit-em-survey-workflow:");
                    require(['app/view/workflow/submit-em-survey'], function (quote) {
                        //Show address warning
                        
                        
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
                                                
                                                $('<div>We did It!  Have a nice Day :-)</div>').modal({
                                                    escapeClose: false,
                                                    clickClose: false,
                                                    showClose: false
                                                });
                                                setTimeout(function () {
                                                    $.modal.close();
                                                }, 1500);
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
                case 'hme-loop-request':
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
                    console.log("Inside loop-request-workflow:");
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
                case 'level-ten-data-order':
                    require(['app/view/workflow/level-ten-data-order'], function (quote) {
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
                                                if ($(this).attr("Name") == "Level 10 Data Order") {
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
                                                                var statusCirronetStatus = 'Ordered ' + moment().format('M/D');
                                                                $('div[data-editable="CirronetStatus"] div[contenteditable="true"]').html(statusCirronetStatus);
                                                                //Rerun the business rules on change to update the view
                                                                constructionRules.helper(view.el, store);
                                                                //Hide the view
                                                                mailView.dialog.hide();
                                                                if (showAlert)
                                                                    alert('Email Sent');


                                                                $().SPServices({
                                                                    operation: "UpdateListItems",
                                                                    async: false,
                                                                    batchCmd: "Update",
                                                                    ID: store.ConstructionId,
                                                                    listName: "Construction_Calls",
                                                                    valuepairs: [["Cirronet_x0020_Status", statusCirronetStatus]],
                                                                    completefunc: function (xData, Status) {
                                                                    }
                                                                });

                                                                //insert new PO record into Level 10 Orders

                                                                $().SPServices({
                                                                    operation: "UpdateListItems",
                                                                    async: false,
                                                                    batchCmd: "New",
                                                                    listName: "Level 10 Orders",
                                                                    valuepairs: [["Title", store.StoreNumber], ["PO_x0020_Number", store.VP6800PONum], ["Subject", subject], ["Body", msg]],
                                                                    completefunc: function (xData, Status) {
                                                                        
                                                                    }
                                                                });

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
                case 'updated-dates':
                    require(['app/view/workflow/email', 'dojo/text!app/view/workflow/updated-dates.html', 'app/widget/widgetHelper', 'dojo/text!app/view/workflow/update-purchase-order.html', 'app/store/purchaseOrders', 'app/controller/purchase-order','app/brands/services/brandServices','app/brands/services/logHelper', 'dojo/when'], function (form, template, widgetHelper, purchaseOrderUpdateTemplate, purchaseOrderStore, poController,brandServices,logHelper,when) {
                        
						var emailDistributionDetails =  brandServices.getEmailDistributionDetails('Workflow','updated-dates');
						logHelper.logDebug("controller-summary.js","EmailDistributionDetails for updated-dates: " + JSON.stringify(emailDistributionDetails));
						
						
						// //Create list to email to based on parameters
                         var CDEmail = '';
                         if (store.ConstructionManager.toUpperCase().indexOf('TRAINER') !== -1)
                             CDEmail += 'atrainer-murray@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('ROWAN') !== -1)
                             CDEmail += 'browan@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('BRUNTON') !== -1)
                             CDEmail += 'bbrunton@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('PIPITONE') !== -1)
                             CDEmail += 'ipipitone@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('CULBERTSON') !== -1)
                             CDEmail += 'jculbertson@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('PUENTE') !== -1)
                             CDEmail += 'jpuente@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('CHISM') !== -1)
                             CDEmail += 'jchism@inspirebrands.com;';
                         if (store.ConstructionManager.toUpperCase().indexOf('RICE') !== -1)
                             CDEmail += 'nrice@inspirebrands.com;';

						
						logHelper.logDebug("controller-summary","Initial email list for updated-dates email : " + CDEmail);
						
						var email = CDEmail + emailDistributionDetails[0].emailTo,
						from = emailDistributionDetails[0].emailFrom,
						emailCC = emailDistributionDetails[0].emailCC,
						template = $(template);
						logHelper.logDebug("controller-summary","email list with distributionList added for updated-dates email : " + email);
                        
                         // var email = CDEmail + 'Tracy.Kapka@sonicdrivein.com;Collise.fisher@hughes.com;sejal.degadwala@hughes.com;meron.abinet@hughes.com;Muhammad.saleem@hughes.com;deokie.khan@hughes.com;valini.sarjoo@hughes.com;sean.carroll@hughes.com;William.kruger@hughes.com;Shae.Mitine@Sonicdrivein.com; ',
                        // from = 'NSTI@sonicdrivein.com; ';
                        // template = $(template);
                         //Edit template fields for the PM signature:
                         template.find('#pm').html(store.ProjectManager);
						
						//TODO:  Need to retrieve Project Manager details from a List
                        if (store.ProjectManager.toUpperCase().indexOf('JASON') !== -1) {
                            template.find('#phone').html('918.269.1657');
                            template.find('#email').html('Jason.Srader@sonicdrivein.com');
                        } else if (store.ProjectManager.toUpperCase().indexOf('LIZ') !== -1) {
                            template.find('#phone').html('405-641-2374');
                            template.find('#email').html('Elizabeth.Sannes@sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('KATIGAN') !== -1) {
                            template.find('#phone').html('405-919-6342');
                            template.find('#email').html('Russell.Katigan@Sonicdrivein.com');
                        }

                        else if (store.ProjectManager.toUpperCase().indexOf('BARRETT') !== -1) {
                            template.find('#phone').html('918.760.8023');
                            template.find('#email').html('Barrett.Seal@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('PAIGE') !== -1) {
                            template.find('#phone').html('918.760.8023');
                            template.find('#email').html('Paige.Bailey@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('DYLAN') !== -1) {
                            template.find('#phone').html('303-437-8623');
                            template.find('#email').html('Dylan.Gehlbach@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('REGINA') !== -1) {
                            template.find('#phone').html('405-201-1235');
                            template.find('#email').html('Regina.Pannell@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('BJ') !== -1) {
                            template.find('#phone').html('405-202-2965');
                            template.find('#email').html('BJ.Bryant@Sonicdrivein.com');
                        }

						logHelper.logDebug("controller-summary","email list with store.ProjectManager added for updated-dates email : " + email);
                        if (store.PaysType === 'VP6800')
                        {
                            template.find('#DataDelivery').text('Level 10 Delivery');
                        }

                        //Insert the dates
                        widgetHelper.activate(template, store);

                        //Hide fields if they are not being used
                        if (store.Pos.toUpperCase().indexOf('MICROS') === -1) {
                            template.find('#cal-row').remove();
                            template.find('#support-row td:first').html('Infor Support');
                            template.find('#pos-row td:first').html('Infor Delivery');
                        } else {
                            template.find('#support-row td:first').html('Micros Support');
                            template.find('#pos-row td:first').html('Micros Delivery');
                        }

                        if (store.HughesVsatStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#hughes-vsat-row').remove();
                        }
                        if (store.HughesTempStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#hughes-temp-row').remove();
                        }
                        if (store.HughesPrimaryStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#hughes-primary-row').remove();
                        }
                        if (store.HughesDeinstallStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#hughes-deinstall-row').remove();
                        }
                        if (store.PopsStatus)
                        if (store.PopsStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#pops-row').remove();
                        }

                        if (store.AudioStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#audio-row').remove();
                        } else {
                            template.find('#audio-row td:first-child').html(store.AudioType + ' Audio Delivery');
                        }
                        if (store.DmbTvStatus)
                        if (store.DmbTvStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#dmb-row').remove();
                        }
                        if (store.SonicRadioStatus)
                        if (store.SonicRadioStatus.toUpperCase().indexOf('NOT REQUIRED') !== -1) {
                            template.find('#sonic-radio-row').remove();
                        }

                        //Fix all the borders & Padding
                        template.find('td').css({
                            'border-top': '1px solid black',
                            'padding-right': '20px'
                        });

                        if (store.ConstructionManager)
                            if (store.ConstructionManager.toUpperCase().indexOf('JULIEN') !== -1) {
                            email += 'djulien@InspireBrands.com;';
                        }
						logHelper.logDebug("controller-summary","email list with store.ConstructionManager added for updated-dates email : " + email);
						//TODO add store installer to Brand - EmailDistributionList
                        //Add installer PM
                        switch (store.Installer) {
                            case 'IST':
                            case 'Skinny IT':
                                email += 'Sonic.installs@skinnyit.com; ';
                                break;
                            case 'AVIT':
                                email += 'skalisek99@gmail.com; amyartibee40@gmail.com; ';
                                break;
                            case 'RH Tech':
                                email += 'Jesse@rhtechservices.com; shane@rhtechservices.com; charlie@rhtechservices.com; lee@rhtechservices.com;  ';
                                break;
                            case 'AVA':
                                email += 'rickcrenshaw7777@gmail.com; ';
                                break;
                            case 'MSIT':
                                email += 'ron.schmittou@msit.us; DavidCasishere@yahoo.com; quotes@MSIT.us; ';
                                break;
                            case 'MYRA':
                            case 'MIRA':
                                email += 'Rachael@miraenterprises.net; mikeb@miraenterprises.net; zachary@miraenterprises.net; dispatchrequest@miraenterprises.net; ';
                                break;
                            case 'ATI':
                                email += 'brfc0316@gmail.com; aticustomerservice2015@gmail.com; ';
                                break;
                            case 'CSI':
                                email += 'Chrissy.Davis@CSICentralStates.com; gabe.marler@CSICentralStates.com; ';
                                break;
                        }
						logHelper.logDebug("controller-summary","email list with store.Installer added for updated-dates email : " + email);
						//TODO add construction Project Manager to Brand - EmailDistributionList
                        //Add construction PM's
                        email += 'Development-ConstructionGroup@Sonicdrivein.com; ';
						logHelper.logDebug("controller-summary","email list with construction Project Manager added for updated-dates email : " + email);
                        //Add Norbert/Kendra if Micros
                        if (store.Pos === 'Micros') {
                            email += 'crussell@inspirebrands.com;lwilliams@inspirebrands.com;mtucker@inspirebrands.com;Hannah.sales@oracle.com;Carol.crory@oracle.com;Blake.webb@oracle.com;erin.mckay@oracle.com;aaron.glosser@oracle.com;dave.p.williams@oracle.com;  ';
                        } else if (store.Pos === 'Infor') {
                            email += 'Doug.Gilbert@infor.com; joel.schuler@infor.com; justin.hiller@infor.com;Kevin.oconnor@infor.com; ';
                        }
						logHelper.logDebug("controller-summary","email list with store.Pos added for updated-dates email : " + email);
                        //Add Paul/Erin if Micros  Audio
                        if (store.AudioType === 'Micros') {
                            email += 'Paul.Fischer@Sonicdrivein.com; inge.smith@sonicdrivein.com; ';
							logHelper.logDebug("controller-summary","email list with store.AudioType added for updated-dates email : " + email);
                        }

                        //Add SonicSales@hme if AudioType contains 'HME'
                        if (store.AudioType.toUpperCase().indexOf('HME') !== -1) {
                            email += 'SonicSales@hme.com; ';
							logHelper.logDebug("controller-summary","email list with store.AudioType HME added for updated-dates email : " + email);
                        }

                        //Add FabCon if status isn't not required
                        if (store.PopsStatus)
                        if (store.PopsStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                            email += 'kgelfer@fabcon.com; bjuarez@fabcon.com; rdelapena@fabcon.com; kgelfer@fabcon.com; IEscobar@fabcon.com;  ';
                        }
                        logHelper.logDebug("controller-summary","email list with store.PopsStatus added for updated-dates email : " + email);
                        //Add Pos Data if status isn't not required
                        if (store.CirronetStatus)
                        if (store.CirronetStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                            if (store.PaysType === 'VP6800')
                                email += 'sonicorder@level10.com; gglaze@level10.com; elanglo@level10.com; ';
                            else
                                email += 'becky.fighera@posdata.com; Amy.sherrer@posdata.com; ';
                        }
						logHelper.logDebug("controller-summary","email list with store.CirronetStatus added for updated-dates email : " + email);
                        if (store.PaysType)
                        if (store.PaysType.indexOf("VP6800") > -1)
                            email += 'gglaze@level10.com; elanglo@level10.com; ';
						logHelper.logDebug("controller-summary","email list with store.PaysType added for updated-dates email : " + email);
                        //Add ProMotion if status isn't not required
                        if (store.DmbTvStatus)
                        if (store.DmbTvStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                            email += 'Victoria.wilson@promotion.tech;katelyn.kazanowski@promotion.tech;crystal.kokenos@promotion.tech;Zena.mikha@promotion.tech;ali.kazanowski@promotion.tech; ';
                        logHelper.logDebug("controller-summary","email list with store.DmbTvStatus added for updated-dates email : " + email);
						}
                        //Add ProMotion if status isn't not required
                        if (store.SonicRadioStatus)
                        if (store.SonicRadioStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                            email += 'dmorris@pamdist.com;  purchasing@pamdist.com; accounting@pamdist.com; JSaunders@pamdist.com; ';
							logHelper.logDebug("controller-summary","email list with store.SonicRadioStatus added for updated-dates email : " + email);
                        }
						logHelper.logDebug("controller-summary","complete email list for updated-dates email : " + email);
                        //Show the quote
                        form.render({
                            subject: store.City + ', ' + store.State + ' #' + store.StoreNumber + ' - Updated Install & Delivery Dates',
                            from: from,
							to: email,
                            cc: emailCC,//'NSTI@sonicdrivein.com; SonicFieldServices@inspirebrands.com; ',
                            body: template.html(),
                            button: 'Send Update',
                            title: 'Notify All of Updated Install/Delivery Dates',
                            callback: function (mailView) {
                                mailView.submit.on('click', function () {
                                    //Disable the button
                                    mailView.submit.setDisabled(true);
                                    //Track process completion
                                    var updateEmailSent = false,
                                      poEmailSent = false;

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
                                    var to = mailView.to.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var cc = mailView.cc.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");

                                    //Close the mailview and open a dialog to update purchase orders if there are any
                                    if (store.PurchaseOrders.length > 0) {
                                        //Hide the view
                                        mailView.dialog.hide();
                                        //Create a modal dialog to see if the PO's should be updated
                                        purchaseOrderUpdateTemplate = $(purchaseOrderUpdateTemplate);
                                        purchaseOrderUpdateTemplate.modal({
                                            escapeClose: false,
                                            clickClose: false,
                                            showClose: false
                                        });

                                        //Add the PO's to the list
                                        var poList = purchaseOrderUpdateTemplate.find('#po-update-list tbody');
                                        _.each(store.PurchaseOrders, function (po) {
                                            poList.append('<tr>' +
                                                '<td><input type="checkbox" class="po-update-checkbox" id="' + po.PurchaseOrderId + '"' + (po.PoType === 'FabCon' ? ' checked ' : ' ') + '/></td>' +
                                                '<td>' + po.PoType + '</td>' +
                                                '<td>' + moment(po.DeliveryDate).format('l') + '</td>' +
                                                '<td>' + moment(store.PopsDeliveryDate).format('l') + '</td>' +
                                              '</tr>');
                                        });

                                        //Handle Don't Update button click
                                        purchaseOrderUpdateTemplate.find('#po-cancel-button').click(function () {
                                            $.modal.close();
                                            poEmailSent = true;
                                            sendToQueue();
                                        });

                                        //Handle update button click
                                        purchaseOrderUpdateTemplate.find('#po-update-button').click(function () {
                                            var requestCount = poList.find('.po-update-checkbox:checked').length;
                                            var mask = $('<div>Updating Purchase Orders 0/' + requestCount + '</div>');
                                            mask.modal({
                                                escapeClose: false,
                                                clickClose: false,
                                                showClose: false
                                            });
                                            poList.find('.po-update-checkbox:checked').each(function () {
                                                //Find the PO
                                                var po = _.find(store.PurchaseOrders, { PurchaseOrderId: $(this).attr('id') });
                                                console.log("PurchaseOrderId: " + $(this).attr('id'));
                                                //Update the date
                                                purchaseOrderStore.changeValue('DeliveryDate', store.PopsDeliveryDate, po.PurchaseOrderId, function () {
                                                    poController.sendUpdate({
                                                        purchaseOrderId: po.PurchaseOrderId,
                                                        callback: function () {
                                                            requestCount--;
                                                            if (requestCount <= 0) {
                                                                $.modal.close();
                                                                poEmailSent = true;
                                                                sendToQueue();
                                                                //TODO - need to find a way to abstract the document update part of the view away so I can update it easily here
                                                            } else {
                                                                mask.html('Updating Purchase Orders 0/' + requestCount);
                                                            }
                                                        }
                                                    });
                                                });
                                            });
                                            //Catch someone clicking update without any items checked
                                            if (requestCount <= 0) {
                                                $.modal.close();
                                                poEmailSent = true;
                                                sendToQueue();
                                            }
                                        });
                                    } else {
                                        $.modal.close();
                                        poEmailSent = true;
                                        sendToQueue();
                                    }


                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.CombinedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "Email") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
														
														sendToQueue();
														 
														//CTG: Old method
                                                        //Fire the workflow on the construction list
                                                        // $().SPServices({
                                                            // operation: "StartWorkflow",
                                                            // item: store.CombinedAbsoluteUrl,
                                                            // templateId: "{" + guid + "}",
                                                            // workflowParameters: "<Data>" +
                                                            // "<eTo>" + to + "</eTo>" +
                                                            // "<eCC>" + cc + "</eCC>" +
                                                            // "<eFrom>" + cc + "</eFrom>" +
                                                            // "<eSubject>" + subject + "</eSubject>" +
                                                            // "<eBody>" + msg + "</eBody>" +
                                                            // "</Data>",
                                                            // completefunc: function () {
                                                                // mailView.dialog.hide();
                                                                // updateEmailSent = true;
                                                                // complete();
                                                            // }
                                                        // });
                                                    }
                                                }
                                            });
                                        }
                                    });
									
									function convertToPlain(rtf) {
									rtf = rtf.replace(/\\par[d]?/g, "");
									return rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
									}
									
									function sendToQueue() {
										
										var plainTextMsg = convertToPlain(msg);
										logHelper.logDebug("controller-summary","updated-dates workflow plainTextMsg: " + plainTextMsg,overrideDebugForFile);
																	
                                        if (poEmailSent || true) {
										
											 $().SPServices({
                                                                    operation: "UpdateListItems",
                                                                    async: false,
                                                                    batchCmd: "New",
                                                                    listName: "Workflow Queue",
                                                                    valuepairs: [["Title", 'Notify All of Updated Install/Delivery Dates'],
																	["StoreNumber", store.StoreNumber],
																	["Item","updated-dates.html"],																	
																	["EmailFrom",from],
																	["EmailTo",to],
																	["EmailCC",cc],
																	["EmailSubject", subject],
																	["EmailBody", plainTextMsg]],																	
                                                                    completefunc: function (xData, Status) {																																			
                                                                        mailView.dialog.hide();
																		updateEmailSent = true;
																		complete();
                                                                    },
																		error: function (data) {
																		   logHelper.logDebugError("controller-summary","updated-dates error: " + data,overrideDebugForFile);
                                                                       
																		}
                                                                });
                                            //Notify that we're still sending the date update email
                                            $('<div>Sending date update email to workflow queue...</div>').modal({
                                                escapeClose: false,
                                                clickClose: false,
                                                showClose: false
                                            });
                                            setTimeout(function () {
                                                $.modal.close();
                                            }, 1500);
                                        } 
                                    }

                                    //Track Completion of email
                                    function complete() {
                                        if (updateEmailSent && poEmailSent) {
                                            //Notify that we're still sending the date update email
                                            $('<div>We did It!  Have a nice Day :-)</div>').modal({
                                                escapeClose: false,
                                                clickClose: false,
                                                showClose: false
                                            });
                                            setTimeout(function () {
                                                $.modal.close();
                                            }, 1500);
                                        } else if (poEmailSent && updateEmailSent === false) {											
												
                                            //Notify that we're still sending the date update email
                                            $('<div>Still sending date update email...</div>').modal({
                                                escapeClose: false,
                                                clickClose: false,
                                                showClose: false
                                            });
											setTimeout(function () {
                                                $.modal.close();
                                            }, 1500);
                                        }
                                    }
                                });
                            }
                        });
                    });
					
					
					
                    break;
                case 'updated-dates-workflow':
                    console.log("Inside updated-dates-workflow:");
                        triggerWorkflow(store.StoreNumber,"NotifyDateChange",false,null);
                    break;
                case 'sonic-radio-order':
                    require(['app/view/workflow/email', 'dojo/text!app/view/workflow/sonic-radio-order.html', 'app/widget/widgetHelper','app/brands/services/brandServices','app/brands/services/logHelper'], function (form, template, widgetHelper,brandServices,logHelper) {
                        //Get the emails from distributionList
						var emailDistributionDetails =  brandServices.getEmailDistributionDetails('Workflow','sonic-radio-order');
						
						var email = emailDistributionDetails[0].emailTo,
						from = emailDistributionDetails[0].emailFrom,
						cc = emailDistributionDetails[0].emailCC,
						template = $(template);
						//Create list to email to based on parameters
                        // var email = 'dmorris@pamdist.com;  purchasing@pamdist.com; accounting@pamdist.com; JSaunders@pamdist.com; ',
                          // cc = 'nsti@sonicdrivein.com; ';
                        // template = $(template);
                        //Edit template fields for the PM signature:
                        template.find('#pm').html(store.ProjectManager);
                        if (store.ProjectManager.toUpperCase().indexOf('JASON') !== -1) {
                            template.find('#phone').html('918.269.1657');
                            template.find('#email').html('Jason.Srader@sonicdrivein.com');
                        } else if (store.ProjectManager.toUpperCase().indexOf('LIZ') !== -1) {
                            template.find('#phone').html('405-641-2374');
                            template.find('#email').html('Elizabeth.Sannes@sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('KATIGAN') !== -1) {
                            template.find('#phone').html('405-919-6342');
                            template.find('#email').html('Russell.Katigan@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('BARRETT') !== -1) {
                            template.find('#phone').html('918.760.8023');
                            template.find('#email').html('Barrett.Seal@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('PAIGE') !== -1) {
                            template.find('#phone').html('918.760.8023');
                            template.find('#email').html('Paige.Bailey@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('DYLAN') !== -1) {
                            template.find('#phone').html('303-437-8623');
                            template.find('#email').html('Dylan.Gehlbach@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('REGINA') !== -1) {
                            template.find('#phone').html('405-201-1235');
                            template.find('#email').html('Regina.Pannell@Sonicdrivein.com');
                        }
                        else if (store.ProjectManager.toUpperCase().indexOf('BJ') !== -1) {
                            template.find('#phone').html('405-202-2965');
                            template.find('#email').html('BJ.Bryant@Sonicdrivein.com');
                        }


                        //Fix the outdoor speaker part number if they are white
                        if (store.SonicRadioOutdoorSpeakerColor.toUpperCase().indexOf('WHITE') !== -1) {
                            template.find('#SpeakerColorLetter').html('W');
                        }

                        //Update the speaker quantities as pairs - note, leaving in case we switch back - they are breaking pairs of speakers for us
                        // var outdoorSpeakers =  (store.SonicRadioOutdoorSpeakerCount !== '' ? parseInt(store.SonicRadioOutdoorSpeakerCount.replace(/[^0-9]+/g, '')) : 0),
                        //     ceilingSpeakers = (store.SonicRadioCeilingSpeakerCount !== '' ? parseInt(store.SonicRadioCeilingSpeakerCount.replace(/[^0-9]+/g, '')) : 0);
                        // template.find('#SonicRadioOutdoorSpeakerCount').html(outdoorSpeakers/2);
                        // template.find('#SonicRadioCeilingSpeakerCount').html(ceilingSpeakers/2);

                        //Insert the dates/quantities
                        widgetHelper.activate(template, store);


                        //Fix all the borders & Padding
                        template.find('#quote-info td').css({
                            'border-top': '1px solid black',
                            'border-bottom': '1px solid black',
                            'padding-right': '20px'
                        });


                        //Show the quote
                        form.render({
                            subject: store.City + ', ' + store.State + ' #' + store.StoreNumber + ' - Sonic Radio Order',
                            to: email,
                            cc: cc,
                            body: template.html(),
                            button: 'Send Order',
                            title: 'Sonic Radio Order',
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
                                    var to = mailView.to.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var cc = mailView.cc.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.CombinedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "Email") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
                                                        //Fire the workflow on the construction list
														sendToQueue();
                                                        // $().SPServices({
                                                            // operation: "StartWorkflow",
                                                            // item: store.CombinedAbsoluteUrl,
                                                            // templateId: "{" + guid + "}",
                                                            // workflowParameters: "<Data>" +
                                                            // "<eTo>" + to + "</eTo>" +
                                                            // "<eCC>" + cc + "</eCC>" +
                                                            // "<eFrom>" + cc + "</eFrom>" +
                                                            // "<eSubject>" + subject + "</eSubject>" +
                                                            // "<eBody>" + msg + "</eBody>" +
                                                            // "</Data>",
                                                            // completefunc: function () {
                                                                // //Update the status to requested today
                                                                // var newStatus = 'Requested ' + moment().format('M/D');
                                                                // construction.changeValue('SonicRadioStatus', newStatus, store, function () {
                                                                    // store.SonicRadioStatus = newStatus;
                                                                    // $('input[data-editable="SonicRadioStatus"]').val(newStatus);

                                                                    // //Rerun the business rules to update the view
                                                                    // constructionRules.helper(view.el, store);

                                                                    // //Hide the view
                                                                    // mailView.dialog.hide();
                                                                // });
                                                            // }
                                                        // });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
						
									function convertToPlain(rtf) {
									rtf = rtf.replace(/\\par[d]?/g, "");
									return rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
									}
									
									function sendToQueue() {
										
										var plainTextMsg = convertToPlain(msg);
										
										
											 $().SPServices({
                                                                    operation: "UpdateListItems",
                                                                    async: false,
                                                                    batchCmd: "New",
                                                                    listName: "Workflow Queue",
                                                                    valuepairs: [["Title", 'Notify All of Updated Install/Delivery Dates'],
																	["StoreNumber", store.StoreNumber],
																	["Item","updated-dates.html"],																	
																	["EmailFrom",from],
																	["EmailTo",to],
																	["EmailCC",cc],
																	["EmailSubject", subject],
																	["EmailBody", plainTextMsg]],																	
                                                                      completefunc: function () {
                                                                 //Update the status to requested today
                                                                 var newStatus = 'Requested ' + moment().format('M/D');
                                                                 construction.changeValue('SonicRadioStatus', newStatus, store, function () {
                                                                     store.SonicRadioStatus = newStatus;
                                                                     $('input[data-editable="SonicRadioStatus"]').val(newStatus);

                                                                     //Rerun the business rules to update the view
                                                                     constructionRules.helper(view.el, store);

                                                                     //Hide the view
                                                                     mailView.dialog.hide();
                                                                 });
                                                             },
																		error: function (data) {
																		   logHelper.logDebugError("controller-summary","updated-dates error: " + data,overrideDebugForFile);
                                                                       
																		}
                                                                });
                                            //Notify that we're still sending the date update email
                                            $('<div>Sending date update email to workflow queue...</div>').modal({
                                                escapeClose: false,
                                                clickClose: false,
                                                showClose: false
                                            });
                                    }
                    });
                    break;
                    case 'sonic-radio-order-workflow':
                        console.log("Inside sonic-radio-order-workflow:");
                        triggerWorkflow(store.StoreNumber,"SonicRadio",false, null);
                    break;
                case 'micros-audio-quote-request':
                    //Check to see if the address is correct
                    require(['app/view/workflow/micros-audio-request'], function (quote) {
                        //Show the input form
                        var modal = quote.renderModal({
                            store: store
                        });

                        //Confirm it's a number and enable the yes button if so
                        function confirmOrderTakers() {
                            var val = parseInt(modal.OrderTakers.val());
                            if (typeof val === 'number' && isFinite(val) && Math.floor(val) === val && val > 0) {
                                store.MicrosAudioOrderTakers = val;
                                modal.Yes.attr('disabled', false);
                            }
                        }

                        modal.OrderTakers
                          .on('change', confirmOrderTakers)
                          .on('keyup', confirmOrderTakers);

                        modal.Yes.click(function (e) {
                            //Recalculate total stalls
                            store.PatioCount = (store.PatioCount === "" ? "0" : store.PatioCount);
                            store.StallCount = (store.StallCount === "" ? "0" : store.StallCount);
                            store.TotalStalls = (store.StallCount !== "" ? parseInt(store.StallCount) : 0) + (store.PatioCount !== "" ? parseInt(store.PatioCount) : 0);

                            //Calculate numeric dt lanes
                            if (store.DriveThruFormat.toUpperCase().indexOf('SINGLE') !== -1) {
                                store.MicrosAudioDriveThruLanes = 1;
                            } else if (store.DriveThruFormat.toUpperCase().indexOf('DOUBLE') !== -1) {
                                store.MicrosAudioDriveThruLanes = 2;
                            } else {
                                store.MicrosAudioDriveThruLanes = 0;
                            }

                            //Recalculate endpoints in case it changed
                            store.AudioEndpointCount = store.TotalStalls + store.MicrosAudioDriveThruLanes;

                            //Calculate number of headsets
                            store.MicrosAudioWirelessHeadsets = store.MicrosAudioOrderTakers * 2;

                            //Calculate number of USB hubs
                            store.MicrosAudioUsbHubs = Math.ceil(store.MicrosAudioWirelessHeadsets / 4);

                            //Calculate number of POE injectors
                            if (store.TotalStalls == 0) {
                                store.MicrosAudioPoeInjectors = store.MicrosAudioDriveThruLanes;
                                store.MicrosAudioSixteenPortInternalSwitches = 0;
                                store.MicrosAudioEightPortInternalSwitches = 0;
                                store.MicrosAudioEightPortExternalSwitches = 0;
                            } else if (store.AudioConfiguration.toUpperCase().indexOf('STALL SWITCHES') === -1) {
                                //Internal switch calculations - check to see if we would have more than one open port on an 8 port switch (one is used for the uplink so actually 2) - also include anything in the 7-16 stall range!
                                if ((store.AudioEndpointCount > 7 && store.AudioEndpointCount <= 16) || store.AudioEndpointCount % 16 <= 6) {
                                    //Assume all 16 port switches if there would be less than two open ports in an 8 port switch
                                    store.MicrosAudioSixteenPortInternalSwitches = Math.ceil(store.AudioEndpointCount / 16);
                                    store.MicrosAudioEightPortInternalSwitches = 0;
                                } else {
                                    //If there will be 1 or more open port on the 8 port switch, use just one
                                    store.MicrosAudioSixteenPortInternalSwitches = Math.floor(store.AudioEndpointCount / 16);
                                    store.MicrosAudioEightPortInternalSwitches = 1;
                                }

                                //Set external to 0 since we aren't using them
                                store.MicrosAudioEightPortExternalSwitches = 0;
                                store.MicrosAudioPoeInjectors = 0;
                            } else {
                                //External switch calculations (outdoor switches have a separate uplink port
                                store.MicrosAudioEightPortExternalSwitches = Math.ceil(store.AudioEndpointCount / 8);

                                //Internal Switches set to zero
                                store.MicrosAudioSixteenPortInternalSwitches = 0;
                                store.MicrosAudioEightPortInternalSwitches = 0;
                                store.MicrosAudioPoeInjectors = 0;
                            }

                            //Create list to email to based on parameters
                            var options = {
                                to: 'vicky.cromley@oracle.com;Carol.crory@oracle.com;Blake.webb@oracle.com;erin.mckay@oracle.com;aaron.glosser@oracle.com;crussell@inspirebrands.com;lwilliams@inspirebrands.com;mtucker@inspirebrands.com;Hannah.sales@oracle.com; ',
                                cc: 'NSTI@sonicdrivein.com;     ',
                                store: store
                            };


                            if (store.ProjectManager.toUpperCase().indexOf('JASON') !== -1) {
                                options.pm = {
                                    phone: '918.269.1657',
                                    email: 'Jason.Srader@sonicdrivein.com'
                                };
                            } else if (store.ProjectManager.toUpperCase().indexOf('LIZ') !== -1) {
                                options.pm = {
                                    phone: '405-641-2374',
                                    email: 'Elizabeth.Sannes@sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('KATIGAN') !== -1) {
                                options.pm = {
                                    phone: '405-919-6342',
                                    email: 'Russell.Katigan@Sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('BARRETT') !== -1) {
                                options.pm = {
                                    phone: '918.760.8023',
                                    email: 'Barrett.Seal@Sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('PAIGE') !== -1) {
                                options.pm = {
                                    phone: '918.760.8023',
                                    email: 'Paige.Bailey@Sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('DYLAN') !== -1) {
                                options.pm = {
                                    phone: '303-437-8623',
                                    email: 'Dylan.Gehlbach@Sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('REGINA') !== -1) {
                                options.pm = {
                                    phone: '405-201-1235',
                                    email: 'Regina.Pannell@Sonicdrivein.com'
                                };
                            }
                            else if (store.ProjectManager.toUpperCase().indexOf('BJ') !== -1) {
                                options.pm = {
                                    phone: '405-202-2965',
                                    email: 'BJ.Bryant@Sonicdrivein.com'
                                };
                            }

                            //Callback after form is rendered
                            options.callback = function (mailView) {
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
                                    var to = mailView.to.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var cc = mailView.cc.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.CombinedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "Email") {
                                                    var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                    if (guid != null) {
                                                        //Fire the workflow on the construction list
                                                        $().SPServices({
                                                            operation: "StartWorkflow",
                                                            item: store.CombinedAbsoluteUrl,
                                                            templateId: "{" + guid + "}",
                                                            workflowParameters: "<Data>" +
                                                            "<eTo>" + to + "</eTo>" +
                                                            "<eCC>" + cc + "</eCC>" +
                                                            "<eFrom>" + cc + "</eFrom>" +
                                                            "<eSubject>" + subject + "</eSubject>" +
                                                            "<eBody>" + msg + "</eBody>" +
                                                            "</Data>",
                                                            completefunc: function () {
                                                                //Update the Status
                                                                var status = 'Requested ' + moment().format('M/D');
                                                                combined.changeValue('AudioStatus', status, store.CombinedId, function () {
                                                                    $('div[data-editable="AudioStatus"] div[contenteditable="true"]').html(status);
                                                                    //Rerun the business rules on change to update the view
                                                                    constructionRules.helper(view.el, store);

                                                                    //Hide the view
                                                                    mailView.dialog.hide();
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                });
                            };

                            //Show the upload form
                            var email = quote.render(options);

                            //Hide the modal
                            $.modal.close();
                        });


                        modal.No.click(function (e) {
                            //Hide the modal
                            $.modal.close();
                        });
                    });
                    break;
                case 'servereps-setup':
                    require(['app/view/workflow/servereps-setup'], function (quote) {
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

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    $().SPServices({
                                        operation: "GetTemplatesForItem",
                                        item: store.EncodedAbsoluteUrl,
                                        async: true,
                                        completefunc: function (xData, Status) {
                                            $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                if ($(this).attr("Name") == "ServerEPS Setup Request") {
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
                                                                $('div[data-editable="ServerEps"] div[contenteditable="true"]').html(status);
                                                                //Rerun the business rules on change to update the view
                                                                constructionRules.helper(view.el, store);
                                                                //Hide the view
                                                                mailView.dialog.hide();
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
                case 'servereps-setup-workflow':
                    console.log("Inside servereps-setup-workflow:");
                    triggerWorkflow(store.StoreNumber,"ServerEPSSetup",false, null);
                    break;       
                case 'fabcon-id-tech-create-purchase-order':
                    require(['app/store/products', 'app/store/purchaseOrders', 'app/store/purchaseOrderItems', 'app/view/workflow/fabcon-create-purchase-order'], function (productStore, purchaseOrderStore, purchaseOrderItemStore, quote) {
                        
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
                                    BillingAddress: store.Address,
                                    BillingPhone: store.PrimaryPhone,
                                    BillingEmail: store.PrimaryEmail,
                                    BillingZip: store.Zip,
                                    BillingCity: store.City,
                                    BillingState: store.State,
                                    ShippingName: store.PrimaryContact,
                                    ShippingAddress: store.Address,
                                    ShippingZip: store.Zip,
                                    ShippingCity: store.City,
                                    ShippingState: store.State,
                                    DeliveryDate: store.PopsDeliveryDate,
                                    PoType: 'FabCon'
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

                                        if (store.PaysType === 'VP6800') {
                                            if (product.PartNumber === 'FC-65060D X' || product.PartNumber === 'FC-6506 X2' || product.PartNumber === 'FC-6548')
                                                return;

                                        }

                                        if ((product.Vendor.toUpperCase().indexOf('FABCON') !== -1 || product.Vendor.toUpperCase().indexOf('ID TECH') !== -1) && product.PartNumber.indexOf('FC-6632P-300') === -1) {
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
                                            location.hash = '#fabcon-id-tech-purchase-order/' + po.PurchaseOrderId;
                                        }
                                    }
                                });
                            });
                        }

                    });
                    break;
                case 'fabcon-create-purchase-order':
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
                        //                if (document.FileName.indexOf('FabCon Credit Packet.') !== -1) {
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
                        //                combined.uploadDocument(store, b64, store.StoreNumber + ' - FabCon Credit Packet.' + extension, function () {
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

                        function showStatusForm ()
                        {

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
                                    DeliveryDate: store.PopsDeliveryDate,
                                    PoType: 'FabCon'
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

                                        if (store.PaysType === 'VP6800')
                                        {
                                            if (product.PartNumber === 'FC-65060D X' || product.PartNumber === 'FC-6506 X2' || product.PartNumber === 'FC-6548')
                                                return;
                                            
                                        }
                                        
                                        if (product.Vendor.toUpperCase().indexOf('FABCON') !== -1 && product.PartNumber.indexOf('FC-6632P-300') === -1) {
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
                                            location.hash = '#purchase-order/' + po.PurchaseOrderId;
                                        }
                                    }
                                });
                            });
                        }

                    });
                    break;
                    case 'fabcon-create-purchase-order-workflow':
                        console.log("Inside fabcon-create-purchase-order-workflow:");
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
                        //                if (document.FileName.indexOf('FabCon Credit Packet.') !== -1) {
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
                        //                combined.uploadDocument(store, b64, store.StoreNumber + ' - FabCon Credit Packet.' + extension, function () {
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
                                PoType: 'FabCon - DT POPS'
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
                                                    console.log("ADDED - fabcon-dtpops-create-purchase-order: " + product.Description);
                                            } catch (e) {
                                                quantity = 0;
                                                if (window.console)
                                                    console.log("NOT ADDED - fabcon-dtpops-create-purchase-order: " + product.Description);
                                            }

                                            if (window.console)
                                                console.log("QTY fabcon-dtpops-create-purchase-order: " + product.Description + " QTY:" + quantity);
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
                case 'promotion-order':

                    require(['app/view/workflow/promotion-order-request'], function (quote) {
                        promotionOrderDisplaySize = 55;
                        var warning = quote.renderAddressWarning({ store: store });

                        warning.Yes.click(function (e) {
                            $.modal.close();
                            promotionOrderDisplaySize = 49;
                            promotionOrderDisplay();
                        });
                        warning.No.click(function (e) {
                            $.modal.close();
                            promotionOrderDisplaySize = 55;
                            promotionOrderDisplay();
                        });

                    });

                    function promotionOrderDisplay() {

                        require(['app/view/workflow/promotion-order'], function (quote) {
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

                                        //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                        $().SPServices({
                                            operation: "GetTemplatesForItem",
                                            item: store.EncodedAbsoluteUrl,
                                            async: true,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                    if ($(this).attr("Name") == "ProMotion Order") {
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
                                                                    //Update the Status & DMB Content Status
                                                                    var status = 'Requested ' + moment().format('M/D');
                                                                    $('div[data-editable="DmbTvStatus"] div[contenteditable="true"]').html(status);
                                                                    $('div[data-editable="DmbContentCreated"] div[contenteditable="true"]').html(status);
                                                                    //Rerun the business rules on change to update the view
                                                                    constructionRules.helper(view.el, store);
                                                                    //Hide the view
                                                                    mailView.dialog.hide();
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
                    }

                    break;
                    case 'promotion-order-workflow':
                        console.log("Inside promotion-order-workflow:");
                        triggerWorkflow(store.StoreNumber,"ProMotion",false, null);
                    break; 
                case 'hughes-request':
                    //Check to see if the address is correct
                    require(['app/view/workflow/hughes-request'], function (quote) {
                        //Show address warning
                        var warning = quote.renderAddressWarning({ store: store });
                        warning.Yes.click(function (e) {
                           
                            //Show the upload form
                            var upload = quote.renderFileUpload({ store: store });

                            //Start file upload if changed to a file/user selects file
                            upload.Upload.change(function (e) {
                                if (this.files.length > 0) {
                                    //Disable the button
                                    upload.UploadLabel.attr('disabled', true);
                                    upload.UploadLabel.html('Uploading...');
                                    //First make sure there aren't pre-existing uploaded files
                                    combined.getDocuments(store, function (store) {
                                        var exists = false;
                                        _.each(store.CombinedDocuments, function (document, i) {
                                            if (document.FileName.indexOf('HUGHES-') !== -1 || document.FileName.indexOf('HAN Agreement.xlsx') !== -1) {
                                                exists = true;
                                                //Delete the file before uploading a new one
                                                combined.deleteDocument(store.CombinedId, document.FilePath, uploadFile);
                                            }
                                        });

                                        if (!exists) {
                                            uploadFile();
                                        }
                                    });

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
                                            combined.uploadDocument(store, b64, 'HUGHES-' + file.name, function () {
                                                //Go to the normal view
                                                showStatusForm();
                                                upload.UploadButton.attr('disabled', true);
                                                upload.SendWithout.attr('disabled', true);
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

                            //Send Without
                            upload.SendWithout.click(function (e) {
                                //Show the normal email form
                                showStatusForm();
                                upload.UploadButton.attr('disabled', true);
                                upload.SendWithout.attr('disabled', true);
                            });


                        });

                        warning.No.click(function (e) {
                            //Hide the modal
                            $.modal.close();
                        });

                        var updateStatus = {
                            Vsat: false,
                            Temp: false,
                            Primary: false,
                            Deinstall: false
                        };

                        function showStatusForm() {
                            //Create new statuses as requested if current status isn't "Not Required"
                            var today = moment().format('M/D');

                            store.NewHughesPrimaryStatus = 'Requested' + today;
                            if (store.HughesVsatStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesVsatRequestStatus = 'Initiate Order';
                                store.NewHughesVsatStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesVsatRequestStatus = store.HughesVsatStatus;
                                store.NewHughesVsatStatus = store.HughesVsatStatus;
                            }

                            if (store.HughesTempStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesTempRequestStatus = 'Initiate Order';
                                store.NewHughesTempStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesTempRequestStatus = store.HughesTempStatus;
                                store.NewHughesTempStatus = store.HughesTempStatus;
                            }

                            if (store.HughesPrimaryStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesPrimaryRequestStatus = 'Initiate Prequal';
                                store.NewHughesPrimaryStatus = 'Prequal Requested ' + today;
                            }
                            else {
                                store.NewHughesPrimaryRequestStatus = store.HughesPrimaryStatus;
                                store.NewHughesPrimaryStatus = store.HughesPrimaryStatus;
                            }

                            if (store.HughesDeinstallStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesDeinstallRequestStatus = 'Initiate Order';
                                store.NewHughesDeinstallStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesDeinstallRequestStatus = store.HughesDeinstallStatus;
                                store.NewHughesDeinstallStatus = store.HughesDeinstallStatus;
                            }

                            //Render the view
                            var statusCheck = quote.renderStatusCheck({ store: store });

                            //Click handler
                            statusCheck.Next.on('click', function (e) {
                                //Check each checkbox
                                updateStatus.Vsat = statusCheck.UpdateVsat.is(':checked');
                                updateStatus.Temp = statusCheck.UpdateTemp.is(':checked');
                                updateStatus.Primary = statusCheck.UpdatePrimary.is(':checked');
                                updateStatus.Deinstall = statusCheck.UpdateDeinstall.is(':checked');

                                //Update to request status if checked
                                if (updateStatus.Vsat) store.HughesVsatStatus = store.NewHughesVsatRequestStatus;
                                if (updateStatus.Temp) store.HughesTempStatus = store.NewHughesTempRequestStatus;
                                if (updateStatus.Primary) store.HughesPrimaryStatus = store.NewHughesPrimaryRequestStatus;
                                if (updateStatus.Primary && store.HughesPrimaryDateType === '') store.HughesPrimaryDateType = 'As Available';
                                if (updateStatus.Deinstall) store.HughesDeinstallStatus = store.NewHughesDeinstallRequestStatus;

                                showEmailForm();
                            });
                        }

                        function showEmailForm() {
                            //Create list to email to based on parameters
                            var options = {
                                to: 'Daniel_smith2@comcast.com; randy_gersten@comcast.com; ',
                                cc: 'NSTI@sonicdrivein.com; ',
                                store: store,
                                updateStatus: updateStatus
                            };

                            if (store.ProjectManager.toUpperCase().indexOf('JASON') !== -1) {
                                options.pm = {
                                    phone: '918.269.1657',
                                    email: 'Jason.Srader@sonicdrivein.com'
                                };
                            } else if (store.ProjectManager.toUpperCase().indexOf('LIZ') !== -1) {
                                options.pm = {
                                    phone: '405-641-2374',
                                    email: 'Elizabeth.Sannes@sonicdrivein.com'
                                };
                            } else if (store.ProjectManager.toUpperCase().indexOf('KATIGAN') !== -1) {
                                options.pm = {
                                    phone: '405-919-6342',
                                    email: 'Russell.Katigan@Sonicdrivein.com'
                                };
                            }

                            else if (store.ProjectManager.toUpperCase().indexOf('BARRETT') !== -1) {
                                options.pm = {
                                    phone: '918.760.8023',
                                    email: 'Barrett.Seal@Sonicdrivein.com'
                                };
                            }

                            else if (store.ProjectManager.toUpperCase().indexOf('PAIGE') !== -1) {
                                options.pm = {
                                    phone: '918.760.8023',
                                    email: 'Paige.Bailey@Sonicdrivein.com'
                                };
                            }

                            else if (store.ProjectManager.toUpperCase().indexOf('DYLAN') !== -1) {
                                options.pm = {
                                    phone: '303-437-8623',
                                    email: 'Dylan.Gehlbach@Sonicdrivein.com'
                                };
                            }

                            else if (store.ProjectManager.toUpperCase().indexOf('REGINA') !== -1) {
                                options.pm = {
                                    phone: '405-201-1235',
                                    email: 'Regina.Pannell@Sonicdrivein.com'
                                };
                            }

                            else if (store.ProjectManager.toUpperCase().indexOf('BJ') !== -1) {
                                options.pm = {
                                    phone: '405-202-2965',
                                    email: 'BJ.Bryant@Sonicdrivein.com'
                                };
                            }

                            //Callback after form is rendered
                            options.callback = function (mailView) {
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
                                    var to = mailView.to.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");
                                    var cc = mailView.cc.getValue()
                                      .replace(/&/g, '&amp;')
                                      .replace(/</g, '&lt;')
                                      .replace(/>/g, '&gt;')
                                      .replace(/"/g, '&quot;')
                                      .replace(/'/g, '&apos;')
                                      .replace(/(\r\n|\n|\r)/gm, "");

                                    //Find the template id - this is a long story but a problem with the template id changing everytime a workflow is updated
                                    //First if there's an attachment
                                    if (mailView.attachment) {
                                        var filename = mailView.attachment.FileName
                                          .replace(/&/g, '&amp;')
                                          .replace(/</g, '&lt;')
                                          .replace(/>/g, '&gt;')
                                          .replace(/"/g, '&quot;')
                                          .replace(/'/g, '&apos;')
                                          .replace(/(\r\n|\n|\r)/gm, "");
                                        var url = encodeURI(mailView.attachment.FilePath)
                                          .replace(/&/g, '&amp;')
                                          .replace(/</g, '&lt;')
                                          .replace(/>/g, '&gt;')
                                          .replace(/"/g, '&quot;')
                                          .replace(/'/g, '&apos;')
                                          .replace(/(\r\n|\n|\r)/gm, "");

                                        $().SPServices({
                                            operation: "GetTemplatesForItem",
                                            item: store.CombinedAbsoluteUrl,
                                            async: true,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                    if ($(this).attr("Name") == "Hughes Order") {
                                                        var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                        if (guid != null) {
                                                            //Fire the workflow on the construction list
                                                            $().SPServices({
                                                                operation: "StartWorkflow",
                                                                item: store.CombinedAbsoluteUrl,
                                                                templateId: "{" + guid + "}",
                                                                workflowParameters: "<Data>" +
                                                                "<eTo>" + to + "</eTo>" +
                                                                "<eCC>" + cc + "</eCC>" +
                                                                "<eFrom>spadmin@Sonicdrivein.com</eFrom>" +
                                                                "<eSubject>" + subject + "</eSubject>" +
                                                                "<eBody>" + msg + "</eBody>" +
                                                                "<eFilename>" + filename + "</eFilename>" +
                                                                "<eFileURL>" + url + "</eFileURL>" +
                                                                "</Data>",
                                                                completefunc: afterWorkflow
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    } else {//Then if there's not an attachment
                                        $().SPServices({
                                            operation: "GetTemplatesForItem",
                                            item: store.CombinedAbsoluteUrl,
                                            async: true,
                                            completefunc: function (xData, Status) {
                                                $(xData.responseXML).find("WorkflowTemplates > WorkflowTemplate").each(function (i, e) {
                                                    if ($(this).attr("Name") == "Email") {
                                                        var guid = $(this).find("WorkflowTemplateIdSet").attr("TemplateId");
                                                        if (guid != null) {
                                                            //Fire the workflow on the construction list
                                                            $().SPServices({
                                                                operation: "StartWorkflow",
                                                                item: store.CombinedAbsoluteUrl,
                                                                templateId: "{" + guid + "}",
                                                                workflowParameters: "<Data>" +
                                                                "<eTo>" + to + "</eTo>" +
                                                                "<eCC>" + cc + "</eCC>" +
                                                                "<eFrom>" + cc + "</eFrom>" +
                                                                "<eSubject>" + subject + "</eSubject>" +
                                                                "<eBody>" + msg + "</eBody>" +
                                                                "</Data>",
                                                                completefunc: afterWorkflow
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }

                                    function afterWorkflow() {
                                        //Update to new status if checked , update in summary, store, and save
                                        var requests = [];
                                        if (updateStatus.Vsat) {
                                            requests.push(function () {
                                                combined.changeValue('HughesVsatStatus', store.NewHughesVsatStatus, store.CombinedId, function () {
                                                    store.HughesVsatStatus = store.NewHughesVsatStatus;
                                                    $('input[data-editable="HughesVsatStatus"]').val(store.HughesVsatStatus);

                                                    complete();
                                                });
                                            });
                                        }
                                        if (updateStatus.Temp) {
                                            requests.push(function () {
                                                combined.changeValue('HughesTempStatus', store.NewHughesTempStatus, store.CombinedId, function () {
                                                    store.HughesTempStatus = store.NewHughesTempStatus;
                                                    $('input[data-editable="HughesTempStatus"]').val(store.HughesTempStatus);

                                                    complete();
                                                });
                                            });
                                        }
                                        if (updateStatus.Primary) {
                                            requests.push(function () {
                                                combined.changeValue('HughesPrimaryStatus', store.NewHughesPrimaryStatus, store.CombinedId, function () {
                                                    store.HughesPrimaryStatus = store.NewHughesPrimaryStatus;
                                                    $('input[data-editable="HughesPrimaryStatus"]').val(store.HughesPrimaryStatus);

                                                    complete();
                                                });
                                            });
                                        }
                                        if (updateStatus.Primary && store.HughesPrimaryDateType === '') {
                                            requests.push(function () {
                                                combined.changeValue('HughesPrimaryDateType', 'As Available', store.CombinedId, function () {
                                                    store.HughesPrimaryDateType = 'As Available';
                                                    $('input[data-editable="HughesPrimaryDateType"]').val(store.HughesPrimaryDateType);

                                                    complete();
                                                });
                                            });
                                        }
                                        if (updateStatus.Deinstall) {
                                            requests.push(function () {
                                                combined.changeValue('HughesDeinstallStatus', store.NewHughesDeinstallStatus, store.CombinedId, function () {
                                                    store.HughesDeinstallStatus = store.NewHughesDeinstallStatus;
                                                    $('input[data-editable="HughesDeinstallStatus"]').val(store.HughesDeinstallStatus);

                                                    complete();
                                                });
                                            });
                                        }

                                        function complete() {
                                            //Hide the mail view and re-run business rules if everything is done, otherwise call the next function
                                            //TODO - note - this is a hack because sharepoint won't update 4 values at once, seems to be a bug but this fixes it
                                            if (requests.length === 0) {
                                                //Rerun the business rules on change to update the view
                                                constructionRules.helper(view.el, store);

                                                //Hide the view
                                                mailView.dialog.hide();
                                            } else {
                                                //Call the next function in the list
                                                requests.shift()();
                                            }
                                        }

                                        //Call complete once in case there were no updates checked
                                        complete();
                                    }
                                });
                            };

                            //Load the combined documents (will update the store object with a new property)
                            combined.getDocuments(store, function () {
                                //Hide the modal
                                $.modal.close();
                                //Show the quote
                                quote.render(options);
                            });
                        }
                    });
                    break;
                case 'hughes-request-workflow':
                    //Check to see if the address is correct
                    require(['app/view/workflow/hughes-request'], function (quote) {
                        //Show address warning
                        var warning = quote.renderAddressWarning({ store: store });
                        warning.Yes.click(function (e) {
                            const modal = document.getElementById('#store-address');
                            if (modal) {
                                modal.style.display = 'none'; // Hide the modal
                            } 
                            // $('#store-address').style.display = 'none';//.close();
                            $.modal.close();
                            //Show the upload form
                            var upload = quote.renderFileUpload({ store: store });
                            var fileName = null;
                            var hasAttachment = false;
                            //Start file upload if changed to a file/user selects file
                            upload.Upload.change(function (e) {
                                if (this.files.length > 0) {
                                    //Disable the button
                                    upload.UploadLabel.attr('disabled', true);
                                    upload.UploadLabel.html('Uploading...');
                                    //First make sure there aren't pre-existing uploaded files
                                    combined.getDocuments(store, function (store) {
                                        var exists = false;
                                        _.each(store.CombinedDocuments, function (document, i) {
                                            if (document.FileName.indexOf('Comcast-') !== -1 || document.FileName.indexOf('HAN Agreement.xlsx') !== -1) {
                                                exists = true;
                                                //Delete the file before uploading a new one
                                                combined.deleteDocument(store.CombinedId, document.FilePath, uploadFile);
                                            }
                                        });

                                        if (!exists) {
                                            uploadFile();
                                        }
                                    });

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
                                            fileName = 'Comcast-' + file.name;
                                            hasAttachment = true;
                                            //Upload the base 64 file
                                            combined.uploadDocument(store, b64, fileName, function () {
                                                //Go to the normal view
                                                showStatusForm();
                                                upload.UploadButton.attr('disabled', true); //disable 'uploading...' button
                                                upload.SendWithout.attr('disabled', true); //disable 'Previously Uploaded/Send without HAN' button
                                            });
                                        };
                                        reader.onerror = function (error) {
                                            alert('Error Uploading File during base 64 conversion!')
                                        };
                                    }
                                } else {
                                    upload.UploadButton.attr('disabled', true); //disable 'Upload' button
                                }
                            });

                            //Previously Uploaded/Send without HAN button clicked
                            upload.SendWithout.click(function (e) {
                                //Show the normal email form
                                showStatusForm(hasAttachment,fileName);
                                upload.UploadButton.attr('disabled', true); //disable 'uploading...' button
                                upload.SendWithout.attr('disabled', true); //disable 'Previously Uploaded/Send without HAN' button
                            });


                        });

                        warning.No.click(function (e) {
                            //Hide the modal
                            $.modal.close();
                        });

                        var updateStatus = {
                            Vsat: false,
                            Temp: false,
                            Primary: false,
                            Deinstall: false
                        };

                        function showStatusForm(hasAttachment,fileName) {
                            //Create new statuses as requested if current status isn't "Not Required"
                            var today = moment().format('M/D');

                            store.NewHughesPrimaryStatus = 'Requested' + today;
                            if (store.HughesVsatStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesVsatRequestStatus = 'Initiate Order';
                                store.NewHughesVsatStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesVsatRequestStatus = store.HughesVsatStatus;
                                store.NewHughesVsatStatus = store.HughesVsatStatus;
                            }

                            if (store.HughesTempStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesTempRequestStatus = 'Initiate Order';
                                store.NewHughesTempStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesTempRequestStatus = store.HughesTempStatus;
                                store.NewHughesTempStatus = store.HughesTempStatus;
                            }

                            if (store.HughesPrimaryStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesPrimaryRequestStatus = 'Initiate Prequal';
                                store.NewHughesPrimaryStatus = 'Prequal Requested ' + today;
                            }
                            else {
                                store.NewHughesPrimaryRequestStatus = store.HughesPrimaryStatus;
                                store.NewHughesPrimaryStatus = store.HughesPrimaryStatus;
                            }

                            if (store.HughesDeinstallStatus.toUpperCase().indexOf('NOT REQUIRED') === -1) {
                                store.NewHughesDeinstallRequestStatus = 'Initiate Order';
                                store.NewHughesDeinstallStatus = 'Requested ' + today;
                            }
                            else {
                                store.NewHughesDeinstallRequestStatus = store.HughesDeinstallStatus;
                                store.NewHughesDeinstallStatus = store.HughesDeinstallStatus;
                            }

                            //Render the view
                            var statusCheck = quote.renderStatusCheck({ store: store });

                            //Click handler
                            statusCheck.Next.on('click', function (e) {
                                //Check each checkbox
                                updateStatus.Vsat = statusCheck.UpdateVsat.is(':checked');
                                updateStatus.Temp = statusCheck.UpdateTemp.is(':checked');
                                updateStatus.Primary = statusCheck.UpdatePrimary.is(':checked');
                                updateStatus.Deinstall = statusCheck.UpdateDeinstall.is(':checked');

                                //Update to request status if checked
                                if (updateStatus.Vsat) store.HughesVsatStatus = store.NewHughesVsatRequestStatus;
                                if (updateStatus.Temp) store.HughesTempStatus = store.NewHughesTempRequestStatus;
                                if (updateStatus.Primary) store.HughesPrimaryStatus = store.NewHughesPrimaryRequestStatus;
                                if (updateStatus.Primary && store.HughesPrimaryDateType === '') store.HughesPrimaryDateType = 'As Available';
                                if (updateStatus.Deinstall) store.HughesDeinstallStatus = store.NewHughesDeinstallRequestStatus;

                                submitEmailForm(hasAttachment,fileName);
                                afterWorkflow();
                            });
                        }

                        function submitEmailForm(hasAttachment,fileName) {

                            console.log("Inside loop-request-workflow:");
                            triggerWorkflow(store.StoreNumber,"ComcastRequest",hasAttachment,fileName);                       
                            


                        } 
                                
                        function afterWorkflow() {
                                //Update to new status if checked , update in summary, store, and save
                                var requests = [];
                                if (updateStatus.Vsat) {
                                    requests.push(function () {
                                        combined.changeValue('HughesVsatStatus', store.NewHughesVsatStatus, store.CombinedId, function () {
                                            store.HughesVsatStatus = store.NewHughesVsatStatus;
                                            $('input[data-editable="HughesVsatStatus"]').val(store.HughesVsatStatus);

                                            complete();
                                        });
                                    });
                                }
                                if (updateStatus.Temp) {
                                    requests.push(function () {
                                        combined.changeValue('HughesTempStatus', store.NewHughesTempStatus, store.CombinedId, function () {
                                            store.HughesTempStatus = store.NewHughesTempStatus;
                                            $('input[data-editable="HughesTempStatus"]').val(store.HughesTempStatus);

                                            complete();
                                        });
                                    });
                                }
                                if (updateStatus.Primary) {
                                    requests.push(function () {
                                        combined.changeValue('HughesPrimaryStatus', store.NewHughesPrimaryStatus, store.CombinedId, function () {
                                            store.HughesPrimaryStatus = store.NewHughesPrimaryStatus;
                                            $('input[data-editable="HughesPrimaryStatus"]').val(store.HughesPrimaryStatus);

                                            complete();
                                        });
                                    });
                                }
                                if (updateStatus.Primary && store.HughesPrimaryDateType === '') {
                                    requests.push(function () {
                                        combined.changeValue('HughesPrimaryDateType', 'As Available', store.CombinedId, function () {
                                            store.HughesPrimaryDateType = 'As Available';
                                            $('input[data-editable="HughesPrimaryDateType"]').val(store.HughesPrimaryDateType);

                                            complete();
                                        });
                                    });
                                }
                                if (updateStatus.Deinstall) {
                                    requests.push(function () {
                                        combined.changeValue('HughesDeinstallStatus', store.NewHughesDeinstallStatus, store.CombinedId, function () {
                                            store.HughesDeinstallStatus = store.NewHughesDeinstallStatus;
                                            $('input[data-editable="HughesDeinstallStatus"]').val(store.HughesDeinstallStatus);

                                            complete();
                                        });
                                    });
                                }

                                function complete() {
                                    //Hide the mail view and re-run business rules if everything is done, otherwise call the next function
                                    //TODO - note - this is a hack because sharepoint won't update 4 values at once, seems to be a bug but this fixes it
                                    if (requests.length === 0) {
                                        //Rerun the business rules on change to update the view
                                        constructionRules.helper(view.el, store);

                                        //Hide the view
                                        //mailView.dialog.hide();
                                    } else {
                                        //Call the next function in the list
                                        requests.shift()();
                                    }
                                }

                                //Call complete once in case there were no updates checked
                                complete();
                        
                            

                            //Load the combined documents (will update the store object with a new property)
                            combined.getDocuments(store, function () {
                                //Hide the modal
                                $.modal.close();
                                //Show the quote
                                location.reload();
                                //quote.render(options);
                            });
                        }
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
                    console.log(file + ", " + fileName + ", ");
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