define(["models.HyperLink",HyperLink],"models.BrandThemeSetting",null,{
name: String,
homeUrl: String,
pageTitle: String,
settings:{
    copyright: String,
    companyLegalName: String,
    companyShortName: String,
    companyStreetAddress: String,
    companyCityState: String,
    companyZipCode: String,
    companyPhone: String
},
hyperlinks: {
    store: [],
    checklist: [],
    pos: [
       

    ],
    franchiseeOwnedPOS: [],
},
images:{

}
});