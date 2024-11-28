import { Dispatch, SetStateAction } from "react";

export type User = {
    id: string; 
    email:string; 
    given_name?:string;
    family_name?:string;
    name?: string;
    picture?:string;
    verified_email?:Boolean; 
    
    _id?:string;
    isAdmin?:Boolean; 
    scopes?: any;
}

export type UserContextType = {
    user: User | null; setUser: Dispatch<SetStateAction<User|null>>;
    userToken: any | null; setUserToken: Dispatch<SetStateAction<any|null>>;
    loading: Boolean | null; loading_permissions: Boolean | null;
    activeComponents: any;
}

export type AdminPathType = {
    title: string;  scope: string; icon: string;
    path:string; element: ()=> JSX.Element;
}

export type AdminTableColType = {
    title: string; 
    key: string; 
    type: string;
    default: any; 
    options?:string[];
    selectKey?:string;
    dictionary?:{[key:string]:any };
    required: boolean;
}

export type PageKey = {
    _id?: String
    title: String
    type?: String
    metaData?: any
    value?: { [key:string]:any}
}

export type SitePage = {
    _id?:string;
    title:string;
    key?:string;
    pageKeys: PageKey[];
}

export type Photosets = {
    id?: string;
    title: string;
    description: string;
    photos?: number;
}

export type Photo = {
    id: string;
    url: string;
}