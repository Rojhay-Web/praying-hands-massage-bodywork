import { createContext, useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

import { UserContextType, User } from '../datatypes';
import { appSessKey, parseToken, buildToken } from "../utils";

const GET_USER_QUERY = gql`
query getUser($id: String!){
    user(id: $id){
        email
        name
        picture
        _id
        isAdmin
        scopes
    }
}`,
GET_USER_PERMISSIONS_QUERY = gql`
query getUserPermissions($_id: String!){
    userPermissions(_id: $_id){
        isAdmin
        scopes
    }
}`;

const UserContext = createContext<UserContextType | null>(null);

function Provider({ children }: { children: any }) {
    const [user, setUser] = useState<User|null>(null);
    const [userToken, setUserToken] = useState<any|null>(null);

    const refreshPermissions = useRef(false);

    const [retrieveUserData,{ loading, data }] = useLazyQuery(GET_USER_QUERY, {fetchPolicy: 'no-cache'});
    const [retrieveUserPermissions,{ loading: loading_permissions, data: data_permissions }] = useLazyQuery(GET_USER_PERMISSIONS_QUERY, {fetchPolicy: 'no-cache'});    

    useEffect(()=>{
        if(userToken && userToken?.access_token){
            retrieveUserData({ variables: { id: userToken.access_token }});
        }
    },[userToken, retrieveUserData]);

    useEffect(()=> {
        if(user?._id && refreshPermissions.current){
            retrieveUserPermissions({ variables: { _id: user._id }});
        }
    },[user, refreshPermissions.current]);

    useEffect(()=> {
        if(!loading && data?.user){
            localStorage.setItem(appSessKey, buildToken(data.user));
            setUser(data.user);
        }
    },[data, loading]);

    useEffect(()=> {
        if(!loading_permissions && data_permissions?.userPermissions){
            refreshPermissions.current = false;
            setUser((d: any)=> {
                return {...d, ...data_permissions?.userPermissions};
            });
        }
    },[data_permissions, loading_permissions]);

    useEffect(()=>{
        const sessionInfo = localStorage.getItem(appSessKey);
        if(sessionInfo){
            let { isExpired, localUser } = parseToken(sessionInfo);
            if(isExpired || !localUser?.user) {
                localStorage.removeItem(appSessKey);
            }
            else {
                refreshPermissions.current = true;
                setUser(localUser.user);
            } 
        }
    },[]);

    //console.log(JSON.stringify(error, null, 2));

    return <UserContext.Provider value={{ user, setUser, userToken, setUserToken, loading, loading_permissions }}>{children}</UserContext.Provider>;
}

export default { UserContext, Provider };