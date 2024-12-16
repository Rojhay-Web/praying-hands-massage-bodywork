require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { createFlickr } = require("flickr-sdk");

const log = require('./log.service');
const { flickr } = createFlickr(process.env.FLICKR_KEY);

const FLICKR_IMG_SIZE = 'b';

module.exports = {
    photos: {
        search: async function(page=1, page_size=20){
            try {
                const res = await flickr("flickr.photos.search", {
                    user_id: process.env.FLICKR_USERID,
                    page: page, per_page: page_size
                });

                if(!res?.photos){
                    return { error: `Unable to retrieve data: ${ex}`};
                }

                let filterPhotos = res.photos?.photo.map((p)=>{
                    return { id: p?.id, url: buildFlickrUrl(p) }
                });

                if(filterPhotos?.length > 0){
                    filterPhotos = filterPhotos.filter((fp) => { return fp.url != null; });
                }

                return { pagesLeft: hasPagesLeft(page, page_size, res?.photos?.total), results: filterPhotos};
            }
            catch(ex){
               log.error(`Searching Photos: ${ex}`);
               return { "error": `Searching Photos`}; 
            }
        },
        /* Elevated Access Required */
        upload: async function(localStore, imagePath, title=null){
            try {
                const { upload } = runElevatedFlickr(localStore);
                if(!upload) {
                    return { error: 'Authenticating For This Request' };
                }

                const imgFullPath = path.resolve(imagePath);
                const data = await upload(imgFullPath, {
                    ...(title ? { title: title } : {})
                });

                // Remove Temp File From Server
                fs.unlinkSync(imgFullPath);

                return { results: data?.id ?? null };
            }
            catch(ex){
                log.error(`Uploading Photo: ${ex}`);
                return { "error": `Uploading Photo`}; 
            }
        },
        delete: async function(localStore, id){
            try {
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photos.delete", {
                    photo_id: id
                });

                return { results: res?.stat === "ok" };
            }
            catch(ex){
               log.error(`Deleting Photo: ${ex}`);
               return { "error": `Deleting Photo`}; 
            }
        },
    },
    photosets:{
        getAll: async function(){
            try {
                const res = await flickr("flickr.photosets.getList", {
                    user_id: process.env.FLICKR_USERID
                });

                const filterPhotoSets = res?.photosets?.photoset.map((p)=>{
                    return { ...p, 
                        title: p?.title?._content, 
                        description: p?.description?._content 
                    };
                })

                return { results: filterPhotoSets };
            }
            catch(ex){
               log.error(`Getting Photosets: ${ex}`);
               return { "error": `Getting Photosets`}; 
            }
        },
        getImages: async function(id, page=1, page_size=20){
            try {
                const res = await flickr("flickr.photosets.getPhotos", {
                    user_id: process.env.FLICKR_USERID,
                    photoset_id: id, page: page, per_page: page_size
                });

                if(!res?.photoset){
                    return { error: `Unable to retrieve data: ${ex}`};
                }

                let filterPhotos = res.photoset?.photo.map((p)=>{
                    return { id: p?.id, url: buildFlickrUrl(p) }
                });

                if(filterPhotos?.length > 0){
                    filterPhotos = filterPhotos.filter((fp) => { return fp.url != null; });
                }

                return { pagesLeft: hasPagesLeft(page, page_size, res?.photoset?.total), results: filterPhotos };
            }
            catch(ex){
               log.error(`Getting Photoset Images: ${ex}`);
               return { "error": `Getting Photoset Images`}; 
            }
        },
        /* Elevated Access Required */
        create: async function(localStore, title, primary_photo_id, description=""){
            try {
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photosets.create", {
                    title: title, description: description,
                    primary_photo_id: primary_photo_id
                });

                return { results: res?.photoset?.id ?? null };
            }
            catch(ex){
               log.error(`Creating Photoset: ${ex}`);
               return { "error": `Creating Photoset`}; 
            }
        },
        edit: async function(localStore, id, title, description=""){
            try {
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photosets.editMeta", {
                    title: title, description: description,
                    photoset_id: id
                });

                return { results: res?.photoset?.id ?? null };
            }
            catch(ex){
               log.error(`Editiing Photoset: ${ex}`);
               return { "error": `Editiing Photoset`}; 
            }
        },
        delete: async function(localStore, id){
            try {
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photosets.delete", {
                    photoset_id: id
                });

                return { results: res?.stat === "ok" };
            }
            catch(ex){
               log.error(`Deleting Photoset: ${ex}`);
               return { "error": `Deleting Photoset`}; 
            }
        },
        addPhotos: async function(localStore, id, photo_ids){
            try {
                // Get Photoset current images 
                const all_res = await flickr("flickr.photosets.getPhotos", {
                    user_id: process.env.FLICKR_USERID, photoset_id: id
                });

                let idPhotos = (all_res?.photoset?.photo ? 
                    all_res.photoset?.photo.map((p)=>{ return p?.id; }) : []);

                let fullList = idPhotos.concat(photo_ids);
                let uniqueList = [...new Set(fullList)].join(",");

                // Add Updated Set
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photosets.editPhotos", {
                    photoset_id: id, photo_ids: uniqueList, 
                    primary_photo_id: fullList[0]
                });

                return { results: res?.stat === "ok" };
            }
            catch(ex){
               log.error(`Adding Photos To Photoset: ${ex}`);
               return { "error": `Adding Photos To Photoset`}; 
            }
        },
        removePhotos: async function(localStore, id, photo_ids){
            try {
                const { elevatedFlickr } = runElevatedFlickr(localStore);
                if(!elevatedFlickr) {
                    return { error: 'Authenticating For This Request' };
                }

                const res = await elevatedFlickr("flickr.photosets.removePhotos", {
                    photoset_id: id, photo_ids: photo_ids.join(",")
                });

                return { results: res?.stat === "ok" };
            }
            catch(ex){
               log.error(`Removing Photo From Photoset: ${ex}`);
               return { "error": `Removing Photo From Photoset`}; 
            }
        }
    }
}

// Private Functions
function runElevatedFlickr(localStore){
    try {
        const oauthToken = localStore.searchCacheStore("flickr_keys", "oauthToken"),
            oauthTokenSecret = localStore.searchCacheStore("flickr_keys", "oauthTokenSecret");

        console.log(`${process.env.FLICKR_KEY} | ${process.env.FLICKR_SECRET} | ${oauthToken} | ${oauthTokenSecret}`)

        if(!oauthToken || !oauthToken){
            return { elevatedFlickr: null, upload: null };
        }

        const { flickr: elevatedFlickr, upload  } = createFlickr({
            consumerKey: process.env.FLICKR_KEY,
            consumerSecret: process.env.FLICKR_SECRET,
            oauthToken: oauthToken, oauthTokenSecret: oauthTokenSecret
        });

        return { elevatedFlickr, upload };
    }
    catch(ex){
        log.error(`Running Elevated Flickr: ${ex}`);
        return { elevatedFlickr: null, upload: null };
    }
}

function buildFlickrUrl(img){
    let ret = null;
    try {
        if("server" in img && "id" in img && "secret" in img){
            // https://www.flickr.com/services/api/misc.urls.html
            ret = `https://live.staticflickr.com/${img.server}/${img.id}_${img.secret}_${FLICKR_IMG_SIZE}.jpg`;
        }
    }
    catch(ex){
        log.error(`Building Flickr Url: ${ex}`);
    }
    return ret;
}

function hasPagesLeft(page, page_size, item_total=0){
    try {
        return (page * page_size) < item_total;
    }
    catch(ex){
        log.error(`Check If Has Pages Left: ${ex}`);
    }

    return false;
}