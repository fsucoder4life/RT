define(function (require) {
    function errorCheck (xData, status) {
        //Notify if web service call failed in transport
        if (status == "Error") {
            alert ("Unable to communicate with Sharepoint Server!");
            return false;
        } else if (status == 'parsererror') {
            alert ("Parser Error! Something went very wrong - please refresh the page to verify that you are logged in.");
            return false;
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
        } else {
            return true;
        }
    }
    
    function escapeXml (val) {
      return val.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/(\r\n|\n|\r)/gm, "");
  }


    return {
        errorCheck: errorCheck,
        escapeXml: escapeXml
    }
});