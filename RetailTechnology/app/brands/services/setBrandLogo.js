//function to replace the title of an element
define([
    "app/brands/services/setBrandLogo",
    "app/brands/infrastructure/models/constants",
    "app/brands/services/setText"
], function (setAppTitle, constants, setText) {
    const setTitle = (async () => {

        try {
            console.log(`Try to fetch the brand's config json file from ${url}`);
            
            var selector = constants("LOCAL_STORAGE_CURRENT_BRAND_LOGO");
            var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRAND_LOGO"));
            await setText(selector, text);
        } catch (error) {
            console.log(error);
        }

    })();

});
