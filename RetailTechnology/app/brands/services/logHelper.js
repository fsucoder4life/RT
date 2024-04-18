/**
 * Make this hold all the stuff that displays an issue so it can be re-used in multiple views
 **/
define([
    // "app/brands/services/logHelper",
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
                    var myTime = new Date();
                    var newInfo = `${info} : ${myTime.toISOString()}`;
                    console.log(newInfo);
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
            // var logFunct =
            //  lang.hitch(lInfo, (function (logType,text) {
            // var obj = this;
            //const consoleLogging = localStorage.getItem(constants("LOCAL_STORAGE_CONSOLE_LOGGING"))

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
                        // default:
                        //     console.log("Default Incoming: " + text);
                        //     logInfoFn(text);


                    }
                }
            });

        }),



    }
}
);