import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import { spiral } from 'ldrs';

import GalleryPagination from "../components/galleryPagination";

import userContext from "../../context/user.context";
import { Photosets, Photo, UserContextType } from "../../datatypes";
import GalleryCtrlModal from "../components/galleryCtrlModal";

const GALLERY_PAGE_SIZE = 15;

const GET_PHOTOSETS_QUERY = gql`
    query getPhotosets {
        photosets{
            id
            title
            description
            photos
        }
    }`,
SEARCH_PHOTOS_QUERY = gql`
     query searchPhotos($page: Int, $pageSize:Int){
        photos(page:$page, pageSize:$pageSize){
            pagesLeft
            results {
                id
                url
            }
        }
    }`,
GET_PHOTOSET_PHOTOS_QUERY = gql`
     query getPhotosetImages($id:String!, $page: Int, $pageSize:Int){
        photosetImages(id:$id, page:$page, pageSize:$pageSize){
            pagesLeft
            results {
                id
                url
            }
        }
    }`;

function ImageGallery(){
    const [selPhotoset, setSelPhotoset] = useState<Photosets | null>(null);
    const [displayPhotos, setDisplayPhotos] = useState<Photo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasPagesLeft, setHasPagesLeft] = useState(false);
    const [openModal, setOpenModal] = useState(false); 

    const pillScrollRef = useRef<HTMLDivElement>(null);
    const pageRender = useRef(false);

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
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [retrievePhotosets,{ loading: photosets_loading, data: photosets_data }] = useLazyQuery(GET_PHOTOSETS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [retrieveAllImages,{ loading: photos_loading, data: photos_data, refetch: photos_refetch }] = useLazyQuery(SEARCH_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [retrieveGalleryImages,{ loading: photoset_photos_loading, data: photoset_photos_data, refetch: photoset_photos_refetch }] = useLazyQuery(GET_PHOTOSET_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

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

    const updatePage = (dir:number) => {
        try {
            if((dir < 0 && currentPage > 1) || (dir > 0 && hasPagesLeft)) {
                setCurrentPage((d)=>{
                    return d + dir;
                });
            }
        }
        catch(ex){
            console.log(`Updating Page: ${ex}`);
        }
    }

    const handleChange = (e:any) => {
        try {
            let { name, value } = e.target;

            if(selPhotoset) {
                setSelPhotoset((d: any)=> {
                    let tmp = _.cloneDeep(d);
                    return {...tmp, [name]:value };
                });
            }
        }
        catch(ex){
            console.log(`Updating Page: ${ex}`);
        }
    }

    const createPhotoset = () =>{
        try {
            setSelPhotoset({ title: "", description: "" });
        }
        catch(ex){
            console.log(`Creating Photoset: ${ex}`);
        }
    }

    const getImages = () => {
        try {
            if(selPhotoset === null){
                retrieveAllImages({ variables: { page: currentPage, pageSize: GALLERY_PAGE_SIZE }});
            }
            else if(!selPhotoset?.id){
                setDisplayPhotos([]);
            }
            else {
                retrieveGalleryImages({ variables: { id: selPhotoset.id, page: currentPage, pageSize: GALLERY_PAGE_SIZE }});
            }
        }
        catch(ex){
            console.log(`Getting Photos: ${ex}`);
        }
    }

    const getMapperTabs = () => {
        return ["select image","upload"];
        /*let ret: string[] = [];
        try {
            ret = (selPhotoset?.id ? ["select image","upload"] : ["upload"]);
        }
        catch(ex){
            console.log(`Getting Mapper Tabls: ${ex}`);
        }

        return ret;*/
    }

    const closeModal = (photoset: Photo[]) => {
        try {
            setOpenModal(false);
        }
        catch(ex){
            console.log(`Closing Modal: ${ex}`);
        }
    }

    const modalSecondAction = (tab: string, ids: string[]) => {
        try {

        }
        catch(ex){
            console.log(`Performing modal second action: ${ex}`);
        }
    }

    /* Data Functions */

    useEffect(()=>{
        if(currentPage > 1){
            setCurrentPage(1);
        }
        else {
            getImages();
        }
    },[selPhotoset]);

    useEffect(()=> {
        if(pageRender?.current) {
            getImages();
        }

        pageRender.current = true;
    },[currentPage]);

    /* Data Based on Action */
    useEffect(()=>{
        if(photos_data?.photos) {
            setDisplayPhotos(photos_data?.photos?.results);
            setHasPagesLeft(photos_data?.photos?.pagesLeft);
        }
    },[photos_data]);

    useEffect(()=>{
        if(photoset_photos_data?.photosetImages) {
            setDisplayPhotos(photoset_photos_data?.photosetImages?.results);
            setHasPagesLeft(photoset_photos_data?.photosetImages?.pagesLeft);
        }
    },[photoset_photos_data]);

    useEffect(()=> { retrievePhotosets({}); spiral.register(); },[]);

    return (
        <div className="admin-component image-gallery">
            <div className="table-action-container padded-container">
                <div className="pill-list-title">
                    <div className={`title-btn ${selPhotoset === null ? 'sel' : 'default'}`} onClick={()=> { setSelPhotoset(null); }}>All Images</div>
                </div>

                <div className={`pill-add-btn ${selPhotoset && !selPhotoset?.id ? "text" : ""}`} onClick={createPhotoset}>
                    <span className="material-symbols-outlined">add</span>
                    <span className="new-page-title">New Gallery</span>
                </div>

                <div className="pill-list-container">
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "prev")}>chevron_left</span>
                    <div className="scroll-pill-list" ref={pillScrollRef}>
                        {photosets_data?.photosets.map((pg: Photosets, i: number)=>
                            <div className={`pill-item ${pg.id === selPhotoset?.id ? 'sel' : ''}`} key={i} onClick={()=> { if(pg.id) setSelPhotoset(pg); }}>{pg.title}</div>
                        )}
                    </div>
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "next")}>chevron_right</span>
                </div>
            </div>
            
            <div className="page-title-container">
                {selPhotoset != null ?
                    <input className='title-input' type="text" name="title" placeholder="Enter Album Title..." value={selPhotoset?.title} onChange={handleChange} />
                    : <></>
                }

                <div className="title-btn-container bookend">
                    <div className={`add-key-btn ${selPhotoset ? '' : 'hide'}`} onClick={()=> { }}>
                        <span className="material-symbols-outlined">save</span>
                        <span>Save Album Info</span>
                    </div>
                    <div className={`add-key-btn remove ${selPhotoset ? '' : 'hide'}`} onClick={()=> { }}>
                        <span className="material-symbols-outlined">delete</span>
                        <span>Delete Album</span>
                    </div>
                </div>
            </div>

            {(photos_loading || photoset_photos_loading) ?
                <div className="admin-loading">
                    <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral>
                </div> : 
                <>
                    <div className="admin-gallery-container">
                        <div className="photo-container add" onClick={()=> { setOpenModal(true); }}>
                            <span className="material-symbols-outlined">cloud_upload</span>
                            <span className="photo-text">Upload New Image</span>
                        </div>

                        {displayPhotos.map((photo,i)=>
                            <div className="photo-container" key={i}>
                                <img src={photo.url} alt="admin gallery item" />
                            </div>
                        )}      
                    </div>

                    <GalleryPagination page={currentPage} hasPagesLeft={hasPagesLeft} updatePage={updatePage} />
                </>
            }

            <GalleryCtrlModal visible={openModal} tabs={getMapperTabs()} maxSelect={7}
                 secondAction={modalSecondAction} secondActionLoading={false} closeAction={closeModal} />
        </div>
    );
}

export default ImageGallery;