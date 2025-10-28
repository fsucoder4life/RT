<!DOCTYPE html>

<%@ Page Language="C#" %>

<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=14.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<!--%@ Register TagPrefix="sld" TagName="PromoDisplay" Src="~/_controltemplates/RetailTechnology/GetCurrentUsersEmail.ascx" %-->
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
<head runat="server">
    <meta charset="utf-8" />
    <title></title>
    <!--Styles-->
    <link rel="stylesheet" type="text/css" href="resources/style/main.css" />
    <link rel="stylesheet" type="text/css" href="resources/style/pure-min.css" />
    <link rel="stylesheet" type="text/css" href="resources/lib/dijit/themes/claro/claro.css" />
    <!--<link rel="stylesheet" type="text/css" href="resources/lib/jquery-ui/jquery-ui.min.css" />-->
    <!--<link rel="stylesheet" type="text/css" href="resources/lib/DataTables/datatables.min.css" />-->
    <link rel="stylesheet" type="text/css" href="resources/lib/date-picker/datepicker.min.css" />
    <link rel="stylesheet" type="text/css" href="resources/lib/jquery-modal/jquery.modal.min.css" />
    <link rel="stylesheet" type="text/css" href="resources/style/font-awesome-4.6.2/css/font-awesome.min.css" />
    <link rel="stylesheet" type="text/css" href="resources/lib/jstree/themes/default/style.min.css" />
    <style>
        #report-main {
    min-width: 75%;
    max-width: 95%;
    margin: 15px;
     border: 1px solid #666; 
    display: table;
    
    height: 133px;
    bottom:0;
    position: fixed;
}

#CurrentAppTitle {
    color: rgb(7, 6, 6);
    margin: 5px 0 15px 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.6em;
}
    </style>
     <!--SP Librarires-->
     <sharepoint:scriptlink name="MicrosoftAjax.js" runat="server" defer="False" localizable="false" />
     <sharepoint:scriptlink name="SP.core.js" runat="server" defer="False" localizable="false" />
     <sharepoint:scriptlink name="SP.js" runat="server" defer="True" localizable="false" />
     <!--Libraries-->
     <script language="javascript" type="text/javascript" src="resources/lib/jquery.min.js"></script>
     <script language="javascript" type="text/javascript" src="resources/lib/jquery.SPServices-2014.01.min.js"></script>
     <script type="text/javascript" src="resources/lib/jquery-modal/jquery.modal.min.js"></script>
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
     <script type="text/javascript" src="resources/lib/jstree/jstree.min.js"></script>
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
     <script language="javascript" type="text/javascript" src="storesearch.js"></script>
     <link id="CurrentBrandThemeStylesheet" rel="stylesheet" type="text/css" href="">
     <base target="_parent">
</head>
<body class="claro">
    
    <div id="report-main">
        <div style="float: left; ">
            <h1 id="CurrentAppTitle" class="currentAppTitle"></h1>
            <span id="sub-title"></span>  <span id="current-date"></span>
        </div>
        <div class="brandTitle">
            <a id="logoHomeUrl" href="#index">
                <img id="CurrentCompanyLogo" class="brandLogo" src="" alt="Logo" />
            </a>
            <div>
                <span id="CurrentCompanyName"></span><br />
                <span id="CurrentCompanyAddress"></span><br />
                <span id="CurrentCompanyCityState"></span><span id="CurrentCompanyZip"></span><br />
                <span id="CurrentCompanyPhone"></span>
            </div>
        </div>  
        <div>
           
            <div style="display: inline-block; margin-left: 10px; width: 385px;" name="search" type="text" title="Search" ><div ></div></div>
        </div>      
		<div style="position: fixed; left: 10; bottom: 20px; width:70%; margin-left:10px; font-weight: bold; font-size: .8em;">
		<a id="currentHomeUrl" href="https://irbpartners.sharepoint.com/sites/RetailTechnologyDev/SitePages/RetailTechnologyProd/index.aspx" target="_parent">Home</a>
		<div id="currentUser" style="width: 300px; float: right; text-align: right; font-weight: bold; font-size: .9em;margin-right:10px;"></div>
		</div>       
		
    </div>
</body>
</html>
