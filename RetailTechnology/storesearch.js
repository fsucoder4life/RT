 
    ExecuteOrDelayUntilScriptLoaded(init, 'sp.js');
    var currentUser;
    function init() {
        this.clientContext = new SP.ClientContext.get_current();
        this.oWeb = clientContext.get_web();
        currentUser = this.oWeb.get_currentUser();
        this.clientContext.load(currentUser);
        this.clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

    }

    function onQuerySucceeded() {

        var curUser = "Current User: " + currentUser.get_email();
        localStorage.setItem("currentUser_userLoginName", currentUser.get_loginName());
        localStorage.setItem("currentUser_userId", currentUser.get_id());
        localStorage.setItem("currentUser_userTitle", currentUser.get_title());
        localStorage.setItem("currentUser_userEmail", currentUser.get_email());
        document.getElementById('currentUser').innerText = curUser;
        document.getElementById('CurrentCompanyPhone').innerHTML = localStorage.getItem('CurrentCompanyPhone'); 
        document.getElementById('CurrentCompanyName').innerHTML = localStorage.getItem('CurrentBrandName');  
        document.getElementById('CurrentCompanyAddress').innerHTML = localStorage.getItem('CurrentCompanyAddress');
        document.getElementById('CurrentCompanyCityState').innerHTML = localStorage.getItem('CurrentCompanyCityState');
        document.getElementById('CurrentCompanyZip').innerHTML = localStorage.getItem('CurrentCompanyZip');
        document.getElementById('CurrentAppTitle').innerHTML = localStorage.getItem('CurrentAppTitle');
        document.getElementById('sub-title').innerHTML = "Reports";
        //document.getElementById('current-date').innerHTML(moment().format('dddd, MMMM Do YYYY - h:mm A'));
        $('#current-date').html(moment().format('dddd, MMMM Do YYYY - h:mm A'));
        document.getElementById('CurrentCompanyZip').innerHTML = localStorage.getItem('CurrentCompanyZip');
        document.getElementById('CurrentCompanyZip').innerHTML = localStorage.getItem('CurrentCompanyZip');
        var logo = document.getElementById('CurrentCompanyLogo');
        var sourceText = localStorage.getItem('ThemeImagesFolder').replace('"','') +  localStorage.getItem('LogoFilePath').replace('"','');
        console.log("logo sourceText: " + sourceText);
        logo.src = sourceText.replace('"','');
        logo.alt = localStorage.getItem('LogoDescription');
        let homeUrl = document.getElementById('currentHomeUrl');
        let logoHomeUrl = document.getElementById('logoHomeUrl');
let currentBrandId = localStorage.getItem('CurrentBrandId').replace('"','').replace('"','');

let homePageUrl = "";// localStorage.getItem('homepageUrl');
// if (!homePageUrl){
//     homePageUrl = localStorage.getItem('sitePage-RetailTechnology-paymentModProjectDates');
    
// }
if (currentBrandId === '380fb82e-9c79-4903-a65a-425f551a84b1'){
    homePageUrl = subSitePath + "/index.aspx"
}
else{
    let subSitePath = localStorage.getItem('subSitePath').replace('"','').replace('"','');
    homePageUrl = subSitePath + "/index.aspx?brandId=" + currentBrandId;
    }

    //homePageUrl = homePageUrl.replace('"','').replace('"','');

    localStorage.setItem('homepageUrl',homePageUrl);
console.log('homePageUrl: ' + homePageUrl);

        homeUrl.setAttribute('href', homePageUrl);  
        logoHomeUrl.setAttribute('href',homePageUrl);
        let link = localStorage.getItem('CurrentBrandThemeStylesheetFilePath').replace('"','').replace('"','');
        let links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
                    if (links[i].getAttribute('id') === "CurrentBrandThemeStylesheet") {
                        let href = links[i].getAttribute('href');

                        let newHref = link + '?version='
                            + new Date().getMilliseconds();
console.log("newHref: " + newHref);
                        links[i].setAttribute('href', newHref);

                      
                    }
                }
    }

    function onQueryFailed(sender, args) {
        alert('Request failed. \nError: ' + args.get_message() + '\nStackTrace: ' + args.get_stackTrace());
    }  
