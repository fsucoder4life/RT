define(
    [
        "app/brands/infrastructure/models/constants",
        "dojo/_base/lang",
        "app/brands/services/brandServices",
        "dojo/dom",
        "app/brands/services/logHelper"
    ], function (constants, lang, brandServices, dom,logHelper) {
        return {
            setText: (async function (selector, text) {

                console.log("Selector: " + selector + " - " + " Text: " + text);
                const title = dom.byId(selector);
                if (!title) {
                    return false;
                }
                title.innerText = text;
                return true;
            }),

            setAppTitle: (async function () {
                logHelper.logInfo("I called him");
                let retVal = false;
                console.log(`setAppTitle: Try to set the app title2`);
                const setTextFn = this.setText.bind(this);
                try {
                    brandServices.getPageTitle().then(async (selector) => {
                        var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
                        retVal = await setTextFn(selector, text);
                    });
                    return retVal;
                } catch (error) {
                    console.log(error);
                }

            }),

            registerBrandTheme: (async function () {
                const setAppTitleFn = this.setAppTitle.bind(this);
                brandServices.getBrandReady().then((isReady) => {
                    logHelper.logInfo("I am in registerBrandTheme, is the brand ready yet? " + isReady);
              
                });
                  let retVal = false;
                retVal = await setAppTitleFn();

            })

        }
    });