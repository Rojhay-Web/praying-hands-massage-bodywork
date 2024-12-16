require('dotenv').config();
const { google } = require('googleapis');

const log = require('./log.service'),
    util = require('../utils/util');

const { EVENT_PRIVATE_KEY, EVENT_CLIENT_EMAIL } = process.env;

module.exports = {
    getReviews: async function(){
        try {
            // const business_account = google.mybusinessaccountmanagement({ version: 'v1', auth: googleAuth });
            // const review_res = await business_account.accounts.locations.reviews.list({
            //     account_id: "",
            //     location_id: ""
            // });
/*
            const token = authenticate();
            const accountId='YOUR ACCOUNT ID';
            const locationId='YOUR LOCATION ID';
            const url=`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;

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

            console.log(res.data);
*/
            return { results: []};
        }
        catch(ex){
            log.error(`Getting Reviews: ${ex}`);
            return { error: "Getting Reviews [E00]" };
        }
    }
}

async function authenticate() {
    let ret = null;
    try {   
        const jwt = getGoogleAuth();
        const resp = await jwt.authorize();

        ret = resp.access_token.replace(/\.{2,}/g, '');
    }
    catch(ex){
        log.error(`Authenticating: ${ex}`);
    }
    return ret;
}

function getGoogleAuth(){
    let ret = null;
    try {
        const privateKey = EVENT_PRIVATE_KEY;
        
        ret = new google.auth.JWT(
            EVENT_CLIENT_EMAIL,
            null,
            privateKey.replace(/\\n/g, '\n'),
            'https://www.googleapis.com/auth/business.manage'
        );
    }
    catch(ex){
        log.error(`Authenticating Google Account: ${ex}`);
    }

    return ret;
}