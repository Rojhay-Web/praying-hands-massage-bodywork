import { isPast, addDays } from "date-fns";

import { User } from "../datatypes";

export const appSessKey = "roj_bprint|usr";
export const GQL_URL = "http://localhost:8080/app/v1/gql";

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