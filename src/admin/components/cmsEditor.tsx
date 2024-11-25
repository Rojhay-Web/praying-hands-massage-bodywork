import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

import userContext from "../../context/user.context";

import { SitePage, UserContextType } from "../../datatypes";

const GET_SITE_PAGES_QUERY = gql`
    query getSitePages{
        sitePages{
            _id
            title
            key
        }
    }`;

function CmsSiteEditor(){
    const [selPage, setSelPage] = useState("");
    const [selPageData, setSelPageData] = useState<SitePage | null>({ title: "", pageKeys:[]});
    const [pageTag, setPageTag] = useState("");

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
    const [retrieveUsers,{ loading: site_pages_loading, data: site_pages_data }] = useLazyQuery(GET_SITE_PAGES_QUERY, {fetchPolicy: 'no-cache'});
    
    const site_pages = [
        {_id: "abc", key: "home", title: "Home" },
        {_id: "cde", key: "about-us", title: "About Us" },
        {_id: "efg", key: "contact-us", title: "Contact Us" }
    ];

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

    const updatePage = (e:any) => {
        try {
            let { key, value } = e.target;

            setSelPageData((d: any)=> {
                return {...d, [key]:value };
            });
        }
        catch(ex){
            console.log(`Updating Page: ${ex}`);
        }
    }

    return(
        <div className="admin-component cms-site-editor">
            <div className="table-action-container">
                <div className="pill-list-title">Website Pages</div>
                <div className="pill-add-btn">
                    <span className="material-symbols-outlined">add</span>
                </div>

                <div className="pill-list-container">
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "prev")}>chevron_left</span>
                    <div className="scroll-pill-list" ref={pillScrollRef}>
                        {site_pages.map((pg,i)=>
                            <div className={`pill-item ${pg.key === selPage ? 'sel' : ''}`} key={i}>{pg.title}</div>
                        )}
                    </div>
                    <span className="material-symbols-outlined ctrl" onClick={()=> controlSlider(pillScrollRef, "next")}>chevron_right</span>
                </div>
            </div>

            {/* CMS Info */}
            {!selPageData ?
                <></>: 
                <>
                    <div className="page-title-container">
                        <input className='title-input' type="text" name="title" placeholder="Enter Page Title..." value={selPageData?.title} onChange={updatePage} />

                        <div className="title-btn-container">
                            <span className={`material-symbols-outlined ${(pageTag != "") ? "":"hide"}`} onClick={()=>{}}>save</span>
                            <span className="material-symbols-outlined remove" onClick={()=>{}}>remove_selection</span>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}

export default CmsSiteEditor;