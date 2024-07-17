define(['app/brand/services/brandServices'],async function(brandServices){
    //Setup
    //Turn Cross Origin Resource Sharing On to get sharepoint data from outside site
    $.support.cors = true;

    //Point towards the sharepoint site
    var webUrl = await brandServices.getSharePointUrlByKey("subSitePath");
    $().SPServices.defaults.webURL = webUrl;//  // URL of the target Web

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
