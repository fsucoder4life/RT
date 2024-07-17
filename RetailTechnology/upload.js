//const request = require('request');
const fs = require('fs');
const path = require('path');

// Replace with your tenant ID, client ID, and client secret
const tenantId = "eb89113c-8b8d-4c7c-894d-e39c2779279b";
const clientId = "ef60d4b3-07cf-4ad5-98d1-e32b25ba6080@eb89113c-8b8d-4c7c-894d-e39c2779279b";
const clientSecret = "LcI8Q~pfSVS~pbbZdli3y~yNaDwpbnSxF_vV~dpV";

async function getAccessToken() {
    const body = new URLSearchParams({
        "grant_type": 'client_credentials',
		"resource": '00000003-0000-0ff1-ce00-000000000000/irbpartners.sharepoint.com@eb89113c-8b8d-4c7c-894d-e39c2779279b',
        "client_id": clientId,
        "client_secret": clientSecret//,
       // "scope": 'https://irbpartners.sharepoint.com/.default' // Replace with your SharePoint site URL
    });

    const response = await fetch(`https://accounts.accesscontrol.windows.net/eb89113c-8b8d-4c7c-894d-e39c2779279b/tokens/OAuth/2`, {method: 'POST', body: body.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
const data = await response.json();   
   //console.log(response);
	console.log(data);
	// const stream = response.body; // Replace with your ReadableStream object

// (async () => {
    // for await (const chunk of stream) {
        // console.log("Received data chunk:");
        // console.log(chunk.toString()); // Process the data chunk (similar to event handler)
    // }
    // console.log("Stream has ended.");
// })();


// console.log(stream.access_token);
	return data.access_token;
}


async function getFilesInFolder(folderPath) {
	console.log("Folder Path: " + folderPath);
    const files = [];

    const directory = await fs.promises.readdir(folderPath);
    for (const fileName of directory) {
        const filePath = path.join(folderPath, fileName);
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
            files.push({ name: fileName, path: filePath });
        }
    }

    return files;
}

async function uploadFile(file, accessToken) {
    const libraryUrl = "/sites/RetailTechnologyDev/SitePages/RetailTechnologyProd/resources/lib/jstree"; // Replace with your document library URL
    const endpointUrl = `https://\irbpartners.sharepoint.com/_api/web/GetFolderByServerRelativeUrl\('{libraryUrl}')/Files/add(url='${file.name}')`;

    const fileContent = await fs.promises.readFile(file.path);
    const base64Content = Buffer.from(fileContent).toString('base64');

    const response = await fetch(endpointUrl, {
		method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose'
        },
        body: JSON.stringify({ __metadata: { 'type': 'SP.File' }, FileContent: base64Content })
    });
const data = await response.json();  
    return data;
}


async function uploadFolderToSharePoint(folderPath) {
    const accessToken = await getAccessToken();
    const files = await getFilesInFolder(folderPath);

    for (const file of files) {
        console.log(`Uploading file: ${file.name}`);
        const uploadResult = await uploadFile(file, accessToken);
        console.log(uploadResult); // You can handle success/failure messages here
    }
}

uploadFolderToSharePoint("resources/\lib/\jstree"); // Replace with your actual folder path
//uploadFolderToSharePoint("C:/\GitLabRepos/\retail-technology/\RetailTechnology/\resources/\lib/\jstree");
