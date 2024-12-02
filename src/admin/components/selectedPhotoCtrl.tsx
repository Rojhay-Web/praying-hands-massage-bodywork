import { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as _ from 'lodash';

import { FilePhoto, FileUploadStatus, UserContextType } from '../../datatypes';
import { API_URL, emptyList } from '../../utils';

import userContext from "../../context/user.context";

type SelectedPhotosCtrlType = {
    maxSelect: number, selected: FilePhoto[], 
    uploadFlag?: Boolean, selecting?:Boolean,
    setCompleted: (d:any) => void,
    toggleImage: (photo: FilePhoto) => void,
}

type SmartPhotoType = {
    photo:FilePhoto, uploadFlag?: Boolean, selecting?:Boolean,
    uploadSuccess?:(id:string | null, uploadId: string | undefined, success:boolean) => void,
    toggleImage: (photo: FilePhoto) => void
}

function SmartPhoto({ uploadFlag, selecting, photo, uploadSuccess, toggleImage } : SmartPhotoType){
    const [status, setStatus] = useState("");
    const { user } = useContext(userContext.UserContext) as UserContextType;

    const checkToggleImage = () => {
        if(status == ""){
            toggleImage(photo);
        }
    }

    const uploadFile = async() => {
        try {
            if(photo.file){
                let imageFormObj = new FormData();
                imageFormObj.append("name", `blueprint-upload-${photo?.fileId ?? Date.now()}`);
                imageFormObj.append("image", photo.file);

                const response = await fetch(`${API_URL}/image`,{
                    method:'POST', body: imageFormObj,
                    headers: { 
                        "Authorization": user?._id ?? "",
                        "Accept": "application/json", 
                    }
                });

                const res = await response.json();

                if(res?.results){
                    setStatus("success");
                    if(uploadSuccess) uploadSuccess(res?.results, photo?.fileId, true);
                }
                else {
                    setStatus("warning");
                    toast.error(`Error Uploading Photo`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                        draggable: true, progress: undefined, theme: "light" });

                    if(uploadSuccess) uploadSuccess(null, photo?.fileId, false);
                }
            }
        }
        catch(ex){
            console.log(`Uploading File: ${ex}`);
        }
    }

    useEffect(()=>{
        if(uploadFlag && photo.type === 'file' && status != "success"){
            setStatus("uploading");
            uploadFile();
        }
    },[uploadFlag]);

    useEffect(()=>{
        if(!!selecting){
            setStatus("success");
        }
    },[selecting]);

    return(
        <div className={`smart-photo-container active ${status}`} onClick={checkToggleImage}>
            <div className='photo-icon'>
                <span className="material-symbols-outlined upload">cloud_upload</span>
                <span className="material-symbols-outlined delete">delete_forever</span>
                <span className="material-symbols-outlined success">task_alt</span>
                <span className="material-symbols-outlined warning">warning</span>
            </div>
            <img src={photo.url} />
        </div>
    );
}

function SelectedPhotosCtrl({ maxSelect, selected, uploadFlag, selecting, setCompleted, toggleImage }: SelectedPhotosCtrlType) {
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const toggleCtrl = (photo: FilePhoto) => {
        if(!selected && !uploadFlag){
            toggleImage(photo);
        }
    }

    const uploadSuccess = (id:string|null, uploadId: string|undefined, success: boolean) => {
        try {
            setCompleted((d:any) =>{
                let tmp = _.cloneDeep(d);
                tmp.push({ id, uploadId, success });
                
                return tmp;
            });
        }
        catch(ex){
            console.log(`Completing Upload: ${ex}`);
        }
    }
    
    return(
        <div className='selected-photos-container'>
            <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(scrollRef, "prev")}>chevron_left</span>
            <div className="scroll-list" ref={scrollRef}>
                {selected.map((photo, i)=>
                    <SmartPhoto photo={photo} uploadFlag={uploadFlag} selecting={selecting} uploadSuccess={uploadSuccess} toggleImage={toggleCtrl} key={i} />
                )}

                {emptyList(maxSelect - selected.length).map((e)=> 
                    <div className='smart-photo-container empty' key={`empty-${e}`} />
                )}
            </div>
            <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(scrollRef, "next")}>chevron_right</span>
        </div>
    );
}

export default SelectedPhotosCtrl;