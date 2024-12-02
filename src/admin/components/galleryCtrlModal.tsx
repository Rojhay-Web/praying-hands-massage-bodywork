import { useState, useEffect, useContext, useRef } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { spiral, quantum } from 'ldrs';
import { v4 as uuidv4 } from 'uuid';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import SelectedPhotosCtrl from './selectedPhotoCtrl';
import GalleryPagination from './galleryPagination';

import userContext from '../../context/user.context';

import { FilePhoto, FileUploadStatus, Photo, UserContextType } from '../../datatypes';
import { handleGQLError } from '../../utils';

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
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
    tabs: string[], closeAction: (photoset: FilePhoto[]) => void,

    secondActionLoading: boolean, hasSecondAction?:boolean,
    secondActionTitle?:string, secondActionStatus?:boolean, 
    secondAction: (tab: string, ids: string[]) => void
};

type GallerySectionType = {
    maxSelect: number, checkClose: (photoset: FilePhoto[]) => void,

    secondActionLoading: boolean, hasSecondAction?:boolean,
    secondActionTitle?:string, secondActionStatus?:boolean, 
    secondAction: (ids: string[]) => void,
};

type PanelActionPageType = {
    panelPage: string, step1Completion: boolean,
    hasSecondAction: boolean, step2Completion: boolean,
    secondActionTitle?: string, checkCloseAction: () => void
};

function PanelActionPage({ panelPage, step1Completion, step2Completion, hasSecondAction, secondActionTitle, checkCloseAction }:PanelActionPageType) {
    useEffect(()=> { quantum.register(); },[]);

    return(
        <div className='action-panel'>
            <div className='panel-steps'>
                {/* Step 1 */}
                <div className={`step ${panelPage === "step_1" ? "active" : ""}`}>
                    <div className={`step-icon ${step1Completion ? 'complete' : ''}`}>
                        <span className="material-symbols-outlined">task_alt</span>
                    </div>
                    <span className='title'>Uploading</span>
                </div>

                {/* Step 2 */}
                {hasSecondAction ?
                    <div className={`step ${panelPage === "step_2" ? "active" : ""}`}>
                        <div className={`step-icon ${step2Completion ? 'complete' : ''}`}>
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                        <span className='title'>{secondActionTitle}</span>
                    </div> : <></>
                }
            </div>

            <div className='panel-content'>
                {panelPage === "step_1" || panelPage === "step_2" ? 
                    <>
                        <span className='panel-content-text title'>Please wait as we finish working with your images</span>
                        <div className='loading-animation'>
                            <l-quantum size="150" speed="2.0" color="rgba(150,150,150,1)" />
                            <span className='panel-content-text'>{panelPage === "step_1" ? "Uploading" : secondActionTitle }</span>
                        </div>
                    </> : <></>
                }

                {panelPage === "complete" ? 
                    <>
                        <span className='panel-content-text title'>Success</span>
                        <span className='panel-content-text'>Feel free to navigate back by closing the modal</span>
                        <div className='action-link cancel' onClick={checkCloseAction}>Close</div>
                    </> : <></>
                }
            </div>
        </div>
    );
}

function GalleryUpload({ maxSelect, hasSecondAction = false, secondActionStatus, secondActionLoading, secondAction, secondActionTitle="Upload", checkClose }: GallerySectionType){
    const [selected, setSelected] = useState<FilePhoto[]>([]);
    const fileUpload = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [completed, setCompleted] = useState<FileUploadStatus[]>([]);
    const [panelPage, setPanelPage] = useState("");

    const toggleImage = (photo: FilePhoto) =>{
        try {
            setSelected((d)=> {
                let tmp = d.filter((fp) => { return fp?.fileId != photo?.fileId; });
                return tmp;
            });
        }
        catch(ex){
            console.log(`Toggling Photo: ${ex}`);
        }
    }

    const handleInputChange = (e:any) => {
        try {
            let files = e.target.files, selList = [],
                remaining = maxSelect - selected.length;

            for(let i=0; i < files.length; i++){
                if(selList.length >= remaining){
                    toast.warning(`You have reached the max file upload amount`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                        draggable: true, progress: undefined, theme: "light" });
                    break;
                }

                if(files[i].size > MAX_UPLOAD_SIZE) {
                    toast.warning(`[${files[i].name}] is too large to upload`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else {
                    selList.push(files[i].fileId);

                    let reader = new FileReader();
                    reader.onload = (e) => {
                        let tmpPhotoFile = {
                            url: e?.target?.result, type: 'file',
                            fileId: uuidv4(), file: files[i]
                        };

                        setSelected((d:any) => {
                            let tmp = [...d, tmpPhotoFile];
                            return tmp;
                        });
                    }
                    reader.readAsDataURL(files[i]);
                }
            }
        }
        catch(ex){
            console.log(`Uploading File: ${ex}`);
        }
    }

    const beginUpload = () => {
        try {
            if(selected?.length > 0 && !uploading && panelPage === ""){
                setUploading(true); setPanelPage("step_1");
            }
        }
        catch(ex){
            console.log(`Beginning Upload: ${ex}`);
        }
    }

    const checkCloseAction = () => {
        setUploading(false); setCompleted([]); 
        setSelected([]); setPanelPage("");
        checkClose([]);
    }

    useEffect(()=>{
        if(uploading && (selected?.length > 0 && selected?.length === completed?.length)){
            setPanelPage((hasSecondAction ? "step_2" : "complete"));
            if(hasSecondAction){
                let idList = completed.filter((c)=> { return c.success === true && c.id != null }).map((c1) => { return c1.id ?? ""; });
                secondAction(idList);
            }
        }
    },[completed]);

    useEffect(()=> {
        if(!secondActionLoading && secondActionStatus && panelPage === "step_2"){
            setPanelPage("complete");
        }
    },[secondActionStatus]);

    return(
        <div className='gallery-section upload'>
            <SelectedPhotosCtrl maxSelect={maxSelect} selected={selected} uploadFlag={uploading} setCompleted={setCompleted} toggleImage={toggleImage}/>

            {!uploading ? 
                <>
                    <div className='section-content upload-container' onClick={()=> { fileUpload?.current?.click(); }}>
                        <input type="file" className="img-input" hidden name="imgFile" accept="image/*" multiple onChange={handleInputChange} ref={fileUpload} />
                        <span className="material-symbols-outlined">upload_file</span>
                        <span className='title'>Choose a image to upload</span>
                        <span className='title sub'>.png, .jpg, .jpeg (50 MB max)</span>
                    </div>

                    <div className='btn-container'>
                        <div className={`action-btn default ${selected?.length <= 0 || uploading ? 'disable' : ''}`} onClick={beginUpload}>{secondActionTitle}</div>
                        <div className='action-btn cancel' onClick={checkCloseAction}>Cancel</div>
                    </div>
                </> :
                <PanelActionPage panelPage={panelPage} step1Completion={(selected.length > 0 && completed.length === selected.length)} 
                    hasSecondAction={hasSecondAction} step2Completion={secondActionStatus ? true : false}
                    secondActionTitle={secondActionTitle} checkCloseAction={checkCloseAction}
                />
            }
        </div>
    );
}

function GallerySelect({ maxSelect, hasSecondAction = false, secondActionStatus, secondActionLoading, secondAction, secondActionTitle="Choose Image(s)", checkClose }: GallerySectionType){
    const [selected, setSelected] = useState<FilePhoto[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selecting, setSelecting] = useState(false);
    const [panelPage, setPanelPage] = useState("");

    const { user } = useContext(userContext.UserContext) as UserContextType;
    const selectedDict = useRef<{[key:string]:FilePhoto}>({});
    
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
            else if(selected.length >= maxSelect){
                toast.warning(`You have reached the max selection size`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
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

    const checkCloseAction = () => {
        setSelecting(false); setCurrentPage(1); 
        setSelected([]); setPanelPage("");
        selectedDict.current = {};
        
        checkClose([]);
    }

    const beginSecondAction = () => {
        try {
            setSelecting(true); setPanelPage((hasSecondAction ? "step_2" : "complete"));

            if(hasSecondAction){
                let idList = selected.filter((c)=> { return c.id != null }).map((c1) => { return c1.id ?? ""; });
                secondAction(idList);
            }
        }
        catch(ex){
            console.log(`Beginning Second Action: ${ex}`);
        }
    }

    useEffect(()=>{
        if(!loading){
            retrieveAllImages({ variables: { page: currentPage, pageSize: 8 }});
        }
    },[currentPage]);

    useEffect(()=> {
        if(!secondActionLoading && secondActionStatus && panelPage === "step_2"){
            setPanelPage("complete");
        }
    },[secondActionStatus]);

    useEffect(()=> { spiral.register(); },[]);

    return(
        <div className='gallery-section select'>
            <SelectedPhotosCtrl maxSelect={maxSelect} selected={selected} uploadFlag={false} selecting={selecting} setCompleted={(d)=>{}} toggleImage={toggleImage} />

            {!selecting ?
                <>
                    <div className='section-content image-container'>
                        {loading ? 
                            <div className="admin-loading">
                                <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)" />
                            </div> :
                            <>
                                {data?.photos?.results.map((photo:Photo, i:number) =>
                                    <div className={`photo-container ${photo.id in selectedDict.current ? 'sel' : ''}`} key={i} onClick={()=> { toggleImage({...photo, type: "image"}); }}>
                                        <img src={photo.url} />
                                    </div>
                                )}
                            </>
                        }
                    </div>

                    <GalleryPagination page={currentPage} hasPagesLeft={data?.photos?.pagesLeft} updatePage={updatePage} />

                    <div className='btn-container'>
                        <div className={`action-btn default ${selected?.length <= 0 ? 'disable':''}`} onClick={beginSecondAction}>{secondActionTitle}</div>
                        <div className='action-btn cancel' onClick={checkCloseAction}>Cancel</div>
                    </div>
                </> :
                <PanelActionPage panelPage={panelPage} step1Completion={selecting} 
                    hasSecondAction={hasSecondAction} step2Completion={secondActionStatus ? true : false}
                    secondActionTitle={secondActionTitle} checkCloseAction={checkCloseAction}
                />
            }
        </div>
    );
}

function GalleryCtrlModal({ 
    visible, tabs, maxSelect, closeAction,

    secondActionLoading, hasSecondAction,
    secondActionTitle, secondActionStatus, secondAction
}: GalleryCtrlModalType){
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

    const selectTabSection = () =>{
        try {
            const tabSecondAction = (ids: string[]) => {
                secondAction(selectedTab, ids);
            }

            switch(selectedTab){
                case "select image":
                    return <GallerySelect maxSelect={maxSelect} secondActionLoading={secondActionLoading} 
                                hasSecondAction={hasSecondAction} secondActionStatus={secondActionStatus}
                                secondActionTitle={secondActionTitle} secondAction={tabSecondAction} checkClose={closeAction}/>;
                case "upload":
                    return <GalleryUpload maxSelect={maxSelect} secondActionLoading={secondActionLoading}
                                hasSecondAction={hasSecondAction} secondActionStatus={secondActionStatus}
                                secondActionTitle={secondActionTitle} secondAction={tabSecondAction} checkClose={closeAction}/>;
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
        <Rodal className="admin-image-mapper-container" visible={visible} onClose={() => { closeAction([]); }} 
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