require('dotenv').config();
const { google } = require('googleapis');
const fns = require('date-fns');

const log = require('./log.service'),
    mail = require('./mail.service'),
    util = require('../utils/util');

const { 
    DEFAULT_EMAIL_ADDRESS, EVENT_PROJECT_NUMBER, CALENDAR_ID
} = process.env;

module.exports = {
    event: {
        create: async function(service, name, email, phone, price, startTime, endTime) {
            try {
                let googleAuth = getGoogleAuth();
                if(!googleAuth){
                    return { 'error': 'Creating Event [E01]' };
                }

                let [event, priceStr] = buildEvent(service, name, email, phone, price, startTime, endTime);

                if(!event) {
                    return { error: "Creating Event [E02]" };
                }

                // Send Event Email
                let cur_hour = fns.getHours(new Date());
                let greetingTime = (cur_hour < 12 ? 'Morning' : (cur_hour < 17 ? 'Afternoon' : 'Evening'));

                const adminEmailBody = [
                    `Good ${greetingTime},`,
                    `There has been a new appointment requested by ${name} for "${service}" at ${fns.format(fns.parseISO(startTime), "MMM dd, yyyy hh:mm aaaa")}.
                     I have taken the liberty of adding this to your connected calendar, there also has been a confirmation email sent to them so please follow up with them to confirm their appointment.`,
                    `Below you will find their appointment information:`,'',
                    `Name: ${name}`, `Email: ${email}`, `Phone #: ${phone}`, 
                    `Scheduled Appointment Time: ${fns.format(fns.parseISO(startTime), "MMM dd, yyyy hh:mm aaaa")} - ${fns.format(fns.parseISO(endTime), "hh:mm aaaa")}`,
                    `Price: ${priceStr}`,
                    '',
                    '~ Site Service Scheduler'
                ],
                userEmailBody = [
                    `Good ${greetingTime},`,
                    `Thank you for requesting the following appointment: `,
                    `Service: ${service}`, `${priceStr}`,'',
                    `Name: ${name}`, `Email: ${email}`, `Phone #: ${phone}`, 
                    `Requested Appointment Time: ${fns.format(fns.parseISO(startTime), "MMM dd, yyyy hh:mm aaaa")} - ${fns.format(fns.parseISO(endTime), "hh:mm aaaa")}`,
                    '','This appointment is not officially confirmed we will reach out to you soon to follow up on this request.', 
                    `If any questions, concerns, or this information is incorrect please contact us at ${DEFAULT_EMAIL_ADDRESS} asap.`,
                    `We look forward to seeing you.`
                ];

                mail.sendEmail(DEFAULT_EMAIL_ADDRESS, 'Appointment Requested', adminEmailBody);
                mail.sendEmail(email, 'Appointment Request Confirmation', userEmailBody);

                // Add Event To Calendar
                const calendar = google.calendar({
                    version: 'v3', auth: googleAuth,
                    project: EVENT_PROJECT_NUMBER
                });
    
                let evtres = await calendar.events.insert({
                    calendarId: CALENDAR_ID,
                    resource: event
                });

                if(evtres?.data?.id){
                    return { results: evtres.data.id };
                }
    
                return { results: null };
            }
            catch(ex){
                log.error(`Creating Event: ${ex}`);
                return { error: "Creating Event [E00]" };
            }
        },
        remove: async function(eventId) {
            try {
                let googleAuth = getGoogleAuth();
                if(!googleAuth){
                    return { 'error': 'Creating Event [E01]' };
                }

                const calendar = google.calendar({
                    version: 'v3', auth: googleAuth,
                    project: EVENT_PROJECT_NUMBER
                });
    
                let evtres = await calendar.events.delete({
                    calendarId: CALENDAR_ID, eventId: eventId
                });

                return { results: (evtres?.data?.length > 0 ? false : true)};
            }
            catch(ex){
                log.error(`Removing Event: ${ex}`);
                return { error: "Removing Event [E00]" };
            }
        },
        get: async function(eventId) {
            try {
                let googleAuth = getGoogleAuth();
                if(!googleAuth){
                    return { 'error': 'Creating Event [E01]' };
                }

                const calendar = google.calendar({
                    version: 'v3', auth: googleAuth,
                    project: EVENT_PROJECT_NUMBER
                });

                let evtres = await calendar.events.get({
                    calendarId: CALENDAR_ID, eventId: eventId
                });

                return { results: evtres?.data };
            }
            catch(ex){
                log.error(`Getting Event: ${ex}`);
                return { error: "Getting Event [E00]" };
            }
        },
        getRange: async function(startDt, endDt) {
            try {
                let googleAuth = getGoogleAuth();
                if(!googleAuth){
                    return { 'error': 'Creating Event [E01]' };
                }

                const calendar = google.calendar({
                    version: 'v3', auth: googleAuth,
                    project: EVENT_PROJECT_NUMBER
                });

                let evtres = await calendar.events.list({
                    calendarId: CALENDAR_ID,
                    timeMin: parseDateString(startDt, true),
                    timeMax: parseDateString(endDt, true),
                    orderBy: "startTime", singleEvents: true
                });

                return { results: evtres?.data?.items };
            }
            catch(ex){
                log.error(`Getting Range Of Event: ${ex}`);
                return { error: "Getting Range Of Event [E00]" };
            }
        }
    },
    avalibility: async function(startDt, endDt, time=60){
        try {
            let googleAuth = getGoogleAuth();
            if(!googleAuth){
                return { 'error': 'Getting Event Avalibility [E01]' };
            }

            const calendar = google.calendar({
                version: 'v3', auth: googleAuth,
                project: EVENT_PROJECT_NUMBER
            });

            let evtres = await calendar.freebusy.query({
                resource:{
                    timeMin: parseDateString(startDt, true),
                    timeMax: parseDateString(endDt, true),
                    items:[{id: CALENDAR_ID}]
                }
            });

            const calBusy = (CALENDAR_ID in evtres?.data?.calendars ? evtres.data.calendars[CALENDAR_ID] : null);

            const timeWindows = [{"start":900, "end": 1700}];

            return { results: determineAvalibility(startDt, calBusy?.busy, time, timeWindows) };
        }
        catch(ex){
            log.error(`Getting Event Avalibility: ${ex}`);
            return { error: "Getting Event Avalibility [E00]" };
        }
    }
}

/* Private Events */
function getGoogleAuth(){
    let ret = null;
    try {
        const privateKey = process.env.EVENT_PRIVATE_KEY;
        
        ret = new google.auth.JWT(
            process.env.EVENT_CLIENT_EMAIL,
            null,
            privateKey.replace(/\\n/g, '\n'),
            'https://www.googleapis.com/auth/calendar'
        );
    }
    catch(ex){
        log.error(`Authenticating Google Account: ${ex}`);
    }

    return ret;
}

function buildEvent(service, name, email, phone, price, startTime, endTime){
    let ret = {}, priceStr = '';
    try {
        if(!service || service.length <= 0){ log.warning(`Invalid Event Service`); return null; }
        if(!name || name.length <= 0){ log.warning(`Invalid Event Name`); return null; }

        if(!email || !util.validateEmail(email)){ log.warning(`Invalid Event Email`); return null; }
        if(!phone || !util.validatePhone(phone)){ log.warning(`Invalid Event Phone`); return null; }

        if(!startTime || !util.validateDate(startTime)){ log.warning(`Invalid Event Start Time`); return null; }
        if(!endTime || !util.validateDate(endTime)){ log.warning(`Invalid End Time Service`); return null; }
        
        priceStr = (!price ? 'Prices may vary' : 
            new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD',
            }).format(price)
        );

        ret = {
            "summary": `${service} Appointment (${name})`,
            "description":
            `${service} Appointment\n
            ${priceStr}\n\n
            Name: ${name}\n
            Email: ${email}\n
            Phone #: ${phone}\n
            ${fns.format(fns.parseISO(startTime), "MMM dd, yyyy hh:mm aaaa")} - 
            ${fns.format(fns.parseISO(endTime), "hh:mm aaaa")}
            `,
            "start": {
                'dateTime': parseDateString(startTime,false),
                'timeZone': 'America/New_York',
            },
            "end": {
                'dateTime': parseDateString(endTime, false),
                'timeZone': 'America/New_York',
            }
        }
    }
    catch(ex){
        log.error(`Building Event: ${ex}`);
        return [null, null];
    }

    return [ret, priceStr];
}

function parseDateString(date, start=false){
    try {
        if(date) {
            let d = fns.parseISO(date);
            let startOfDt = (start ? fns.startOfDay(d) : d);

            return fns.formatISO(startOfDt);
        }
    }
    catch(ex){
        log.error(`Parsing Date String: ${ex}`);
    }
    return null;
}

function determineAvalibility(startDt, calBusy=[], time, windows) {
    try {
        let ret = [];
        for(let i=0; i < windows.length; i++){
            let windowTime = windows[i].start;
            
            while(windowTime < windows[i].end){
                let end = calcTime(windowTime, time),
                    isAvaliable = true;

                // Ensure time is not in calc busy window
                for(let j=0; j < calBusy.length; j++){
                    let bStart = getDateStrTime(calBusy[j].start),
                        bEnd = getDateStrTime(calBusy[j].end);
                        
                    let unAvailable = (windowTime >= bStart && windowTime < bEnd) || (windowTime < bStart && end > bStart);
                    
                    isAvaliable = (unAvailable ? false : isAvaliable);
                }
                
                if(isAvaliable) {
                    let parsedDt = fns.parseISO(startDt);
                    ret.push({
                        dateTime: `${fns.format(parsedDt,'yyyy-MM-dd')}T${calcTimeStr(windowTime)}`,
                        timeZone: "America/New_York"
                    });
                }
                
                windowTime = calcTime(windowTime, 30);
            }
        }

        return ret;
    }
    catch(ex){
        log.error(`Determining Avalibility: ${ex}`);
    }

    return [];
}

function calcTime(time, mins){
    let ret = time;
    try {
        // Build Time String
        let timeStr = calcTimeStr(time);

        // Add Time to Random Date
        const date = new Date(`1970-01-01T${timeStr}`);
        date.setMinutes(date.getMinutes() + mins);
        
        // Get New Time String
        let newTimeStr = date.toTimeString().slice(0, 5);
        ret = Number(newTimeStr.replace(':',''));
    }
    catch(ex){
        log.error(`Calculating Time: ${ex}`);
    }

    return ret;
}

function calcTimeStr(time){
    let ret='';
    try {
        const timeStr = `0000${time}`,
            timeStr2 = [];

        for(let i=0; i < 4 ; i++){
            if(i == 2){
                timeStr2.unshift(':');
            }

            let char = timeStr.at((timeStr.length-1) - i);
            timeStr2.unshift(char);
        }

        ret = timeStr2.join('');
    }
    catch(ex){
        log.error(`Calc Time String: ${ex}`);
    }

    return ret;
}

function getDateStrTime(dtStr){
    let ret = 0;

    try {
        const dt = new Date(dtStr);
        const h = dt.getHours(), m = dt.getMinutes();
        const timeStr = `${h < 10 ? `0${h}` : `${h}`}${m < 10 ? `0${m}` : `${m}`}`;

        ret = Number(timeStr);
    }
    catch(ex){
        log.error(`Calculating Date Str: ${ex}`);
    }

    return ret;
}