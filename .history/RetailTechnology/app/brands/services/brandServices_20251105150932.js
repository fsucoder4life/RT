define(
    [
        "app/brands/infrastructure/models/constants",
        "dojo/_base/lang",
        "dojox/json/query",
        "app/brands/services/logHelper",
        "dojo/dom",
        "dojo/dom-construct",
        "dojo/store/DataStore"
    ], function (constants, lang, query, logHelper, dom, domConstruct) {

        //Overide consoleLogging Flag
        //If overrideDebugForFile = false && consoleLogging == true, any logHelper.logDebug or logHelper.logInfo lines will output to the console
        //If overrideDebugForFile = true && consoleLogging == true, any logHelper.logDebug or logHelper.logInfo lines will NOT output to the console
        const overrideDebugForFile = false;

        return {


            //Start App
            startApp: (async function () {
                const setBrandIdFn = this.setBrandId.bind(this);
                const setUserFn = this.getCurrentUser.bind(this);
                const params = new Proxy(new URLSearchParams(window.location.search), {
                    get: (searchParams, prop) => searchParams.get(prop),
                });
                let retVal = false;
                let brandId = params.brandId;
                //If there is no brandId in the querystring
                if (!brandId) {
                    brandId = '380fb82e-9c79-4903-a65a-425f551a84b1'; //Default to Sonic
                }
                //Don't use logHelper yet, it hasn't been loaded
                logHelper.logDebug("brandServices.js", "Start app for brandId: " + brandId, overrideDebugForFile);
                await setUserFn();
                retVal = await setBrandIdFn(brandId);

                return retVal;

            }),

            getCurrentUser: (async function(){
                var currentUser;
                
                    this.clientContext = new SP.ClientContext.get_current();
                    this.oWeb = clientContext.get_web();
                    currentUser = this.oWeb.get_currentUser();
                    if (currentUser){
                        var curUser = "Current User: " + currentUser.get_email();
                            localStorage.setItem("currentUser_userLoginName", currentUser.get_loginName());
                            localStorage.setItem("currentUser_userId", currentUser.get_id());
                            localStorage.setItem("currentUser_userTitle", currentUser.get_title());
                            localStorage.setItem("currentUser_userEmail", currentUser.get_email());
                            localStorage.setItem("CurrentUser",currentUser);
                    }  
            }),

            //Load Base config.json
            loadConfigFile: (async function () {
                const setLoggingFlagFn = this.setLoggingFlag.bind(this);
                const setsiteCollectionUrlFn = this.setsiteCollectionUrl.bind(this);
                const setAllBrandsFileFn = this.setAllBrandsFile.bind(this);
                let retVal = false;
                var url = "config.json";
                var brandsUrl = "app/brands/brands.json";
                //console.log(`brandservices.js - Try to fetch the config.json file from ${url}`);
                await fetch(url)
                    .then((res) => res.json())
                    .then(async (json) => {
                        localStorage.clear();
                        //store the config.json 
                        localStorage.setItem(constants("LOCAL_STORAGE_APP_CONFIG"), JSON.stringify(json));


                        var consoleLogging = (json.consoleLogging === 'true');
                        var sharePointBaseUrl = json.sharePointBaseUrl;
                        retVal = await setLoggingFlagFn(consoleLogging);
                        retVal = await setsiteCollectionUrlFn(sharePointBaseUrl);
                        if (consoleLogging) {
                            console.log("brandServices.js - loadConfigFile: Verbose logging has been enabled");
                        }
                        else {
                            console.log("brandServices.js - loadConfigFile: Verbose logging is disabled, no further logHelper events will display.")
                        }

                        //localStorage.setItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"),consoleLogging)
                    }).then(async () => {
                        await fetch(brandsUrl)
                            .then((brandRes) => brandRes.json())
                            .then(async (json) => {
                                retVal = setAllBrandsFileFn(json).then(() => {
                                    // logHelper.logDebug("brandServices.js","loadConfigFile: All Brands File cached");

                                });

                            })
                        retVal = true;
                    })
                    .catch((err) => {
                        logHelper.logDebugError("brandServices.js", 'loadConfigFile: File Load Error!', {
                            error: "Error fetching the config file.",
                            details: err,
                        });
                    });

                return retVal;
            }),


            getSharePointBaseUrl: (function () {
                var url = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_SHAREPOINT_BASE_URL"));
                if (!url) {
                    logHelper.logDebugError("Base Url not set");
                    return false
                }
                return url;
            }),

            //Setup Current Brand Configuration
            setCurrentBrandConfig: (async function () {


                logHelper.logDebug("brandServices.js", "setCurrentBrandConfig: Setting up Brand Configuration", overrideDebugForFile);
                //Setup function bindings
                const getAllBrandsFileFn = this.getAllBrandsFile.bind(this);
                const getBrandIdFn = this.getBrandId.bind(this);
                const setBrandConfigFilePathFn = this.setBrandConfigFilePath.bind(this);
                const setBrandNameFn = this.setBrandName.bind(this);
                const setBrandBaseFolderFn = this.setBrandBaseFolder.bind(this);
                const setBrandImagesFolderFn = this.setBrandImagesFolder.bind(this);
                const setCurrentBrandConfigSettingsFn = this.setCurrentBrandConfigSettings.bind(this);
                const setBrandCssThemeFilePathFn = this.setBrandCssThemeFilePath.bind(this);
                logHelper.logInfo("get Current Brand Id");
                await getBrandIdFn().then(async (val) => {

                    var brandId = val;
                    logHelper.logDebug("brandServices.js", "setCurrentBrandConfig: Brand Id: " + brandId, overrideDebugForFile);
                    var allBrands = await getAllBrandsFileFn().then(async (json) => {
                        //Pull the allBrands.json from local storage and parse it

                        var allBrandsJson = json;//JSON.parse(json);
                        logHelper.logDebug("brandServices.js", "AllBrandsJson: " + allBrandsJson, overrideDebugForFile);
                        //query it by the brand id in the querystring
                        var queryText = `[?brandId='${brandId}']`;

                        try {
                            var results = dojox.json.query("$.brands", allBrandsJson);
                        } catch (error) {
                            logHelper.logError("setCurrentBrandConfig: " + error.details);
                        }


                        if (!results) {
                            logHelper.logError("setCurrentBrandConfig: Error loading allBrands.json config file!");
                            return false;
                        }

                        //Get the Brand specific settings from the allBrands array
                        var item = dojox.json.query(queryText, results);

                        //Store the settings in localStorage

                        var companyName = item[0]["settings"]["brandName"];
                        var configFilePath = item[0].settings.configFile;
                        var baseFolderPath = item[0].settings.baseFolder;
                        var imagesFolderPath = item[0].settings.imagesFolder;
                        var cssThemeFilePath = item[0].settings.cssThemeFile;
                        let retVal = false;
                        retVal = await setBrandNameFn(companyName);
                        retVal = await setBrandConfigFilePathFn(configFilePath);
                        retVal = await setBrandImagesFolderFn(imagesFolderPath);
                        retVal = await setBrandBaseFolderFn(baseFolderPath);
                        retVal = await setBrandCssThemeFilePathFn(cssThemeFilePath);
                        retVal = await setCurrentBrandConfigSettingsFn();
                        logHelper.logDebug("brandServices.js", "setCurrentBrandConfig: End of Setup Config", overrideDebugForFile);
                        logHelper.logDebug("brandServices.js", "setCurrentBrandConfig: Next up, register the Brand's theme", overrideDebugForFile);
                        return retVal;
                    });
                })
                //localStorage.getItem(constants("LOCAL_STORAGE_ALL_BRANDS"));
                return true;
            }),

            //Load Current Brand Config File
            setCurrentBrandConfigSettings: (async function () {
                const getBrandIdFn = this.getBrandId.bind(this);
                let brandId = '';
                await getBrandIdFn().then(async (val) => {

                    brandId = val;
                })
                    .then(async () => {

                        const getBrandConfigFilePathFn = this.getBrandConfigFilePath.bind(this);
                        const setBrandConfigFileFn = this.setBrandConfigFile.bind(this);
                        const registerBrandThemeFn = this.registerBrandTheme.bind(this);
                        const getBrandConfigFileFn = this.getBrandConfigFile.bind(this);

                        const cachePageTitleFn = this.cachePageAndSiteTitle.bind(this);
                        //const setEmailDistributionDetailsFn = this.setEmailDistributionDetails.bind(this);
                        //const setQuoteDetailsFn = this.setQuoteDetails.bind(this);
                        const setSharePointUrlsFn = this.setSharePointUrls.bind(this);
                        const setHomeUrlFn = this.setHomeUrl.bind(this);
                        const getsiteCollectionUrlFn = this.getsiteCollectionUrl.bind(this);
                        const setBrandLogoFn = this.setBrandLogo.bind(this);
                        const setBrandInfoFn = this.setBrandInfo.bind(this);
                        // const queryEmailDistributionListFn = this.queryEmailDistributionList.bind(this);


                        var queryText = `[*]`
                        await getBrandConfigFilePathFn().then((value) => {
                            var url = value;
                            logHelper.logDebug("brandServices.js", "setCurrentBrandConfigSettings: Url: " + url, overrideDebugForFile);
                            logHelper.logDebug("brandServices.js", `setCurrentBrandConfigSettings: Try to fetch the current brand's settings.json file from ${url}`, overrideDebugForFile);
                            fetch(url)
                                .then((res) => res.json())
                                .then(async (json) => {
                                    //store the config.json 
                                    logHelper.logDebug("brandServices.js", "setCurrentBrandConfigSettings: Set the current Theme Config File to cache", overrideDebugForFile);
                                    //replace variables



                                    await setBrandConfigFileFn(JSON.stringify(json));
                                    var item = dojox.json.query(queryText, json);

                                    //Each brand has a sharePoint-config.json file and they should be structured identically
                                    //Brand specific company information array
                                    var companyInfo = item[1];
                                    //Brand landing page for Retail Technology
                                    var homeUrl = item[2];
                                    //Brand specific page title; what is shown on the screen
                                    var pageTitle = item[3];
                                    //Brand specific site title; what is shown in the browser tab
                                    var siteTitle = item[4];

                                    //SharePoint Url array
                                    var SPUrls = item[5];

                                    var stringified = JSON.stringify(SPUrls);
                                    //**NOTE**  json has to be parsed and stringified each time you do a replace or the next replace won't work
                                    //replace placeholders with actual values
                                    var rootUrl = await getsiteCollectionUrlFn();
                                    stringified = stringified.replace(/__siteCollectionUrl__/g, rootUrl);
                                    SPUrls = JSON.parse(stringified);
                                    const varsubSitePath = SPUrls["subSitePath"];
                                    stringified = stringified.replace(/__subSitePath__/g, varsubSitePath);
                                    logHelper.logInfo("Stringified: " + stringified);
                                    //Brand specific SharePoint Base Url; will be used to replace placeholders to build the some of the SharePoint Urls
                                    //const sharePointBaseUrl = SPUrls["sharePointBaseUrl"];
                                    SPUrls = JSON.parse(stringified);
                                    const subSitePath = SPUrls["subSitePath"];
                                    var homepageUrl = SPUrls["homepageUrl"];

                                    if (brandId != '380fb82e-9c79-4903-a65a-425f551a84b1') {
                                        homepageUrl = homepageUrl + homeUrl;
                                    }

                                    logHelper.logInfo("Homepage Url: " + homepageUrl);

                                    stringified = JSON.stringify(SPUrls);

                                    //Brand specific Payment Survey Signoff Site Page Base Url; will be used to replace placeholders to build the Urls that leverage this site page
                                    const sitePagePaymentSignOff = SPUrls["sitePage-PaymentSurveySignOff"];
                                    stringified = stringified.replace(/__sitePage-PaymentSurveySignOff__/g, sitePagePaymentSignOff);
                                    SPUrls = JSON.parse(stringified);
                                    stringified = JSON.stringify(SPUrls);

                                    //Brand specific Construction Calss List Page Base Url; will be used to replace placeholders to build the Urls that leverage this list page
                                    const listConstructionCalls = SPUrls["list-ConstructionCalls"];
                                    stringified = stringified.replace(/__list-ConstructionCalls/g, listConstructionCalls);
                                    SPUrls = JSON.parse(stringified);
                                    stringified = JSON.stringify(SPUrls);

                                    //Brand specific Retail Technology Site Page Base Url; will be used to replace placeholders to build the Urls that leverage this site page
                                    const sitePageRetailTech = SPUrls["sitePage-RetailTechnology"];
                                    stringified = stringified.replace(/__sitePage-RetailTechnology__/g, sitePageRetailTech);

                                    SPUrls = JSON.parse(stringified);

                                    const apipdfGenerator = SPUrls["api-pdfGenerator"];
                                    const formPOSSurvey = SPUrls["form-POSSurvey"];
                                    const listCombinedSchedule = SPUrls["list-CombinedSchedule"];

                                    const listConstructionCallsDispForm = SPUrls["list-ConstructionCalls-DispForm"];
                                    const listInstallQuoteGen = SPUrls["list-InstallQuoteGen"];
                                    const listLevel2010Orders = SPUrls["list-Level2010Orders"];
                                    const listPurchaseOrders = SPUrls["list-PurchaseOrders"];
                                    const siteAssetsRenameListFileAttachments = SPUrls["siteAssets-RenameListFileAttachments"];
                                    const sitePageDailyUpdates = SPUrls["sitePage-DailyUpdates"];
                                    const sitePageMasterPortal = SPUrls["sitePage-MasterPortal"];

                                    const sitePagePSOSurvey = SPUrls["sitePage-PaymentSurveySignOff-survey"];
                                    const sitePagePSOViewAll = SPUrls["sitePage-PaymentSurveySignOff-viewPhotosAllArea-surveyStart"];
                                    const sitePagePSOViewAllSurvey = SPUrls["sitePage-PaymentSurveySignOff-viewPhotosAllArea"];
                                    const sitePagePSOCheckin = SPUrls["sitePage-PaymentSurveySignOff-checkin"];
                                    const sitePagePSODailyUpdate = SPUrls["sitePage-PaymentSurveySignOff-dailyUpdate"];
                                    const sitePageProjectReviewPayMod = SPUrls["sitePage-ProjectReviewPaymod"];

                                    const sitePageRetailTechSearch = SPUrls["sitePage-RetailTechnology-search"];
                                    const sitePageRetailTechPaymentModProjectDates = SPUrls["sitePage-RetailTechnology-paymentModProjectDates"];
                                    const sitePageRetailTechStoreConfigurationSearch = SPUrls["sitePage-RetailTechnology-storeConfigurationSearch"];


                                    //Quotes array
                                    //var quoteDetails = item[7];

                                    //Images & Logo array
                                    var logo = item[7];
                                    var logoDescription = logo["logo"].description;
                                    var logoFilePath = logo["logo"].uri;

                                    var retVal = false;

                                    retVal = await cachePageTitleFn(pageTitle, siteTitle);


                                    retVal = await setHomeUrlFn(homeUrl);

                                    retVal = await setBrandLogoFn(logoFilePath, logoDescription);
                                    retVal = await setBrandInfoFn(companyInfo);

                                    logHelper.logDebug("brandServices.js", subSitePath, overrideDebugForFile);

                                    if (SPUrls) {
                                        retVal = await setSharePointUrlsFn(subSitePath, homepageUrl, apipdfGenerator, formPOSSurvey, listCombinedSchedule, listConstructionCalls, listConstructionCallsDispForm,
                                            listInstallQuoteGen, listLevel2010Orders, listPurchaseOrders, siteAssetsRenameListFileAttachments, sitePageDailyUpdates, sitePageMasterPortal, sitePagePaymentSignOff,
                                            sitePagePSOSurvey, sitePagePSOViewAll, sitePagePSOViewAll, sitePagePSOViewAllSurvey, sitePagePSOCheckin, sitePagePSODailyUpdate,
                                            sitePageProjectReviewPayMod, sitePageRetailTech, sitePageRetailTechSearch, sitePageRetailTechPaymentModProjectDates, sitePageRetailTechStoreConfigurationSearch)
                                            .then(async () => {
                                                //Email array from SharePoint Online | EmailDistributionList                            
                                                //var emailDistributionDetails = queryEmailDistributionListFn(brandId);
                                                //retVal = await setEmailDistributionDetailsFn(emailDistributionDetails);
                                                //retVal = await setQuoteDetailsFn(quoteDetails);
                                                retVal = await registerBrandThemeFn();
                                            });
                                        logHelper.logInfo("After setting SharePointUrls");
                                    }

                                    logHelper.logInfo("It won't be ready until here");
                                    return retVal;
                                })

                                .catch((err) => {
                                    logHelper.logError('setCurrentBrandConfigSettings: File Load Error!', {
                                        error: "Error fetching the config file.",
                                        details: err,
                                    });
                                })
                        })
                    })

            }),

            //Load the Current Brand Theme
            registerBrandTheme: (async function () {
                const setPageTitleFn = this.setPageTitle.bind(this);
                const getBrandReadyFn = this.getBrandReady.bind(this);
                const setCompanyInfoFn = this.setCompanyInfo.bind(this);


                getBrandReadyFn().then(async (isReady) => {
                    // logHelper.logDebug("brandServices.js","I am in registerBrandTheme, is the brand ready yet? " + isReady,overrideDebugForFile);
                    let retVal = false;
                    retVal = await setPageTitleFn();
                    retVal = await setCompanyInfoFn();
                });


            }),





            //Cache Current Brand CssFile Path
            setBrandCssThemeFilePath: (async function (filePath) {

                try {

                    localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE_PATH"), JSON.stringify(filePath));
                    await logHelper.logDebug("brandServices.js", "setBrandCssThemeFilePath: Brand Css File Path set", overrideDebugForFile);

                    return true;
                } catch (error) {
                    return false;
                }


            }),

            getBrandCssThemeFilePath: (async function () {
                var filePath = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE_PATH"));
                if (!filePath) {
                    logHelper.logError("getBrandCssThemeFilePath: Error locating the brand css theme file!", overrideDebugForFile);
                    return null;
                }
                return filePath;
            }),

            //*****ALL BRANDS JSON PATH
            //Cache All Brands JSON File Path
            setAllBrandsFilePath: (async function () {

                try {
                    var filePath = 'app/brands/brands.json';
                    localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS_FILE_PATH"), filePath);
                    await logHelper.logDebug("brandServices.js", "setAllBrandsFilePath: All Brands File Path set", overrideDebugForFile);

                    return true;
                } catch (error) {
                    return false;
                }


            }),

            getAllBrandsFilePath: (async function () {


                logHelper.logDebug("brandServices.js", "getAllBrandsFilePath: getAllBrandsFilePath", overrideDebugForFile);
                var configFilePath = localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS_FILE_PATH"));
                if (!configFilePath) {
                    logHelper.logError("getAllBrandsFilePath: Error locating the brands.json config file!", overrideDebugForFile);
                    return null;
                }
                return configFilePath;


            }),

            //*****ALL Brands JSON File
            //Cache All Brands JSON File
            setAllBrandsFile: (async function (json) {
                localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS"), JSON.stringify(json));
                logHelper.logDebug("brandServices.js", "setAllBrandsFile: Brands.json loaded into cache", overrideDebugForFile);
                return true;
            }),

            getAllBrandsFile: (async function () {
                var brandsConfig = localStorage.getItem(constants("LOCAL_STORAGE_ALL_BRANDS"));
                if (!brandsConfig) {
                    logHelper.logError("getAllBrandsFile: Error retrieving brands.json file from cache!");
                    return null;
                }
                return JSON.parse(brandsConfig);
            }),

            //*****Page Title
            //Cache Current Brand Page Title
            cachePageAndSiteTitle: (async function (pageTitle, siteTitle) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"), pageTitle);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"), siteTitle);

                logHelper.logDebug("brandServices.js", "cachePageAndSiteTitle: Page Title has been cached", overrideDebugForFile);
                return true;
            }),

            getPageTitle: (async function () {

                var pageTitle = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
                logHelper.logInfo("Get current page title: " + pageTitle);
                if (!pageTitle) {
                    logHelper.logError("getPageTitle: Page Title not set");
                    return false
                }
                return pageTitle;
            }),



            //Query the Brand-EmailDistributionList asynchronously
            queryEmailDistributionList: (function (brandId) {
                const getSharePointUrlByKeyFn = this.getSharePointUrlByKey.bind(this);
                const _brandId = brandId;

                // Get all the Email Distribution data
                let hostWebUrl = getSharePointUrlByKeyFn("hostWebUrl");

                try {
                    // resources are in URLs in the form:
                    // web_url/_layouts/15/resource
                    var scriptbase = hostWebUrl + "/_layouts/15/";
                    // Load the js files and continue to the successHandler
                    $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);
                    function execCrossDomainRequest() {
                        var executor = new SP.RequestExecutor(hostWebUrl);
                        executor.executeAsync(
                            {
                                url:
                                    hostWebUrl +
                                    "/_api/web/lists/getbytitle('Brand - EmailDistributionList')/items",
                                headers: { "Accept": "Application/json; odata=verbose" },
                                method: "GET",
                                success: successHandler,
                                error: errorHandler
                            }
                        );
                    }
                    // Function to handle the success event.                    
                    distributionList = [];
                    function successHandler(data) {
                        //Ran out of time but change this to use getBrandId
                        var brandId = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"));

                        logHelper.logDebug("brandServices.js", "EmailDistributionList data: " + JSON.stringify(data), true);
                        var jsonObject = JSON.parse(data.body);

                        var d = jsonObject.d.results;
                        var results = jsonObject.d.results;
                        row = {};
                        for (var i = 0; i < results.length; i++) {

                            if (results[i].field_0 == brandId) {
                                var formType = results[i].Title;
                                var brandId = results[i].field_0;
                                var distributionType = results[i].field_2;
                                var emailTo = results[i].field_3;
                                var emailCC = results[i].field_4;
                                var emailFrom = results[i]["EmailFrom"];
                                var emailForPosition = results[i]["EmailForPosition"];
                                row = {
                                    "brandId": brandId,
                                    "formType": formType,
                                    "distributionType": distributionType,
                                    "emails": {
                                        "emailTo": emailTo,
                                        "emailCC": emailCC,
                                        "emailFrom": emailFrom,
                                        "emailForPosition": emailForPosition
                                    }
                                };

                                distributionList.push(row);
                            }

                        }

                        //Add EmailDistributionList to localStorage

                        localStorage.setItem(constants("LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS"), JSON.stringify(distributionList));
                        return JSON.stringify(distributionList);

                        //})
                    }

                    // Function to handle the error event.
                    function errorHandler(data, errorCode, errorMessage) {
                        logHelper.logError("errorCode: " + errorCode);
                        logHelper.logError("errorMessage: " + errorMessage);
                    }


                } catch (error) {
                    logHelper.logDebug("brandServices.js", error, overrideDebugForFile);
                    return false;
                }

            }),

            //*****Site Title
            setEmailDistributionDetails: (async function (details) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS"), JSON.stringify(details));

                logHelper.logDebug("brandServices.js", "setEmailDistributionDetails: Email Distribution Details have been cached", overrideDebugForFile);
                return true;
            }),

            //Clean, working function returns array of object from Brand - EmailDistributionList
            getEmailDistributionDetails: (function (formType, distributionType) {

                var brandId = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"));
                if (brandId) {
                    var emailDistributionDetailsJson = null;
                    //Get the full distribution list from local storage
                    var emailDistributionDetails = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS"));
                    if (emailDistributionDetails) {
                        const emailDistributionList = [];
                        logHelper.logDebug("brandServices.js", "emailDistributionDetails: " + emailDistributionDetails, overrideDebugForFile)
                        emailDistributionDetailsJson = JSON.parse(emailDistributionDetails);
                        //Filter the full distribution list by the formType & distributionType
                        var filteredJson = JSON.parse(emailDistributionDetails).filter((item) => {
                            logHelper.logDebug("brandServices.js", "before filteredJson: " + item, overrideDebugForFile);
                            if (item.formType.toLowerCase() === formType.toLowerCase() && item.distributionType.toLowerCase() === distributionType.toLowerCase()) {
                                //Push the object to the emsilDistributionList array
                                emailDistributionList.push(item);
                                return;
                            }
                            return;
                        });


                        //Create the final array of object that will be returned
                        const emailDetails = [];
                        var emailTo = emailDistributionList[0]["emails"]["emailTo"];

                        //If there is no emailTo address, this record isn't valid
                        if (!emailTo) {
                            logHelper.logError("logHelper: emailTo has not been cached");
                            return false
                        }

                        //emailDetails.push(emailTo);
                        var emailCC = emailDistributionList[0]["emails"]["emailCC"];
                        if (!emailCC) {
                            emailCC = "";
                            logHelper.logError("getEmailDistributionDetails: emailCC has not been cached");
                        }
                        //emailDetails.push(emailCC);

                        var emailFrom = emailDistributionList[0]["emails"]["emailFrom"];
                        if (!emailFrom) {
                            emailFrom = "";
                            logHelper.logError("getEmailDistributionDetails: emailFrom has not been cached");
                        }
                        //emailDetails.push(emailFrom);


                        var emailForPosition = emailDistributionList[0]["emails"]["emailForPosition"];
                        if (!emailForPosition) {
                            emailForPosition = "";
                            logHelper.logError("getEmailDistributionDetails: emailForPosition has not been cached");
                        }
                        //emailDetails.push(emailForPosition);

                        var jsonObject = {
                            "emailTo": emailTo,
                            "emailCC": emailCC,
                            "emailFrom": emailFrom,
                            "emailForPosition": emailForPosition
                        };

                        emailDetails.push(jsonObject);


                        //return the object array
                        return emailDetails;

                    }

                }
                return null;
            }
            ),

            //Cache Quote Details
            setQuoteDetails: (async function (details) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_QUOTE_DETAILS"), JSON.stringify(details));

                logHelper.logDebug("brandServices.js", "setQuoterDetails: Quote Details have been cached", overrideDebugForFile);
                return true;
            }),

            getEmailDistributionDetailsAsync: (async function () {

                var emailDistributionDetails = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS"));
                if (!emailDistributionDetails) {
                    logHelper.logError("getEmailDistributionDetails: Email Distribution Details have not been cached");
                    return false
                }

                return JSON.parse(emailDistributionDetails);
            }),
            getQuoteDetails: (async function () {

                var quoteDetails = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_QUOTE_DETAILS"));
                if (!quoteDetails) {
                    logHelper.logError("getQuoteDetails: Quote Details have not been cached");
                    return false
                }

                return JSON.parse(quoteDetails);
            }),




            getQuoteEmailDetails: (async function (distributionType) {
                const getQuoteDetailsFn = this.getQuoteDetails.bind(this);
                const quoteDetails = await getQuoteDetailsFn();
                const emailDetails = [];
                var queryText = `[?distributionType='${distributionType}']`
                var item = dojox.json.query(queryText, quoteDetails);
                var emailTo = item[0]["emails"]["emailTo"];

                if (!emailTo) {
                    logHelper.logError("getQuoteEmailDetails: emailTo has not been cached");
                    return false
                }
                emailDetails.push(emailTo);
                var emailCC = item[0]["emails"]["emailCC"];
                if (!emailCC) {
                    logHelper.logError("getQuoteEmailDetails: emailCC has not been cached");

                }
                emailDetails.push(emailCC);
                return emailDistributionDetails;
            }),
            //Cache Sharepoint URLs
            setSharePointUrls: (async function (baseUrl, homepageUrl, pdfApi, posSurvey, combSchedule, constrCalls, constrCalls2, quoteGen,
                levelOrders, dailyUpdates, siteAssets, masterPortal, surveySignOff, survSignOff2, surveySignOff3, surveySignOff4,
                surveySignOff5, surveySignOff6, projectReview, retailTech, retailTech2, retailTech3, retailTech4) {
                //setting sharePointBaseUrl in config.json
                //localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITE_COLLECTION_URL"), sharePointBaseUrl);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SUBSITE_PATH"), baseUrl);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_HOMEPAGE_URL"), homepageUrl);
                localStorage.setItem(constants("LOCAL_STORAGE_API_GENERATE_PDF"), pdfApi);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_FORM_POSSURVEY"), posSurvey);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_LIST_COMBINED_SCHEDULE"), combSchedule);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_LIST_CONSTRUCTION_CALLS"), constrCalls);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_LIST_CONSTRUCTION_CALLS_DISPFORM"), constrCalls2);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_LIST_INSTALL_QUOTE_GEN"), quoteGen);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_LIST_LEVEL2010ORDERS"), levelOrders);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_DAILY_UPDATES"), dailyUpdates);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEASSETS_RENAME_LIST_FILE_ATTACHMENTS"), siteAssets);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_MASTER_PORTAL"), masterPortal);

                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF"), surveySignOff);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_SURVEY"), survSignOff2);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_VIEW_PHOTOS_ALL_AREA_SURVEY_START"), surveySignOff3);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_VIEW_PHOTOS_ALL_AREA"), surveySignOff4);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_CHECKIN"), surveySignOff5);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_DAILY_UPDATE"), surveySignOff6);

                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_PROJECTREVIEWPAYMOD"), projectReview);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY"), retailTech);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_SEARCH"), retailTech2);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_PAYMENT_MOD_PROJECT_DATES"), retailTech3);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_STORE_CONFIGURATION_SEARCH"), retailTech4);

                logHelper.logDebug("brandServices.js", "setSharePointUrls: SharePointUrls have been cached", overrideDebugForFile);
                return true;
            }),


            //get the sharepoint url by key from localstorage
            getSharePointUrlByKey: (function (key) {
                if (!key) {
                    logHelper.logError("getSharePointUrlByKey: Invalid Constant Key!");
                    return false
                }
                logHelper.logDebug("brandServices.js", "getSharePointUrlByKey: Attempting to get key: " + key, overrideDebugForFile);
                var url = localStorage.getItem(key);
                logHelper.logDebug("brandServices.js", "getSharePointUrlByKey: localStorage result: " + url, overrideDebugForFile);
                if (!url) {
                    logHelper.logError(`getSharePointUrlByKey: ${} not cached`);
                    return false
                }
                logHelper.logDebug("brandServices.js", "Returning SharePointUrl for " + key + " : " + url, overrideDebugForFile);
                return url;
            }),

            getSharePointUrlByKeyAsync: (async function (key) {
                if (!key) {
                    logHelper.logError("getSharePointUrlByKeyAsync: Invalid Constant Key!");
                    return false
                }
                logHelper.logDebug("brandServices.js", "getSharePointUrlByKeyAsync: Attempting to get key: " + key, overrideDebugForFile);
                var url = localStorage.getItem(key);
                logHelper.logDebug("brandServices.js", "getSharePointUrlByKeyAsync: localStorage result: " + url, overrideDebugForFile);
                if (!url) {
                    logHelper.logError("getSharePointUrlByKeyAsync: SharePoint Url not cached");
                    return false
                }
                logHelper.logDebug("brandServices.js", "Returning SharePointUrl for " + key + " : " + url, overrideDebugForFile);
                return url;
            }),

            //Cache Home URL
            setHomeUrl: (async function (url) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BASE_URL"), url);
                logHelper.logDebug("brandServices.js", "setHomeUrl: BaseUrl has been cached", overrideDebugForFile);
                return true;
            }),

            getHometUrl: (async function () {
                var url = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BASE_URL"));
                if (!url) {
                    logHelper.logError("Base Url not set");
                    return false
                }
                return url;
            }),

            //Cache Subsite Path
            setSubsitePath: (async function (url) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SUBSITE_PATH"), url);
                logHelper.logInfo("setSubsitePath: Subsite path has been cached");
                return true;
            }),

            getSubsitePath: (async function () {
                var url = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_SUBSITE_PATH"));
                if (!url) {
                    logHelper.logError("Subsite path not set");
                    return false
                }
                return url;
            }),

            getHomePageUrl: (async function () {
                var url = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_HOMEPAGE_URL"));
                if (!url) {
                    logHelper.logError("Homepage Url not set");
                    return false
                }
                return url;
            }),

            //Cache Logging Flag
            setLoggingFlag: (async function (flag) {
                localStorage.setItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"), flag);
                logHelper.logDebug("brandServices.js", "setLoggingFlag: Logging flag cached", overrideDebugForFile);
                return true;
            }),

            getLoggingFlag: (async function () {
                var loggingFlag = localStorage.getItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"));
                if (!loggingFlag) {
                    logHelper.logError("getLoggingFlag: Logging flag not set");
                    return false
                }
                return loggingFlag;
            }),

            //Cache Host Url
            setsiteCollectionUrl: (async function (sharePointBaseUrl) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SITE_COLLECTION_URL"), sharePointBaseUrl);
                logHelper.logInfo("setsiteCollectionUrl: Host Web Url cached");
                return true;
            }),

            getsiteCollectionUrl: (async function () {
                var sharePointBaseUrl = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_SITE_COLLECTION_URL"));
                if (!sharePointBaseUrl) {
                    logHelper.logError("getsiteCollectionUrl: Host Web Url not set");
                    return null;
                }
                return sharePointBaseUrl;
            }),

            //Cache BrandId
            setBrandId: (async function (brandId) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"), brandId);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_READY"), false);
                logHelper.logDebug("brandServices.js", "setBrandId: BrandId: " + brandId + " has been cached", overrideDebugForFile);
                return true;
            }),

            //Get the current brandId
            getBrandId: (async function () {
                var brandId = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"));
                if (!brandId) {
                    brandId = '380fb82e-9c79-4903-a65a-425f551a84b1'; //Sonic

                }

                return brandId;
            }),

            //Get the current brand readiness flag
            getBrandReady: (async function () {
                var isBrandReady = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_READY"));
                return isBrandReady ?? false;
            }),

            //Cache current brand name
            setBrandName: (async function (brandNameToSet) {


                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRAND_NAME"), brandNameToSet);
                logHelper.logDebug("brandServices.js", "setBrandName: Brand Name: " + brandNameToSet + " has been cached", overrideDebugForFile);
                return true;
            }),

            //Get the current brand name
            getBrandName: (async function () {
                var brandName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRAND_NAME"));
                if (!brandName) {
                    logHelper.logError("getBrandName: Brand has not been cached!");
                    return null;
                }
                return brandName;
            }),

            //Cache currentBrand Info
            setBrandInfo: (async function (companyInfo) {

                var legalName = companyInfo.companyLegalName;
                var shortName = companyInfo.companyShortName;
                var address = companyInfo.companyStreetAddress;
                var cityState = companyInfo.companyCityState;
                var zipCode = companyInfo.companyZipCode;
                var phoneNumber = companyInfo.companyPhone;
                var copyright = companyInfo.copyright;

                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME"), legalName);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_SHORT_NAME"), shortName);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE"), cityState);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS"), address);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP"), zipCode);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_PHONE"), phoneNumber);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COPYRIGHT"), copyright);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_READY"), true);
                logHelper.logDebug("brandServices.js", "setBrandInfo: Brand Info cached", overrideDebugForFile);
                return true;
            }),

            getBrandInfo: (async function () {
                var brandInfo = [{
                    "legalName": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME")),
                    "shortName": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_SHORT_NAME")),
                    "cityState": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE")),
                    "address": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS")),
                    "zipCode": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP")),
                    "phone": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_PHONE")),
                    "copyright": localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COPYRIGHT"))
                }];
                logHelper.logDebug("brandServices.js", brandInfo, overrideDebugForFile);
                // var legalName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME"));
                return brandInfo;
            }),


            //Cache current brand config file path
            setBrandConfigFilePath: (async function (configFilePath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE_PATH"), configFilePath);
                logHelper.logDebug("brandServices.js", " setBrandConfigFilePath: Brand config file path set", overrideDebugForFile);
                return true;
            }),

            //Get the current brand JSON config file path
            getBrandConfigFilePath: (async function () {
                var configFilePath = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE_PATH"));
                if (!configFilePath) {
                    logHelper.logError("getBrandConfigFilePath: Error loading Brand config file path!")
                    return null;
                }
                return configFilePath;
            }),

            //Cache current brand JSON config file
            setBrandConfigFile: (async function (configFile) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"), configFile);
                logHelper.logDebug("brandServices.js", "setBrandConfigFile: Brand config.file loaded", overrideDebugForFile);
                return true;
            }),
            //Get the current brand config file
            getBrandConfigFile: (async function () {
                var configFile = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"));
                if (!configFile) {
                    logHelper.logError("getBrandConfigFile: Error loading Brand config file!")
                    return null;
                }
                return configFile;
            }),

            //Cache current brand base folder
            setBrandBaseFolder: (async function (folderPath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_BASE_FOLDER"), JSON.stringify(folderPath));
                logHelper.logDebug("brandServices.js", "setBrandBaseFolder: Brand base folder path set.", overrideDebugForFile);
                return true;
            }),

            //Get the current brand base folder
            getBrandBaseFolder: (async function () {
                var folderPath = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_BASE_FOLDER"));
                if (!folderPath) {
                    logHelper.logError("getBrandBaseFolder: Error loading Brand base folder!")
                    return null;
                }
                return folderPath;
            }),

            //Cache images folder file path
            setBrandImagesFolder: (async function (folderPath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_IMAGES_FOLDER"), JSON.stringify(folderPath));
                logHelper.logDebug("brandServices.js", "setBrandImagesFolder: Brand images folder path set", overrideDebugForFile);
                return true;
            }),
            //Get the current brand images folder
            getBrandImagesFolder: (async function () {
                var folderPath = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_IMAGES_FOLDER"));
                if (!folderPath) {
                    logHelper.logError("getBrandImagesFolder: Error loading Brand images folder path!")
                    return null;
                }
                return folderPath;
            }),

            //Cache Brand Logo             
            setBrandLogo: (async function (filePath, description) {

                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_FILE_PATH"), filePath);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_DESCRIPTION"), description);
                return true;
            }),
            //Get the current brand logo file path
            getBrandLogoFilePath: (async function () {
                var logoFilePath = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_FILE_PATH"));
                logHelper.logDebug("brandServices.js", logoFilePath, overrideDebugForFile);
                if (!logoFilePath) {
                    logHelper.logError("getBrandLogoFilePath: Logo File Path not set");
                    return false
                }
                return logoFilePath;
            }),

            //Get the current brand logo file path
            getBrandLogoDescription: (async function () {
                var description = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_DESCRIPTION"));
                logHelper.logDebug("brandServices.js", description, overrideDebugForFile);
                if (!description) {
                    logHelper.logError("getBrandLogoDescription: Logo Description not set");
                    return false
                }
                return description;
            }),

            getSiteTitle: (async function () {
                var siteTitle = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"));
                logHelper.logInfo("Get current site title: " + siteTitle);
                if (!siteTitle) {
                    logHelper.logError("getSiteTitle: Site Title not set");
                    return false
                }
                return siteTitle;
            }),
            //Set the current brand page and site titles..... check the tab to verify it updated


            setText: (async function (selector, text) {

                logHelper.logDebug("brandServices.js", "Selector: " + selector + " - " + " Text: " + text, overrideDebugForFile);
                const title = dom.byId(selector);
                if (!title) {
                    return false;
                }
                title.innerText = text;
                return true;
            }),

            setImage: (async function (selector, sourceText, altText) {

                logHelper.logDebug("brandServices.js", "Selector: " + selector + " - " + " Text: " + altText, overrideDebugForFile);
                const div = dom.byId(selector);
                if (!div) {
                    return false;
                }
                div.src = sourceText;
                div.alt = altText;
                return true;
            }),

            replaceLinkHref: (async function (selector, newHref) {
                logHelper.logDebug("brandServices.js", "Replace Link: Selector: " + selector + " , NewHRef: " + newHref, overrideDebugForFile);
                const link = dom.byId(selector);
                if (!link) {
                    return false;
                }
                link.href = newHref;
                logHelper.logDebug("brandServices.js", "Replace Link: Selector: " + selector + " , NewHRef: " + newHref);
                return true;
            }),
            setPageTitle: (async function () {
                const getPageTitleFn = this.getPageTitle.bind(this);


                let retVal = false;
                logHelper.logDebug("brandServices.js", `setPageTitle: Try to set the app title`, overrideDebugForFile);
                const setTextFn = this.setText.bind(this);
                try {
                    getPageTitleFn().then(async (selector) => {
                        var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
                        var siteText = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"));
                        retVal = await setTextFn(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"), text);
                        logHelper.logInfo('Page Title set to: ' + text);
                        retVal = await setTextFn(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"), siteText);
                        logHelper.logInfo('Site Title set to: ' + siteText);
                    });
                    return retVal;
                } catch (error) {
                    logHelper.logDebug("brandServices.js", error, overrideDebugForFile);
                }

            }),

            //Set the current brand css in the index.aspx
            setBrandCSS: (async function (link) {
                let links = document.getElementsByTagName('link');
                for (let i = 0; i < links.length; i++) {
                    if (links[i].getAttribute('id') === constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE")) {
                        let href = links[i].getAttribute('href');

                        let newHref = link + '?version='
                            + new Date().getMilliseconds();

                        links[i].setAttribute('href', newHref);

                        logHelper.logDebug("brandServices.js", "href: " + href, overrideDebugForFile);
                        logHelper.logDebug("brandServices.js", "newHref: " + newHref, overrideDebugForFile);
                    }
                }
            }),

            //Refresh the CSS after loading a new css theme file
            refreshCSS: (async function () {
                let links = document.getElementsByTagName('link');
                for (let i = 0; i < links.length; i++) {
                    if (links[i].getAttribute('id') === constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE")) {
                        let href = links[i].getAttribute('href');

                        let newHref = href + '?version='
                            + new Date().getMilliseconds();

                        links[i].setAttribute('href', newHref);

                        logHelper.logDebug("brandServices.js", "href: " + href, overrideDebugForFile);
                        logHelper.logDebug("brandServices.js", "newHref: " + newHref, overrideDebugForFile);
                    }
                }
            }),

            //sets the current time in the header
            setCurrentTime: (async function () {
                let currentTime = new Date();
                let timeNow = currentTime.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                const dayName = currentTime.toLocaleString('en-us', { weekday: 'long' });
                const pluralRules = new Intl.PluralRules('en-US', {
                    type: 'ordinal'
                })
                const suffixes = {
                    'one': 'st',
                    'two': 'nd',
                    'few': 'rd',
                    'other': 'th'
                }
                const convertToOrdinal = (number) => `${number}${suffixes[pluralRules.select(number)]}`
                // At this point:
                // convertToOrdinal("1") === "1st"
                // convertToOrdinal("2") === "2nd"
                // etc.

                const extractValueAndCustomizeDayOfMonth = (part) => {
                    if (part.type === "day") {
                        return convertToOrdinal(part.value);
                    }
                    return part.value;
                };
                const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                let mid = longEnUSFormatter.formatToParts(currentTime)
                    .map(extractValueAndCustomizeDayOfMonth)
                    .join("");

                var displayText = dayName + ", " + mid + " - " + timeNow;
                dom.byId("current-date").innerText = displayText;
            }),

            //Load the current brand's css theme file to the <head> section of the index.aspx page
            loadBrandStyleSheet: (async function (newHref) {

                let link = domConstruct.create("link", { id: constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE"), rel: "stylesheet", type: "text/css", href: newHref });
                document.head.append(link);

                return true;

            }),

            //Set the current brand's information
            setCompanyInfo: (async function () {
                const getBrandInfoFn = this.getBrandInfo.bind(this);
                const getBrandNameFn = this.getBrandName.bind(this);
                const getBrandLogoFilePathFn = this.getBrandLogoFilePath.bind(this);
                const getBrandLogoDescriptionFn = this.getBrandLogoDescription.bind(this);
                const getSharePointUrlByKeyFn = this.getSharePointUrlByKeyAsync.bind(this);
                const replaceLinkHrefFn = this.replaceLinkHref.bind(this);
                let retVal = false;
                logHelper.logDebug("brandServices.js", `setCompanyInfo: Try to set the company header info`, overrideDebugForFile);
                const setTextFn = this.setText.bind(this);

                try {
                    getBrandInfoFn().then((res) => res).then(async (brandInfo) => {

                        addressText = brandInfo[0].address;
                        addressSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS");
                        cityStateText = brandInfo[0].cityState + ' ' + brandInfo[0].zipCode;
                        cityStateSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE");
                        //zipText = brandInfo[0].zipCode;
                        //zipSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP");
                        phoneText = brandInfo[0].phone;
                        phoneSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_PHONE");
                        legalNameText = brandInfo[0].legalName;
                        legalNameSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME");
                        shortNameText = brandInfo[0].shortName;
                        shortNameSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_SHORT_NAME");
                        copyrightText = brandInfo[0].copyright;
                        copyrightSelector = constants("LOCAL_STORAGE_CURRENT_COPYRIGHT");
                        logHelper.logDebug("brandServices.js", "Trying to retrieve the Brand Info", overrideDebugForFile);
                        logHelper.logDebug("brandServices.js", brandInfo[0].address, overrideDebugForFile);
                        //  var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
                        retVal = await setTextFn(addressSelector, addressText);
                        retVal = await setTextFn(cityStateSelector, cityStateText);
                        //retVal = await setTextFn(zipSelector, zipText);
                        retVal = await setTextFn(phoneSelector, phoneText);
                        //  retVal = await setTextFn(legalNameSelector, legalNameText);
                        //  retVal = await setTextFn(shortNameSelector, shortNameText);
                        //  retVal = await setTextFn(copyrightSelector, copyrightText);
                        retVal = await getBrandNameFn().then(async (respB) => {
                            brandNameText = respB;
                            brandNameSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_NAME");
                            retVal = await setTextFn(brandNameSelector, brandNameText);
                        });

                        //Set Home Link Url
                        retVal = await getSharePointUrlByKeyFn("homepageUrl").then(async (url) => {
                            var newUrl = url;
                            logHelper.logInfo("after changing Home link" + url);
                            await replaceLinkHrefFn("currentHomeUrl", newUrl);
                        });

                        retVal = await getBrandLogoFilePathFn()
                            .then(async (respC) => {
                                const logoFilePath = respC;
                                var logoDescription = null;
                                await getBrandLogoDescriptionFn().then((respD) => {
                                    logoDescription = respD;
                                });

                                logHelper.logDebug("brandServices.js", "Logo File Path: " + logoFilePath, overrideDebugForFile);
                                logHelper.logDebug("brandServices.js", "Logo Description: " + logoDescription, overrideDebugForFile);
                                //    // JSON.stringify(respC)
                                //    var jObject = new JSONObject(respC);
                                logHelper.logDebug("brandServices.js", respC, overrideDebugForFile);
                                const getBrandImagesFolderFn = this.getBrandImagesFolder.bind(this);
                                const setImageFn = this.setImage.bind(this);
                                const getBrandCssThemeFilePathFn = this.getBrandCssThemeFilePath.bind(this);
                                const replaceLinkHrefFn = this.replaceLinkHref.bind(this);
                                const setBrandCSSFn = this.setBrandCSS.bind(this);
                                const refreshCSSFn = this.refreshCSS.bind(this);
                                const loadBrandStyleSheetFn = this.loadBrandStyleSheet.bind(this);
                                const setCurrentTimeFn = this.setCurrentTime.bind(this);
                                getBrandImagesFolderFn().then(async (fldr) => {
                                    imagesFolderPath = JSON.parse(fldr);
                                    logHelper.logDebug("brandServices.js", "Images Folder Path: " + imagesFolderPath, overrideDebugForFile);
                                    var selector = constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO");
                                    var description = logoDescription;
                                    var logo = imagesFolderPath + logoFilePath;
                                    await setImageFn(selector, logo, description);
                                    logHelper.logInfo("Setting Logo: " + logo);

                                });
                                getBrandCssThemeFilePathFn().then(async (path) => {
                                    themeFilePath = JSON.parse(path);
                                    var divSelector = constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE");
                                    var whatChanged = await loadBrandStyleSheetFn(themeFilePath);
                                    await setCurrentTimeFn();
                                    logHelper.logDebug("brandServices.js", "Link changed? " + whatChanged, overrideDebugForFile);
                                    return true;
                                })

                            })

                        return retVal;
                    })
                }
                catch (error) {
                    logHelper.logDebug("brandServices.js", error, overrideDebugForFile);
                }

            }),


            getReports: (async function (brandId) {
                var url = "http://localhost:3000/BrandLinkMapping?BrandId=" + brandId;
                var reports = store.query(url).then(async (res) => {
                    logHelper.logDebug("brandServices.js", res, overrideDebugForFile);
                });
                logHelper.logDebug("brandServices.js", reports, overrideDebugForFile);
            }),

            discardCircularRefs: (function (obj) {
                document.querySelectorAll('iframe').forEach(iframe => iframe.remove());

                let cache = [];
                const globals = JSON.stringify(obj, (key, value) => {
                    if (typeof value === 'object' && value !== null) {

                        // Circular reference found, discard key
                        if (cache.indexOf(value) !== -1) return;

                        // Store value in our collection
                        cache.push(value);
                    }

                    return value;
                });

                cache = null; // Enable garbage collection
                console.log(globals);
            })
            ,
            stringifyWithCircularRefs: (function (obj, space) {
                const refs = new Map();
                const parents = [];
                const path = ["this"];

                function clear() {
                    refs.clear();
                    parents.length = 0;
                    path.length = 1;
                }

                try {
                    parents.push(obj);
                    return JSON.stringify(obj, checkCircular, space);
                } finally {
                    clear();
                }


                function updateParents(key, value) {
                    var idx = parents.length - 1;
                    var prev = parents[idx];
                    if (prev[key] === value || idx === 0) {
                        path.push(key);
                        parents.push(value);
                    } else {
                        while (idx-- >= 0) {
                            prev = parents[idx];
                            if (prev[key] === value) {
                                idx += 2;
                                parents.length = idx;
                                path.length = idx;
                                --idx;
                                parents[idx] = value;
                                path[idx] = key;
                                break;
                            }
                        }
                    }
                }

                function checkCircular(key, value) {
                    if (value != null) {
                        if (typeof value === "object") {
                            if (key) {
                                logHelper.logDebug("brandServices.js", "Key: " + key, overrideDebugForFile);
                                updateParents(key, value);
                            }

                            let other = refs.get(value);
                            if (other) {
                                return '[Circular Reference]' + other;
                            } else {
                                refs.set(value, path.join('.'));
                            }
                        }
                    }

                    logHelper.logDebug("brandServices.js", "Key: " + key + " | Value: " + value, overrideDebugForFile);
                    return value;
                }

                // stringifyWithCircularRefs: (function(obj, space) {

                //     function clear() {
                //         refs.clear();
                //         parents.length = 0;
                //         path.length = 1;
                //     }

                //     try {
                //         parents.push(obj);
                //         return JSON.stringify(obj, checkCircular, space);
                //     } finally {
                //         clear();
                //     }
                // })
            }
            )



        }
    })