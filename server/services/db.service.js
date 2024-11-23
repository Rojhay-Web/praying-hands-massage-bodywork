"use strict";
require('dotenv').config();
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');


const log = require('./log.service');

module.exports = {
    getFullUser: async function(token){
        try {
            const url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;

            const ret = await fetch(url, {
                method: "GET", headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if(ret.status != 200){
                log.error(`Unable to retrieve G-User Data [E00]`);
                return { error: `Unable to retrieve G-User Data [E00]` };
            }

            let res = await ret.json();
            if(!res?.email){
                log.error(`Unable to retrieve G-User Data [E01]`);
                return { error: `Unable to retrieve G-User Data [E01]` };
            }

            const sheetData = await getSheetData('users');
            if(sheetData?.error){
                return { results: { ...res }};
            }

            let emailFilter = sheetData.results.filter((usr)=> { 
                return usr.email.toLowerCase() === res.email.toLowerCase(); 
            });

            let formatted_data = formatUserData({ ...res, ...(emailFilter?.length > 0 ? emailFilter[0] : {}) });
            return { results: formatted_data};
        }   
        catch(ex){
            log.error(`Getting Full User: ${ex}`);
            return { 'error': 'Getting Full User [E00]'};
        }
    },
    getUserPermissions: async function(appId){
        try {
            // Check if User Exists
            const sheetData = await getSheetData('users');
            if(sheetData?.error){
                return { error: 'Unable to get User Permissions' };
            }

            let userRow = sheetData.results.map((u) => u.appId).indexOf(appId);
            if(userRow < 0){
                return { error: 'User DNE', results: false };
            }

            let formatted_data = formatUserData({ ...sheetData.results[userRow] });
            return { results: formatted_data };
        }
        catch(ex){
            log.error(`Getting User Permissions: ${ex}`);
            return { "error": `Getting User Permissions`};
        }
    },
    addUser: async function(email, isAdmin=false, scopes={}){
        try {
            // Check if User Exists
            const sheetData = await getSheetData('users');
            if(sheetData?.error){
                return { results: false };
            }

            let emailFilter = sheetData.results.filter((usr)=> { 
                return usr.email.toLowerCase() === email.toLowerCase(); 
            });

            if(emailFilter?.length > 0){
                return { results: false, error: 'User Email Exists' };
            }

            // appId | email | isAdmin | scope
            const scopeStr = JSON.stringify(scopes);
            const formatted_data = [[uuidv4(), email, isAdmin, scopeStr]];

            const googleAuth = getGoogleAuth();

            const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth});
            const updateSheet = await sheetInstance.spreadsheets.values.append({
                auth: googleAuth,
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: 'users',
                valueInputOption: 'RAW',
                resource:{ values: formatted_data }
            });

            return { results: updateSheet?.data?.updates && updateSheet?.data?.updates.updatedRows > 0 };
        }
        catch(ex){
            log.error(`Adding User: ${ex}`);
            return { "error": `Adding User`};
        }
    },
    updateUser: async function(appId, isAdmin=false, scopes={}){
        try {
            // Check if User Exists
            const sheetData = await getSheetData('users');
            if(sheetData?.error){
                return { results: false };
            }

            let userRow = sheetData.results.map((u) => u.appId).indexOf(appId);
            if(userRow < 0){
                return { error: 'User DNE', results: false };
            }

            // appId | email | isAdmin | scope
            const rowEmail = sheetData.results[userRow]?.email,
                scopeStr = JSON.stringify(scopes);
            const formatted_data = [[appId, rowEmail, isAdmin, scopeStr]];

            const googleAuth = getGoogleAuth();

            const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth});
            const updateSheet = await sheetInstance.spreadsheets.values.update({
                auth: googleAuth,
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `users!${(userRow + 2)}:${(userRow + 2)}`,
                valueInputOption: 'RAW',
                resource:{ values: formatted_data }
            });

            return { results: updateSheet?.data && updateSheet?.data?.updatedRows > 0 };
        }
        catch(ex){
            log.error(`Updating User: ${ex}`);
            return { "error": `Updating User`};
        }
    },
    removeUser: async function(appId){
        try {
            // Check if User Exists
            const sheetData = await getSheetData('users');
            if(sheetData?.error){
                return { results: false };
            }

            let userRow = sheetData.results.map((u) => u.appId).indexOf(appId);
            if(userRow < 0){
                return { error: 'User DNE', results: false };
            }

            const googleAuth = getGoogleAuth();

            const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth});
            const updateSheet = await sheetInstance.spreadsheets.values.clear ({
                auth: googleAuth,
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `users!${(userRow + 2)}:${(userRow + 2)}`
            });
            console.log(updateSheet);

            return { results: !!updateSheet?.data?.clearedRange };
        }
        catch(ex){
            log.error(`Removing User: ${ex}`);
            return { "error": `Removing User`};
        }
    }
};


/* Private Functions */
function getGoogleAuth(){
    let ret = null;
    try {
        const privateKey = process.env.PRIVATE_KEY;
        
        ret = new google.auth.JWT(
            process.env.CLIENT_EMAIL,
            null,
            privateKey.replace(/\\n/g, '\n'),
            'https://www.googleapis.com/auth/spreadsheets'
        );
    }
    catch(ex){
        log.error(`Authenticating Google Account: ${ex}`);
    }

    return ret;
}

function buildSheetObject(listData) {
    let ret = [];
    try {
        let colNames = listData[0];

        for(let i=1; i< listData.length; i++){
            let item = {};
            for(let j=0; j < listData[i].length; j++){
                let colName = colNames.length >= j ? colNames[j] : `col-${j}`;
                item[colName] = listData[i][j];
            }

            ret.push(item);
        }
    }
    catch(ex){
        log.error(`Building Sheet Data: ${ex}`);
    }
    return ret;
}

async function getSheetData(sheetName){
    try {
        let googleAuth = getGoogleAuth();
        if(!googleAuth){
            return { 'error': 'Retrieving Sheet Auth [E01]' };
        }

        const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth });
        const sheetInfo = await sheetInstance.spreadsheets.values.get({
            auth: googleAuth,
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `${sheetName}`
        });

        return { "results":(sheetInfo?.data?.values ? buildSheetObject(sheetInfo.data.values) : []) };
    }
    catch(ex){
        log.error(`Getting Sheet Data: ${ex}`);
        return { 'error': 'Getting Sheet Data [E00]'};
    }
}

function formatUserData(usrData){
    let ret = { ...usrData };

    try {
        ret.isAdmin = usrData?.isAdmin?.toLowerCase() === "true";
        try {
            ret.scopes = (usrData?.scopes?.length > 0 ? JSON.parse(usrData?.scopes) : {});
        }
        catch(ex){
            ret.scopes = {};
        }
    }
    catch(ex){
        log.error(`Formating User Data: ${ex}`);
    }

    return ret;
}