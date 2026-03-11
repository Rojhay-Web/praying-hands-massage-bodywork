import { useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ripples, ring } from 'ldrs';
import parse from 'html-react-parser';

import ReserveBtn from '../components/reserveBtn';

import { externalSiteConfirm, handleGQLError, priceString, tagPageview, timeString } from '../../utils';
import { Service } from '../../datatypes';

// Images
import logo from '../../assets/logos/logo_color.png';
import wellness_logo from '../../assets/logos/wellnessliving.svg';

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
      videos
    }
}`;

const booking_link = "https://www.wellnessliving.com/rs/appointment-new/praying_hands_massage_and_bodywork?dtu_redirect=2026-03-11+18%3A36%3A28&id_class_tab=3&id_mode=1&s_id=sBKQ2b";
const TOTAL_SERVICE_SIZE = 3,
    serviceTypes = [
        { display: "all", value: "" },
        { display: "massages", value: "massage" },
        { display: "groups", value: "group" },
        { display: "workshops", value: "workshop" },
        { display: "healings", value: "healing" }
    ];

    type ServiceItemDetailsType = {
    serviceList:Service[], pagePos:number, maxPages:number,
    setPagePos: (d:number) => void
}

function ServiceItemDetails({ serviceList, setPagePos, pagePos, maxPages }: ServiceItemDetailsType){
    const [selService, setSelService] = useState<Service>();
    const [showMore, setShowMore] = useState(false);

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

    const getBookingLink = (service: Service) => {
        let ret = "";
        try {
            // &is_widget=1 &is_microsite=0 id_screen=3 &id_mode=11 &is_all=1 &id_class_tab=4
            ret = "https://www.wellnessliving.com/rs/appointment-start.html?k_business=766502";  
        }
        catch(ex){
            console.log(`Get Booking Link: ${ex}`);
        }
        return ret;
    }

    const formatDesc = () => {
        let ret= {};
        try {
            if(!showMore) {
                // -webkit-line-clamp
                ret = { "WebkitLineClamp": `5` };
            }
        }
        catch(ex){
            console.log(`Error Formating Desc: ${ex}`);
        }

        return ret;
    }

    const toggleShow = () => {
        setShowMore((d) => { return !d; } )
    }

    useEffect(()=>{
        if(serviceList?.length){
            setSelService(serviceList[0]);
        }
    },[serviceList]);

    useEffect(()=>{ ring.register(); },[]);

    return(
        <div className='service-details-container'>
            <div className='title-outer-container'>
                <span className={`material-symbols-outlined ctrl ${pagePos === 1 ? 'disable': ''}`} onClick={()=> { changePage(-1); }}>chevron_left</span>

                <div className='title-list-container'>
                    {serviceList.map((svc, i)=>
                        <span className={(svc._id === selService?._id ? "sel" : "")} 
                            key={i} onClick={()=>{ setSelService(svc); }}>{svc.title ?? 'N/A'}</span>
                    )}
                </div>

                <span className={`material-symbols-outlined ctrl ${pagePos === maxPages ? 'disable': ''}`} onClick={()=> { changePage(1); }}>chevron_right</span>
            </div>
            

            <div className='sel-details'>
                {!selService ? <></> :
                    <>
                        <div className='img-container'>
                            <img src={(selService.image ?? logo)} alt={`${selService.time} representation`}/>
                        </div>

                        <div className='detail-content'>
                            <h2 className='content-title'>{selService.title}</h2>

                            <div className='sub-title-details'>
                                <span>{timeString(selService.time)}</span>
                                <span>{priceString(selService.price)}</span>
                            </div>

                            {selService?.videos && selService.videos.length > 0 ?
                                <>
                                    <div className='content-title'>Videos</div>
                                    <div className='video-outer-container'>
                                        <div className='video-inner-container'>
                                            {selService.videos.map((vid, i) =>
                                                <div className='video-item'>
                                                    <iframe src={`${vid}/preview`} className='video-frame' width="160" height="120" key={i}/>
                                                    <div className='loading-item'>
                                                        <l-ring size="40" stroke="5" bg-opacity="0" speed="2" color="rgba(160, 82, 45, 0.7)"></l-ring>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </> : <></>
                            }

                            <div className='content-title'>Description</div>

                            <div className="description-content web">{parse(selService?.description ?? "Please contact us for more information on this service.")}</div>
                            {/* Mobile Description */}
                            <>
                                <div className="description-content mobile" style={formatDesc()}>{parse(selService?.description ?? "Please contact us for more information on this service.")}</div>

                                <div className="more-toggle" onClick={toggleShow}>
                                    <span className="material-symbols-outlined">{showMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                                    <span>{`Show ${showMore ? 'Less' : 'More'}`}</span>
                                    <span className="material-symbols-outlined">{showMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                                </div>
                            </>
                            
                            <div className="btn-container">
                                {selService.bookingSite ?
                                    <a href={getBookingLink(selService)} target="_blank" rel="noreferrer" onClick={externalSiteConfirm} className="btn img-icon border-base">
                                        <img src={wellness_logo} alt={`Sponsored By WellnessLiving`} />
                                        <span>Book</span>
                                    </a>: 
                                    <ReserveBtn service={selService} />
                                }
                            </div>
                        </div>
                    </>
                }
                <></>
            </div>
        </div>
    );
}

function Services(){
    const [selectType, setSelectType] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [pages, setPages] = useState({ page: 0, total: 0 });  
    
    const initService = useRef(false);

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
    const setType = (type: string) => {
        try {
            if(type !== selectType){
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
        tagPageview('/services', 'View Page');
        ripples.register();
    },[]);

    return(
        <div className="core-page services">
            <section className="internal-landing back">
                <h1>Bookings & Services</h1>
            </section>
            
            <section className='core-section mini'>
                <div className='booking-cards'>
                    <h1 className='section-title mini'>Our Booking Site</h1>

                    <a href={booking_link} target="_blank" rel="noreferrer" className='card-container'>
                        <img src={"https://d1v4s90m0bk5bo.cloudfront.net/E/S.png"} alt="Wellnessliving" />
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
                                    <ServiceItemDetails serviceList={services} maxPages={pages.total} pagePos={pages.page} setPagePos={setPage} />
                                </> :
                                <div className='empty-message'>
                                    Currently we don't offer any of this specific type
                                </div>
                            }                            
                        </>
                    }
                </div>
            </section>
        </div>
    );
}

export default Services;