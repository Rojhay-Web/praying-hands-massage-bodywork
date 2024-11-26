import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import { spiral } from 'ldrs'

import userContext from "../../context/user.context";

import { AdminTableColType, SitePage, UserContextType } from "../../datatypes";
import AdminTable from "./adminTable";

const MAX_NEW_ROWS = 1;
const tableSetup: AdminTableColType[] = [
    { title: "Title", key:"title", type: "text", default: "", required: true },
    { 
        title: "Type", key:"type", type: "select", default: "", 
        options:[ "title", "description","list","images"], required: true 
    },
    { 
        title: "", key:"metaData", type: "select_metadata",
        selectKey: "type", 
        dictionary:{ 
            "list":[{ key: "max", type: "number", default: 0 }],
            "images":[{ key: "max", type: "number", default: 0 }]
        }, default: {}, required: false 
    }
];

const GET_SITE_PAGES_QUERY = gql`
    query getSitePages{
        sitePages{
            _id
            title
            key
        }
    }`,
GET_IND_SITE_PAGE_QUERY = gql`
    query getSitePage($key: String!) { 
        sitePage(key: $key) {
            _id
            title
            key
            pageKeys {
                _id
                title
                type
                metaData
                value
            }
        }
    }`;

function CmsSiteEditor(){
    const [selPage, setSelPage] = useState("");
    const [selPageData, setSelPageData] = useState<SitePage | null>(null);

    const pillScrollRef = useRef<HTMLDivElement>(null);
    const localNewPage = useRef<SitePage | null>(null);

    const { user } = useContext(userContext.UserContext) as UserContextType;

    const handleGQLError = (err:any) => {
        try {
            toast.error(`Sorry we encountered an error. [${err}]`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });
        }
        catch(ex){
            console.log(`Handling Error: ${ex}`);
        }
    }

    // GQL Queries
    const [retrievePages,{ loading: site_pages_loading, data: site_pages_data }] = useLazyQuery(GET_SITE_PAGES_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});
    const [retrievePage,{ loading: site_page_loading, data: site_page_data }] = useLazyQuery(GET_IND_SITE_PAGE_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});

    const controlSlider = (ref:any, dir:string) => {
        try {
            let offsetWidth = ref.current.offsetWidth,
                scrollWidth = ref.current.scrollWidth;

            if(scrollWidth > offsetWidth){
                let scrollSz = (offsetWidth <= 770 ? 220 : ((scrollWidth - offsetWidth) / 2)),
                    newScrollLeft = ref.current.scrollLeft;

                if(dir === "prev"){
                    newScrollLeft = ref.current.scrollLeft - scrollSz;
                }
                else if(dir === "next"){
                    newScrollLeft = ref.current.scrollLeft + scrollSz;
                }

                ref.current.scrollLeft = newScrollLeft;
            }
        }
        catch(ex){
            console.log(`Error Controlling Slider: ${ex}`);
        }
    }

    const toggleNewPage = () => {
        if(localNewPage?.current){
            setSelPageData(localNewPage.current);
        }
        else {
            localNewPage.current = { title:"", pageKeys:[] };
            setSelPageData({ title:"", pageKeys:[] });
        }
    }

    const updatePage = (e:any) => {
        try {
            let { name, value } = e.target;

            setSelPageData((d: any)=> {
                return {...d, [name]:value };
            });
        }
        catch(ex){
            console.log(`Updating Page: ${ex}`);
        }
    }

    const addKeyRow = () => {
        try {
            let newRow = selPageData?.pageKeys.filter((p) => { return !p._id; });
            if(newRow && newRow?.length >= MAX_NEW_ROWS){
                toast.warning(`You have ${MAX_NEW_ROWS} pending new page key, please save the pending key before adding any more.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else if(!selPageData?._id){
                toast.warning(`Please save your page before adding keys.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                setSelPageData((d: any)=>{
                    let tmp = {...d};
                    tmp.pageKeys.unshift({ title: "", type:"", metaData:{}, value:{ data: ""}});

                    return tmp;
                });
            }
        }
        catch(ex){
            console.log(`Adding Key Row: ${ex}`);
        }
    }

    const deleteKeyRow = (_id: string | undefined, newIdx: number) => {
        try {
            if(_id) {
                console.log('Delete > ', _id);
                // removeUser({ variables: { _id: _id }});
            }
            else if(newIdx >= 0){
                setSelPageData((d: any)=>{
                    let tmp = {...d};
                    tmp.pageKeys.splice(newIdx,1);
                    return tmp;
                });
            }
        }
        catch(ex){
            console.log(`Deleting Row: ${ex}`);
        }
    }

    const saveKeyRow = (row: any) => {
        try {
            if(!selPageData?._id){
                toast.error(`Please save your page prior to adding page key.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                let isValid = true;
                tableSetup.forEach((s)=> {
                    if(s.required && _.isEmpty(row[s.key])){
                        isValid = false;
                    }
                });

                if(!isValid) {
                    toast.error(`Unable to Save Row: Please make sure you don't leave any fields empty.`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else {
                    if(selPageData && !selPageData?._id) {
                        localNewPage.current = null;
                    }
                    // Upsert Page Key
                }
            }
        }
        catch(ex){
            console.log(`Saving Row: ${ex}`);
        }
    }

    useEffect(()=> {
        if(selPage) {
            if(selPageData && !selPageData?._id) {
                localNewPage.current = _.cloneDeep(selPageData);
            }
            retrievePage({ variables: { key: selPage }});
        }
        else if(selPageData){
            setSelPageData(null);
        }
    },[selPage]);

    useEffect(()=>{
        if(site_page_data?.sitePage){
            setSelPageData(site_page_data.sitePage);
        }
    },[site_page_data])

    useEffect(()=>{ spiral.register(); },[]);

    // Refresh Users On Completion of action
    useEffect(()=>{ 
        if(!site_pages_loading){
            retrievePages({});
        }
    },[]);

    return(
        <div className="admin-component cms-site-editor">
            <div className="table-action-container">
                <div className="pill-list-title">Website Pages</div>
                <div className={`pill-add-btn ${!selPageData || selPageData?._id ? "" : "text"}`} onClick={toggleNewPage}>
                    <span className="material-symbols-outlined">add</span>
                    <span className="new-page-title">New Page</span>
                </div>

                <div className="pill-list-container">
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "prev")}>chevron_left</span>
                    <div className="scroll-pill-list" ref={pillScrollRef}>
                        {site_pages_data?.sitePages.map((pg: SitePage, i: number)=>
                            <div className={`pill-item ${pg.key === selPage ? 'sel' : ''}`} key={i} onClick={()=> { if(pg.key) setSelPage(pg.key); }}>{pg.title}</div>
                        )}
                    </div>
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "next")}>chevron_right</span>
                </div>
            </div>

            {/* CMS Info */}
            {site_page_loading ?
                <div><l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral></div> :
                <>
                    {!selPageData ?
                        <></>: 
                        <>
                            <div className="page-title-container">
                                <input className='title-input' type="text" name="title" placeholder="Enter Page Title..." value={selPageData?.title} onChange={updatePage} />

                                <div className="title-btn-container">
                                    <div className="add-key-btn" onClick={addKeyRow}>
                                        <span className="material-symbols-outlined">library_add</span>
                                        <span>Add Page Key</span>
                                    </div>
                                    <span className={`material-symbols-outlined icon-btn`} onClick={()=>{}}>save</span>
                                    <span className="material-symbols-outlined icon-btn remove" onClick={()=>{}}>remove_selection</span>
                                </div>
                            </div>

                            <AdminTable data={selPageData?.pageKeys} cols={tableSetup} loading={site_pages_loading} saveRow={saveKeyRow} deleteRow={deleteKeyRow}/>
                        </>
                    }   
                </>
            }
        </div>
    );
}

export default CmsSiteEditor;