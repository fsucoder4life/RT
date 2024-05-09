<!DOCTYPE html>
<%@ Page Language="C#" %>

<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<!-- <%@ Register TagPrefix="sld" TagName="PromoDisplay" Src="~/_controltemplates/RetailTechnology/GetCurrentUsersEmail.ascx" %> -->
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-2931895-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-2931895-1');
    </script>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="cache-control" content="max-age=0">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="-1">
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 11:00:00 GMT">
    <meta http-equiv="pragma" content="no-cache">

    <title>Sonic Retail Technology</title>
    <link rel="shortcut icon" href="/_layouts/images/favicon.ico" type="image/vnd.microsoft.icon" />
    <!--Styles-->
    <link rel="stylesheet" type="text/css" href="resources/style/main.css" />
    <link rel="stylesheet" type="text/css" href="resources/style/pure-min.css" />
    <link rel="stylesheet" type="text/css" href="resources/lib/dijit/themes/claro/claro.css" />
    <!--<link rel="stylesheet" type="text/css" href="resources/lib/jquery-ui/jquery-ui.min.css" />-->
    <!--<link rel="stylesheet" type="text/css" href="resources/lib/DataTables/datatables.min.css"/>-->
    <link rel="stylesheet" type="text/css" href="resources/lib/date-picker/datepicker.min.css" />
    <link rel="stylesheet" type="text/css" href="resources/lib/jquery-modal/jquery.modal.min.css" />
    <link rel="stylesheet" type="text/css" href="resources/style/font-awesome-4.6.2/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="resources/lib/jstree/themes/default/style.min.css">
    <!--Search-->
    <link rel="search"
        href="opensearch.xml"
        type="application/opensearchdescription+xml"
        title="Sonic Search" />
    <!--SP Librarires-->
   
    <!--Libraries-->
    <script language="javascript" type="text/javascript" src="resources/lib/jquery-1.11.1.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/jquery.SPServices-2014.01.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/jquery-modal/jquery.modal.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/date-picker/datepicker.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/moment.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/lodash.compat.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/camljs.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/ckeditor/ckeditor.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/jquery.parse.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/papaparse.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/xlsx.core.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/Blob.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/FileSaver.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/tableexport.min.js"></script>
    <script language="javascript" type="text/javascript" src="resources/lib/jstree/jstree.min.js"></script>
    <script language="javascript" type="text/javascript" src="app/utility/asyncLoop.js"></script>
    <!--<script language="javascript" type="text/javascript" src="resources/lib/FileSaver.min.js"></script>-->
    <!--<script language="javascript" type="text/javascript" src="resources/lib/jspdf.min.js"></script>-->
    <!--<script language="javascript" type="text/javascript" src="resources/lib/jspdf.plugin.autotable.js"></script>-->
    <!--<script language="javascript" type="text/javascript" src="resources/lib/table2CSV.js"></script>-->
    <script language="javascript" type="text/javascript" src="resources/lib/big.min.js"></script>
    <%--<script>--%>
    <%--function demoFromHTML() {--%>
    <%--var columns = ["ID", "Name", "Country"];--%>
    <%--var rows = [--%>
    <%--[1, "Shaw", "Tanzania"],--%>
    <%--[2, "Nelson", "Kazakhstan"],--%>
    <%--[3, "Garcia", "Madagascar"]--%>
    <%--];--%>

    <%--// Only pt supported (not mm or in)--%>
    <%--var doc = new jsPDF('p', 'pt');--%>
    <%--doc.autoTable(columns, rows);--%>
    <%--doc.save('table.pdf');--%>
    <%--}--%>
    <%--</script>--%>
    <!--<script language="javascript" type="text/javascript" src="resources/lib/jquery-ui/jquery-ui.min.js"></script>-->
    <!--<script language="javascript" type="text/javascript" src="resources/lib/DataTables/datatables.min.js"></script>-->
    <%--<script language="javascript" type="text/javascript" src="resources/lib/wkhtmltopdf_tableSplitHack.js"></script>--%>
    <!-- load Dojo -->
    <script type="text/javascript">
       
        // Configure DOJO
        // Instead of using data-dojo-config, we're creating a dojoConfig
        // object *before* we load dojo.js; they're functionally identical,
        // it's just easier to read this approach with a larger configuration.
        var base = location.pathname.replace("index.aspx", "");
        var dojoConfig = {
            async: true,
            baseUrl: "/",
            tlmSiblingOfDojo: false,
            cacheBust: true,
            packages: [
                { name: "dojo", location: base + "resources/lib/dojo" },
                { name: "dijit", location: base + "resources/lib/dijit" },
                { name: "dojox", location: base + "resources/lib/dojox" },
                { name: "app", location: base + 'app' },
                { name: "resources", location: base + 'resources' }
            ]
        };

        //Turn off inline auto editor for all editable fields
        CKEDITOR.disableAutoInline = true;
    </script>
    <script src="resources/lib/dojo/dojo.js"></script>
    <!--Start application-->
    <script language="javascript">
        require(['app/router']);
    </script>
    <script>
        require([
    
    
            'app/brands/services/brandServices',
            "app/brands/services/logHelper",
            'dojo/when',
            'app/brands/services/domServices'
    
        ], function (brandServices, logHelper, when, domServices) {
            const replaceLinkHrefFn = brandServices.replaceLinkHref.bind(this);
            loadConfigFile: (async function () {
                let retVal = false;
                retVal = await brandServices.loadConfigFile();
                if (retVal) {
                    logHelper.logInfo("loadConfigFile: Config File Loaded");
                    logHelper.logInfo("Step 1 Return Value: " + retVal);
                    retVal = false;
                    retVal = await brandServices.startApp();
    
                    if (retVal) {
                        logHelper.logInfo("Step 2 Return Value: " + retVal);
                        retVal = false;
                        retVal = await brandServices.setCurrentBrandConfig();
                    }
    
                    if (retVal) {
                        logHelper.logInfo("Step 3 Return Value: " + retVal);
                        retVal = false;
                        retVal = await logHelper.logInfo("loadConfigFile: App Started");
                    }
    
                    //Only use if using mock data api
                    // if (retVal) {
                    //     logHelper.logInfo("Step 4 Return Value: " + retVal);
                    //     retVal = await brandServices.refreshCSS();
                    //     brandServices.getReports();
                    // }
    
                    if (retVal) {
                        logHelper.logInfo("Step 4 Return Value: " + retVal);
                        dom.byId("current-date").innerHtml = new Date();
                        $("#loading-mask").hide();
    
                        logHelper.logInfo("before changing link");
                        await brandServices.getSharePointUrlByKey("sitePage-RetailTechnology").then(async (url) => {
                            var newUrl = url + "/index.aspx#reports/micros";
                            logHelper.logInfo("after changing link" + url);
                            brandServices.replaceLinkHref("posMicros", newUrl);
                        });
    
                    }
    
                }
    
    
    
    
    
    
    
            })();
    
        });
    
    
    </script>
</head>
<body class="claro">
    <div id="main">
        <div style="float: left;">
            <h1 id="title" style="margin: 5px 0 0 0;">Retail Technology - Development Projects</h1>
            <span id="sub-title">Search/Reports</span> - <span id="current-date"></span>
        </div>
        <div style="width: 300px; float: right; text-align: right; font-weight: bold; font-size: .8em;">
            <a href="#index">
                <img style="float: right; margin: 5px;width:138px;" src="https://d1bczdvydwfy0q.cloudfront.net/images/whats-cookin/TjR24U_newsonicbottomlogo_01222020.png" alt="Sonic Logo" /></a>
            Sonic Corporate<br />
            300 Johnny Bench Drive<br />
            Oklahoma City, OK 73104<br />
            405-225-5000
        </div>
        <!--Search Box-->
        <div id="search-container">
            Search Stores:<input id='search' style="display: inline-block; margin-left: 10px; width: 385px;" name="search" type="text" title="Search" /><div id="search-type"></div>
        </div>
        <div id="content">
            <!--Loading Mask-->
            <div id="loading-mask">
                <img src="resources/images/loading.gif" alt="loading image" />
            </div>
        </div>
    </div>
    <iframe id="KeepCentrifyUserSessionAlive" name="KeepCentrifyUserSessionAlive" style="display: none;" src="KeepCentrifyUserSessionAlive.aspx" />
</body>
</html>
