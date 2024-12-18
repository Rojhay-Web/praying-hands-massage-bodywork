import { useEffect, useState } from "react";

import { emptyList } from "../../utils";

type PagerCtrlType = {
    maxPages:number, pagePos?:number, maxLen?: number,
    setPagePos: (d:number) => void
}

export default function PagerCtrl({ maxPages, setPagePos, pagePos=0, maxLen = 5 }: PagerCtrlType){
    const [pageEnd, setPageEnd] = useState<number[]>([]);
    const [groupList, setGroupList] = useState<number[]>([]);

    const isInList = () => {
        let ret = false;
        try {
            ret = (maxPages > maxLen && pagePos >= groupList[0] && pagePos <= groupList.slice(-1)[0]);
        }
        catch(ex){
            console.log(`Checking is In List: ${ex}`);
        }

        return ret;
    }

    const changePage = (dir: number) => {
        try {
            if(dir < 0 && pagePos > 1){
                setPagePos(pagePos - 1);
            }
            else if(dir > 0 && (pagePos < maxPages)){
                setPagePos(pagePos + 1);
            }
        }
        catch(ex){
            console.log(`Changing Page: ${ex}`);
        }
    }

    useEffect(()=> {
        let tmpList: number[] = emptyList(maxPages);
        setPageEnd(tmpList.slice(-2));
        setGroupList(tmpList.slice(3,-2));
    },[maxPages]);

    return(
        <div className="pager-container">
            <span className="material-symbols-outlined ctrl" onClick={()=> { changePage(-1); }}>chevron_left</span>

            <div className="pager-bullet-container">
                {(maxPages <= maxLen) ?
                    <>
                        {emptyList(maxPages).map((_item: any, i: number) =>
                            <div className={`pager-bullet ${(pagePos-1) == i ? 'sel' : ''}`} key={i} />
                        )}
                    </> :
                    <>
                        {[1,2].map((item: any, i: number) =>
                            <div className={`pager-bullet ${pagePos == item ? 'sel' : ''}`} key={i} />
                        )}

                        <div className={`pager-bullet full ${isInList() ? 'sel' : ''}`} />

                        {pageEnd.map((item: any, i: number) =>
                            <div className={`pager-bullet ${pagePos == item ? 'sel' : ''}`} key={i} />
                        )}
                    </>
                }
            </div>

            <span className="material-symbols-outlined ctrl" onClick={()=> { changePage(1); }}>chevron_right</span>
        </div>
    );
}