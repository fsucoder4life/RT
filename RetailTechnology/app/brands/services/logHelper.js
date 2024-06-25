/**
 * LogHelper is used to log info, warnings, and errors to the console - **IF logging is true in config.js**
 * This will allow for verbose logging to be turned on or off during development and production
 **/
define([
    "app/brands/infrastructure/models/constants",
    "dojo/_base/lang"
], function (constants, lang) {
    return {
        consoleLogging: (async function () {
            const loggingFlag = localStorage.getItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING")) === "true";
            return loggingFlag;
        }),

        logInfo: (async function (info) {
            const consoleLoggingFn = this.consoleLogging.bind(this);
            consoleLoggingFn().then((consoleLogging) => {
                if (consoleLogging) {          
                    try {
                        //console.log(info);
                         var myTime = new Date();
                    var newInfo = `${info} : ${myTime.toISOString()}`;
                    console.log(newInfo);
                    } catch (error) {
                        console.log(error);
                    }          
                   
                }
            })
        }),
        logWarning: (async function (warning) {
            const consoleLoggingFn = this.consoleLogging.bind(this);
            consoleLoggingFn().then((consoleLogging) => {
                if (consoleLogging !== 'undefined' || consoleLogging) {
                    console.warn(warning);
                }
            })
        }),
        logError: (async function (error, data) {

            if (typeof (data) === "undefined") {
                console.error(error);
            }
            else {
                console.error(error, data);
            }
        }),

        whatItIs: (async function (object) {
            var stringConstructor = "test".constructor;
            var arrayConstructor = [].constructor;
            var objectConstructor = ({}).constructor;

            function whatIsIt(object) {
                if (object === null) {
                    return "null";
                }
                if (object === undefined) {
                    return "undefined";
                }
                if (object.constructor === stringConstructor) {
                    return "String";
                }
                if (object.constructor === arrayConstructor) {
                    return "Array";
                }
                if (object.constructor === objectConstructor) {
                    return "Object";
                }
                {
                    return "unknown";
                }
            }

        }),

        log: (async function (logType, text) {
            const logInfoFn = this.logInfo.bind(this);
            const consoleLoggingFn = this.consoleLogging.bind(this);
           
            consoleLoggingFn().then((consoleLogging) => {
                const logInfoFn = this.logInfo.bind(this);
                const logErrorFn = this.logError.bind(this);
                const logWarningFn = this.logWarning.bind(this);

                //console.log("Console Logging: " + consoleLogging);
                if (consoleLogging === 'undefined' || consoleLogging === false) {
                    logInfoFn("Console logging is currently disabled");
                }
                else {



                    switch (logType) {
                        case "warning":
                            logWarningFn(text);
                        case "info":
                            console.log("Incoming: " + text);
                            logInfoFn(text);
                        case "error":
                            logErrorFn(text);
                       
                    }
                }
            });

        }),



    }
}
);