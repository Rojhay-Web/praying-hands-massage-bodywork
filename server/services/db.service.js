require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const log = require('./log.service');

const client = new MongoClient(process.env.DatabaseConnectionString);
(async () => { await client.connect(); log.debug(`Connected Successfully to server`); })();

const appTables = {
    "users":true, "site_pages":true
},
pageKeyTypes = {
    "title":true, "description":true, "list":true, "images":true
};

module.exports = {
    getAppTable: async function(table){
        try {
            if(!(table in appTables)){
                return { error: "Invalid Table" };
            }

            const collection = await dbCollection(table);
            if(collection == null){
                return { error: "Unable to connect to DB [Please contact site admin]"};
            }

            const appData = await collection.find({}).toArray();
            return { results: appData};
        }
        catch(ex){
            log.error(`Getting All By Table: ${ex}`);
            return { 'error': 'Getting All By Table [E00]'};
        }
    },
    removeAppTableData: async function(table, _id){
        try {
            const collection = await dbCollection(table);
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            const result = await collection.deleteOne({ _id: new ObjectId(_id) });
            return { results: (result?.deletedCount ? true : false)};
        }
        catch(ex){
            log.error(`Removing App Table Row: ${ex}`);
            return { "error": `Removing App Table Row`};
        }
    },
    /* Users */
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
                return { error: `User DNE 2` };
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
                let setDict = { ...(email ? { email: email } : {}), isAdmin: isAdmin, scopes: scopes};
                const result = await collection.updateOne(query, 
                    { $set: setDict});

                return { results: (result.matchedCount ? _id : null) };
            }
        
            // Add User
            const result = await collection.insertOne({ email: email, isAdmin: isAdmin, scopes: scopes });
            return { results: (result?.insertedId ?? null) };    
        }
        catch(ex){
            log.error(`Upserting User: ${ex}`);
            return { "error": `Upserting User`};
        }
    },
    /* Site Pages */
    getPageData: async function(key){
        try {
            const collection = await dbCollection("site_pages");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            /* Check if User Exists with UserId */
            const findPage = await collection.findOne({ key: key });
            if(!findPage){
                return { error: `Page DNE` };
            }

            return { results: findPage };
        }
        catch(ex){
            log.error(`Getting Page Data: ${ex}`);
            return { 'error': 'Getting Page Data [E00]'};
        }
    },
    upsertPageData: async function(title, pageKeys, _id=null){
        try {
            const collection = await dbCollection("site_pages");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            let key = `${title.replace(/[^\w\s]/gi, '').replace(/&/gi,'').split(' ').join('_')}`.toLowerCase();

            let validatedKeys = validatePageKeys(pageKeys);
            if(validatedKeys.error){
                return { error: `Invalid Page Keys: ${validatedKeys.error}`};
            }

            let setDict = { key: key, title: title };

            if(_id){
                if(validatedKeys.results){
                    setDict.pageKeys =  validatedKeys.results;
                }
                // Update Page
                const result = await collection.updateOne(
                    { _id: new ObjectId(_id) },  { $set: setDict }
                );

                return { results: (result.matchedCount ? key : null) };
            }
        
            // Add Page
            setDict.pageKeys = (validatedKeys.results ? validatedKeys.results : []);
            const result = await collection.insertOne(setDict);
            return { results: (result?.insertedId ? key : null) };    
        }
        catch(ex){
            log.error(`Upserting Page Data: ${ex}`);
            return { "error": `Upserting Page Data`};
        }
    },
    upsertPageKey: async function(page_id, key_id, title, type, meta, value){
        try {
            const collection = await dbCollection("site_pages");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            if(!page_id){
                return { error: "Invalid Page or Key Id" };
            }

            // Update Page
            if(key_id){
                const result = await collection.updateOne(
                    { 
                        _id: new ObjectId(page_id),
                        "pageKeys._id": key_id
                    },  { 
                        $set: { 
                            "pageKeys.$.title": title, "pageKeys.$.type":type, 
                            "pageKeys.$.metaData":meta, "pageKeys.$.value":value 
                        } 
                    }
                );
    
                return { results: (result.matchedCount ? page_id : null) };
            }

            const tmpKeyId = uuidv4();
            const result = await collection.updateOne(
                {  _id: new ObjectId(page_id) },  { 
                    $push: { 
                        pageKeys: { 
                            _id: tmpKeyId, title: title, type: type, 
                            metaData: meta, value: value 
                        }
                    } 
                }
            );

            return { results: (result.matchedCount ? tmpKeyId : null) };
        }
        catch(ex){
            log.error(`Upserting Page Key: ${ex}`);
            return { "error": `Upserting Page Key`};
        }
    },
    removePageKey: async function(page_id, key_id){
        try {
            const collection = await dbCollection("site_pages");
            if(collection == null){
                return { "error": "Unable to connect to DB [Please contact site admin]"};
            }

            if(!key_id || !page_id){
                return { error: "Invalid Page or Key Id" };
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(page_id) },  
                { $pull: { pageKeys: { _id: key_id } }}
            );
            return { results: (result?.matchedCount ? true : false)};
        }
        catch(ex){
            log.error(`Removing Page Key: ${ex}`);
            return { "error": `Removing Page Key`};
        }
    },

    /* Services */
    getServices: async function(type=null, page=1, page_size=20){
        try {
            const collection = await dbCollection("services");
            if(collection == null){
                return { error: "Unable to connect to DB [Please contact site admin]"};
            }

            const page_skip = (page - 1) * page_size;

            const appData = await collection.find({
                ...(type ? { type: type } : {})
            })
            //.skip(page_skip).limit(page_size)
            .toArray();

            return { results: appData};
        }
        catch(ex){
            log.error(`Getting All By Table: ${ex}`);
            return { 'error': 'Getting All By Table [E00]'};
        }
    },
    upsertService: async function(title, type, _id=null, time=null, price=null, bookingSite=null, image=null, description=null){
        try {
            const collection = await dbCollection("services");
            if(collection == null){
                return { error: "Unable to connect to DB [Please contact site admin]"};
            }

            let service = {
                title, time, price, bookingSite, 
                image, description, type
            };

            const validation = validatingService(service);
            if(validation.length > 0){
                log.error(`Invalid Service Upsert: ${validation.join(",")}`);
                return { error: "Invalid Service Upsert" };
            }
            
            if(_id){
                // Update Service
                const result = await collection.updateOne(
                    { _id: new ObjectId(_id) },  { $set: service }
                );

                return { results: (result.matchedCount ? _id : null) };
            }
        
            // Add Service
            const result = await collection.insertOne(service);
            return { results: (result?.insertedId ?? null) };
        }
        catch(ex){
            log.error(`Upserting Service: ${ex}`);
            return { 'error': 'Upserting Service [E00]'};
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

function validatePageKeys(pageKeys){
    try {
        if(!pageKeys){
            return { results: null };
        }

        let ret = pageKeys.map((key)=> {
            if(!(key.type in pageKeyTypes)){
                throw 'Invalid key type';
            }
            let rKey = { ...key, ...("_id" in key ? {} : { _id: uuidv4()}) };

            return rKey;
        });

        return { results: ret };
    }
    catch(ex){
        log.error(`Validating Page Keys: ${ex}`);
        return { error: `Validating Page Keys: ${ex}`};
    }
}

function validatingService(service){
    let ret = [];
    try{
        if(!("title" in service) || service.title.length <= 0){
            ret.push(`Title`);
        }

        if(!("type" in service) || service.type.length <= 0){
            ret.push(`Type`);
        }

        if(!("time" in service)){
            ret.push(`Time`);
        }

        if(!("price" in service)){
            ret.push(`Price`);
        }

        if(!("bookingSite" in service)){
            ret.push(`Booking Site`);
        }

        if(!("image" in service)){
            ret.push(`image`);
        }

        if(!("description" in service)){
            ret.push(`Description`);
        }
    }
    catch(ex){
        log.error(`Validating Service: ${ex}`);
        ret.push('validating');
    }

    return ret;
}

/* Connection Clean Up */
const cleanup = (event) => {
    log.debug(`Closing Connection`);
    client.close(); process.exit(); 
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);