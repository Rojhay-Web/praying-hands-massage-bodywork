const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const fns = require('date-fns');

const db = require('../services/db.service.js'), 
    log = require('../services/log.service.js'),
    util = require('../utils/util.js');

module.exports = function (cacheStore) {
    const resolver = {
        Query:{
            users: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                let ret = await db.getAppTable("users");
                util.checkGQLResults(ret);

                return ret?.results;
            },
            user: async(_obj, args, context, _info) => {
                util.validateGQLParams(["id"], args);

                let ret = await db.getFullUser(args.id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            userPermissions: async(_obj, args, context, _info) => {
                util.validateGQLParams(["_id"], args);

                let ret = await db.getUserPermissions(args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },

            sitePages: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                let ret = await db.getAppTable("site_pages");
                util.checkGQLResults(ret);

                return ret?.results;
            },
            sitePage: async(_obj, args, context, _info) => {
                util.validateGQLParams(["key"], args);

                let ret = await db.getPageData(args.key);
                util.checkGQLResults(ret);

                return ret?.results;
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

            upsertSitePage: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["title"], args);

                let ret = await db.upsertPageData(args.title, args?.pageKeys, args?._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removeSitePage: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["_id"], args);

                let ret = await db.removeAppTableData("site_pages",args._id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            updatePageKey: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["_id","key_id"], args);

                let ret = await db.updatePageKey(args._id, args.key_id, args?.title, args?.type, args?.meta, args?.value);
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