import { useState } from "react";
import { Link } from "react-router-dom";
import parse from 'html-react-parser';

import { Service } from "../../datatypes"

import logo from '../../assets/logos/logo_color.png';
import { externalSiteConfirm } from "../../utils";

type ServiceItemType = {
    service: Service, size?: number, max_lines?:number,
    show_learn_more?: boolean, show_more_toggle?: boolean
}

export default function ServiceItem({ service, size=2, max_lines=3, show_learn_more=false, show_more_toggle=true }: ServiceItemType){
    const [showMore, setShowMore] = useState(false);

    const timeString = (time?: number | null) => {
        let ret = "";
        try {
            ret = `${!time ? 'Time may vary' : `${time} mins`}`;
        }
        catch(ex){
            console.log(`Building Time Str: ${ex}`);
        }
        return ret;
    }

    const priceString = (price?: number | null) => {
        let ret = "";
        try {
            ret = (!price ? 'Prices may vary' : 
                new Intl.NumberFormat('en-US', {
                    style: 'currency', currency: 'USD',
                }).format(price)
            );
        }
        catch(ex){
            console.log(`Building Time Str: ${ex}`);
        }
        return ret;
    }

    const formatDesc = () => {
        let ret= {};
        try {
            if(!showMore) {
                // -webkit-line-clamp
                ret = { "WebkitLineClamp": `${max_lines}` };
            }
        }
        catch(ex){
            console.log(`Error Formating Desc: ${ex}`);
        }

        return ret;
    }

    const getBookingLink = () => {
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

    const toggleShow = () => {
        setShowMore((d) => { return !d; } )
    }

    return(
        <div className={`service-info sz-${size}`}>
            <div className="service-info-container">
                <div className='info-title'>
                    <div className='title-container'>
                        <span className='title'>{service.title}</span>
                        <span className="sub-title">{timeString(service.time)}</span>
                        <span className="sub-title">{priceString(service.price)}</span>
                    </div>

                    <div className='img-container'>
                        <img src={(service.image ?? logo)} alt={`${service.title} Representation`} />
                    </div>
                </div>

                <div className="description-container">
                    <div className="description-content" style={formatDesc()}>{parse(service?.description ?? "Please contact us for more information on this service.")}</div>

                    {show_more_toggle ?
                        <div className="more-toggle" onClick={toggleShow}>
                            <span className="material-symbols-outlined">{showMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                            <span>{`Show ${showMore ? 'Less' : 'More'}`}</span>
                            <span className="material-symbols-outlined">{showMore ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                        </div> : <></>
                    }
                </div>

                <div className="btn-container">
                    {show_learn_more ?
                        <Link to="/services" className="btn">Learn More</Link> : <></>
                    }
                    {service.bookingSite ?
                        <a href={getBookingLink()} target="_blank" rel="noreferrer" onClick={externalSiteConfirm} className="btn main">Book</a>:
                        <div className="btn main c1">Reserve</div>
                    }
                </div>
            </div>
        </div>
    )
}