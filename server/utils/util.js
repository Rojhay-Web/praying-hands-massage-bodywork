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
            throw new GraphQLError(ret.error, { extensions: { code: 'SERVICE_ERROR' } }); 
        }
    },
    jsonStrFormatter(str, isString){
        let ret = null;
        try {
            if(isString){
                ret = (str?.length > 0 ? JSON.parse(str) : {});
            }
            else {
                ret = (str ? JSON.stringify(str) : '{}');
            }
        }
        catch(ex){
            ret = (isString ? {} : '{}');
        }

        return ret;
    },
    validateEmail(value){
        let ret = false;
        try {
            var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            ret = (value?.length > 0 && value.match(validRegex));
        }
        catch(ex){
            console.log(`Validating Email: ${ex}`);
        }
        return ret;
    },
    validatePhone(value){
        let ret = false;
        try {
            var validRegex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
            ret = (value?.length > 0 && value.match(validRegex));
        }
        catch(ex){
            console.log(`Validating Phone Number: ${ex}`);
        }
        return ret;
    },
    validateDate(value){
        let ret = false;
        try {
            ret = !isNaN((new Date(value)).getTime());
        }
        catch(ex){
            console.log(`Validating Date: ${ex}`);
        }
        return ret;
    }
}