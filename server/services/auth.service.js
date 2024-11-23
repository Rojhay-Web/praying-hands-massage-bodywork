'use strict';
require('dotenv').config();

const jwt = require("jsonwebtoken"),
    log = require('./log.service');

module.exports = {
    validateUser: async function(headers, body){
        try {
            const { authorization: token } = headers;

            if(!token){
                return { error: "Invalid Token" };
            }

            let decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            if (!decoded) {
                log.error(`Verifing Token [E01]: ${err}`);
                return { error: "Unauthorized", results: false };
            }

            // Reading From DB
            let results = [{}];
            
            if(results.length <= 0){
                log.warning(`Validating UserId: User DNE(${decoded.id})`);
                return { error: `User DNE`, results: false};
            }

            return { results: true, app_id: decoded.appId };
        }
        catch(ex){
            log.error(`Validating UserId: ${ex}`);
            return { error: `Validating UserId: ${ex}`, results: false };
        }
    }
}