//function to replace the Brand related theme links in the application pages
    define([
        "app/brands/services/registerBrandTheme",
         "app/brands/infrastructure/models/constants",
         "app/brands/services/setBrandLabels",
         "app/brands/services/setAppTitle",
         "app/brands/services/setBrandLogo"
        ], function (registerBrandTheme,constants,setAppTitle,setBrandLabels) {
        
            const register = (async () => {
                
                console.log("Step 2: Inside registerBrandTheme Function");
                    var url = localStorage.getItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"));
                    console.log(`Try to fetch the brand's config json file from ${url}`);
                    await fetch(url)
                        .then((res) => res.json())
                        .then((json) => {
                        
                            localStorage.setItem(constants("LOCAL_STORAGE_BRAND_CONFIG_FILE"),JSON.stringify(json)); 
                            
                        })
                        .then((setupConfig) => { 
                            console.log("Inside 2nd Promise");
                            //setupConfig.setup();
                            console.log("Time to setup the Partner");
                        })
                        .then((setAppTitle) => {

                        })
                        .then((setBrandLabels) => {

                        })
                        .then((setBrandLogo) => {

                        })
                        .catch((err) => {
                            console.log('File Load Error!', {
                                error: "Error fetching the Brand config file.",
                                details: err,
                            });
                        });
                })();
            
            });
       
        