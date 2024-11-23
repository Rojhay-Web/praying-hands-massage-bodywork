import { useContext, useEffect, useState } from "react";
import { Sheet } from 'react-modal-sheet';

import userContext from "../../context/user.context";
import { UserContextType } from "../../datatypes";

const adminComponents = [
    { title: "User Management", scope:"users", icon:"group", component: null },
    { title: "Image Gallery", scope:"gallery", icon:"gallery_thumbnail", component: null },
    { title: "Site Content", scope:"site_content", icon:"dvr", component: null },
];

type CtrlContainerType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void
}
type MobileNavType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void, 
    isOpen: boolean, setOpen:(a:any) => void
};

function CtrlContainer({ displayComponents, selComponent, query, searchQuery }: CtrlContainerType){
    const { user } = useContext(userContext.UserContext) as UserContextType;

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
                    <div className={`component-item ${selComponent === item.scope ? 'sel':''}`} key={i}>
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
                <div className="sign-out-link">Sign-out</div>
            </div>
        </>
    );
}

function MobileNav({ isOpen, displayComponents, selComponent, query, searchQuery, setOpen }: MobileNavType){
    return(
        <div className="mobile-nav-container">
            <Sheet isOpen={isOpen} onClose={() => setOpen(false)} snapPoints={[0.75]}>
                <Sheet.Container>
                    <Sheet.Content>
                        <div className="ctrl-panel">
                            <CtrlContainer displayComponents={displayComponents} selComponent={selComponent} 
                                query={query} searchQuery={searchQuery} />
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
    const [selComponent, setSelComponent] = useState("");
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

    useEffect(()=>{
        let filterList = adminComponents.filter((comp) => {
            const hasQuery = comp.title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
            const isInScope = user?.scopes 
                && (comp.scope in user.scopes)
                && user.scopes[comp.scope] === true;

            return hasQuery && isInScope;
        });

        setDisplayComponents(filterList);
    },[query]);

    useEffect(()=>{
        getHeaderTitle();
    },[selComponent])
    
    return (
        <div className="admin-home-page">
            <MobileNav displayComponents={displayComponents} selComponent={selComponent} 
                query={query} searchQuery={searchQuery} isOpen={mobileNavOpen}
                setOpen={setMobileNavOpen} />
            <div className="side-panel ctrl-panel">
                <CtrlContainer displayComponents={displayComponents} selComponent={selComponent} 
                    query={query} searchQuery={searchQuery} />
            </div>
            <div className="base-section">
                <div className="base-header">
                    <span className="material-symbols-outlined mobile-btn" onClick={()=> { setMobileNavOpen(!mobileNavOpen); }}>widgets</span>
                    <h1>
                        <span className="material-symbols-outlined">{header.icon}</span>
                        <span>{header.title}</span>
                    </h1>

                    <div className="bookend header-btn">
                        <span className="material-symbols-outlined">language</span>
                        <span>Website</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHome;