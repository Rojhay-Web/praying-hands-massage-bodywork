import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import { spiral } from 'ldrs';

import userContext from "../../context/user.context";
import { Photosets, Photo, UserContextType } from "../../datatypes";

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
    const [selPhotoset, setSelPhotoset] = useState("");
    const [displayPhotos, setDisplayPhotos] = useState<Photo[]>([]);

    const pillScrollRef = useRef<HTMLDivElement>(null);

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

    /* Data Functions */

    useEffect(()=>{
        if(selPhotoset?.length === 0){
            retrieveAllImages({ variables: { page: 1, pageSize: 20 }});
        }
        else {
            retrieveGalleryImages({ variables: { id:selPhotoset, page: 1, pageSize: 20 }});
        }
    },[selPhotoset]);

    /* Data Based on Action */
    useEffect(()=>{
        if(photos_data?.photos) {
            setDisplayPhotos(photos_data?.photos.results);
        }
    },[photos_data]);

    useEffect(()=>{
        if(photoset_photos_data?.photos) {
            setDisplayPhotos(photoset_photos_data?.photosetImages.results);
        }
    },[photoset_photos_data]);

    useEffect(()=> { retrievePhotosets({}); spiral.register(); },[]);

    return (
        <div className="admin-component image-gallery">
            <div className="table-action-container padded-container">
                <div className="pill-list-title">
                    <div className={`title-btn ${selPhotoset === "" ? 'sel' : 'default'}`} onClick={()=> { setSelPhotoset(""); }}>All Images</div>
                </div>

                <div className="pill-list-container">
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "prev")}>chevron_left</span>
                    <div className="scroll-pill-list" ref={pillScrollRef}>
                        {photosets_data?.photosets.map((pg: Photosets, i: number)=>
                            <div className={`pill-item ${pg.id === selPhotoset ? 'sel' : ''}`} key={i} onClick={()=> { if(pg.id) setSelPhotoset(pg.id); }}>{pg.title}</div>
                        )}
                    </div>
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "next")}>chevron_right</span>
                </div>
            </div>

            {(photos_loading || photoset_photos_loading) ?
                <div><l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral></div> : 
                <>
                    {displayPhotos?.length > 0 ?
                        <div>
                            
                        </div> 
                        : <></>
                    }
                </>
            }
        </div>
    );
}

export default ImageGallery;