//function to set the brand specifc page lables
define([
    "app/brands/services/setBrandLabels",
    "app/brands/infrastructure/models/constants",
    "app/brands/services/setText"
], function (setBrandLabels, constants, setText) {
    const setLabels = (async function (setText) {


        var currentCompanyName = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_NAME"));
        var companyCityState = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE"));
        var companyZipCode = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP"));
        var companyPhone = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_PPHONE"));
        var companyLogo = localStorage.getItem(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO"));


console.log("CurrentCompanyName: " + currentCompanyName);
       // var result = setText.set(constants("LOCAL_STORAGE_CURRENT_COMPANY_NAME"), currentCompanyName);
       // console.log("Result: " + result);
        // setText(constants("LOCAL_STORAGE_CURRENT_COMPANY_CITYSTATE"), companyCityState);
        // setText(constants("LOCAL_STORAGE_CURRENT_COMPANY_ZIP"), companyZipCode);
        // setText(constants("LOCAL_STORAGE_CURRENT_COMPANY_PPHONE"), companyPhone);
        // setText(constants("LOCAL_STORAGE_CURRENT_COMPANY_LOGO"), companyLogo);

    });

});
