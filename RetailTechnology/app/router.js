define(["dojo/router", 'dojo/text!app/view/loading-mask.html', 'dojo/domReady!', 'app/controller/search'], function(router, loadMask, search){
    //Google Analytics
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    ga('create', 'UA-2931895-1', 'auto');

    //Route id functions
    var id = 0;
    function generateRouteId() {
        return ++id;
    }
    function getRouteCheckFunction() {
        var routeId = generateRouteId();

        return function () {
            return routeId === id;
        }
    }

    //Report routing
    router.register("reports/:id", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/reports/' + evt.params.id.toLowerCase());
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Reset the width
        $('#main').css('width', '');

        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/' + evt.params.id.toLowerCase()], function (controller) {
            controller.show($('#content'), getRouteCheckFunction());
        });
    });

    router.register("reports/:id/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/reports/' + evt.params.id.toLowerCase());
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Reset the width
        $('#main').css('width', '');

        //Show the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/' + evt.params.id.toLowerCase()], function (controller) {
            controller.show($('#content'), getRouteCheckFunction(), parseParams(evt.params.options));
        });
    });

    //Search View Routing
    router.register("search/:query", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/search');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/search'], function (search) {
            search.search($('#content'), evt.params.query, getRouteCheckFunction());
        });
    });

    //Search Query Routing
    router.register("search", function(){
        //Google Analytics Stuff
        ga('set', 'page', '/search');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/search'], function (search) {
            search.show($('#content'), getRouteCheckFunction());
        });
    });

    //Summary Routing
    router.register("summary/:storeNumber", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/summary');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/summary'], function (summary) {
            summary.show($('#content'), evt.params.storeNumber, getRouteCheckFunction());
        });
    });
  
  //Purchase Order Routing
  router.register("purchase-order/:purchaseOrderId", function(evt){
    //Google Analytics Stuff
    ga('set', 'page', '/summary');
    ga('send', 'pageview');
    
    //Clear the content area
    clearContent();
    
    //Get the controller
    require(['app/controller/purchase-order'], function (summary) {
      summary.show($('#content'), evt.params, getRouteCheckFunction());
    });
  });

  router.register("idtech-purchase-order/:purchaseOrderId", function (evt) {
      //Google Analytics Stuff
      ga('set', 'page', '/summary');
      ga('send', 'pageview');

      //Clear the content area
      clearContent();

      //Get the controller
      require(['app/controller/idtech-purchase-order'], function (summary) {
          summary.show($('#content'), evt.params, getRouteCheckFunction());
      });
  });

    //Purchase Order Routing
  router.register("fabcon-id-tech-purchase-order/:purchaseOrderId", function (evt) {
      //Google Analytics Stuff
      ga('set', 'page', '/summary');
      ga('send', 'pageview');

      //Clear the content area
      clearContent();

      //Get the controller
      require(['app/controller/fabcon-id-tech-purchase-order'], function (summary) {
          summary.show($('#content'), evt.params, getRouteCheckFunction());
      });
  });

    //Project Assignment Tool
    router.register("project-assignment", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/project-assignment');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-assignment'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });

    //Project Assignment Tool
    router.register("project-quarters", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-quarters'], function (view) {
            view.show($('body'), getRouteCheckFunction());
        });
    });

    //Project Review Tool
    router.register("project-review", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/search');
        ga('send', 'project-review');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review2'], function (view) {
            view.show($('body'), getRouteCheckFunction());
        });
    });
    router.register("project-review/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/project-review');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review2'], function (controller) {
            controller.show($('body'), getRouteCheckFunction(), parseParams(evt.params.options));
        });
    });

    //Project Review Tool
    router.register("project-review-paymod", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/search');
        ga('send', 'project-review-paymod');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review-paymod'], function (view) {
            view.show($('body'), getRouteCheckFunction());
        });
    });

    router.register("project-review-paymod4", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/search');
        ga('send', 'project-review-paymod');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review-paymod4'], function (view) {
            view.show($('body'), getRouteCheckFunction());
        });
    });
    router.register("project-review-paymod/*options", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/project-review-paymod');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review-paymod'], function (controller) {
            controller.show($('body'), getRouteCheckFunction(), parseParams(evt.params.options));
        });
    });

    router.register("project-review-paymod4/*options", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/project-review-paymod4');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/project-review-paymod4'], function (controller) {
            controller.show($('body'), getRouteCheckFunction(), parseParams(evt.params.options));
        });
    });

    //Manufacturing Projections
    router.register("manufacturing-projection/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/manufacturing-projection');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/manufacturing-projection'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("manufacturing-projection", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', '/manufacturing-projection');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/manufacturing-projection'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Weekly POPS Routing
    router.register("weekly-pops/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/weekly-pops');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/weekly-pops/weekly-pops'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("weekly-pops", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Google Analytics Stuff
        ga('set', 'page', '/weekly-pops');
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/weekly-pops/weekly-pops'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Support Routing
    router.register("support/installs-by-day/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("support/installs-by-day", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    router.register("support/installs-by-day-payment/*options", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day-payment'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("support/installs-by-day-payment", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day-payment'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //PAYS Modern Support Routing
    router.register("support/installs-by-day-paysmodern/*options", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day-paysmodern'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("support/installs-by-day-paysmodern", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/support/installs-by-day-paysmodern'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Openings Routing
    router.register("openings/openings-by-day/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/openings/openings-by-day'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("openings/openings-by-day", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/openings/openings-by-day'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Training Routing
    router.register("training/openings-by-day/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/training/openings-by-day'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("training/openings-by-day", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/training/openings-by-day'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Hughes Routing
    router.register("hughes/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/hughes-all'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("hughes", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/hughes-all'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Sync Routing - Construction/Development Report
    router.register("sync/construction-report", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/sync/construction-report'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });

    //Sync Routing - Construction/Development Report
    router.register("sync/construction-report-new", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/sync/construction-report-new'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });

    //Sync Routing - CommWorks
    router.register("sync/commworks", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/sync/commworks'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });
    //Sync Routing - Hughes Report
    router.register("sync/hughes-report", function (evt) {
        clearContent();

        require(['app/controller/sync/hughes-report'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });

    //Sync Routing - ISC Report
    router.register("sync/fabcon-report", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/sync/fabcon-report'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });
    //Sync Routing - Proforma Generator
    router.register("sync/proforma-generator", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/sync/proforma-generator'], function (view) {
            view.show($('#content'), getRouteCheckFunction());
        });
    });

    //payment monetization summary
    router.register("paymentmonetizationsummary/:stores", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/paymentmonetizationsummary'], function (view) {
            view.show($('#content'), evt.params.stores.split('-'), getRouteCheckFunction());
        });
    });

    //Pro Forma Routing - Pro-Forma List
    router.register("proforma/:stores", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/proforma'], function (view) {
            view.show($('#content'), evt.params.stores.split('-'), getRouteCheckFunction());
        });
    });

    //Pro Forma Routing - Pro-Forma List
    router.register("quotegen/:stores", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/quotegen'], function (view) {
            view.show($('#content'), evt.params.stores.split('-'), getRouteCheckFunction());
        });
    });

    router.register("installquotegen/:stores", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/installquotegen'], function (view) {
            view.show($('#content'), evt.params.stores.split('-'), getRouteCheckFunction());
        });
    });

    //Audio Pro Forma Routing - Pro-Forma List
    router.register("audio-summary/:stores", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        clearContent();

        require(['app/controller/audio-summary'], function (view) {
            view.show($('#content'), evt.params.stores.split('-'), getRouteCheckFunction());
        });
    });

    //Issues/Tasks
    router.register("issues/*options", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/issues/issues'], function (view) {
            view.show($('#content'), parseParams(evt.params.options), getRouteCheckFunction());
        });
    });
    router.register("issues", function(evt){
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();
        //Hide the search bar
        $('#search-container').show();

        //Get the controller
        require(['app/controller/issues/issues'], function (view) {
            view.show($('#content'), {}, getRouteCheckFunction());
        });
    });

    //Default Route
    router.register("index", function (evt) {
        //Google Analytics Stuff
        ga('set', 'page', evt.newPath);
        ga('send', 'pageview');

        //Clear the content area
        clearContent();

        //Get the controller
        require(['app/controller/index'], function (index) {
            index.show($('#content'), getRouteCheckFunction());
        });
    });


    // Startup must be called in order to "activate" the router and begin routing
    router.startup('index');

    //Make sure search is showing
    $('#search-container').show();
    search.bootstrap();


    function clearContent() {
        //Clear the content area/set loading
        $('#content').html(loadMask);
        //Clear the width
        $('#main').css('width', '');
    }

    function parseParams(params) {
        var result = {};
        params = params.split("/");
        for (var i = 0; i < params.length; i+=2) {
            var param = params[i+1];
            //Handle arrays
            if (param.indexOf(',') !== -1) {
                param = param.split(',');
                _.each(param, function (p, x) {
                    param[x] = decodeURIComponent(param[x])
                });
            } else {
                //Handle strings
                param = decodeURIComponent(params[i+1]);
            }

            result[params[i]] = param;
        }
        return result;
    }
});