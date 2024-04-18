
    define([
        "app/brands/infrastructure/config/setBrandSettings",
        "app/brands/infrastructure/models/constants",
        "app/brands/infrastructure/config/setupConfig",
        "app/brands/services/registerBrandTheme",
        "app/brands/services/setBrandLabels"
], function(setBrandSettings,constants,setupConfig,registerBrandTheme){     
    
        
        const fileLoad = (async () => {
            var url = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"));
            console.log(`Try to fetch the brand json file from ${url}`);
            await fetch(url)
                .then((res) => res.json())
                .then((json) => {
                //store the partners.json 
                    localStorage.setItem(constants("LOCAL_STORAGE_ALL_PARTNERS"),JSON.stringify(json)); 
                    
                })
                .then((setupConfig) => { 
                   //Retrieve the brand config
                })
                .then((registerBrandTheme) => {
                    //Register the brand theme
                })
                .then((setBrandLabels) => {

                })
                .catch((err) => {
                    console.log('File Load Error!', {
                        error: "Error fetching the Brand config file.",
                        details: err,
                    });
                });
        })();
       
    },
    
);