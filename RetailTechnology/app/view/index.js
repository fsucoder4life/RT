define(['dojo/text!app/view/index.html', 'app/controller/search', 'app/router'], function (indexTemplate, searchController, router) {

    return {
        render: function (options) {
            //Stop if another route has registered
            if (!options.routeCheck()) {
                return;
            }
            //Show the search box
            searchController.bootstrap();
            ///Set the date
            $('#current-date').html(moment().format('dddd, MMMM Do YYYY - h:mm A'));
            //Set the title
            $('#sub-title').html("Search/Reports");
            //Add the template to the content area

            $(options.target).html(indexTemplate);

            

        }
    };
});