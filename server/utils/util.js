const fns = require('date-fns');
const { GraphQLError } = require('graphql');

const log = require('../services/log.service'),
    response = require('../utils/responseCode');

module.exports = {
    formatDate(date, formatStr = 'yyyy-MM-dd'){
        let ret = null;
        try {
            ret = fns.format(date, formatStr);
        }
        catch(ex){
            log.error(`Formatting Date: ${ex}`);
            ret = null;
        }
        return ret;
    },
    terminate(server, options = { coredump: false, timeout: 500 }){
        const exit = code => {
            options.coredump ? process.abort() : process.exit(code)
        }
        
        return (code, reason) => (err, promise) => {
            if (err && err instanceof Error) {
                // Log error information, use a proper logging library here :)
                log.error(`${reason} ${err.message} - ${err.stack}`);
            }
            
            if(code === 0){
                // Attempt a graceful shutdown
                server.close(exit);
                setTimeout(exit, options.timeout).unref();
            }            
        }
    },
    activeUserCheck(userValidation){
        if(userValidation.error || !userValidation.results){
            log.error(userValidation.error);
            throw new GraphQLError(userValidation.error, { extensions: { code: response.ERROR.UNAUTHORIZED } });
        }
    },
    validateGQLParams(params, obj){
        if(!obj){ 
            throw new GraphQLError("param object is empty", { extensions: { code: 'BAD_REQUEST' } });    
        }
        else{
            let missingList = [];

            for(let i = 0; i < params.length; i++){
                if(!(params[i] in obj) || obj[params[i]] == null || obj[params[i]].length == 0){
                    log.warning(`${params[i]} is missing`);
                    missingList.push(params[i]);
                }
            }

            if(missingList.length > 0){
                throw new GraphQLError(`${missingList.join(",")} parameters are missing`, { extensions: { code: 'ValidationError' } });
            }
        }
    },
    checkGQLResults(ret){
        if(ret.error) {
            if(!ret?.errorCode || ret?.errorCode >= 0){
                log.error(ret.error);
            }            
            throw new GraphQLError(ret.error, { extensions: { code: 'KNOD_SERVICE_ERROR' } }); 
        }
    },
}