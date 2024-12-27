import { isPast, addDays } from "date-fns";
import { toast } from "react-toastify";
import ReactGA from "react-ga4";

import { User } from "../datatypes";

const rootPath = (window.location.href.indexOf("localhost") > -1  ? "http://localhost:8080" : "");

export const appSessKey = "phw_bprint|usr";
export const GQL_URL = `${rootPath}/v1/gql`;
export const API_URL = `${rootPath}/v1/api`;

export const GA_MEASUREMENT_ID = "G-DEY50Q7M7B";

export const GOOGLE_LINK = "https://www.google.com/maps/place/Praying+Hands+Massage+and+Bodywork/@39.5146624,-75.7139167,17z/data=!3m1!4b1!4m6!3m5!1s0x89c7a16c990b9bc3:0xa72cb1cda5affc10!8m2!3d39.5146583!4d-75.7113418!16s%2Fg%2F11tfktb4z6?entry=ttu&g_ep=EgoyMDI0MTExOC4wIKXMDSoASAFQAw%3D%3D";
export const FACEBOOK_LINK = "https://www.facebook.com/sparklewithtrish";
export const INSTAGRAM_LINK = "https://www.instagram.com/praying_handsmassage/";

export function parseToken(token: string){
    var localUser: { user: User | null, expDt: Date | null } | null = null, 
        isExpired: Boolean | null = true; 

    try {
        localUser = JSON.parse(token);
        if(localUser && localUser.expDt){
            isExpired = (localUser?.user && isPast(localUser.expDt));
        }
    }
    catch(ex){
        console.log("[Error] parsing token: ",ex);
    }

    return { localUser, isExpired }
}

export function buildToken(user: User){
    let token = ""; 

    try {
        token = JSON.stringify({ user: user, expDt: addDays(new Date(), 30) });
    }
    catch(ex){
        console.log("[Error] parsing token: ",ex);
    }

    return token;
}

export const emptyList = (length: number) => {
    let ret: any[]  = [];
    for(let i=0; i < length; i++){ ret.push(i); }
    return ret;
}

export const handleGQLError = (err:any) => {
    try {
        toast.error(`Sorry we encountered an error. [${err}]`, { position: "top-right",
            autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
            draggable: true, progress: undefined, theme: "light" });
    }
    catch(ex){
        console.log(`Handling Error: ${ex}`);
    }
}

export const externalSiteConfirm = () => {
    return window.confirm('We are now navigating you to an external site via a new tab. To return to our website please switch via your browsers tabs bar.');
}

export const timeString = (time?: number | null) => {
    let ret = "";
    try {
        ret = `${!time ? 'Time may vary' : `${time} mins`}`;
    }
    catch(ex){
        console.log(`Building Time Str: ${ex}`);
    }
    return ret;
}

export const priceString = (price?: number | null) => {
    let ret = "";
    try {
        ret = (!price ? 'Prices may vary' : 
            new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD',
            }).format(price)
        );
    }
    catch(ex){
        console.log(`Building Time Str: ${ex}`);
    }
    return ret;
}

// Analytics
export const tagEvent = (category: string, action: string) => {
    try {
        ReactGA.event({ category: category, action: action });
    }
    catch(ex){
        console.log(`Tagging Event: ${ex}`);
    }
}

export const tagPageview = (page: string, title: string) => {
    try {
        ReactGA.send({ hitType: "pageview", page: page, title: title });
    }
    catch(ex){
        console.log(`Tagging Page View: ${ex}`);
    }
}