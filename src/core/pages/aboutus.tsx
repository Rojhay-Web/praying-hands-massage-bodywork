import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { gql, useQuery } from '@apollo/client';

// Images
import trish1 from '../../assets/stock/trish1.jpg';
import trish2 from '../../assets/stock/trish2.jpg';
import trish3 from '../../assets/stock/trish3.jpg';
import about1 from '../../assets/stock/about1.jpg';
import AreaMap from '../components/areaMap';
import { handleGQLError, tagPageview } from '../../utils';

const PAGE_KEY = 'about_us';
const GET_PAGE_QUERY = gql`
    query GetSitePage($key: String!) { 
        cachedSitePage(key: $key) {
            pageKeys {
                _id
                title
                type
                metaData
                value
            }
        }
    }`;

function AboutUs(){
    const [story, setStory] = useState("");

    const { loading, data } = useQuery(GET_PAGE_QUERY, {variables: { key: PAGE_KEY }, fetchPolicy: 'cache-and-network', onError: handleGQLError});
    
    useEffect(()=> {
        if(data?.cachedSitePage?.pageKeys?.length > 0){
            let tmpKey = data.cachedSitePage.pageKeys.filter((pk: any) => {
                return pk.title.toLowerCase() === "our story";
            });

            if(tmpKey.length > 0 && tmpKey[0]?.value?.data) {
                setStory(tmpKey[0].value.data);
            }
        }
    },[data]);

    useEffect(()=> { 
        document.title = "About Us";
        tagPageview('/aboutUs', 'View Page');
    },[]);

    return(
        <div className="core-page aboutus">
            <section className="internal-landing back">
                <h1>About Us</h1>
            </section>
            <section className='core-section contained'>
                <div className='about-img-grid'>
                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={trish3} alt="about praying hands massage" />
                        </div>
                    </div>

                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={trish2} alt="about praying hands massage" />
                        </div>
                        <div className='img-container'>
                            <img src={trish1} alt="about praying hands massage" />
                        </div>
                    </div>

                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={about1} alt="about praying hands massage" />
                        </div>
                    </div>
                    
                </div>

                <h1 className='section-title'>Our Story</h1>

                {loading ?
                    <></> :
                    <div className='story-content'>{parse(story)}</div>
                }
                
            </section>

            <section className='core-section'>
                <h1 className='section-title'>Areas Served</h1>
                <AreaMap />
            </section>
        </div>
    );
}

export default AboutUs;