define(['dojo/text!resources/style/main.css', 'dojo/text!resources/style/pure-min.css'], function (mainCss, pureCss) {
    function afterRenderReport(view, options) {
        options = options || {};

        if (options.email === 'pdf') {
            sendPDFReport(view, options);
        } else if (options.email === 'html') {
            sendHTMLReport(view, options);
        }
    }

    function sendPDFReport (view, options) {
        options = options || {};

        //Remove all the hidden dropdowns
        $('div.dropdown > ul').remove();

        var data = {
            html: "<style>" + pureCss + " " + mainCss + "</style>" + $('table#stores').prop('outerHTML'),
            subject: options.subject || 'Automated Email',
            body: getEmailBodyReport(options.body, options.targetEl),
            to: options.to,
            filename: options.filename || 'report'
        };

        if (typeof options.cc !== 'undefined' && options.cc !== '') {
            data.cc = options.cc;
        }

        $.ajax({
            url: '/public/PDF/html2pdfEmail.aspx',
            type: 'POST',
            data: data,
            success: function (result) {
                //TODO - Do I need to notify the headless browser that I'm done?
            }
        });

        /**
         * This is code to access the rocket pdf api directly, it works but the reader API doesn't work on IE/only works in chrome
         */
        // Setup POST Data variable
        // var data = "apikey=" + options.apiKey +
        //     "&value=" + encodeURIComponent("<style>" + pureCss + " " + mainCss + "</style>" + $('table#stores').prop('outerHTML')) +
        //     "&UseLandscape=true";

        //Create Request
        // var req = new XMLHttpRequest();

        //Handle Request load
        // req.onload = function(event) {
        //     function xmlEscape(string) {
        //         return string
        //             .replace(/&/g, '&amp;')
        //             .replace(/</g, '&lt;')
        //             .replace(/>/g, '&gt;')
        //             .replace(/"/g, '&quot;')
        //             .replace(/'/g, '&apos;')
        //             .replace(/(\r\n|\n|\r)/gm,"");
        //     }
        //     //Get the escaped body with no breaks
        //     var msg = xmlEscape(options.msg || 'See attached report'),
        //         subject = xmlEscape(options.subject || 'Report'),
        //         to = xmlEscape(options.to),
        //         cc = xmlEscape(options.cc || ''),
        //         item = "https://irbpartners.sharepoint.com/sites/RetailTechDeployment/Lists/Combined%20Schedule/3850_.000";//this is a random item because this is a workflow for a list item we are borrowing
        //
        //
        //     //TODO - Stop displaying PDF
        //     var reader = new FileReader();
        //     reader.addEventListener("loadend", function() {
        //         // Open in new tab
        //         window.open(reader.result, "_blank");
        //
        //         // return data URI
        //         return reader.result;
        //     });
        //
        //     reader.readAsDataURL(req.response);
        // };
        //
        // //Configure and send request
        // req.open("POST", "https://api.html2pdfrocket.com/pdf", true);
        // req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // req.responseType = "blob";
        // req.send(data);
    }

    function sendHTMLReport(view, options) {
        
        options = options || {};
        var data = {
            subject: options.subject || 'Automated Email',
            body: getEmailBodyReport(options.body, options.targetEl),
            to: options.to
        };

        if (typeof options.cc !== 'undefined' && options.cc !== '') {
            data.cc = options.cc;
        }

        $.ajax({
            url: '/public/PDF/html2pdfEmail.aspx',
            type: 'POST',
            data: data,
            success: function (result) {
                
                //TODO - Do I need to notify the headless browser that I'm done?
            }
        });
    }

    function getEmailBodyReport (body, targetEl) {
        var targetEl = targetEl || $('#stores');
        //Remove all the hidden dropdowns
        $('div.dropdown > ul').remove();

        //Add background colors for table head and make it bold
        $('table thead th').each(function (i, el) {
            $(this).html = '<b>' + $(this).html() + '</b>';
            $(this).attr('bgcolor', '#e0e0e0');
        });
        //Stripe the rows
        $('table tbody tr:nth-child(odd) td').attr('bgcolor', '#f2f2f2');
        //Fix the business rule highlighting
        $('.red-highlight').attr('bgcolor', '#FFC7CE').css('color', '#9C0006');
        $('.yellow-highlight').attr('bgcolor', '#FFEB9C').css('color', '#9C6500');
        $('.green-highlight').attr('bgcolor', '#C6EFCE').css('color', '#006100');
        //Make all links absolute
        $('table a').attr('href', window.location.origin + window.location.pathname + $('a').attr('href'));

        return "<style>table, td, th {text-align: left;font-family:Arial,Helvetica,sans-serif; font-size: 14px;}table {border-collapse: collapse;width: 100%;border: 1px solid #cbcbcb;}td, th {padding: 6px 12px;border-left: 1px solid #cbcbcb; border-right: 1px solid #cbcbcb; vertical-align: bottom;}</style>" +
            (body || "Automated Report Below") + "<br/><br/>" +
            targetEl.prop('outerHTML').replace(/\r?\n|\r/g, '');
    }

    return {
        afterRenderReport: afterRenderReport,
        sendPDF: sendPDFReport,
        sendHTML: sendHTMLReport
    }
});