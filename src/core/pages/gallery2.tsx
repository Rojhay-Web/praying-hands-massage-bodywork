import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ripples } from 'ldrs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { emptyList, FACEBOOK_LINK, GOOGLE_LINK, handleGQLError, INSTAGRAM_LINK, tagPageview } from '../../utils';

const MAX_PAGE_SIZE = 9, MAX_IMG_SETS = 3, MOBILE_IMG_SETS = 2;

const GET_GALLERY_QUERY = gql`
query siteGallery($page: Int, $pageSize:Int){
	siteGallery(page:$page, pageSize:$pageSize){
      pagesLeft
      results {
        url
      }
    }
 }`;

 type GalleryImg = { url: string };
 
function GallerySet({ imgList, nth, offset }: { imgList: GalleryImg[], nth: number, offset: number}){
    const [displaySet, setDisplaySet] = useState<GalleryImg[]>([]);

    useEffect(()=>{
        if(imgList?.length > 0){
            let tmpList = (imgList?.length > 0 ? imgList.filter((e,i)=> (i+offset) % nth === nth - 1) : []);
            setDisplaySet(tmpList);
        }
    },[imgList]);

    return(
        <div className={`gallery-col ${nth}-col`}>
            {displaySet.map((img,i)=>
                <div className={`col-img-container ${!img?.url ? 'empty' : ''}`} key={i}>
                    {img?.url ? <img src={img.url} alt={`gallery item`} /> : <></>}
                </div>
            )}
        </div>
    )
}

function Gallery(){
    const [page, setPage] = useState(1);
    const [pagesLeft, setPagesLeft] = useState(false);
    const [images, setImages] = useState<GalleryImg[]>([]); 
    
    const [retrieveGallery,{ loading: gallery_loading, data: gallery_data }] = useLazyQuery(GET_GALLERY_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});    

    const changePage = () => {
        try {
            if(pagesLeft){
                setPage((p) => p + 1);
            }
        }
        catch(ex){
            console.log(`Changing Page: ${ex}`);
        }
    }

    useEffect(()=>{
        if(page > 0){
            retrieveGallery({ variables: { page: page, pageSize: MAX_PAGE_SIZE }});
        }
    },[page]);

    useEffect(()=>{
        if(gallery_data){
            setPagesLeft((gallery_data?.siteGallery?.pagesLeft ? true : false));
            setImages((i) => {
                const tmpImgs = gallery_data?.siteGallery?.results ?? [];
                let tmpGallery = page > 1 ? [...i].concat(tmpImgs) : tmpImgs;
                
                return tmpGallery;
            });
        }
    },[gallery_data]);

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
                <div className='gallery-stack-section default'>
                    {emptyList(MAX_IMG_SETS).map((item,l) => 
                        <GallerySet imgList={images} nth={MAX_IMG_SETS} offset={(MAX_IMG_SETS - (l+1))} key={l} />
                    )}
                </div>

                <div className='gallery-stack-section mobile'>
                    {emptyList(MOBILE_IMG_SETS).map((item,l) => 
                        <GallerySet imgList={images} nth={MOBILE_IMG_SETS} offset={(MOBILE_IMG_SETS - (l+1))} key={l} />
                    )}
                </div>

                {gallery_loading ?
                    <div className='loading-container'>
                        <l-ripples size="150" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                    </div> :
                    <div className="btn-container">
                        {pagesLeft ? 
                            <div className="btn main c1" onClick={changePage}>View More Images</div> : 
                            <div className='end-list'>
                                <h1>You have reached the end of the gallery</h1>

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
                            </div>
                        }
                    </div>
                }
            </section>
        </div>
    );
}

export default Gallery;