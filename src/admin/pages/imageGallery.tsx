import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from "react-toastify";
import * as _ from 'lodash';
import { spiral } from 'ldrs';

import userContext from "../../context/user.context";
import GalleryCtrlModal from "../components/galleryCtrlModal";
import GalleryPagination from "../components/galleryPagination";

import { Photosets, Photo, UserContextType, FilePhoto } from "../../datatypes";
import { handleGQLError } from "../../utils";

const GALLERY_PAGE_SIZE = 10;

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
    }`,
ADD_TO_PHOTOSET = gql`
     mutation addPhotosToPhotoset($id: String!, $photoIds:[String]!){
	    addPhotosetPhotos(id: $id, photoIds: $photoIds)
    }`,
REMOVE_FROM_PHOTOSET = gql`
     mutation removePhotosFromPhotoset($id: String!, $photoIds:[String]!){
	    removePhotosetPhotos(id: $id, photoIds: $photoIds)
    }`,
EDIT_PHOTOSET = gql`
    mutation editPhotosetInfo($id:String!, $title:String!, $description:String){
       editPhotoset(id: $id, title: $title, description: $description)
    }`,
DELETE_PHOTOSET = gql`
    mutation deletePhotoset($id:String!){
       deletePhotoset(id: $id)
    }`,
CREATE_PHOTOSET = gql`
    mutation createPhotoset($title:String!, $primaryPhotoId: String!, $description:String){
       createPhotoset(title:$title, primaryPhotoId: $primaryPhotoId, description:$description)
    }`,
DELETE_PHOTO = gql`
    mutation removePhoto($id: String!){
       deletePhoto(id: $id)
    }`;

function ImageGallery(){
    const [selPhotoset, setSelPhotoset] = useState<Photosets | null>(null);
    const [displayPhotos, setDisplayPhotos] = useState<Photo[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasPagesLeft, setHasPagesLeft] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [tabs, setTabs] = useState<string[]>([]); 

    const pillScrollRef = useRef<HTMLDivElement>(null);
    const pageRender = useRef(false);

    const { user } = useContext(userContext.UserContext) as UserContextType;

    // GQL Queries
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [retrievePhotosets,{ loading: photosets_loading, data: photosets_data }] = useLazyQuery(GET_PHOTOSETS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [retrieveAllImages,{ loading: photos_loading, data: photos_data, refetch: photos_refetch }] = useLazyQuery(SEARCH_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [retrieveGalleryImages,{ loading: photoset_photos_loading, data: photoset_photos_data, refetch: photoset_photos_refetch }] = useLazyQuery(GET_PHOTOSET_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    // Mutations
    const [addPhotosToSet,{ loading: add_photos_loading, data: add_photos_data }] = useMutation(ADD_TO_PHOTOSET, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [removePhotosFromSet,{ loading: remove_photos_loading, data: remove_photos_data }] = useMutation(REMOVE_FROM_PHOTOSET, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [editPhotoset,{ loading: edit_photoset_loading, data: edit_photoset_data }] = useMutation(EDIT_PHOTOSET, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [deletePhotoset,{ loading: delete_photoset_loading, data: delete_photoset_data }] = useMutation(DELETE_PHOTOSET, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [createNewPhotoset,{ loading: create_photoset_loading, data: create_photoset_data }] = useMutation(CREATE_PHOTOSET, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [removePhoto,{ loading: delete_photo_loading, data: delete_photo_data }] = useMutation(DELETE_PHOTO, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    
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
        try {
            setTabs((selPhotoset ? ["select image","upload"] : ["upload"]));
        }
        catch(ex){
            console.log(`Getting Mapper Tabs: ${ex}`);
        }
    }

    const closeModal = (_photoset: FilePhoto[]) => {
        try {
            if(selPhotoset?.id){
                photoset_photos_refetch();
            }
            else if(selPhotoset){
                retrievePhotosets({}); setSelPhotoset(null);
            }
            else {
                photos_refetch();
            }

            setOpenModal(false);
        }
        catch(ex){
            console.log(`Closing Modal: ${ex}`);
        }
    }

    const deletePhoto = (id:String) => {
        if(window.confirm(`Are you sure you want to ${selPhotoset?.id ? 'REMOVE this photo from the set':'DELETE this photo perminantly'}?`)){
            if(selPhotoset?.id){
                removePhotosFromSet({ variables: { id:selPhotoset?.id, photoIds: [id] }});
            }
            else {
                removePhoto({ variables: { id:id }});
            }
        }
    }

    const updatePhotoset = () =>{
        if(!selPhotoset?.title || selPhotoset?.title.length <= 0){
            toast.warning(`Please Insert A Gallery Title`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                draggable: true, progress: undefined, theme: "light" });
        }
        else {
            editPhotoset({ variables: { id:selPhotoset?.id, title:selPhotoset?.title, description:selPhotoset?.description }});
        }
    }

    const removePhotoset = () =>{
        if(window.confirm('Are you sure you want to DELETE this album PERMANENTLY?')){
            deletePhotoset({ variables: { id:selPhotoset?.id }});
        }
    }

    // Second Action Sets
    const getSecondActionTitle = () => {
        let ret: string | undefined = undefined;
        try {
            if(selPhotoset?.id) {
                ret = "Add To Set";
            }
            else if(selPhotoset){
                ret = "Create New Gallery";
            }
        }
        catch(ex){
            console.log(`Getting Second Action Title: ${ex}`);
        }

        return ret;
    }

    const modalSecondAction = (tab: string, ids: string[], _photoset: FilePhoto[]) => {
        try {
            if(selPhotoset?.id){
                addPhotosToSet({ variables: { id: selPhotoset.id, photoIds: ids }});
            }
            else if(selPhotoset){
                if(ids.length <= 0){
                    toast.error(`Please Select a starting image`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else if(!selPhotoset?.title){
                    toast.error(`Please Insert A Gallery Title`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else {
                    createNewPhotoset({ variables: {
                        title: selPhotoset?.title, primaryPhotoId: ids[0]
                    }});
                }
            }
        }
        catch(ex){
            console.log(`Performing modal second action: ${ex}`);
        }
    }

    const secondActionLoading = () => {
        try {
            if(selPhotoset?.id) {
                return add_photos_loading;
            }
            else if(selPhotoset){
                return create_photoset_loading;
            }
        }
        catch(ex){
            console.log(`Second Action Loading: ${ex}`);
        }
        return false;
    }

    const secondActionStatus = () => {
        try {
            if(selPhotoset?.id) {
                return add_photos_data?.addPhotosetPhotos;
            }
            else if(selPhotoset){
                return !!create_photoset_data?.createPhotoset;
            }
        }
        catch(ex){
            console.log(`Second Action Status: ${ex}`);
        }

        return false;
    }

    const toggleCreateModal = () => {
        try {
            if(!selPhotoset?.title || selPhotoset.title.length <= 0 ){
                toast.warning(`Please Insert A Gallery Title`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                setOpenModal(true);
            }
        }
        catch(ex){
            console.log(`Toggling for create modal: ${ex}`);
        }
    }

    /* Data Functions */
    useEffect(()=>{ getMapperTabs(); },[selPhotoset]);

    useEffect(()=>{
        if(currentPage > 1){
            setCurrentPage(1);
        }
        else {
            getImages();
        }
    },[selPhotoset?.id]);

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

    /* Remove Photos */
    useEffect(()=>{
        if(!delete_photo_loading && delete_photo_data?.deletePhoto){
            photos_refetch();
        }
    },[delete_photo_loading]);

    useEffect(()=>{
        if(!remove_photos_loading && remove_photos_data?.removePhotosetPhotos){
            photoset_photos_refetch();
        }
    },[remove_photos_loading]);

    /* Update Photosets */
    useEffect(()=>{
        if((!delete_photoset_loading && delete_photoset_data?.deletePhotoset) ||
        (!edit_photoset_loading && edit_photoset_data?.editPhotoset)){
            retrievePhotosets({}); setSelPhotoset(null);
        }
    },[delete_photoset_loading, edit_photoset_loading]);

    useEffect(()=> { retrievePhotosets({}); spiral.register(); },[]);

    return (
        <div className="admin-component image-gallery">
            <div className="table-action-container padded-container">
                <div className="pill-list-title">
                    <div className={`title-btn ${selPhotoset === null ? 'sel' : 'default'}`} onClick={()=> { setSelPhotoset(null); }}>All Images</div>
                </div>

                <div className="pill-list-container">
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "prev")}>chevron_left</span>
                    <div className="scroll-pill-list" ref={pillScrollRef}>
                        <div className={`pill-add-btn ${selPhotoset && !selPhotoset?.id ? "text" : ""}`} onClick={createPhotoset}>
                            <span className="material-symbols-outlined">add</span>
                            <span className="new-page-title">New Gallery</span>
                        </div>
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
                    <div className={`add-key-btn text ${(selPhotoset && !selPhotoset?.id) ? '' : 'hide'}`}>
                        <span className="material-symbols-outlined">info</span>
                        <span>Please add title and then add default image to generate new gallery</span>
                    </div>
                    <div className={`add-key-btn ${selPhotoset?.id && selPhotoset?.title?.length > 0 ? '' : 'hide'}`} onClick={updatePhotoset}>
                        <span className="material-symbols-outlined">save</span>
                        <span>Save Album Info</span>
                    </div>
                    <div className={`add-key-btn remove ${selPhotoset?.id ? '' : 'hide'}`} onClick={removePhotoset}>
                        <span className="material-symbols-outlined">delete</span>
                        <span>Delete Album</span>
                    </div>
                </div>
            </div>

            {(photos_loading || photoset_photos_loading || delete_photo_loading || remove_photos_loading) ?
                <div className="admin-loading">
                    <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"/>
                </div> : 
                <>
                    <div className="admin-gallery-container">
                        {(selPhotoset && !selPhotoset.id) ?
                            <div className="photo-btn-container">
                                <div className="photo-btn" onClick={toggleCreateModal}>Add/Upload Default Image</div>
                            </div> :
                            <>
                                <div className="photo-container add" onClick={()=> { setOpenModal(true); }}>
                                    <span className="material-symbols-outlined">cloud_upload</span>
                                    <span className="photo-text">Add/Upload New Image</span>
                                </div>

                                {displayPhotos.map((photo,i)=>
                                    <div className="photo-container" key={i} onClick={()=> { deletePhoto(photo.id); }}>
                                        <img src={photo.url} alt="admin gallery item" />
                                    </div>
                                )}  
                            </>    
                        }
                    </div>

                    <GalleryPagination page={currentPage} hasPagesLeft={hasPagesLeft} updatePage={updatePage} />
                </>
            }

            <GalleryCtrlModal visible={openModal} tabs={tabs} maxSelect={(!selPhotoset || selPhotoset?.id ? 7 : 1)} secondActionTitle={getSecondActionTitle()}
                 secondAction={modalSecondAction} secondActionLoading={secondActionLoading()} hasSecondAction={!!selPhotoset} 
                 secondActionStatus={secondActionStatus()} closeAction={closeModal} />
        </div>
    );
}

export default ImageGallery;