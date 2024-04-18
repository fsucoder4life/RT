define(["app/brands/infrastructure/startup", "app/brands/infrastructure/models/constants"],function(constants) {
    const start = (() => {
        console.log("Start Here");
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        let brandId = params.brandId;
        loadPartnerFile();
        console.log(brandId);
        if (brandId == "" || brandId == null) {
            console.warn("Invalid url!");
            window.location.href = "";
        }
        else {
        }
    })();
});


define(function (appName) {
    return {
        getConfigFilePath: () => {
            const scriptPath = document.querySelector(`script[scr*="${appName}"]`);
        }
    }
});

define(function (configFilePath, runtimeConfigurationWindowKey) {
    return {
        loadConfigFile: () => {
            const headers = {
                'Content-Type': 'application/json; charset=utf-8',
                pragma: 'no-cache',
                'cache-control': 'no-cache',
            };
            return window
                .fetch(configFilePath, { headers })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`Status Code ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    (window)[runtimeConfigurationWindowKey] = data;
                    return data;
                })
                .catch((err) => {
                    console.log('Deployment Error!', {
                        error: "Error fetching the Brand config file.",
                        details: err,
                    });
                });
        }
    }
});