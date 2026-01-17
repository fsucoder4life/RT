###Description
This project is intended as a more intuitive and specialized access mechanism to the SharePoint ICE lists.  It provides reports, task specific editing views, workflows, and synchronization tools for both our internal teams and our external partners.

###Stakeholders
 * Project Initiators: 
    * Bill Klearman
    * John Robinson
    * Kent Lee
 * Supervisor: Chris Vincent
 * Developer/Analyst: Stephen Tremaine
 * Users:
    * Retail Technology - Construction Team
    * Retail Technology - POPS/POS Conversion Team
    * Retail Technology - Support Team
    * Retail Technology - Enterprise Management
    * RVP's
    * Market Leaders
    * Construction Project Managers
    * Hardware Vendors

###Technology Used 
 * DOJO Toolkit 
 * SPServices - 
 * CAMLJS  - Builds CamlQuery's
 * Moment.js - Date manipulation library
 * Lodash.js - Utility library for working with collections/arrays/objects
 * Big.js - Arbitrary precision math library for avoiding binary rounding errors when working with money
 * CKEDITOR - HTML text area editor for rich text notes
 * Table2CSV - creates base64 encoded csv's from a table - only works in chrome, need better solution
 * jQuery - DOM manipulation library
 * SharePoint Web Services - Used to access list and user information from our sharepoint ICE site


###Vendor Reports
 * POS:
    * Micros – Construction
    * Micros – Conversion
    * Infor
 * Installers:
    * Site-Surveys
    * IST - Construction
    * IST - Alll
    * MSIT - Construction
    * AVIT - Construction
 * HME
 * ProMotion
 * PAYS
 * Hughes
 * Fabcon

###Internal Reports
 * RVP Agenda 
 * Upcoming Projects 
 * Weekly Install Summary 
 * POPS Hardware Projected
 * Upcoming Digital Menu Board Projects
 * Project Manager Assignment
 * Chronically Ailing Store List


###Tools
 * Development Report Synchronization
 * Hughes Report Synchronization
 * ISC Report Synchronization
 * Summary Estimate Generator - Generate multiple summary estimates by uploading a list of store numbers and POS amounts

###Store Summary View
 * Issue tracker that links to the combined schedule via store number
 * Notes, threaded by category and linked to the combined schedule via store number and optionally linked to an issue by issue ID.
 * Construction Projects:
    * Store contact/Address
    * Go-live date
    * Stakeholders
    * Connectivity
    * POS
    * POPS
    * Audio
    * PAYS
    * DMB/TV
    * Store Configuration
    * Installation
    * Attachments
 * Conversion Projects:
    * Store contact/Address
    * Stakeholders
    * POS
    * POPS

###Workflows
 * HME / Audio Quote Request 
 * POS Quote Request
 * Issue editor/create
 * Note editor/create
 * Summary Estimate Generator

###Search
 * Search tool that can search across all projects or be limited to the construction or conversion projects.

###Branches and Repository Management
 * Master
 * Dev
 * Normal Development:
    * Edit on your local development branch syncing to the sharepoint develpment site
    * Pull master
    * Merge dev to master locally
    * Push/merge to master at origin
    * Update the sharepoint files on the live site
 * Bug/Hot fixes:
    * Pull master to local
    * Create local hotfix branch off master
    * Merge to local master
    * Push to origin
    * Update the sharepoint files on the live site

###Environments
 * Live Site:
    * https://irbpartners.sharepoint.com/sites/RetailTechDeployment/SitePages/RetailTechnology/index.aspx
 * Development Site:
    * https://irbpartners.sharepoint.com/sites/RetailTechDeployment/SitePages/RetailTechnologyDev/index.aspx
 * Legacy Site (forwards to live):
    * https://irbpartners.sharepoint.com/sites/RetailTechDeployment/SitePages/Construction/index.aspx
