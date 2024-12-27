import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ripples } from 'ldrs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { FACEBOOK_LINK, GOOGLE_LINK, handleGQLError, INSTAGRAM_LINK, tagPageview } from '../../utils';

const MAX_PAGE_SIZE = 7,
layout1 = [
    { level: 1, rows:[
        { level: 2, height: 2, sections:[{ level: 3, imgIdx: 0 }]},
        { level: 2, height: 1, sections:[{ level: 3, imgIdx: 1 }, { level: 3, imgIdx: 2 }]}
    ]},
    { level: 1, rows:[
        { level: 2, height: 1, sections:[{ level: 3, imgIdx: 3 },{ level: 3, imgIdx: 4 }]},
        { level: 2, height: 2, sections:[{ level: 3, imgIdx: 5 }, { level: 3, imgIdx: 6 }]}
    ]}
],
layout2 = [
    { level: 1, rows:[
        { level: 2, height: 2, sections:[{ level: 3, imgIdx: 0 }, { level: 3, imgIdx: 1 }]},
        { level: 2, height: 1, sections:[{ level: 3, imgIdx: 2 },{ level: 3, imgIdx: 3 }]}
    ]},
    { level: 1, rows:[
        { level: 2, height: 1, sections:[{ level: 3, imgIdx: 4 },{ level: 3, imgIdx: 5 }]},
        { level: 2, height: 2, sections:[{ level: 3, imgIdx: 6 }]}
    ]}
];

const GET_GALLERY_QUERY = gql`
query siteGallery($page: Int, $pageSize:Int){
	siteGallery(page:$page, pageSize:$pageSize){
      pagesLeft
      results {
        url
      }
    }
 }`;

 
function GalleryImg({ imgUrl }: { imgUrl?: string | null}){
    return(
        <div className={`grid-l3-img-container ${!imgUrl ? 'empty' : ''}`}>
            {imgUrl ? <img src={imgUrl} alt={`gallery item`} /> : <></>}
        </div>
    )
}

function Gallery(){
    const [page, setPage] = useState(1);
    const [pagesLeft, setPagesLeft] = useState(false); 
    
    const [retrieveGallery,{ loading: gallery_loading, data: gallery_data }] = useLazyQuery(GET_GALLERY_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});    

    const changePage = (dir: number) => {
        try {
            if(dir < 0 && page > 1){
                setPage(page - 1);
            }
            else if(dir > 0 && pagesLeft){
                setPage(page + 1);
            }
        }
        catch(ex){
            console.log(`Changing Page: ${ex}`);
        }
    }

    const getPageImg = (idx: number) => {
        try {
            if(gallery_data?.siteGallery?.results?.length > idx){
                let tmpImg = gallery_data?.siteGallery?.results[idx];

                if(tmpImg?.url) {
                    return tmpImg.url;
                }
            }
        }
        catch(ex){
            console.log(`Getting Page Img: ${ex}`);
        }
        return null;
    }

    const getLayout = () => {
        let ret = layout1;

        try {
            if((page % 2) === 0){
                ret = layout2;
            }
        }
        catch(ex){
            console.log(`Getting Layout: ${ex}`);
        }

        return ret;
    }

    useEffect(()=>{
        if(page > 0){
            retrieveGallery({ variables: { page: page, pageSize: MAX_PAGE_SIZE }});
        }
    },[page]);

    useEffect(()=>{
        if(gallery_data){
            setPagesLeft((gallery_data?.siteGallery?.pagesLeft ? true : false));
        }
    },[gallery_data])

    useEffect(()=> { 
        document.title = "Gallery";
        tagPageview('/gallery', 'View Page');
        ripples.register();
    },[]);

    return(
        <div className="core-page gallery">
            <section className="internal-landing back">
                <h1>Gallery</h1>
            </section>

            <section className='core-section contained'>
                {gallery_loading ?
                    <div className='loading-container'>
                        <l-ripples size="150" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                    </div> :
                    <>
                        <div className='gallery-grid-outer-container'>
                            <span className={`material-symbols-outlined ctrl ${page <= 1 ? 'disabled' : ''}`} onClick={()=> { changePage(-1); }}>chevron_left</span>

                            <div className='gallery-grid-container'>
                                {getLayout().map((lvl1, i)=>
                                    <div className='grid-l1-col' key={i}>
                                        {lvl1.rows.map((lvl2,j)=>
                                            <div className={`grid-l2-row sz-${lvl2.height}`} key={`${i}-${j}`}>
                                                {lvl2.sections.map((lvl3,k)=>
                                                    <GalleryImg imgUrl={getPageImg(lvl3.imgIdx)} key={`${j}-${k}`}/>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <span className={`material-symbols-outlined ctrl ${!pagesLeft ? 'disabled':''}`} onClick={()=> { changePage(1); }}>chevron_right</span>
                        </div>

                        <div className='additional-galleries'>
                            <p>View more images on our social media platforms</p>

                            <div className='gallery-info-container'>
                                <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                                    <FontAwesomeIcon icon={faFacebookF} />
                                    <span>Facebook</span>
                                </a>
        
                                <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                                    <FontAwesomeIcon icon={faInstagram} />
                                    <span>Instagram</span>
                                </a>
        
                                <a href={GOOGLE_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                                    <FontAwesomeIcon icon={faGoogle} />
                                    <span>Google Places</span>
                                </a>
                            </div>           
                        </div>
                    </>
                }
                
            </section>
        </div>
    );
}

export default Gallery;