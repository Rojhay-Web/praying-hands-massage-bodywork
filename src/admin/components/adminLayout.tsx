import { useContext, useEffect, useState } from "react";
import { Sheet } from 'react-modal-sheet';
import { Link, useLocation, useNavigate  } from "react-router-dom";

import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import userContext from "../../context/user.context";

import { AdminPathType, UserContextType } from "../../datatypes";
import { appSessKey } from "../../utils";

/* Component Types */
type CtrlContainerType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void,
    pressEvent?: () => void
}

type MobileNavType = {
    displayComponents: any, selComponent: string,
    query: string, searchQuery: (e: any)=> void, 
    isOpen: boolean, setOpen:(a:any) => void
};

function CtrlContainer({ displayComponents, selComponent, query, pressEvent, searchQuery }: CtrlContainerType){
    const { user, setUser } = useContext(userContext.UserContext) as UserContextType;
    const navigate = useNavigate();

    const signOff = () => {
        try {
            if(window.confirm('Are you sure you want to Sign out?')){
                linkOnPress(); setUser(null);
                localStorage.removeItem(appSessKey);
                navigate('/');
            }
        }
        catch(ex){
            console.log(`Unable to signOff: ${ex}`);
        }
    }

    const linkOnPress = () => {
        if(pressEvent) pressEvent();
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
                {displayComponents.map((item: AdminPathType, i:number)=>
                    <Link to={`/allaccess/${item.path}`} className={`component-item ${selComponent === `/allaccess/${item.path}` ? 'sel':''}`} onClick={linkOnPress} key={i}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="item-title">{item.title}</span>
                    </Link>
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

function MobileNav({ isOpen, displayComponents, selComponent, query, searchQuery, setOpen }: MobileNavType){
    return(
        <div className="mobile-nav-container">
            <Sheet isOpen={isOpen} onClose={() => setOpen(false)} snapPoints={[0.75]}>
                <Sheet.Container>
                    <Sheet.Content>
                        <div className="ctrl-panel">
                            <CtrlContainer displayComponents={displayComponents} selComponent={selComponent} 
                                query={query} searchQuery={searchQuery} pressEvent={()=> setOpen(false)}  />
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop onTap={()=> setOpen(false) }/>
            </Sheet>
        </div>
    );
}

function AdminLayout(){
    const [query, setQuery] = useState("");
    const [displayComponents, setDisplayComponents] = useState<any>([]);
    const [selComponent, setSelComponent] = useState("");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [header, setHeader] = useState({ icon: "shield_person", title:"Admin Portal" });

    const { activeComponents } = useContext(userContext.UserContext) as UserContextType;
    const location = useLocation();

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
            const filterComp = activeComponents.filter((ac: AdminPathType) => { return `/allaccess/${ac.path}` === selComponent; });

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
        let filterList = activeComponents.filter((comp: AdminPathType) => {
            const hasQuery = comp.title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
            return hasQuery;
        });

        setDisplayComponents(filterList);
    },[activeComponents]);

    useEffect(()=>{ getHeaderTitle(); },[selComponent, activeComponents]);

    // TODO: Change selComponent on route change
    useEffect(()=>{
        setSelComponent(location?.pathname ?? "")
    },[location?.pathname]);

    return (
        <div className='app-body'>
            <ToastContainer />
            
            <div className="admin-home-page">
                <MobileNav displayComponents={displayComponents} selComponent={selComponent} 
                    query={query} searchQuery={searchQuery} 
                    isOpen={mobileNavOpen} setOpen={setMobileNavOpen} />
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

                        <Link className="app-link bookend header-btn" to="/">
                            <span className="material-symbols-outlined">language</span>
                            <span>Website</span>
                        </Link>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;