'use strict';
require('dotenv').config();
const fns = require('date-fns');

const log = require('./log.service'),
    gallery = require('./gallery.service');

class CacheStore {
    constructor() {
        this.storeExpiration = {
            flickr_keys: 0,
            gallery: 1
        };
        this.store = {
            flickr_keys: {},
            gallery: {}
        };
    }

    /* Search Cache Store For Key */
    searchCacheStore(storeName, key){
        try {
            key = key.toLowerCase();
            if(!(storeName in this.store)) {
                /* Key is not in store */
                log.debug(`Unable to find ${storeName} in cacheStore`);
                return null;
            }
            
            let ret = this.store[storeName][key];
            if(!ret?.lastAccessed || !ret?.data){
                return null;
            }

            // Check if cache expired
            let expDt = fns.addHours(ret.lastAccessed, this.storeExpiration[storeName]);
            if(this.storeExpiration[storeName] > 0 && fns.isPast(expDt)){
                return null;
            }

            return ret?.data;        
        }
        catch(ex){
            log.error(`Searching Cache [${storeName}]: ${ex}`);
            return null;
        }
    }

    /* Update Cache Store Local & Backup DB */
    updateCacheStore(storeName, key, data){
        let status = true;
        try {
            if(!(storeName in this.store)) {
                /* Key is not in store */
                /*log.error(`Unable to find ${storeName} in cacheStore`);*/
                return false;
            }
            else if(!data){
                /* Key is not in store */
                /*log.error(`No Data To Update/Insert`);*/
                return false;
            }

            key = key.toLowerCase();
            this.store[storeName][key] = { 
                "key": key, "lastAccessed": new Date(), "data": data
            };
            log.debug(`Added [${key}] to [${storeName}] cache`);
        }
        catch(ex){
            log.error(`Updating Cache [${storeName}]: ${ex}`);
            status = false;
        }

        return status;
    }

    clearCacheStore(){
        try {
            let objKey = Object.keys(this.store), self = this;

            objKey.forEach((obj) => {
                self.store[obj] = {}
            });
        }
        catch(ex){
            log.error(`Clearing Cache: ${ex}`);
        }
    }

    init(){
        try {
            this.updateCacheStore("flickr_keys", "oauthToken", process.env.FLICKR_OAUTH_TOKEN);
            this.updateCacheStore("flickr_keys", "oauthTokenSecret", process.env.FLICKR_OAUTH_TOKEN_SECRET);
        }
        catch(ex){
            log.error(`Init Cache: ${ex}`);
        }
    }

    /* Site Gallery */
    async getGallery(page=1, pageSize=20){
        try {
            const key =`${page}|${pageSize}`;
            let cacheGallery = this.searchCacheStore('gallery',key);

            if(cacheGallery) {
                return cacheGallery;
            }
            
            const flickrGallery = await gallery.photosets.getImages(process.env.GALLERY_DEFAULT_ID, page, pageSize);
            if(flickrGallery?.results) {
                this.updateCacheStore("gallery", key, flickrGallery);
            }

            return flickrGallery;
        }
        catch(ex){
            log.error(`Getting Cache Gallery: ${ex}`);
            return { error: `Getting Cache Gallery: ${ex}`};
        }
    }
}

module.exports = CacheStore;