import { useEffect, useRef, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { ripples } from 'ldrs';
import parse from 'html-react-parser';

import ReserveBtn from '../components/reserveBtn';

import { externalSiteConfirm, handleGQLError, priceString, timeString } from '../../utils';
import { Service } from '../../datatypes';

// Images
import heallist from '../../assets/logos/heallist.png';
import massagebook from '../../assets/logos/massageBook.png';
import logo from '../../assets/logos/logo_color.png';


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
            if(service.bookingSite === "massagebook") {
                ret = "https://www.massagebook.com/therapists/PrayingHandsMassageandBodywork";
            }
            else if(service.bookingSite === "heallist") {
                ret = "https://app.heallist.com/p/patricia-blakey";
            }
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
                                    <a href={getBookingLink(selService)} target="_blank" rel="noreferrer" onClick={externalSiteConfirm} className="btn main">Book</a>:
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

                    <a href="https://www.massagebook.com/therapists/PrayingHandsMassageandBodywork" target="_blank" rel="noreferrer" onClick={externalSiteConfirm} className='card-container'>
                        <img src={massagebook} alt="MassageBook Logo" />
                    </a>

                    <a href="https://app.heallist.com/p/patricia-blakey" target="_blank" rel="noreferrer" onClick={externalSiteConfirm} className='card-container'>
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