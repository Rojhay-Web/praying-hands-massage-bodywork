require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const app = express();

const auth = require('./server/services/auth.service'), 
    log = require('./server/services/log.service'),
    util = require('./server/utils/util.js');

// Initiating Cache Store
let localCacheStore = null;

// parse application/json
app.use(express.json());

// Set CORS Headers & Run Request Auth
app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    next();
});

// Graphql Declaration
async function startGraphQLServer() {
    const typeDefs = require('./server/graphql/typeDef.js'),
        resolvers = require('./server/graphql/resolvers.js')(localCacheStore);

    const apolloServer = new ApolloServer({ typeDefs, resolvers , context: async ({ req }) => { 
        return await auth.validateUser(req?.headers, req?.body);
    } });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/app/v1/gql' });
}

// Start GraphQL Server
startGraphQLServer();


// Catch all other routes and return the index file
const server = app.listen({ port: process.env.PORT || 8080 }, ()=> {
    log.info(`Rojhay-BP is open on port ${process.env.PORT || 8080}`);
});