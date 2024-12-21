import { createContext, useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

import { UserContextType, User, AdminPathType } from '../datatypes';
import { appSessKey, parseToken, buildToken } from "../utils";

// Admin Components
// import AdminHome from '../admin/pages/adminHome';
import CmsSiteEditor from '../admin/pages/cmsEditor';
import UserManagement from '../admin/pages/userManagement';
import SiteEditor from '../admin/pages/siteEditor';
import ImageGallery from '../admin/pages/imageGallery';
import ServicesEditor from '../admin/pages/services';

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

const adminComponents: AdminPathType[] = [
    { title: "User Management", scope:"users", icon:"group", path:"user_management", element: UserManagement },
    { title: "CMS Editor", scope:"cms_admin", icon:"engineering", path:"cms_editor", element: CmsSiteEditor },
    { title: "Site Editor", scope:"site_content", icon:"dvr", path:"site_editor", element: SiteEditor },
    { title: "Services", scope:"services", icon:"playing_cards", path:"services", element: ServicesEditor },
    { title: "Image Gallery", scope:"gallery", icon:"gallery_thumbnail", path:"image_gallery", element: ImageGallery },
]; 

function Provider({ children }: { children: any }) {
    const [user, setUser] = useState<User|null>(null);
    const [userToken, setUserToken] = useState<any|null>(null);
    const [activeComponents, setActiveComponents] = useState<any>([]);

    const refreshPermissions = useRef(false);

    const [retrieveUserData,{ loading, data }] = useLazyQuery(GET_USER_QUERY, {fetchPolicy: 'no-cache'});
    const [retrieveUserPermissions,{ loading: loading_permissions, data: data_permissions }] = useLazyQuery(GET_USER_PERMISSIONS_QUERY, {fetchPolicy: 'no-cache'});    

    const filterActiveComponents = () => {
        try {
            let filterList = adminComponents.filter((comp) => {
                const isInScope = user?.scopes 
                    && (comp.scope in user.scopes)
                    && user.scopes[comp.scope] === true;
    
                return isInScope;
            });

            setActiveComponents(filterList);
        }
        catch(ex){
            console.log(`Filtering Active Components: ${ex}`);
        }
    }

    useEffect(()=>{
        if(userToken && userToken?.access_token){
            retrieveUserData({ variables: { id: userToken.access_token }});
        }
    },[userToken, retrieveUserData]);

    useEffect(()=> {
        if(user?._id && refreshPermissions.current){
            retrieveUserPermissions({ variables: { _id: user._id }});
        }

        filterActiveComponents();
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

    return <UserContext.Provider value={{ user, setUser, userToken, setUserToken, loading, loading_permissions, activeComponents }}>{children}</UserContext.Provider>;
}

const contextRet = { UserContext, Provider };
export default contextRet;