const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const fns = require('date-fns');

const db = require('../services/db.service.js'), 
    log = require('../services/log.service.js'),
    util = require('../utils/util.js');

module.exports = function (cacheStore) {
    const resolver = {
        Query:{
            user: async(_obj, args, context, _info) => {
                util.validateGQLParams(["id"], args);

                let ret = await db.getFullUser(args.id);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            userPermissions: async(_obj, args, context, _info) => {
                util.validateGQLParams(["appId"], args);

                let ret = await db.getUserPermissions(args.appId);
                util.checkGQLResults(ret);

                return ret?.results;
            },
        },
        Mutation:{
            addUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["email"], args);

                let ret = await db.addUser(args.email, args?.isAdmin, args?.scopes);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            updateUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["appId"], args);

                let ret = await db.updateUser(args.appId, args?.isAdmin, args?.scopes);
                util.checkGQLResults(ret);

                return ret?.results;
            },
            removeUserPermissions: async(_obj, args, context, _info) => {
                // Validate Active User
                // util.activeUserCheck(context);
                util.validateGQLParams(["appId"], args);

                let ret = await db.removeUser(args.appId);
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