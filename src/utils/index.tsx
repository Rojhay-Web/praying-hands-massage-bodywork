import { isPast, addDays } from "date-fns";
import { toast } from "react-toastify";

import { User } from "../datatypes";

const rootPath = (window.location.href.indexOf("localhost") > -1  ? "http://localhost:8080" : "");

export const appSessKey = "roj_bprint|usr";
export const GQL_URL = `${rootPath}/v1/gql`;
export const API_URL = `${rootPath}/v1/api`;

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