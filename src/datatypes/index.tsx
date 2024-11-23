import { Dispatch, SetStateAction } from "react";

export type User = {
    id: string; 
    email:string; 
    given_name?:string;
    family_name?:string;
    name?: string;
    picture?:string;
    verified_email?:Boolean; 
    
    appId?:string;
    isAdmin?:Boolean; 
    scopes?: Array<string>;
}

export type UserContextType = {
    user: User | null; setUser: Dispatch<SetStateAction<User|null>>;
    userToken: any | null; setUserToken: Dispatch<SetStateAction<any|null>>;
    loading: Boolean | null;
}