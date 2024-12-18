import { useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ripples } from 'ldrs';

import ServiceItem from '../components/serviceItem';
import PagerCtrl from '../components/pageCtrl';

import { externalSiteConfirm, handleGQLError } from '../../utils';
import { Service } from '../../datatypes';

// Images
import heallist from '../../assets/logos/heallist.png';
import massagebook from '../../assets/logos/massageBook.png';


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
}`;

const TOTAL_SERVICE_SIZE = 2,
    serviceTypes = [
        { display: "all", value: "" },
        { display: "massages", value: "massage" },
        { display: "groups", value: "group" },
        { display: "workshops", value: "workshop" },
        { display: "healings", value: "healing" }
    ];

function Services(){
    const [selectType, setSelectType] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [pages, setPages] = useState({ page: 0, total: 0 });  
    
    const initService = useRef(false);

    const [retrieveServices,{ loading: services_loading, error, data: services_data }] = useLazyQuery(GET_SERVICES_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});

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
    const setType = (type: string) => {
        try {
            if(type != selectType){
                setSelectType(type);
            }
        }
        catch(ex){
            console.log(`Setting Type: ${ex}`);
        }
    }
    
    useEffect(()=> {
        if(pages?.total === 0) {
            setServices([]);
        }
        else if(pages?.page > 0 && pages?.page <= pages?.total){
            let start = ((pages.page - 1) * TOTAL_SERVICE_SIZE);
            let tmpServices = services_data?.services?.slice(start, (start + TOTAL_SERVICE_SIZE));

            setServices(tmpServices);
        }
    },[pages]);
    
    useEffect(()=>{ 
        if(initService.current){
            const tmp_total = (services_data?.services?.length > 0 ? Math.ceil(services_data.services.length / TOTAL_SERVICE_SIZE): 0);
            setPages({ page:1, total: tmp_total });
        }

        initService.current = true;
    },[services_data]);

    useEffect(()=>{
        retrieveServices({ variables: { type: selectType }});
    },[selectType]);

    useEffect(()=> { 
        document.title = "Bookings & Services"; 
        ripples.register();
    },[]);

    return(
        <div className="core-page services">
            <section className="internal-landing back">
                <h1>Bookings & Services</h1>
            </section>
            
            <section className='core-section mini'>
                <div className='booking-cards'>
                    <h1 className='section-title mini'>Our Booking Sites</h1>

                    <a href="https://www.massagebook.com/therapists/PrayingHandsMassageandBodywork" target="_blank" onClick={externalSiteConfirm} className='card-container'>
                        <img src={massagebook} alt="MassageBook Logo" />
                    </a>

                    <a href="https://app.heallist.com/p/patricia-blakey" target="_blank" onClick={externalSiteConfirm} className='card-container'>
                        <img src={heallist} alt="HealList Logo" />
                    </a>
                </div>
            </section>

            <section className='core-section contained'>
                <div className='service-type-outer-container'>
                    <div className='service-type-container'>
                        {serviceTypes.map((type, i) => 
                            <div className={`type-sel ${type.value === selectType ? 'sel':''}`} key={i} onClick={()=>{ setType(type.value); }}>{type.display}</div>
                        )}
                    </div>
                </div>

                <div className='services-container paged'>
                    {services_loading ?
                        <div className='loading-container'>
                            <l-ripples size="150" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                        </div> :
                        <>
                            {services.length > 0 ?
                                <>
                                    {services?.map((service, i)=>
                                        <ServiceItem key={i} service={service} size={TOTAL_SERVICE_SIZE} max_lines={3} show_learn_more={false} show_more_toggle={true} />
                                    )}
                                </> :
                                <div className='empty-message'>
                                    Currently we don't offer any of this specific type
                                </div>
                            }                            
                        </>
                    }
                </div>
                    
                <div className='services-pagination'>
                    {pages?.total > 0 ?
                        <PagerCtrl maxPages={pages.total} pagePos={pages.page} setPagePos={setPage} />
                        : <></>
                    }
                </div>
            </section>
        </div>
    );
}

export default Services;