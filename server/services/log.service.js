require('dotenv').config();
const fs = require('fs');

const { DEBUG, MAX_LOG_SZ, MAX_LOG_CNT }= process.env;

module.exports = {
    error: function(message){
        try {
            updateLog(` [Error] ${message}`);
        }
        catch(ex){
            console.log(`[ER] Logging: ${ex}`);
        }
    },
    warning: function(message){
        try {
            updateLog(` [Warning] ${message}`);
        }
        catch(ex){
            console.log(`[ER] Logging(2): ${ex}`);
        }
    },
    info: function(message){
        try {
            updateLog(`> ${message}`);
        }
        catch(ex){
            console.log(`[ER] Logging(3): ${ex}`);
        }
    },
    debug: function(message){
        try {
            if(DEBUG === "1"){
                updateLog(" [DEBUG] ");
                updateLog(message);  
            }          
        }
        catch(ex){
            console.log(`[ER] Logging(4): ${ex}`);
        }
    }
}

// Update LogFile
function updateLog(msg){
    try {
        if(DEBUG === "1"){
            update_log_file(msg);
        }
        else {
            update_log_console(msg);
        }
    }
    catch(ex){
        console.log(` [Error] writing to log: ${ex}`);
    }
}

function update_log_file(msg){
    try {
        let dir = `../logs`, d = new Date();

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        if(!fs.existsSync(`${dir}/log.txt`)){
            fs.appendFileSync(`${dir}/log.txt`, "-- --\n");
        }
        
        if(fs.statSync(`${dir}/log.txt`).size >= MAX_LOG_SZ){
            // Change File Name to old date name
            fs.renameSync(`${dir}/log.txt`, `${dir}/log_${d.getTime()}.txt`);
            // Create new log file
            fs.appendFileSync(`${dir}/log.txt`, "-- --\n");

            let dirList = fs.readdirSync(dir);

            if(dirList.length >= MAX_LOG_CNT) {
                let fileList = [];
                dirList.forEach(function (file) {
                    if(fs.existsSync(`${dir}/${file}`)){
                        let tmpStats = fs.statSync(`${dir}/${file}`);
                        tmpStats.path = `${dir}/${file}`; fileList.push(tmpStats);
                    }
                    else if(DEBUG) { console.log(`File DNE: ${file}`); }
                });

                const minFile = fileList.reduce(function(prev, current) {
                    return (prev.mtimeMs < current.mtimeMs) ? prev : current
                });

                // Delete Oldest File       
                if(DEBUG) { console.log(`Delete File: ${minFile.path}`); }           
                fs.unlinkSync(minFile.path);                    
            }
        }

        if(DEBUG) { console.log(msg); }
        fs.appendFileSync(`${dir}/log.txt`, ` ${d.toString()} | ${msg} \n`); 
    }
    catch(ex){
        console.log(` [Error] writing to log: ${ex}`);
    }    
}

function update_log_console(msg){
    try {
        let d = new Date();
        console.log(` ${d.toString()} | ${msg}`);
    }
    catch(ex){
        console.log(` [Error] writing to log: ${ex}`);
    } 
}