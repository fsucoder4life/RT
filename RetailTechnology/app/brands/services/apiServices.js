define(
    [ "app/brands/services/brandServices",       
        "app/brands/services/logHelper"
    ], function (brandServices, logHelper) {
        return {

            addToList: (async function (list, itemData){
                logHelper.logInfo("addToList (" + list + "): Adding data");
               
                await brandServices.getSharePointUrlByKeyFn("hostWebUrl")
                    .then((hostWebUrl) => {
                         fetch(`${hostWebUrl}/_api/web/lists/getbytitle('${list}')/items`, {
                            method: "POST",
                            headers: {
                              "Accept": "application/json;odata=verbose",
                              "Content-Type": "application/json;odata=verbose",
                              "X-RequestDigest": this.getFormDigest() // Get form digest for security
                            },
                            body: JSON.stringify(itemData)
                          })
                          .then(response => {
                            if (!response.ok) {
                              throw new Error(`Error adding item: ${response.statusText}`);
                            }
                            return response.json();
                          })
                          .then(data => {
                            logHelper.logInfo("Item added successfully:", data);
                          })
                          .catch(error => {
                            logHelper.logInfo("Error adding item:", error);
                          });
                        try {

                        } catch (error) {
                            logHelper.logInfo(error);
                            return false;
                        }
                    });
            }),
            getListItems: (async function (list, options) {
                //const getSharePointUrlByKeyFn = brandServices.getSharePointUrlByKey.bind(this);
                
                var queryUrl = hostWebUrl + "/_api/web/lists/getbytitle(" + list + ")/items";
                if (options){
                    if (options.query){                       
                        queryUrl = queryUrl + options.query;
                        logHelper.logInfo("queryList (" + list + "): Get all the data using query: " + options.query);
                    }
                    else{
                        logHelper.logInfo("queryList (" + list + "): Get all the data");
                    }
                }
                 
               

                // Get all the Email Distribution data
                await brandServices.getSharePointUrlByKeyFn("hostWebUrl")
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
                                        url: queryUrl,
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
                               
                                var jsonObject = JSON.parse(data.body);                               

                                var results = jsonObject.d.results;
                               
                                
                                return results;
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
            getListItemAttachments: (async function (list, itemId) {
                //const getSharePointUrlByKeyFn = brandServices.getSharePointUrlByKey.bind(this);
                
                var queryUrl = hostWebUrl + `/_api/web/lists/getbytitle(${list})/items(${itemId})/AttachmentFiles?$select=ServerRelativeUrl,FileName`;
               
                  logHelper.logInfo("queryList (" + list + "): Get all the data for itemId: " + itemId);
               

                // Get all the Email Distribution data
                await brandServices.getSharePointUrlByKeyFn("hostWebUrl")
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
                                        url: queryUrl,
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
                               
                                var jsonObject = JSON.parse(data.body);                               

                                var results = jsonObject.d.results;
                               
                                
                                return results;
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
            deleteFromList: (async function(list, itemId) {
                await brandServices.getSharePointUrlByKeyFn("hostWebUrl")
                .then((hostWebUrl) => {
                    try {
                        fetch(`${hostWebUrl}/_api/web/lists/getbytitle('${list}')/items(${itemId})`, {
                            method: "DELETE",
                            headers: {
                              "Accept": "application/json;odata=verbose",
                              "X-RequestDigest": this.getFormDigest() // Get form digest for security
                            }
                          })
                          .then(response => {
                            if (!response.ok) {
                                logHelper.logError(`Error deleting item: ${response.statusText}`);
                            }
                            logHelper.logInfo("Item deleted successfully.");
                          })
                          .catch(error => {
                            logHelper.logError("Error deleting item:", error);
                          });
                    } catch (error) {
                        logHelper.logInfo(error);
                        return false;
                    }
                });
            }),
            getFormDigest: (async function() {
                await brandServices.getSharePointUrlByKeyFn("hostWebUrl")
                .then((hostWebUrl) => {
                    try {
                        return fetch(`${hostWebUrl}/_api/web/getformdigestignorecache`, {
                            method: "POST",
                            headers: {
                              "Accept": "application/json;odata=verbose"
                            }
                          })
                          .then(response => {
                            if (!response.ok) {
                                logHelper.logError(`Error getting form digest: ${response.statusText}`);
                            }
                            return response.json();
                          })
                          .then(data => {
                            return data.d.GetFormDigestForAddingItems;
                          });
                    } catch (error) {
                        logHelper.logInfo(error);
                        return false;
                    }
                });
            }),

            formattedDate: (async function (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-indexed)
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
              
                const formattedDate = date.toLocaleDateString();
                return `${year}${month}${day}${hours}${minutes}${seconds}`;
              }),
        }

    })