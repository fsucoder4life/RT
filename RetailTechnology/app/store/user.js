define(['app/brands/services/brandServices', 'app/brands/services/logHelper'], function (brandServices, logHelper) {
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    $.support.cors = true;

    //Point towards the sharepoint site
    var webUrl = brandServices.getSharePointUrlByKey("siteCollectionUrl");
    $().SPServices.defaults.webURL = webUrl;//  // URL of the target Web
    logHelper.logDebug("user.js", "webUrl: " + webUrl);
    function loadData () {
        //Load the user data
        return $().SPServices.SPGetCurrentUser({
            fieldNames: ["FirstName", "LastName", "UserName"],
            debug: false
        });
    }

    return {
        loadData: loadData
    };
});
