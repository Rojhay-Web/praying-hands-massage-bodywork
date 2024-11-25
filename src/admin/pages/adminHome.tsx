import { useContext, useEffect, useState } from "react";
import { Sheet } from 'react-modal-sheet';
import { Link } from "react-router-dom";

import userContext from "../../context/user.context";

import UserManagement from "../components/userManagement";
import CmsSiteEditor from "../components/cmsEditor";

import { UserContextType } from "../../datatypes";
import { appSessKey } from "../../utils";

const adminComponents = [
    { title: "CMS Editor", scope:"cms_admin", icon:"engineering" },
    { title: "User Management", scope:"users", icon:"group" },
    { title: "Image Gallery", scope:"gallery", icon:"gallery_thumbnail" },
    { title: "Site Editor", scope:"site_content", icon:"dvr" },
];

type CtrlContainerType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void,
    setSelComponent: (e:string) => void
}
type MobileNavType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void, 
    isOpen: boolean, setOpen:(a:any) => void,
    setSelComponent: (e:string) => void
};

function CtrlContainer({ displayComponents, selComponent, query, searchQuery, setSelComponent }: CtrlContainerType){
    const { user, setUser } = useContext(userContext.UserContext) as UserContextType;

    const signOff = () => {
        try {
            if(window.confirm('Are you sure you want to Sign out?')){
                setUser(null);
                localStorage.removeItem(appSessKey);
            }
        }
        catch(ex){
            console.log(`Unable to signOff: ${ex}`);
        }
    }

    return(
        <>
            <div className="side-title">
                <span className="material-symbols-outlined">genetics</span>
                <span className="title-txt">Site.Blueprint</span>
            </div>

            <div className="side-search">
                <div className="admin-input-container">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" name="query" placeholder='Search For Tool' value={query} onChange={searchQuery} />
                </div>
            </div>

            <div className="component-list-container">
                {displayComponents.map((item: any, i:number)=>
                    <div className={`component-item ${selComponent === item.scope ? 'sel':''}`} key={i} onClick={()=>{ setSelComponent(item.scope); }}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                    </div>
                )}
            </div>

            <div className="side-user-container">
                <div className="user-info">
                    <div className="user-img">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <span className="user-email">{user?.email}</span>
                </div>
                <div className="sign-out-link" onClick={signOff}>Sign-out</div>
            </div>
        </>
    );
}

function MobileNav({ isOpen, displayComponents, selComponent, query, searchQuery, setOpen, setSelComponent }: MobileNavType){
    return(
        <div className="mobile-nav-container">
            <Sheet isOpen={isOpen} onClose={() => setOpen(false)} snapPoints={[0.75]}>
                <Sheet.Container>
                    <Sheet.Content>
                        <div className="ctrl-panel">
                            <CtrlContainer displayComponents={displayComponents} selComponent={selComponent} 
                                query={query} searchQuery={searchQuery} setSelComponent={setSelComponent} />
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop />
            </Sheet>
        </div>
    );
}

function AdminHome(){
    const [query, setQuery] = useState("");
    const [displayComponents, setDisplayComponents] = useState<any>([]);
    const [selComponent, setSelComponent] = useState("cms_admin");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [header, setHeader] = useState({ icon: "shield_person", title:"Admin Portal" });

    const { user } = useContext(userContext.UserContext) as UserContextType;

    const searchQuery = (e:any) => {
        try {
            setQuery(e.target.value);
        }
        catch(ex){
            console.log(`Searching: ${ex}`);
        }
    }

    const getHeaderTitle = () => {
        let ret = { icon: "shield_person", title:"Admin Portal" };
            
        try {
            const filterComp = adminComponents.filter((ac) => { return ac.scope === selComponent; });

            if(selComponent?.length > 0 && filterComp?.length > 0) {
                ret = { icon: filterComp[0].icon, title:filterComp[0].title };
            }
        }
        catch(ex){
            console.log(`Getting Header: ${ex}`);
        }

        setHeader(ret);
    }
    
    const getAdminPage = () => {
        try {
            switch(selComponent){
                case "cms_admin":
                    return <CmsSiteEditor />;
                case "users":
                    return <UserManagement />;
                case "gallery":
                    return <></>;
                case "site_content":
                    return <></>;
                default:
                    return <></>;
            }
        }
        catch(ex){
            console.log(`Getting Admin Page: ${ex}`);
        }

        return <></>;
    }

    useEffect(()=>{
        let filterList = adminComponents.filter((comp) => {
            const hasQuery = comp.title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
            const isInScope = user?.scopes 
                && (comp.scope in user.scopes)
                && user.scopes[comp.scope] === true;

            return hasQuery && isInScope;
        });

        setDisplayComponents(filterList);
    },[query, user]);

    useEffect(()=>{
        getHeaderTitle();
    },[selComponent])
    
    return (
        <div className="admin-home-page">
            <MobileNav displayComponents={displayComponents} selComponent={selComponent} 
                setSelComponent={setSelComponent} query={query} searchQuery={searchQuery} 
                isOpen={mobileNavOpen} setOpen={setMobileNavOpen} />
            <div className="side-panel ctrl-panel">
                <CtrlContainer displayComponents={displayComponents} selComponent={selComponent} 
                    setSelComponent={setSelComponent} query={query} searchQuery={searchQuery} />
            </div>
            <div className="base-section">
                <div className="base-header">
                    <span className="material-symbols-outlined mobile-btn" onClick={()=> { setMobileNavOpen(!mobileNavOpen); }}>widgets</span>
                    <h1>
                        <span className="material-symbols-outlined">{header.icon}</span>
                        <span>{header.title}</span>
                    </h1>

                    <Link className="app-link bookend header-btn" to="/">
                        <span className="material-symbols-outlined">language</span>
                        <span>Website</span>
                    </Link>
                </div>

                {getAdminPage()}
            </div>
        </div>
    );
}

export default AdminHome;