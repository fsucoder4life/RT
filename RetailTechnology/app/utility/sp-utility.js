define(function (require) {
    function errorCheck (xData, status) {
        //Notify if web service call failed in transport
        if (status == "Error") {
            alert ("Unable to communicate with Sharepoint Server!");
            return {success: false, message: "Unable to communicate with Sharepoint Server!"};
        } else if (status == 'parsererror') {
            alert ("Parser Error! Something went very wrong - please refresh the page to verify that you are logged in.");
            return {success: false, message: "Parser Error! Something went very wrong - please refresh the page to verify that you are logged in."};
        }

        //Check for Errors in returned XML
        var spErrCode = $(xData.responseText).find("ErrorCode").first(),
            error = false,
            errorMessage = "ERROR: Call to SharePoint Web Services failed.";
        if (spErrCode.length > 0 && spErrCode.text() !== "0x00000000") {
            error = true;
            errorMessage += "\n\n" + $(xData.responseText).find("ErrorCode").first().text()
                +	": " + $(xData.responseText).find("ErrorText").first().text();
        } else if($(xData.responseText).find("faultcode").length > 0) {
            error = true;
            errorMessage += "\n\n" + $(xData.responseText).find("faultstring").first().text()
                + "\n" + $(xData.responseText).find("errorstring").first().text();
        }

        //Notify of failed update operation
        if (error) {
            alert("Something went wrong!\n\n" + errorMessage);
            return {success: false, message: errorMessage};
        } else {
            return {success: true};
        }
    }

    function displayObject(obj) {
        _.forIn(obj, function (val, key) {
            console.log(key + ": ", val);
        });
    }

    function fixLookups(mapping, data) {
        _.each(data, function (item, i) {
            _.each(mapping, function(field, key) {
                if (field.objectType === 'Lookup') {
                    item[field.mappedName + 'Id'] = item[field.mappedName].lookupId;
                    item[field.mappedName] = item[field.mappedName].lookupValue;
                } else if (field.type === 'json') {
                  try {
                    item[field.mappedName] = JSON.parse(item[field.mappedName]);
                  } catch (e) {
                    alert('Invalid JSON in this field: ' + field.mappedName + '\r\n\r\nData:\r\n ' + item[field.mappedName]);
                  }
                }
            })
        });
    }
    
    function escapeXml (val) {
      return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/(\r\n|\n|\r)/gm, "");
    }

    return {
        errorCheck: errorCheck,
        displayObject: displayObject,
        fixLookups: fixLookups,
        escapeXml: escapeXml
    }
});