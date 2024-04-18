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
        return {
            //Start App
            startApp: (async function () {
                const setBrandIdFn = this.setBrandId.bind(this);
                const params = new Proxy(new URLSearchParams(window.location.search), {
                    get: (searchParams, prop) => searchParams.get(prop),
                });
                let retVal = false;
                let brandId = params.brandId;
                if (!brandId) {
                    brandId = '380fb82e-9c79-4903-a65a-425f551a84b1'; //Sonic
                }
                //Don't use logHelper yet, it hasn't been loaded
                logHelper.logInfo("Start app for brandId: " + brandId);
                retVal = await setBrandIdFn(brandId);

                return retVal;

            }),

            //Load Base config.json
            loadConfigFile: (async function () {
                const setLoggingFlagFn = this.setLoggingFlag.bind(this);
                const setAllBrandsFileFn = this.setAllBrandsFile.bind(this);
                let retVal = false;
                var url = "config.json";
                var brandsUrl = "app/brands/brands.json";
                console.log(`Try to fetch the config.json file from ${url}`);
                await fetch(url)
                    .then((res) => res.json())
                    .then(async (json) => {
                        localStorage.clear();
                        //store the config.json 
                        localStorage.setItem(constants("LOCAL_STORAGE_APP_CONFIG"), JSON.stringify(json));
                        console.log("config.json loaded")

                        var consoleLogging = (json.consoleLogging === 'true');
                        retVal = await setLoggingFlagFn(consoleLogging);
                        if (consoleLogging) {
                            console.log("loadConfigFile: Verbose logging has been enabled");
                        }
                        else {
                            console.log("loadConfigFile: Verbose logging is disabled, no further logHelper events will display.")
                        }

                        //localStorage.setItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"),consoleLogging)
                    }).then(async () => {
                        await fetch(brandsUrl)
                            .then((brandRes) => brandRes.json())
                            .then(async (json) => {
                                retVal = setAllBrandsFileFn(json).then(() => {
                                    logHelper.logInfo("loadConfigFile: All Brands File cached");

                                });

                            })
                        retVal = true;
                    })
                    .catch((err) => {
                        logHelper.logInfo('loadConfigFile: File Load Error!', {
                            error: "Error fetching the config file.",
                            details: err,
                        });
                    });

                return retVal;
            }),

            //Load Brands File
            // loadAllBrandsFile: (async function () {
            //     const getAllBrandsFilePathFn = this.getAllBrandsFilePath.bind(this);
            //     const setAllBrandsFileFn = this.setAllBrandsFile.bind(this);
            //     const setCurrentBrandConfigFn = this.setCurrentBrandConfig.bind(this);
            //     var url = null;
            //     var urlFn = await getAllBrandsFilePathFn()
            //         .then((value) => {
            //             logHelper.logInfo("loadAllBrandsFile: AllBrandsFilePath: " + value);
            //             url = value

            //             logHelper.logInfo(`loadAllBrandsFile: Try to fetch the brands json file from ${url}`);
            //             fetch(url)
            //                 .then(async (res) => {
            //                     logHelper.logInfo(res.json);
            //                     logHelper.logInfo("setup all brands file");
            //                     await setAllBrandsFileFn(JSON.stringify(res.json));

            //                 })
            //                 .catch((err) => {
            //                     logHelper.logError('loadAllBrandsFile: File Load Error!', {
            //                         error: "Error fetching the Brand config file.",
            //                         details: err,
            //                     });
            //                 });
            //         }
            //         );

            // }),

            //Setup Brand Config
            setCurrentBrandConfig: (async function () {


                logHelper.logInfo("setCurrentBrandConfig: Setting up Brand Configuration");
                //Setup function bindings
                const getAllBrandsFileFn = this.getAllBrandsFile.bind(this);
                const getBrandIdFn = this.getBrandId.bind(this);
                const setBrandConfigFilePathFn = this.setBrandConfigFilePath.bind(this);
                const setBrandNameFn = this.setBrandName.bind(this);
                const setBrandBaseFolderFn = this.setBrandBaseFolder.bind(this);
                const setBrandImagesFolderFn = this.setBrandImagesFolder.bind(this);
                const setCurrentBrandConfigSettingsFn = this.setCurrentBrandConfigSettings.bind(this);
                const setBrandCssThemeFilePathFn = this.setBrandCssThemeFilePath.bind(this);
                await getBrandIdFn().then(async (val) => {

                    var brandId = val;
                    logHelper.logInfo("setCurrentBrandConfig: Brand Id: " + brandId);
                    var allBrands = await getAllBrandsFileFn().then(async (json) => {
                        //Pull the allBrands.json from local storage and parse it

                        var allBrandsJson = json;//JSON.parse(json);
                        logHelper.logInfo("AllBrandsJson: " + allBrandsJson);
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
                        logHelper.logInfo("setCurrentBrandConfig: End of Setup Config");
                        logHelper.logInfo("setCurrentBrandConfig: Next up, register the Brand's theme");
                        return retVal;
                    });
                })
                //localStorage.getItem(constants("LOCAL_STORAGE_ALL_BRANDS"));
                return true;
            }),

            //Load Brand Config File
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
                        const setEmailDistributionDetailsFn = this.setEmailDistributionDetails.bind(this);
                        const setQuoteDetailsFn = this.setQuoteDetails.bind(this);
                        const setSharePointUrlsFn = this.setSharePointUrls.bind(this);
                        const setHomeUrlFn = this.setHomeUrl.bind(this);

                        const setBrandLogoFn = this.setBrandLogo.bind(this);
                        const setBrandInfoFn = this.setBrandInfo.bind(this);
                        const queryEmailDistributionListFn = this.queryEmailDistributionList.bind(this);


                        var queryText = `[*]`
                        await getBrandConfigFilePathFn().then((value) => {
                            var url = value;
                            logHelper.logInfo("setCurrentBrandConfigSettings: Url: " + url);
                            logHelper.logInfo(`setCurrentBrandConfigSettings: Try to fetch the current brand's settings.json file from ${url}`);
                            fetch(url)
                                .then((res) => res.json())
                                .then(async (json) => {
                                    //store the config.json 
                                    logHelper.logInfo("setCurrentBrandConfigSettings: Set the current Theme Config File to cache");
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
                                    //Brand specific SharePoint Base Url; will be used to replace placeholders to build the some of the SharePoint Urls
                                    const hostWebUrl = SPUrls["hostWebUrl"];
                                    const sharePointBaseUrl = SPUrls["sharePointBaseUrl"];
                                    var stringified = JSON.stringify(SPUrls);

                                    //replace placeholders with actual values
                                    stringified = stringified.replace(/__sharePointBaseUrl__/g, sharePointBaseUrl);
                                    //json has to be parsed and stringified each time you do a replace or the next replace won't work
                                    SPUrls = JSON.parse(stringified);
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
                                    var logo = item[9];
                                    var logoDescription = logo["logo"].description;
                                    var logoFilePath = logo["logo"].uri;

                                    var retVal = false;
                                    logHelper.logInfo("Is it here");
                                    retVal = await cachePageTitleFn(pageTitle, siteTitle);


                                    retVal = await setHomeUrlFn(homeUrl);

                                    retVal = await setBrandLogoFn(logoFilePath, logoDescription);
                                    retVal = await setBrandInfoFn(companyInfo);
                                    logHelper.logInfo("Before looping through sharePointUrls");
                                    logHelper.logInfo(sharePointBaseUrl);

                                    if (SPUrls) {
                                        retVal = await setSharePointUrlsFn(hostWebUrl, sharePointBaseUrl, apipdfGenerator, formPOSSurvey, listCombinedSchedule, listConstructionCalls, listConstructionCallsDispForm,
                                            listInstallQuoteGen, listLevel2010Orders, listPurchaseOrders, siteAssetsRenameListFileAttachments, sitePageDailyUpdates, sitePageMasterPortal, sitePagePaymentSignOff,
                                            sitePagePSOSurvey, sitePagePSOViewAll, sitePagePSOViewAll, sitePagePSOViewAllSurvey, sitePagePSOCheckin, sitePagePSODailyUpdate,
                                            sitePageProjectReviewPayMod, sitePageRetailTech, sitePageRetailTechSearch, sitePageRetailTechPaymentModProjectDates, sitePageRetailTechStoreConfigurationSearch)
                                            .then(async () => {
                                                //Email array from SharePoint Online | EmailDistributionList                            
                                    var emailDistributionDetails = queryEmailDistributionListFn(brandId);
                                    retVal = await setEmailDistributionDetailsFn(emailDistributionDetails);
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

            //Brand Theme
            registerBrandTheme: (async function () {
                const setPageTitleFn = this.setPageTitle.bind(this);
                const getBrandReadyFn = this.getBrandReady.bind(this);
                const setCompanyInfoFn = this.setCompanyInfo.bind(this);


                getBrandReadyFn().then(async (isReady) => {
                    logHelper.logInfo("I am in registerBrandTheme, is the brand ready yet? " + isReady);
                    let retVal = false;
                    retVal = await setPageTitleFn();
                    retVal = await setCompanyInfoFn();
                });


            }),





            //Cache Brands CssFile Path
            setBrandCssThemeFilePath: (async function (filePath) {

                try {

                    localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE_PATH"), JSON.stringify(filePath));
                    await logHelper.logInfo("setBrandCssThemeFilePath: Brand Css File Path set");

                    return true;
                } catch (error) {
                    return false;
                }


            }),

            getBrandCssThemeFilePath: (async function () {
                var filePath = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE_PATH"));
                if (!filePath) {
                    logHelper.logError("getBrandCssThemeFilePath: Error locating the brand css theme file!");
                    return null;
                }
                return filePath;
            }),


            //Cache Brands File Path
            setAllBrandsFilePath: (async function () {

                try {
                    var filePath = 'app/brands/brands.json';
                    localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS_FILE_PATH"), filePath);
                    await logHelper.logInfo("setAllBrandsFilePath: All Brands File Path set");

                    return true;
                } catch (error) {
                    return false;
                }


            }),

            getAllBrandsFilePath: (async function () {


                logHelper.logInfo("getAllBrandsFilePath: getAllBrandsFilePath");
                var configFilePath = localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS_FILE_PATH"));
                if (!configFilePath) {
                    logHelper.logError("getAllBrandsFilePath: Error locating the brands.json config file!");
                    return null;
                }
                return configFilePath;


            }),

            //Cache Brands Config File
            setAllBrandsFile: (async function (json) {
                localStorage.setItem(constants("LOCAL_STORAGE_ALL_BRANDS"), JSON.stringify(json));
                logHelper.logInfo("setAllBrandsFile: Brands.json loaded into cache");
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

            //Cache Page Title
            cachePageAndSiteTitle: (async function (pageTitle, siteTitle) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"), pageTitle);
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"), siteTitle);

                logHelper.logInfo("cachePageAndSiteTitle: Page Title has been cached");
                return true;
            }),

            getPageTitle: (async function () {
                logHelper.logInfo("who called you?");
                var pageTitle = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));

                if (!pageTitle) {
                    logHelper.logError("getPageTitle: Page Title not set");
                    return false
                }
                return pageTitle;
            }),

            queryEmailDistributionList: (async function (brandId) {
                const getSharePointUrlByKeyFn = this.getSharePointUrlByKey.bind(this);
                const _brandId = brandId;
                logHelper.logInfo("queryEmailDistributionList (JSON): Get all the Email Distribution data for brandId: " + brandId);

                // Get all the Email Distribution data
                await getSharePointUrlByKeyFn("hostWebUrl")
                    .then((hostWebUrl) => {

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
                                            "/_api/web/lists/getbytitle('EmailDistributionList')/items",
                                        headers: { "Accept": "Application/json; odata=verbose" },
                                        method: "GET",
                                        success: successHandler,
                                        error: errorHandler
                                    }
                                );
                            }
                            // Function to handle the success event.                    
                            distributionList = [];
                            async function successHandler(data) {
                                //Ran out of time but change this to use getBrandId
                                var brandId = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"));
                                // let brandId = '';
                                // await getBrandIdFn().then(async (val) => {
                
                                //     brandId = val;
                                // })
                                //     .then(async () => {

                               
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
                                        row = {
                                            "brandId": brandId,
                                            "formType": formType,
                                            "distributionType": distributionType,
                                            "emails": {
                                                "emailTo": emailTo,
                                                "emailCC": emailCC
                                            }
                                        };
                                        
                                        distributionList.push(row);
                                    }

                                }
                                
                                return distributionList;
                            //})
                            }

                            // Function to handle the error event.
                            function errorHandler(data, errorCode, errorMessage) {
                                logHelper.logError("errorCode: " + errorCode);
                                logHelper.logError("errorMessage: " + errorMessage);
                            }


                        } catch (error) {
                            logHelper.logInfo(error);
                            return false;
                        }
                    });
            }),


            //Cache Email Distribution Details
            setEmailDistributionDetails: (async function (details) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS"), JSON.stringify(details));

                logHelper.logInfo("setEmailDistributionDetails: Email Distribution Details have been cached");
                return true;
            }),

            //Cache Quote Details
            setQuoteDetails: (async function (details) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_QUOTE_DETAILS"), JSON.stringify(details));

                logHelper.logInfo("setQuoterDetails: Quote Details have been cached");
                return true;
            }),
            getEmailDistributionDetails: (async function () {

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



            getEmailDistributionDetails: (async function (formType,distributionType) {
                const emailDistributionDetailsFn = this.getEmailDistributionDetails.bind(this);
                const emailDistributionDetails = await getEmailDistributionDetailsFn();
                const emailDetails = [];
                var queryText = `[?formType='${formType}&distributionType='${distributionType}']`
                var item = dojox.json.query(queryText, emailDistributionDetails);
                var emailTo = item[0]["emails"]["emailTo"];

                if (!emailTo) {
                    logHelper.logError("logHelper: emailTo has not been cached");
                    return false
                }
                emailDetails.push(emailTo);
                var emailCC = item[0]["emails"]["emailCC"];
                if (!emailCC) {
                    logHelper.logError("getEmailDistributionDetails: emailCC has not been cached");

                }
                emailDetails.push(emailCC);
                return emailDistributionDetails;
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
            setSharePointUrls: (async function (hostWebUrl, baseUrl, pdfApi, posSurvey, combSchedule, constrCalls, constrCalls2, quoteGen,
                levelOrders, dailyUpdates, siteAssets, masterPortal, surveySignOff, survSignOff2, surveySignOff3, surveySignOff4,
                surveySignOff5, surveySignOff6, projectReview, retailTech, retailTech2, retailTech3, retailTech4) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SHAREPOINT_HOST_WEB_URL"), hostWebUrl);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_SHAREPOINT_BASE_URL"), baseUrl);
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

                logHelper.logInfo("setSharePointUrls: SharePointUrls have been cached");
                return true;
            }),

            getSharePointUrlByKey: (async function (key) {
                if (!key) {
                    logHelper.logError("getSharePointUrlByKey: Invalid Constant Key!");
                    return false
                }
                logHelper.logInfo("getSharePointUrlByKey: Attempting to get key: " + key);
                var url = localStorage.getItem(key);
                logHelper.logInfo("getSharePointUrlByKey: localStorage result: " + url);
                if (!url) {
                    logHelper.logError("getSharePointUrlByKey: SharePoint Url not cached");
                    return false
                }
                return url;
            }),

            //Cache Home URL
            setHomeUrl: (async function (url) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BASE_URL"), url);
                logHelper.logInfo("setHomeUrl: BaseUrl has been cached");
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



            //Cache Logging Flag
            setLoggingFlag: (async function (flag) {
                localStorage.setItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"), flag);
                logHelper.logInfo("setLoggingFlag: Logging flag cached");
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

            //Cache BrandId
            setBrandId: (async function (brandId) {
                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"), brandId);
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_READY"), false);
                logHelper.logInfo("setBrandId: BrandId: " + brandId + " has been cached");
                return true;
            }),

            getBrandId: (async function () {
                var brandId = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRANDID"));
                if (!brandId) {
                    brandId = '380fb82e-9c79-4903-a65a-425f551a84b1'; //Sonic

                }

                return brandId;
            }),

            getBrandReady: (async function () {
                var isBrandReady = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_READY"));
                return isBrandReady ?? false;
            }),

            //Cache Brand Name
            setBrandName: (async function (brandNameToSet) {


                localStorage.setItem(constants("LOCAL_STORAGE_CURRENT_BRAND_NAME"), brandNameToSet);
                logHelper.logInfo("setBrandName: Brand Name: " + brandNameToSet + " has been cached");
                return true;
            }),

            getBrandName: (async function () {
                var brandName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_BRAND_NAME"));
                if (!brandName) {
                    logHelper.logError("getBrandName: Brand has not been cached!");
                    return null;
                }
                return brandName;
            }),

            //Cache Brand Info
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
                logHelper.logInfo("setBrandInfo: Brand Info cached");
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
                logHelper.logInfo(brandInfo);
                // var legalName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME"));
                // var shortName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_SHORT_NAME"));
                // var cityState = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE"));
                // var address = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS"));
                // var zipCode = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP"));
                // var phone = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_PHONE"));
                // var copyright = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COPYRIGHT"));
                // brandInfo.push(legalName);
                // brandInfo.push(shortName);
                // brandInfo.push(cityState);
                // brandInfo.push(address);
                // brandInfo.push(zipCode);
                // brandInfo.push(phone);
                // brandInfo.push(copyright);


                return brandInfo;
            }),


            //Cache Brand Config File Path
            setBrandConfigFilePath: (async function (configFilePath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE_PATH"), configFilePath);
                logHelper.logInfo(" setBrandConfigFilePath: Brand config file path set");
                return true;
            }),

            getBrandConfigFilePath: (async function () {
                var configFilePath = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE_PATH"));
                if (!configFilePath) {
                    logHelper.logError("getBrandConfigFilePath: Error loading Brand config file path!")
                    return null;
                }
                return configFilePath;
            }),

            //Cache Brand Config File
            setBrandConfigFile: (async function (configFile) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"), configFile);
                logHelper.logInfo("setBrandConfigFile: Brand config.file loaded");
                return true;
            }),

            getBrandConfigFile: (async function () {
                var configFile = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"));
                if (!configFile) {
                    logHelper.logError("getBrandConfigFile: Error loading Brand config file!")
                    return null;
                }
                return configFile;
            }),

            //Cache Base folder
            setBrandBaseFolder: (async function (folderPath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_BASE_FOLDER"), JSON.stringify(folderPath));
                logHelper.logInfo("setBrandBaseFolder: Brand base folder path set.");
                return true;
            }),

            getBrandBaseFolder: (async function () {
                var folderPath = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_BASE_FOLDER"));
                if (!folderPath) {
                    logHelper.logError("getBrandBaseFolder: Error loading Brand base folder!")
                    return null;
                }
                return folderPath;
            }),

            //Cache Images Folder Path
            setBrandImagesFolder: (async function (folderPath) {
                localStorage.setItem(constants("LOCAL_STORAGE_BRAND_IMAGES_FOLDER"), JSON.stringify(folderPath));
                logHelper.logInfo("setBrandImagesFolder: Brand images folder path set");
                return true;
            }),

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

            getBrandLogoFilePath: (async function () {
                var logoFilePath = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_FILE_PATH"));
                logHelper.logInfo(logoFilePath);
                if (!logoFilePath) {
                    logHelper.logError("getBrandLogoFilePath: Logo File Path not set");
                    return false
                }
                return logoFilePath;
            }),

            getBrandLogoDescription: (async function () {
                var description = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO_DESCRIPTION"));
                logHelper.logInfo(description);
                if (!description) {
                    logHelper.logError("getBrandLogoDescription: Logo Description not set");
                    return false
                }
                return description;
            }),









            //******************************************************************************************** */


            setText: (async function (selector, text) {

                logHelper.logInfo("Selector: " + selector + " - " + " Text: " + text);
                const title = dom.byId(selector);
                if (!title) {
                    return false;
                }
                title.innerText = text;
                return true;
            }),

            setImage: (async function (selector, sourceText, altText) {

                logHelper.logInfo("Selector: " + selector + " - " + " Text: " + altText);
                const div = dom.byId(selector);
                if (!div) {
                    return false;
                }
                div.src = sourceText;
                div.alt = altText;
                return true;
            }),

            replaceLinkHref: (async function (selector, newHref) {
                logHelper.logInfo("Replace Link: Selector: " + selector + " , NewHRef: " + newHref);
                const link = dom.byId(selector);
                if (!link) {
                    return false;
                }
                link.href = newHref;
                window.alert("Replace Link: Selector: " + selector + " , NewHRef: " + newHref);
                return true;
            }),

            setPageTitle: (async function () {
                const getPageTitleFn = this.getPageTitle.bind(this);


                let retVal = false;
                logHelper.logInfo(`setPageTitle: Try to set the app title`);
                const setTextFn = this.setText.bind(this);
                try {
                    getPageTitleFn().then(async (selector) => {
                        var text = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"));
                        var siteText = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"));
                        retVal = await setTextFn(constants("LOCAL_STORAGE_CURRENT_PAGE_TITLE"), text);
                        retVal = await setTextFn(constants("LOCAL_STORAGE_CURRENT_SITE_TITLE"), siteText);
                    });
                    return retVal;
                } catch (error) {
                    logHelper.logInfo(error);
                }

            }),

            setBrandCSS: (async function (link) {
                let links = document.getElementsByTagName('link');
                for (let i = 0; i < links.length; i++) {
                    if (links[i].getAttribute('id') === constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE")) {
                        let href = links[i].getAttribute('href');

                        let newHref = link + '?version='
                            + new Date().getMilliseconds();

                        links[i].setAttribute('href', newHref);

                        logHelper.logInfo("href: " + href);
                        logHelper.logInfo("newHref: " + newHref);
                    }
                }
            }),
            refreshCSS: (async function () {
                let links = document.getElementsByTagName('link');
                for (let i = 0; i < links.length; i++) {
                    if (links[i].getAttribute('id') === constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE")) {
                        let href = links[i].getAttribute('href');

                        let newHref = href + '?version='
                            + new Date().getMilliseconds();

                        links[i].setAttribute('href', newHref);

                        logHelper.logInfo("href: " + href);
                        logHelper.logInfo("newHref: " + newHref);
                    }
                }
            }),

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

            loadBrandStyleSheet: (async function (newHref) {

                let link = domConstruct.create("link", { id: constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE"), rel: "stylesheet", type: "text/css", href: newHref });
                // link.href = src;
                // link.rel = 'stylesheet';

                // link.onload = () => resolve(link);
                // link.onerror = () => reject(new Error(`Style load error for ${src}`));

                document.head.append(link);

                return true;

            }),

            setCompanyInfo: (async function () {
                const getBrandInfoFn = this.getBrandInfo.bind(this);
                const getBrandNameFn = this.getBrandName.bind(this);
                const getBrandLogoFilePathFn = this.getBrandLogoFilePath.bind(this);
                const getBrandLogoDescriptionFn = this.getBrandLogoDescription.bind(this);

                let retVal = false;
                logHelper.logInfo(`setCompanyInfo: Try to set the company header ino`);
                const setTextFn = this.setText.bind(this);

                try {
                    getBrandInfoFn().then((res) => res).then(async (brandInfo) => {

                        addressText = brandInfo[0].address;
                        addressSelector = constants("LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS");
                        cityStateText = `${brandInfo[0].cityState} ${brandInfo[0].zipCode}`;
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
                        logHelper.logInfo("Trying to retrieve the Brand Info");
                        logHelper.logInfo(brandInfo[0].address);
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

                        retVal = await getBrandLogoFilePathFn()
                            .then(async (respC) => {
                                const logoFilePath = respC;
                                var logoDescription = null;
                                await getBrandLogoDescriptionFn().then((respD) => {
                                    logoDescription = respD;
                                });

                                logHelper.logInfo("Logo File Path: " + logoFilePath);
                                logHelper.logInfo("Logo Description: " + logoDescription);
                                //    // JSON.stringify(respC)
                                //    var jObject = new JSONObject(respC);
                                logHelper.logInfo(respC);
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
                                    logHelper.logInfo("Images Folder Path: " + imagesFolderPath);
                                    var selector = constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO");
                                    var description = logoDescription;
                                    var logo = imagesFolderPath + logoFilePath;
                                    await setImageFn(selector, logo, description);

                                });
                                getBrandCssThemeFilePathFn().then(async (path) => {
                                    themeFilePath = JSON.parse(path);
                                    var divSelector = constants("LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE");
                                    var whatChanged = await loadBrandStyleSheetFn(themeFilePath);
                                    await setCurrentTimeFn();
                                    logHelper.logInfo("Link changed? " + whatChanged);
                                    return true;
                                })

                            })
                        //    var logoString = JSON.stringify(respC);
                        //    var logoJSON = JSON.parse(logoString);
                        //         logHelper.logInfo(logoString);
                        //         logHelper.logInfo(logoJSON);

                        //         logHelper.logInfo(logoJSON[0]);
                        //         //logHelper.logInfo(respC[0]["logo"]);
                        //     });
                        // .then((abc) => {
                        //     logHelper.logInfo("ResponseC: " + respC);
                        //     logHelper.logInfo("After Then: " + abc);
                        // }
                        // )
                        // .then(async (image) => {
                        //         logHelper.logInfo("Trying to get the image");
                        //         logHelper.logInfo(JSON.parse(image));
                        //         const setImageFn = this.setImage.bind(this);
                        //         var selector = constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO");
                        //         var description = image["logo"].description;
                        //         var logo = image["logo"].uri;
                        //         await setImageFn(selector, logo, description);
                        //     }) ;                             

                        return retVal;
                    })
                }
                catch (error) {
                    logHelper.logInfo(error);
                }

            }),


            getReports: (async function (brandId) {
                var url = "http://localhost:3000/BrandLinkMapping?BrandId=" + brandId;
                var reports = store.query(url).then(async (res) => {
                    logHelper.logInfo(res);
                });
                logHelper.logInfo(reports);
            })



        }
    })