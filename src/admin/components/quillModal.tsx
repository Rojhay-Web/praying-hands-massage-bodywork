import { useEffect, useState } from "react";

import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

type QuillModalType = {
    visible: boolean,
    title?: string,
    closeAction: () => void,
}

function QuillModal({ visible, title='Quill Text Editor', closeAction }: QuillModalType){
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
                
            </div>
        </Rodal>
    );
}

export default QuillModal;