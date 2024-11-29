import { useState, useEffect, useContext, useRef } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { spiral } from 'ldrs';

import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import { FilePhoto, Photo, UserContextType } from '../../datatypes';
import SelectedPhotosCtrl from './selectedPhotoCtrl';
import userContext from '../../context/user.context';
import GalleryPagination from './galleryPagination';

const SEARCH_PHOTOS_QUERY = gql`
    query searchPhotos($page: Int, $pageSize:Int){
        photos(page:$page, pageSize:$pageSize){
            pagesLeft
            results {
                id
                url
            }
        }
    }`;

type GalleryCtrlModalType = {
    visible: boolean, maxSelect: number,
    tabs: string[], secondActionLoading: boolean,
    secondAction: (tab: string, ids: string[]) => void
    closeAction: (photoset: Photo[]) => void
};

type GallerySectionType = {
    maxSelect: number, secondActionLoading: boolean,
    secondAction: (ids: string[]) => void
};

function GalleryUpload(){
    return(
        <></>
    );
}

function GallerySelect({ maxSelect, secondActionLoading, secondAction }: GallerySectionType){
    const [selected, setSelected] = useState<FilePhoto[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const { user } = useContext(userContext.UserContext) as UserContextType;
    const selectedDict = useRef<{[key:string]:FilePhoto}>({});
    
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
    const [retrieveAllImages,{ loading, data }] = useLazyQuery(SEARCH_PHOTOS_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    const updatePage = (dir:number) => {
        try {
            if((dir < 0 && currentPage > 1) || (dir > 0 && data?.photos?.pagesLeft)) {
                setCurrentPage((d)=>{
                    return d + dir;
                });
            }
        }
        catch(ex){
            console.log(`Updating Page: ${ex}`);
        }
    }

    const toggleImage = (photo: FilePhoto) =>{
        try {
            if(photo.id in selectedDict.current){
                delete selectedDict.current[photo.id];
            }
            else {
                selectedDict.current[photo.id] = {...photo, type: "image"};
            }

            const selList = Object.values(selectedDict.current);
            setSelected(selList);
        }
        catch(ex){
            console.log(`Toggling Photo: ${ex}`);
        }
    }

    useEffect(()=>{
        if(!loading){
            retrieveAllImages({ variables: { page: currentPage, pageSize: 8 }});
        }
    },[currentPage]);

    useEffect(()=> { spiral.register(); },[]);

    return(
        <div className='gallery-section select'>
            <SelectedPhotosCtrl maxSelect={maxSelect} selected={selected} uploadFlag={false} toggleImage={toggleImage}/>

            <div className='section-content image-container'>
                {loading ? 
                    <div className="admin-loading">
                        <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral>
                    </div> :
                    <>
                        {data?.photos?.results.map((photo:Photo, i:number) =>
                            <div className='photo-container' key={i} onClick={()=> { toggleImage({...photo, type: "image"}); }}>
                                <img src={photo.url} />
                            </div>
                        )}
                    </>
                }
            </div>

            <GalleryPagination page={currentPage} hasPagesLeft={data?.photos?.pagesLeft} updatePage={updatePage} />
        </div>
    );
}

function GalleryCtrlModal({ 
    visible, tabs, secondActionLoading, 
    maxSelect, secondAction, closeAction 
}: GalleryCtrlModalType){
    const [completedPhotos, setCompletedPhotos] = useState<Photo[]>([]);
    const [selectedTab, setSelectedTab] = useState("");
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const calcModalSize = () => {
        let ret = { width: 400, height: 300 };
        try {
            ret.width = (windowSize.width > 832 ? 800 : .85 * windowSize.width);
            ret.height = (windowSize.height < 200 ? 200 : .85 * windowSize.height);
        }
        catch(ex){
            console.log(`Calculating Modal Size: ${ex}`);
        }
        return ret;
    }

    const checkCloseAction = () => {
        try{
            // TODO: Check if action has completed
            closeAction(completedPhotos);
        }
        catch(ex){
            console.log(`Checking Close Action: ${ex}`);
        }
    }

    const selectTabSection = () =>{
        try {
            const tabSecondAction = (ids: string[]) => {
                secondAction(selectedTab, ids);
            }

            switch(selectedTab){
                case "select image":
                    return <GallerySelect maxSelect={maxSelect} secondActionLoading={secondActionLoading} secondAction={tabSecondAction}/>;
                case "upload":
                    return <GalleryUpload />;
                default:
                    return <></>;
            }
        }
        catch(ex){
            console.log(`selecting tab section: ${ex}`);            
        }
        return <></>;
    }

    useEffect(()=>{
        if(tabs?.length > 0){
            setSelectedTab(tabs[0]);
        }
    },[tabs]);

    useEffect(()=> {
        function handleResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
      
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); 
    },[]);

    return(
        <Rodal className="admin-image-mapper-container" visible={visible} onClose={checkCloseAction} 
            width={calcModalSize().width} height={calcModalSize().height}>
            <div className='admin-image-mappery-title'>
                <h2>Image Mapper</h2>

                {tabs?.length > 1 ?
                    <div className='title-btn-container'>
                        {tabs.map((tab,i)=>
                            <div className={`title-btn ${selectedTab === tab ? 'sel':''}`} key={i} onClick={()=>{ setSelectedTab(tab); }}>{tab}</div>
                        )}
                    </div> : <></>
                }
            </div>
            <div className='mapper-content'>
                {selectTabSection()}
            </div>
        </Rodal>
    );
}

export default GalleryCtrlModal;