require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const log = require('./log.service');

const client = new MongoClient(process.env.DatabaseConnectionString);
(async () => { await client.connect(); log.debug(`Connected Successfully to server`); })();


module.exports = {
    getFullUser: async function(token){
        try {
            // Get User Info From G-Suite
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

            // Get Permissions Data From DB
            const collection = await dbCollection("users");
            if(collection == null){
                return { results: { ...res }};
            }

            /* Check if User Exists with Email or UserId */
            const query = { email: res.email.toLowerCase() };
            const findUser = await collection.findOne(query);
            if(!findUser){
                return { results: { ...res }};
            }

            return { results: { ...res, ...findUser }};
        }
        catch(ex){
            log.error(`Getting Full User: ${ex}`);
            return { 'error': 'Getting Full User [E00]'};
        }
    },
    getUserPermissions: async function(_id){
        try {
            const collection = await dbCollection("users");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            /* Check if User Exists with UserId */
            const query = { _id: new ObjectId(_id) };
            const findUser = await collection.findOne(query);
            if(!findUser){
                return { error: `User DNE` };
            }

            return { results: findUser };
        }
        catch(ex){
            log.error(`Getting User Permissions: ${ex}`);
            return { "error": `Getting User Permissions`};
        }
    },
    upsertUser: async function(email, isAdmin=false, scopes={}, _id=null){
        try {
            const collection = await dbCollection("users");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            if(_id){
                /* Check if User Exists with Email or UserId */
                const query = { _id: new ObjectId(_id) };
                const findUser = await collection.findOne(query);

                if(!findUser){
                    return { error: `User DNE` };
                }

                // Update User
                let setDict = { ...(email ? email : {}), isAdmin: isAdmin, scopes: scopes};
                const result = await collection.updateOne(query, 
                    { $set: setDict});

                return { results: (result.matchedCount ? _id : null) };
            }
        
            // Add User
            const result = await collection.insertOne({ email: email, isAdmin: isAdmin, scopes: scopes });
            return { results: (result?.insertedId ?? null) };    
        }
        catch(ex){
            log.error(`Adding User: ${ex}`);
            return { "error": `Adding User`};
        }
    },
    removeUser: async function(_id){
        try {
            const collection = await dbCollection("users");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            const result = await collection.deleteOne({ _id: new ObjectId(_id) });
            return { results: (result?.deletedCount ? true : false)};
        }
        catch(ex){
            log.error(`Removing User: ${ex}`);
            return { "error": `Removing User`};
        }
    }
}

/* Private FUnctions */
async function dbCollection(conn_collection) {
    let collection = null;
    try {
        //await client.connect(); //log.debug(`Connected Successfully to server`);
        const db = client.db(process.env.DatabaseName);
        collection = db.collection(conn_collection);
    }
    catch(ex){
        log.error(`Connection to Database: ${ex}`);
    }

    return collection;
}

/* Connection Clean Up */
const cleanup = (event) => {
    log.debug(`Closing Connection`);
    client.close(); process.exit(); 
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);