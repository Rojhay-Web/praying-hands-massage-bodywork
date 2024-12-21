require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

const auth = require('./server/services/auth.service'), 
    log = require('./server/services/log.service');

const { PORT } = process.env;

// init local cache store
const CacheStore = require('./server/services/cache.store.js');
let localStore = new CacheStore();
localStore.init();

// parse application/json
app.use(express.json());

// Apply the rate limiting middleware to all requests.
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200 // limit each IP to 100 requests per windowMs
}));

// Set CORS Headers & Run Request Auth
app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    next();
});

// Graphql Declaration
async function startGraphQLServer() {
    const typeDefs = require('./server/graphql/typeDef.js'),
        resolvers = require('./server/graphql/resolvers.js')(localStore);

    const apolloServer = new ApolloServer({ typeDefs, resolvers , context: async ({ req }) => { 
        return await auth.validateUser(req?.headers);
    } });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/v1/gql' });
}

// Start GraphQL Server
startGraphQLServer();

// API Declaration
app.use('/v1/api', require('./server/controllers/routes.controller.js')(localStore));

// set the static files location
app.use(express.static(path.join(__dirname, 'build')));

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build','index.html'));
});

// Start App
app.listen({ port: PORT || 8080 }, ()=> {
    log.info(`PHW-BP is open on port ${PORT || 8080}`);
});