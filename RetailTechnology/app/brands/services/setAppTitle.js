//function to replace the title of an element
define([
    "app/brands/services/setAppTitle",
    "app/brands/infrastructure/models/constants",
    "app/brands/services/setText"
], function (setAppTitle, constants, setText) {
    const setTitle = (async () => {

        try {
            var selector = constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE");
            var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
            console.log(`Try to fetch the brand's config json file from ${url}`);
            await setText(selector, text);
        } catch (error) {
            console.log(error);
        }

    })();

});
