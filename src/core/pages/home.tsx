import { useEffect, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { Service } from '../../datatypes';
import { emptyList, FACEBOOK_LINK, GOOGLE_LINK, handleGQLError, INSTAGRAM_LINK, tagPageview } from '../../utils';

import ServiceItem from '../components/serviceItem';
import PagerCtrl from '../components/pageCtrl';
import ReviewsList from '../components/reviewsList';

// Images
import background from '../../assets/landing-background-2.png';
import massuese_logo from '../../assets/logo3.png';

import massage_1 from '../../assets/stock/massage_1.jpg';
import massage_2 from '../../assets/stock/massage_2.jpg';
import massage_chair from '../../assets/stock/massage_chair.jpg';
import { Link } from 'react-router-dom';

const GET_SERVICES_QUERY = gql`
query getServices($type: String, $page:Int, $pageSize: Int){
	services(type: $type, page:$page, pageSize:$pageSize){
      _id
      title
      type
      time
      price
      bookingSite
      image
      description
    }
}`

const TOTAL_SERVICE_SIZE = 3;

function Home(){
    // Services Paging
    const [services, setServices] = useState<Service[]>([]);
    const [pages, setPages] = useState({ page: 0, total: 0 });

    const [retrieveServices,{ loading: services_loading, data: services_data }] = useLazyQuery(GET_SERVICES_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});

    const setPage = (pg:number) => {
        try {
            setPages((d:any)=> {
                let tmpD = {...d, page: pg };

                return tmpD;
            });
        }
        catch(ex){
            console.log(`Setting Page: ${ex}`);
        }
    }

    useEffect(()=> { 
        if(pages?.page > 0 && pages?.page <= pages?.total){
            let start = ((pages.page - 1) * TOTAL_SERVICE_SIZE);
            let tmpServices = services_data?.services?.slice(start, (start + TOTAL_SERVICE_SIZE));

            setServices(tmpServices);
        }
    },[pages]);

    useEffect(()=>{ 
        if(services_data?.services?.length > 0){ 
            setPages({ 
                page:1, total: Math.ceil(services_data.services.length / TOTAL_SERVICE_SIZE)
            });
        }
    },[services_data]);

    useEffect(()=>{
        retrieveServices({ variables: { type: '' }});
        tagPageview('/', 'View Page');
    },[]);
    
    return (
        <div className="core-page home">              
            <section className="home-landing">
                <img src={background} className="landing-background" alt='Landing page background' />
                <div className="landing-content-container">
                    <div className="landing-content">
                        <h1>Experience Healing & Restoration</h1>
                        <h1>Through Prayer Massage</h1>
                        <span>Experience the healing power of massage at our Praying Hands Massage and Bodywork studio.</span>

                        <div className="btn-container">
                            <Link to="/services" className="btn main">Book You Healing Session</Link>
                            <Link to="/contactUs" className="btn">Email Us</Link>
                        </div>
                    </div>
                    <img src={massuese_logo} className="landing-img" alt="landing page default" />   
                </div>

                <div className='contact-info-container'>
                    <div className="spacer sz-1" />
                    <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                        <FontAwesomeIcon icon={faFacebookF} />
                    </a>

                    <div className="spacer sz-f-20" />
                    <a href={INSTAGRAM_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>

                    <div className="spacer sz-f-20" />
                    <a href={GOOGLE_LINK} target="_blank" rel="noreferrer" className='icon-container'>
                        <FontAwesomeIcon icon={faGoogle} />
                    </a>

                    <div className="spacer sz-f-40" />
                    <a href="tel:302-650-3183" className='icon-container text'>
                        <span>(302) 650-3183</span>
                    </a>

                    <div className="spacer sz-f" />
                </div>             
            </section>

            <section className='home-section contained'>
                <div className='img-content-container'>
                    <div className='img-grid'>
                        <img src={massage_1} className='sz-2' alt="Back Massage" />
                        <img src={massage_2} className='sz-1'alt="Neck Massage"  />
                        <img src={massage_chair} className='sz-1' alt="Massage chair" />
                    </div>

                    <div className='text-content'>
                        <h1>Are you feeling the need to hit the reset button & feel refreshed?</h1>

                        <p>
                            Owner Trish has been a  Massage technician for over 20 years, and loves what she does.
                            She is dedicated to seeing results and brings awareness to prevention of illness to everyone around her.
                        </p>
                        <p>Treat yourself or loved one to a massage today, why wait.</p>

                        <div className="btn-container ctr">
                            <Link to="/aboutus" className="btn main">About Us</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className='home-section contained alt-color mobile-full'>
                <h1 className='section-title'>Services + Sessions</h1>
                <span className='section-subtitle'>Relax and Rejuvenate with Praying Hands Massage and Bodywork</span>

                <div className='services-container paged'>
                    {services_loading ?
                        <>
                            {emptyList(3).map((_svc, i) =>
                                <div className='service-info sz-3' key={i}>
                                    <div className='service-info-container empty' />
                                </div>
                            )}
                        </> :
                        <>
                            {services?.map((service, i)=>
                                <ServiceItem key={i} service={service} size={TOTAL_SERVICE_SIZE} max_lines={3} show_learn_more={true} show_more_toggle={false} />
                            )}
                        </>
                    }
                </div>

                <div className='services-pagination'>
                    <PagerCtrl maxPages={pages.total} pagePos={pages.page} setPagePos={setPage} />
                </div>
            </section>

            <section className='home-section'>
                <h1 className='section-title'>Reviews</h1>
                
                <ReviewsList />
            </section>
        </div>
    );
}

export default Home;