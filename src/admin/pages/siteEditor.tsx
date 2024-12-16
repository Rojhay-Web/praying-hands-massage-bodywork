import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';

import SelectedPhotosCtrl from "../components/selectedPhotoCtrl";
import GalleryCtrlModal from "../components/galleryCtrlModal";

import userContext from "../../context/user.context";

import { FilePhoto, PageKey, Photo, SitePage, UserContextType } from "../../datatypes";
import { handleGQLError } from "../../utils";

type KeyEditorTileType = {
    pageKey: PageKey, updatePageData: (data: any) => void
}

type ImageEditorType = {
    maxSelect?: number, selected: FilePhoto[],
    updateList:(images:Photo[]) => void
}

const quillSetup = {
    modules: {
        toolbar:[
            [{ 'header': '1'}, {'header': '2'}, {size: []}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}, 
                {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'clean'],
        ],
        clipboard: {matchVisual: false }
    },
    formats: [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'list', 'indent', 'link',
    ]
};

const GET_SITE_PAGES_QUERY = gql`
    query GetSitePages{
        sitePages{
            _id
            title
            key
        }
    }`,
GET_IND_SITE_PAGE_QUERY = gql`
    query GetSitePage($key: String!) { 
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
    }`,
UPSERT_PAGE_MUTATION = gql`
    mutation UpsertSitePage($title: String!, $pageKeys:[PageKeyInput], $_id:String){
        upsertSitePage(title: $title, pageKeys: $pageKeys, _id: $_id)
    }`,
SEARCH_PHOTOS_QUERY = gql`
    query searchPhotos($page: Int, $pageSize:Int){
       photos(page:$page, pageSize:$pageSize){
           pagesLeft
           results {
               url
           }
       }
   }`;

function PillListEditor({ list, updateList }:{ list:string[], updateList: (e:string[]) => void }){
    const [newItem, setNewItem] = useState("");

    const addToList = () => {
        try {
            if(newItem.length > 0){
                let tmpList = (!list ? [] : _.cloneDeep(list));
                tmpList.push(newItem);
                updateList(tmpList);
                setNewItem("");
            }
        }
        catch(ex){
            console.log(`Adding To List: ${ex}`)
        }
    }

    const removeFromList = (idx: number) => {
        try {
            if(idx < list.length){
                let tmpList = (!list ? [] : _.cloneDeep(list));
                tmpList.splice(idx, 1);
                updateList(tmpList);
            }
        }
        catch(ex){
            console.log(`Removing From List: ${ex}`)
        }
    }

    return(
        <div className="pill-list-editor-container">
            <div className="ple-input-container">
                <input className="ple-input" value={newItem} onChange={(e:any) => { setNewItem(e.target.value); }} />
                <div className={`ple-btn ${newItem.length <= 0 ? "disabled":""}`} onClick={addToList}>
                    <span className="material-symbols-outlined">add</span>
                    <span className="ple-title">Add Item</span>
                </div>
            </div>

            <div className="ple-list">
                {list && list?.length > 0 ?
                    <>
                        {list?.map((item,i)=>
                            <div className="ple-item" key={i}>
                                <span className="material-symbols-outlined remove-ple" onClick={()=> removeFromList(i)}>close</span>
                                <span className="ple-title">{item}</span>
                            </div>
                        )}
                    </> : <></>
                }
            </div>
        </div>
    );
}

function ImageEditor({ maxSelect=1, selected, updateList }: ImageEditorType){
    const [openModal, setOpenModal] = useState(false);
    const [localSelect, setLocalSelect] = useState<FilePhoto[]>([]);
    const [manualAdd, setManualAdd] = useState(false); 

    const { user } = useContext(userContext.UserContext) as UserContextType;
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [searchImages,{ loading: search_loading, data: search_data }] = useLazyQuery(SEARCH_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    const tabs = ["select image","upload"];

    const toggleImage = (photo: FilePhoto) => {
        try {
            let toggleIdx = localSelect.map((u:any)=> u.url).indexOf(photo.url);
            
            if(toggleIdx >= 0){
                localSelect.splice(toggleIdx,1);
                updateList(localSelect);
            }
        }
        catch(ex){
            console.log(`Toggling SE Image: ${ex}`);
        }
    }

    const closeModal = (photoset: FilePhoto[]) => {
        try {
            // TODO: Add photos to selected

            setOpenModal(false);
        }
        catch(ex){
            console.log(`Closing Modal: ${ex}`);
        }
    }

    const modalSecondAction = (tab: string, ids: string[], photoset: FilePhoto[]) => {
        try {
            if(tab === "upload") {
                searchImages({ variables: { page: 1, pageSize: ids?.length }});                
            }
            else {
                let tmpList = localSelect.concat(photoset);
                updateList(tmpList); setManualAdd(true);
            }
        }
        catch(ex){
            console.log(`Performing modal second action: ${ex}`);
        }
    }

    const checkOpenModal = () => {
        try {
            if((maxSelect - localSelect?.length) <= 0){
                toast.warning(`You have reached the limit for images for this field.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                setManualAdd(false);
                setOpenModal(true);
            }
        }
        catch(ex){
            console.log(`Checking Open Modal: ${ex}`);
        }
    }

    useEffect(()=>{
        if(!search_loading && search_data?.photos?.results?.length > 0){
            let tmpList = localSelect.concat(search_data.photos.results);
            updateList(tmpList);
        }
    },[search_loading]);

    useEffect(()=>{
        if(selected && _.isArray(selected)){
            setLocalSelect(selected);
        }
        else {
            setLocalSelect([]);
        }
    },[selected]);

    return(
        <div className="image-editor-container">
            <SelectedPhotosCtrl maxSelect={maxSelect} selected={localSelect} uploadFlag={false} selecting={false} setCompleted={(d)=>{}} toggleImage={toggleImage} />
            <div className='image-editor-upload-container' onClick={checkOpenModal}>
                <span className="material-symbols-outlined">gallery_thumbnail</span>
                <span className='title'>Add/Select image(s) to use</span>
            </div>

            <GalleryCtrlModal visible={openModal} tabs={tabs} maxSelect={(maxSelect - localSelect?.length)} secondActionTitle={"Add Images"}
                 secondAction={modalSecondAction} secondActionLoading={search_loading} hasSecondAction={true} 
                 secondActionStatus={(search_data?.photos?.results?.length > 0 || manualAdd)} closeAction={closeModal} />
        </div>
    );
}

function KeyEditorTile({ pageKey, updatePageData }: KeyEditorTileType){
    const getTileIcon = () => {
        try {
            switch(pageKey?.type){
                case "title":
                    return <span className="material-symbols-outlined">title</span>;
                case "description":
                    return <span className="material-symbols-outlined">description</span>;
                case "list":
                    return <span className="material-symbols-outlined">list</span>;
                case "images":
                    return <span className="material-symbols-outlined">photo_library</span>;
                default:
                    return <></>;
            }
        }
        catch(ex){
            console.log(`Getting Tile Icon: ${ex}`);
        }
    }

    const defaultHandleChange = (e:any) => {
        try {
            if(pageKey._id){
                updatePageData(e.target.value);
            }
        }
        catch(ex){
            console.log(`Handle Default Change: ${ex}`);
        }
    }

    const quillHandleChange = (value:any) => {
        try {
            if(pageKey._id){
                updatePageData(value);
            }
        }
        catch(ex){
            console.log(`Handle Quill Change: ${ex}`);
        }
    }

    const getTileContentEditor = () => {
        try {
            switch(pageKey?.type){
                case "title":
                    return <textarea name={`${pageKey?.title}`} rows={3} value={pageKey?.value?.data} onChange={defaultHandleChange} />;
                case "description":
                    return <ReactQuill theme="snow" value={pageKey?.value?.data} onChange={quillHandleChange} 
                                modules={quillSetup.modules} formats={quillSetup.formats} className="admin-quill"
                            />;
                case "list":
                    return <PillListEditor list={pageKey?.value?.data} updateList={quillHandleChange} />;
                case "images":
                    return <ImageEditor selected={pageKey?.value?.data} maxSelect={pageKey?.metaData?.max} updateList={quillHandleChange}/>;
                default:
                    return <></>;
            }
        }
        catch(ex){
            console.log(`Getting tile content editor: ${ex}`);
        }
    }

    return(
        <div className="key-editor-tile-container">
            <div className="key-tile-title">
                <span className="tile-title">{pageKey.title}</span>
                <div className="title-icon-container">{getTileIcon()}</div>
            </div>

            <div className="tile-content-editor-container">
                {getTileContentEditor()}
            </div>
        </div>
    );
}

function SiteEditor(){
    const [selPage, setSelPage] = useState("");
    const [selPageData, setSelPageData] = useState<SitePage | null>(null);

    const pillScrollRef = useRef<HTMLDivElement>(null);

    const { user } = useContext(userContext.UserContext) as UserContextType;

    // GQL Queries
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [retrievePages,{ loading: site_pages_loading, data: site_pages_data }] = useLazyQuery(GET_SITE_PAGES_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [retrievePage,{ loading: site_page_loading, data: site_page_data, refetch: site_page_refetch }] = useLazyQuery(GET_IND_SITE_PAGE_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    // Mutations
    const [upsertPage,{ loading: upsert_pg_loading, data: upsert_pg_data }] = useMutation(UPSERT_PAGE_MUTATION, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });

    /* Application Functions*/
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

    /* Data Functions */
    const savePage = () => {
        try {
            if(!selPageData?.title){
                toast.warning(`Please make sure the page has a title`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                const cleanKeys = selPageData.pageKeys.map((key)=> {
                    const tmpKey = { 
                        _id: key._id, title:key.title, metaData:key.metaData, 
                        type:key.type, value:key.value
                    };

                    return tmpKey;
                });

                upsertPage({ variables: { 
                    _id: selPageData._id, title: selPageData.title, pageKeys: cleanKeys
                }});
            }
        }
        catch(ex){
            console.log(`Saving Site Page: ${ex}`);
        }
    }

    const updateKey = (key_idx: number, data: any) => {
        try {
            setSelPageData((d:any) => {
                const tmp = _.cloneDeep(d);
                tmp.pageKeys[key_idx].value = { data: data };

                return tmp;
            });
        }
        catch(ex){
            console.log(`Updating Key: ${ex}`);
        }
    }

    useEffect(()=> {
        if(selPage) {
            retrievePage({ variables: { key: selPage }});
        }
        else if(selPageData){
            setSelPageData(null);
        }
    },[selPage]);

    useEffect(()=>{
        if(site_page_data?.sitePage){
            const sp = _.cloneDeep(site_page_data.sitePage);
            setSelPageData(sp);
        }
    },[site_page_data]);

    // Refresh Page Data On Completion of action
    useEffect(()=>{ 
        if(!site_pages_loading && !upsert_pg_loading && upsert_pg_data?.upsertSitePage){
            toast.success(`Update Site Page.`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });

            site_page_refetch();
        }
    },[upsert_pg_loading]);

    useEffect(()=> { retrievePages({}); },[]);

    return(
        <div className="admin-component site-editor">
            <div className="table-action-container">
                <div className="pill-list-title">Website Pages</div>

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

            {site_page_loading ?
                <div className="admin-loading">
                    <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)" />
                </div> :
                <>
                    {!selPageData ? 
                        <div className="admin-loading">
                            <p>Please select a site page to begin making changes</p>
                        </div> :
                        <>
                            <div className="page-title-container">
                                <h2>{selPageData?.title}</h2>

                                <div className="title-btn-container">
                                    <div className="add-key-btn" onClick={savePage}>
                                        <span className="material-symbols-outlined">save</span>
                                        <span>Save</span>
                                    </div>
                                </div>
                            </div>

                            {/* Add Page Tiles */}
                            <div className="admin-editor-tile-container">
                                {selPageData?.pageKeys.map((key,i) =>
                                    <KeyEditorTile pageKey={key} updatePageData={(data) => updateKey(i, data)} key={i}/>
                                )}
                            </div>
                        </>
                    }
                </>
            }
        </div>
    );
}

export default SiteEditor;