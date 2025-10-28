define([
    "app/brands/infrastructure/models/constants",
    "dojo/_base/lang"],
    function (lang) {

        var constants = {
            LOCAL_STORAGE_APP_CONFIG: "config.json",
            LOCAL_STORAGE_CONSOLE_LOGGING: "LogToConsole",
            LOCAL_STORAGE_BRAND_READY: "IsBrandReady",
            LOCAL_STORAGE_ALL_BRANDS: "AllBrands",
            LOCAL_STORAGE_ALL_BRANDS_FILE_PATH: "AllBrandsFilePath",
            LOCAL_STORAGE_CURRENT_BRANDID: "CurrentBrandId",
            LOCAL_STORAGE_CURRENT_BRAND_SETTINGS_FILE: "CurrentBrandSettingsFile",
            LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE_PATH: "CurrentBrandThemeStylesheetFilePath",
            LOCAL_STORAGE_CURRENT_BRAND_CSS_THEME_FILE: "CurrentBrandThemeStylesheet",
            LOCAL_STORAGE_CURRENT_COMPANY_NAME: "CurrentCompanyName",
            LOCAL_STORAGE_CURRENT_COMPANY_LEGAL_NAME: "CurrentCompanyLegalName",
            LOCAL_STORAGE_CURRENT_COMPANY_SHORT_NAME: "CurrentCompanyShortName",
            LOCAL_STORAGE_CURRENT_BRAND_NAME: "CurrentBrandName",
            LOCAL_STORAGE_CURRENT_COMPANY_ADDRESS: "CurrentCompanyAddress",
            LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE: "CurrentCompanyCityState",
            LOCAL_STORAGE_CURRENT_COMPANY_ZIP: "CurrentCompanyZip",
            LOCAL_STORAGE_CURRENT_COMPANY_PHONE: "CurrentCompanyPhone",
            LOCAL_STORAGE_CURRENT_COMPANY_LOGO: "CurrentCompanyLogo",
            LOCAL_STORAGE_CURRENT_COMPANY_LOGO_FILE_PATH: "LogoFilePath",
            LOCAL_STORAGE_CURRENT_COMPANY_LOGO_DESCRIPTION: "LogoDescription",
            LOCAL_STORAGE_CURRENT_SITE_TITLE: "applicationId",
            LOCAL_STORAGE_CURRENT_PAGE_TITLE: "CurrentAppTitle",
            LOCAL_STORAGE_CURRENT_BASE_URL: "BaseURL",
            LOCAL_STORAGE_BRAND_SITE_COLLECTION_URL: "sharePointBaseUrl",
            LOCAL_STORAGE_BRAND_SUBSITE_PATH: "subSitePath",
            LOCAL_STORAGE_BRAND_HOMEPAGE_URL: "homepageUrl",
            LOCAL_STORAGE_CURRENT_COPYRIGHT: "Copyright",
            LOCAL_STORAGE_BRAND_CONFIG_FILE: "ThemeConfigFile",
            LOCAL_STORAGE_BRAND_CONFIG_FILE_PATH: "CurrentBrandConfigFilePath",
            LOCAL_STORAGE_BRAND_IMAGES_FOLDER: "ThemeImagesFolder",
            LOCAL_STORAGE_BRAND_BASE_FOLDER: "ThemeBaseFolder",

            LOCAL_STORAGE_API_GENERATE_PDF: "api-pdfGenerator",
            LOCAL_STORAGE_BRAND_FORM_POSSURVEY: "form-POSSurvey",
            LOCAL_STORAGE_BRAND_LIST_LEVEL2010ORDERS: "list-Level2010Orders",
            LOCAL_STORAGE_BRAND_LIST_PURCHASE_ORDER: "list-PurchaseOrders",
            LOCAL_STORAGE_BRAND_LIST_CONSTRUCTION_CALLS: "list-ConstructionCalls",
            LOCAL_STORAGE_BRAND_LIST_CONSTRUCTION_CALLS_DISPFORM: "list-ConstrunctionCalls-DispForm",
            LOCAL_STORAGE_BRAND_LIST_COMBINED_SCHEDULE: "list-CombinedSchedule",
            LOCAL_STORAGE_BRAND_LIST_INSTALL_QUOTE_GEN: "list-InstallQuoteGen",
            LOCAL_STORAGE_BRAND_SITEASSETS_RENAME_LIST_FILE_ATTACHMENTS: "siteAssets-RenameListFileAttachments",
            LOCAL_STORAGE_BRAND_SITEPAGE_DAILY_UPDATES: "sitePage-DailyUpdates",
            LOCAL_STORAGE_BRAND_SITEPAGE_MASTER_PORTAL: "sitePage-MasterPortal",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF: "sitePage-PaymentSurveySignOff",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_SURVEY: "sitePage-PaymentSurveySignOff-survey",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_VIEW_PHOTOS_ALL_AREA_SURVEY_START: "sitePage-PaymentSurveySignOff-viewPhotosAllArea-surveyStart",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_VIEW_PHOTOS_ALL_AREA: "sitePage-PaymentSurveySignOff-viewPhotosAllArea",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_CHECKIN: "sitePage-PaymentSurveySignOff-checkin",
            LOCAL_STORAGE_BRAND_SITEPAGE_PAYMENT_SURVEY_SIGNOFF_DAILY_UPDATE: "sitePage-PaymentSurveySignOff-dailyUpdate",

            LOCAL_STORAGE_BRAND_SITEPAGE_PROJECTREVIEWPAYMOD: "sitePage-ProjectReviewPaymod",
            LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY: "sitePage-RetailTechnology",
            LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_SEARCH: "sitePage-RetailTechnology-search",
            LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_PAYMENT_MOD_PROJECT_DATES: "sitePage-RetailTechnology-paymentModProjectDates",
            LOCAL_STORAGE_BRAND_SITEPAGE_RETAILTECHNOLOGY_STORE_CONFIGURATION_SEARCH: "sitePage-RetailTechnology-storeConfigurationSearch",
            LOCAL_STORAGE_BRAND_EMAIL_DISTRIBUTION_DETAILS: "Brand-EmailDistributionDetails",
            LOCAL_STORAGE_BRAND_QUOTE_DETAILS: "Brand-QuoteDetails"




        };

        return function (cname) {
            if (typeof cname == "undefined") {
                // Copy of our protected object
                return lang.clone(constants);
            } else {
                // Value of a particular thing            
                if (constants.hasOwnProperty(cname)) {
                    return constants[cname];
                } else {
                    throw "Constant '" + cname + "' does not exist.";
                }
            }
        };

    });