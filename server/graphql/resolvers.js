const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const fns = require('date-fns');

const db = require('../services/db.service.js'), 
    gallery = require('../services/gallery.service.js'),
    log = require('../services/log.service.js'),
    util = require('../utils/util.js');

module.exports = function (localStore) {
    const resolver = {
        Query:{
            /* Users */
            users: async(_obj, _args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                let ret = await db.getAppTable("users");
                util.checkGQLResults(ret);

                return ret?.results;
            },
            user: async(_obj, args, _context, _info) => {
                util.validateGQLParams(["id"], args);

                let ret = await db.getFullUser(args.id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            userPermissions: async(_obj, args, _context, _info) => {
                util.validateGQLParams(["_id"], args);

                let ret = await db.getUserPermissions(args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            /* Site Pages */
            sitePages: async(_obj, _args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                let ret = await db.getAppTable("site_pages");
                util.checkGQLResults(ret);

                return ret?.results;
            },
            sitePage: async(_obj, args, _context, _info) => {
                util.validateGQLParams(["key"], args);

                let ret = await db.getPageData(args.key);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            /* Gallery */
            photos: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                let ret = await gallery.photos.search(args?.page, args?.pageSize);
                util.checkGQLResults(ret);

                return ret;
            },
            photosets: async(_obj, _args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                let ret = await gallery.photosets.getAll();
                util.checkGQLResults(ret);

                return ret?.results;
            },
            photosetImages: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);                
                util.validateGQLParams(["id"], args);

                let ret = await gallery.photosets.getImages(args.id, args?.page, args?.pageSize);
                util.checkGQLResults(ret);

                return ret;
            },
        },
        Mutation:{
            addUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["email"], args);

                let ret = await db.upsertUser(args.email, args?.isAdmin, args?.scopes, null);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            updateUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["_id"], args);

                let ret = await db.upsertUser(args.email, args?.isAdmin, args?.scopes, args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removeUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["_id"], args);

                let ret = await db.removeAppTableData("users",args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            /* Site Page */
            upsertSitePage: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["title"], args);

                let ret = await db.upsertPageData(args.title, args?.pageKeys, args?._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removeSitePage: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["_id"], args);

                let ret = await db.removeAppTableData("site_pages",args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            upsertPageKey: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["_id"], args);

                let ret = await db.upsertPageKey(args._id, args.key_id, args?.title, args?.type, args?.meta, args?.value);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removePageKey: async(_obj, args, context, _info) => {
                // Validate Active User
                util.activeUserCheck(context);
                util.validateGQLParams(["_id","key_id"], args);

                let ret = await db.removePageKey(args._id, args.key_id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            /* Gallery */
            deletePhoto: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["id"], args);

                let ret = await gallery.photos.delete(localStore, args.id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            createPhotoset: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["title", "primaryPhotoId"], args);

                let ret = await gallery.photosets.create(localStore,args.title, args.primaryPhotoId, args?.description);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            editPhotoset: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["title", "id"], args);

                let ret = await gallery.photosets.edit(localStore, args.id, args.title, args?.description);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            deletePhotoset: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["id"], args);

                let ret = await gallery.photosets.delete(localStore, args.id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            addPhotosetPhoto: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["id", "photoId"], args);

                let ret = await gallery.photosets.addPhoto(localStore, args.id, args.photoId);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removePhotosetPhotos: async(_obj, args, context, _info) => {
                // Validate Active User
                //util.activeUserCheck(context);
                util.validateGQLParams(["id", "photoIds"], args);

                let ret = await gallery.photosets.removePhotos(localStore, args.id, args.photoIds);
                util.checkGQLResults(ret);

                return ret?.results;
            },
        },
        /* Scalar Types */
        Date: new GraphQLScalarType({
            name: 'Date',
            description: 'Date custom scalar type',
            parseValue(value) {
                return (value ? fns.parseISO(value) : null); // value from the client
            },
            serialize(value) {
                const dtStr = util.formatDate(value, 'yyyy-MM-dd HH:mm:ss')
                let d = fns.parseISO(dtStr);
                return (value ? fns.getTime(d) : -1);
            },
            parseLiteral(ast) {
                if (ast.kind === Kind.INT) {
                    return parseInt(ast.value, 10); // ast value is always in string format
                }
                return null;
            },
        }),
        JSONObj: new GraphQLScalarType({
            name: 'JSONObj',
            description: 'JSON Object custom scalar type',
            parseValue(value) {
                if(value && value instanceof Object) {
                    return value;
                }

                return (value ? JSON.parse(value) : null); // value from the client
            },
            serialize(value) {
                let d = (value instanceof Object ? value : JSON.parse(value));
                return d;
                //return (value ? JSON.stringify(d) : null); // value sent to the client
            }
        })
    };

    return resolver;
};