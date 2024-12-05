"use strict";
const express = require('express');
const multer = require('multer');
const router = express.Router();

const auth = require('../services/auth.service'), 
    gallery = require('../services/gallery.service'),
    log = require('../services/log.service'),
    response = require('../utils/responseCode');

/* IMG Upload */
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, './uploads'); },
    filename: function (req, file, cb) { cb(null, Date.now() + file.originalname); }
});
const acceptedFiles = { 'image/jpeg': true, 'image/png': true };
const fileFilter = (_req, file, cb) => {
    cb(null, (file.mimetype in acceptedFiles));
}

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }    
});

module.exports = function(localStore) {
    async function uploadImage(req, res){
        try {
            const auth_ret = await auth.validateUser(req?.headers);
            if(auth_ret?.results){
                const ret = await gallery.photos.upload(localStore, req.file.path, req?.body?.name);
                res.status(response.SUCCESS.OK).json(ret);
            }
            else {
                res.status(response.ERROR.UNAUTHORIZED).json({ "error":"Unauthorized User" });
            }
        }
        catch(ex){
            log.error(`Uploading Image: ${ex}`);
            res.status(response.SERVER_ERROR.UNAVAILABLE).json({"error":`Error uploading image: ${ex}`});
        }
    }

    router.post("/image", upload.single('image'), uploadImage);

    return router;
}