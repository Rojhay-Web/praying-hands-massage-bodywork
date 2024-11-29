import { useEffect, useRef, useState } from 'react';
import * as _ from 'lodash';

import { FilePhoto } from '../../datatypes';
import { emptyList } from '../../utils';

type SelectedPhotosCtrlType = {
    maxSelect: number, selected: FilePhoto[], uploadFlag?: Boolean
    completeAction?:(idList:string[]) => void,
    toggleImage: (photo: FilePhoto) => void
}

type SmartPhotoType = {
    photo:FilePhoto, uploadFlag?: Boolean,
    completeAction?:(id:string, success: boolean) => void,
    toggleImage: (photo: FilePhoto) => void
}

function SmartPhoto({ uploadFlag, photo, completeAction, toggleImage } : SmartPhotoType){
    const [status, setStatus] = useState("");

    const checkToggleImage = () => {
        toggleImage(photo);
    }

    useEffect(()=>{
        if(uploadFlag && photo.type === 'file' && status != "success"){
            // TODO: perform file upload
        }
    },[uploadFlag]);

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

function SelectedPhotosCtrl({ maxSelect, selected, uploadFlag, toggleImage }: SelectedPhotosCtrlType) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [uploaded, setUploaded] = useState<{id: string, success: boolean }[]>([]);

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

    const completedUploaded = (id:string, success: boolean) => {
        try {
            setUploaded((d) =>{
                let tmp = _.cloneDeep(d);
                tmp.push({ id, success });
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
                    <SmartPhoto photo={photo} uploadFlag={uploadFlag} completeAction={completedUploaded} toggleImage={toggleImage} key={i} />
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