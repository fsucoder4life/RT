define(['app/view/issues/issues', 'app/store/combined', 'app/store/construction', 'app/store/issues', 'app/store/notes', "dojo/hash"], function (issuesView, combined, construction, issueStore, noteStore, hash) {
    function afterRender (view) {
        view.button.on('click', function (e) {
            //Get all the values and build a hash
            var fragment = "issues/issueStatus/" + view.issueStatus.val() + '/orderBy/' + view.orderBy.val();

            if (view.liveStartDate.datepicker('getDate')) {
                fragment += "/liveStartDate/" + encodeURIComponent(moment(view.liveStartDate.datepicker('getDate')).toISOString());
            }
            if (view.liveEndDate.datepicker('getDate')) {
                fragment += "/liveEndDate/" + encodeURIComponent(moment(view.liveEndDate.datepicker('getDate')).toISOString());
            }
            if (view.projectManager.val() !== "") {
                fragment += "/projectManager/" + encodeURIComponent(view.projectManager.val());
            }
            hash(fragment);
        });
    }

    return {
        show: function (target, options, routeCheck) {
            //Load the stores and their issues
            var issueQuery = '';

            if (typeof options.issueStatus === 'undefined' || options.issueStatus === 'Open') {
                issueQuery = new CamlBuilder().Where().TextField('Status').EqualTo('Open').ToString();
                issueQuery = "<Query>" + issueQuery + "</Query>";
            } else if (options.issueStatus === 'Closed') {
                issueQuery = new CamlBuilder().Where().TextField('Status').EqualTo('Closed').ToString();
                issueQuery = "<Query>" + issueQuery + "</Query>";
            }//No query needed for "All" status, just send empty query

            issueStore.loadData({query: issueQuery}, function (issues) {
                //Build queries - two to get the store info, another to get the related notes
                var combinedQueryBlocks = [],
                    constructionQueryBlocks = [],
                    noteQueryBlocks = [];

                _.each(issues, function (issue) {
                    constructionQueryBlocks.push(CamlBuilder.Expression().TextField('Title').Contains(issue.StoreNumber));
                    combinedQueryBlocks.push(CamlBuilder.Expression().TextField('Title').Contains(issue.StoreNumber));
                    noteQueryBlocks.push(CamlBuilder.Expression().TextField('IssueId').EqualTo(issue.IssueId));
                });

                //Build Queries
                var combinedQuery = new CamlBuilder().Where().All(
                    CamlBuilder.Expression().Any.apply(CamlBuilder.Expression(), combinedQueryBlocks),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion')
                ).ToString();
                combinedQuery = "<Query>" + combinedQuery + "</Query>";

                var constructionQuery = new CamlBuilder().Where().All(
                    CamlBuilder.Expression().Any.apply(CamlBuilder.Expression(), constructionQueryBlocks),
                    CamlBuilder.Expression().Any(
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Relocation'),
                        CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Rebuild')
                    )
                ).ToString();
                constructionQuery = "<Query>" + constructionQuery + "</Query>";

                var notesQuery = new CamlBuilder().Where().All(
                    CamlBuilder.Expression().Any.apply(CamlBuilder.Expression(), noteQueryBlocks),
                    CamlBuilder.Expression().All(
                        CamlBuilder.Expression().TextField('IssueId').NotEqualTo(''),
                        CamlBuilder.Expression().TextField('IssueId').IsNotNull()
                    )
                ).ToString();
                notesQuery = "<Query>" + notesQuery + "</Query>";

                //Load Everything
                var stores = [],
                    combinedLoaded = false,
                    constructionLoaded = false,
                    notesLoaded = false,
                    notes;
                combined.loadData({query: combinedQuery}, function (data) {
                    combinedLoaded = true;
                    //todo - this is a hack because they come back as objects sometimes??
                    stores = stores.concat(_.isArray(data) ? data : _.values(data));
                    complete();
                });
                construction.loadData({combinedQuery: constructionQuery}, function (data) {
                    constructionLoaded = true;
                    //todo - this is a hack because they come back as objects sometimes??
                    stores = stores.concat(_.isArray(data) ? data : _.values(data));
                    complete();
                });
                noteStore.loadData({query: notesQuery}, function (data) {
                    notesLoaded = true;
                    notes = data;
                    complete();
                });

                //Merge it all together
                function complete() {
                    if (combinedLoaded && constructionLoaded && notesLoaded) {
                        //Go through each issue and attach to it's store
                        var storeIndex = _.indexBy(stores, 'StoreNumber');
                        _.each(issues, function (issue) {
                            //Make sure there is an issues array, add a notes array, and then add the issue to the store
                            storeIndex[issue.StoreNumber].Issues = storeIndex[issue.StoreNumber].Issues || [];
                            issue.Notes = [];
                            storeIndex[issue.StoreNumber].Issues.push(issue);
                            if (typeof storeIndex[issue.StoreNumber].MostSevereIssue === 'undefined' || issue.Severity[1] > storeIndex[issue.StoreNumber].MostSevereIssue[1]) {
                                storeIndex[issue.StoreNumber].MostSevereIssue = issue.Severity;
                            }
                        });

                        //Go through each note and attach it to it's issue
                        _.each(notes, function (note) {
                            _.find(storeIndex[note.StoreNumber].Issues, {IssueId: note.IssueId}).Notes.push(note);
                        });

                        //Sort by whatever was passed
                        stores = _.sortBy(stores, options.sortBy || 'InstallDate');

                        //Filter by the project manager name
                        var filtered = [];
                        if (typeof options.projectManager !== 'undefined') {
                            filtered = [];
                            _.each(stores, function (store, index) {
                                if (typeof store.ProjectManager !== 'undefined' && store.ProjectManager.indexOf(options.projectManager) !== -1) {
                                    filtered.push(store);
                                }
                            });
                            stores = filtered;
                        }

                        //Filter by the start date
                        if (typeof options.liveStartDate !== 'undefined') {
                            filtered = [];
                            _.each(stores, function (store, index) {
                                if (moment(store.GoLiveDate).diff(moment(options.liveStartDate)) >= 0) {
                                    filtered.push(store);
                                }
                            });
                            stores = filtered;
                        }
                        //Filter by the end date
                        if (typeof options.liveEndDate !== 'undefined') {
                            filtered = [];
                            _.each(stores, function (store, index) {
                                if (moment(store.GoLiveDate).diff(moment(options.liveEndDate)) <= 0) {
                                    filtered.push(store);
                                }
                            });
                            stores = filtered;
                        }


                        //Show the report
                        issuesView.render({
                            stores: stores,
                            target: target,
                            issueStatus: options.issueStatus,
                            orderBy: options.orderBy,
                            liveStartDate: options.liveStartDate,
                            liveEndDate: options.liveEndDate,
                            projectManager: options.projectManager,
                            routeCheck: routeCheck,
                            callback: afterRender
                        });
                    }
                }
            });
        }
    };
});