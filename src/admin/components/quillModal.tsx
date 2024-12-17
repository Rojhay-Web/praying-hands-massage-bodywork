import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';

import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

type QuillModalType = {
    visible: boolean,
    title?: string,
    data: string,
    updateData: (d:string) => void,
    closeAction: () => void,
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

function QuillModal({ visible, data, title='Quill Text Editor', updateData, closeAction }: QuillModalType){
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

    useEffect(()=> {
        function handleResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
      
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); 
    },[]);

    return (
        <Rodal className="quill-editor-container" visible={visible} onClose={closeAction} 
            width={calcModalSize().width} height={calcModalSize().height}>
            <h2 className="quill-title">{title}</h2>
            <div className="text-editor-container">
                <ReactQuill theme="snow" value={data} onChange={updateData} 
                    modules={quillSetup.modules} formats={quillSetup.formats} className="admin-quill"
                />
            </div>
            <div className="btn-row">
                <div className="close-btn" onClick={closeAction}>Close Modal</div>
            </div>
        </Rodal>
    );
}

export default QuillModal;