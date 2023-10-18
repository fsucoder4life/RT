define(['app/view/report', 'dojo/hash', "dojo/store/Memory", "dojo/data/ObjectStore", "dijit/form/Select"], function (report, hash, Memory, ObjectStore, Select) {
    //Used by the event handler and display functions to make sure another event hasn't occured
    var searchTimeoutId = null;

    var searchType;

    function bootstrap() {
        //Make sure the combo box is setup
        if (typeof searchType === "undefined") {
            searchType = new Select({
                style: 'display: inline-block; width: 125px; position: relative; top: -1px;',
                store: new ObjectStore({
                    objectStore: new Memory({
                        data: [
                          { label: "All", id: "All" },
                          { label: "Construction", id: "Construction" },
                          { label: "Conversion", id: "Conversion" }
                        ]
                    })
                }),
                value: (localStorage.getItem("SearchType") !== null ? localStorage['SearchType'] : 'All')
            }, 'search-type');
            searchType.startup();

            //Create a change event handler to store the type in local storage and re-search
            searchType.on('change', function () {
                localStorage['SearchType'] = searchType.get('value');
                //Set the hash value to initiate search and enable forward/back
                //TODO this is a hack!!! - probably need a re-route function on the router, or need to get the route check function public so I can call another search directly here
                var val = $('#search').val();
                if (val !== '') {
                    //Search for results
                    hash('');
                    setTimeout(function () {
                        hash('search/' + $('#search').val().replace(/ /gi, '+'));
                    }, 1);
                }
            });
        }

        //Show the search bar
        $('#search-container').show();

        //Make sure the event handler is working
        $('#search').keyup(function (evt) {
            //Ignore if blank and not on search
            if ($('#search').val() === "" && hash().substring(0, 6) === "search") {
                return;
            }

            //And ignore if it's the tab or shift key
            if (evt.keyCode == '9' || evt.keyCode == '16') {
                return;
            }

            //Clear timeout if exists
            if (searchTimeoutId !== null) {
                clearTimeout(searchTimeoutId);
            }

            //Set new timeout to search
            searchTimeoutId = setTimeout(function () {
                //Set the hash value to initiate search and enable forward/back
                var val = $('#search').val();
                if (val === '') {
                    //Show search box
                    hash('search');
                } else {
                    //Search for results
                    hash('search/' + $('#search').val().replace(/ /gi, '+'));
                }
            }, 350);
        });
    }

    var self = {
        data: {},
        bootstrap: bootstrap,

        show: function (target, routeCheck, options) {
            //Setup page
            bootstrap();

            //Set the width to desired
            $('#main').css('width', '1056px');

            //Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY'));

            //Set the title
            $('#sub-title').html('Store Search');
        },

        search: function (target, query, routeCheck) {
            //Setup page
            bootstrap();

            //Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY'));

            //Set the title
            $('#sub-title').html('Store Search');

            //Decode It
            query = decodeURIComponent(query);
            //Set the search value to the query if it's empty (fresh page load)
            var val = $('#search').val();
            if (val === '') {
                $('#search').val(query.replace(/\+/gi, ' '));
            }

            if (val.length === 4 && parseInt(val).toString().length === 4 && Number.isInteger(parseInt(val))) {
                hash('summary/' + val);
                return;
            }

            //Build an individual search block for each word
            var searchBlocks = [];
            _.each(query.split("+"), function (q, i) {

                //Add an OR block for all the query fields
                searchBlocks.push(
                  CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Franchise_x0020_Group').Contains(q),
                    CamlBuilder.Expression().TextField('Principal_x0020_Name').Contains(q),
                    CamlBuilder.Expression().TextField('Senior_x0020_Vice_x0020_Presiden').Contains(q),
                    CamlBuilder.Expression().TextField('Regional_x0020_Vice_x0020_Presid').Contains(q),
                    CamlBuilder.Expression().TextField('Title').Contains(q),
                    CamlBuilder.Expression().TextField('City').Contains(q),
                    CamlBuilder.Expression().TextField('State_x0020_').Contains(q),
                    CamlBuilder.Expression().TextField('POS_x0020_Selection').Contains(q),
                    CamlBuilder.Expression().TextField('Installation_x0020_Company').Contains(q)

                  )
                );
            });
            //ADD POC and GC to search

            //Build the rest of the query, only look at new, relo, rebuild
            var combinedBuilder = new CamlBuilder(),
              combinedQuery;
            if (searchType.get('value') === "Conversion") {
                combinedQuery = combinedBuilder.Where().All(
                  CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('POS Conversion'),
                  CamlBuilder.Expression().All.apply(CamlBuilder.Expression(), searchBlocks)
                ).ToString();
                combinedQuery = "<Query>" + combinedQuery + "</Query>";

                //<Query><Where><And><Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">POS Conversion</Value></Eq><Or><Contains><FieldRef Name="Franchise_x0020_Group" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Principal_x0020_Name" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Senior_x0020_Vice_x0020_Presiden" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Regional_x0020_Vice_x0020_Presid" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Title" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="City" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="State_x0020_" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="POS_x0020_Selection" /><Value Type="Text">test</Value></Contains><Contains><FieldRef Name="Installation_x0020_Company" /><Value Type="Text">test</Value></Contains></Or></Or></Or></Or></Or></Or></Or></Or></And></Where></Query>

            } else if (searchType.get('value') === "Construction") {
                combinedQuery = combinedBuilder.Where().All(
                  CamlBuilder.Expression().Any(
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('New'),
                    CamlBuilder.Expression().TextField('Project_x0020_Type').EqualTo('Remodel'),
                    CamlBuilder.Expression().TextField("Project_x0020_Type").EqualTo('Relocation'),
                    CamlBuilder.Expression().TextField("Project_x0020_Type").EqualTo('Rebuild')
                  ),
                  CamlBuilder.Expression().All.apply(CamlBuilder.Expression(), searchBlocks)
                ).ToString();
                combinedQuery = "<Query>" + combinedQuery + "</Query>";

                //<Query><Where><And><Or><Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">New</Value></Eq><Or><Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">Remodel</Value></Eq><Or><Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">Relocation</Value></Eq><Eq><FieldRef Name="Project_x0020_Type" /><Value Type="Text">Rebuild</Value></Eq></Or></Or></Or><Or><Contains><FieldRef Name="Franchise_x0020_Group" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Principal_x0020_Name" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Senior_x0020_Vice_x0020_Presiden" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Regional_x0020_Vice_x0020_Presid" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Title" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="City" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="State_x0020_" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="POS_x0020_Selection" /><Value Type="Text">test</Value></Contains><Contains><FieldRef Name="Installation_x0020_Company" /><Value Type="Text">test</Value></Contains></Or></Or></Or></Or></Or></Or></Or></Or></And></Where></Query>

            } else {
                //combinedQuery = "<Query><Where>" + CamlBuilder.Expression().All.apply(CamlBuilder.Expression(), searchBlocks).ToString() + "</Where></Query>";
                combinedQuery = "<Query><Where><Or><Or><Or><Or><Or><Or><Or><Or><Or><Contains><FieldRef Name='Franchise_x0020_Group'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains><Contains><FieldRef Name='Principal_x0020_Name'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='Senior_x0020_Vice_x0020_Presiden'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='Regional_x0020_Vice_x0020_Presid'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='Title'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='City'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='State_x0020_'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='POS_x0020_Selection'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='Installation_x0020_Company'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or><Contains><FieldRef Name='Primary_x0020_Contact'/><Value Type='Text'>" + query.replace("+", " ") + "</Value></Contains></Or></Where></Query>";

                //<Query><Where><Or><Contains><FieldRef Name="Franchise_x0020_Group" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Principal_x0020_Name" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Senior_x0020_Vice_x0020_Presiden" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Regional_x0020_Vice_x0020_Presid" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="Title" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="City" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="State_x0020_" /><Value Type="Text">test</Value></Contains><Or><Contains><FieldRef Name="POS_x0020_Selection" /><Value Type="Text">test</Value></Contains><Contains><FieldRef Name="Installation_x0020_Company" /><Value Type="Text">test</Value></Contains></Or></Or></Or></Or></Or></Or></Or></Or></Where></Query>
            }
            

            //Define Report Columns
            var columns = [
              { key: 'ProjectType', title: 'Type' },
              { key: 'StoreNumber', title: 'No.' },
              { key: 'City', title: 'City' },
              { key: 'State', title: 'State' },
              { key: 'GoLiveDate', title: 'Go-Live', transform: 'date' },
              { key: 'Pos', title: 'POS' },
              { key: 'FranchiseGroup', title: 'Franchisee' },
              { key: 'RegionalVicePresident', title: 'RVP' },
              { key: 'PrimaryContact', title: 'POC' },
              {
                  key: 'Contractor', title: 'GC', transform: function (value, row, data, index) {
                      if (String(value) == "undefined")
                          return ""
                      else
                          return value
                  }
              },
              {
                  key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                      return "<a href='#summary/" + value + "'>more</a>"
                  }
              }
            ];

            //Define report title
            var title = 'Search Results';

            //Define sorting
            var sort = {
                key: 'GoLiveDate',
                direction: 'DESC'
            };

            //Define filtering
            var filter = function (arr) {
                //                var keepers = [];
                //                _.forEach(arr, function (store, index) {
                //                    if (store.Pos.toUpperCase() === 'MICROS') {
                //                        keepers.push(store);
                //                    }
                //                });
                //
                //                return keepers;
                return arr;
            };


            //Show report
            report.render({
                //                constructionQuery: constructionQuery,
                combinedQuery: combinedQuery,
                columns: columns,
                title: title,
                target: target,
                sort: sort,
                filter: filter,
                callback: function (data) {
                    self.data = data;
                },
                routeCheck: routeCheck
            });

        }
    };

    return self;
});