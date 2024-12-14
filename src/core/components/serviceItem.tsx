import { useState } from "react";
import { Service } from "../../datatypes"

import logo from '../../assets/logos/logo_color.png';

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
                ret = { "-webkit-line-clamp": `${max_lines}` };
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
                        <img src={(service.image ?? logo)} />
                    </div>
                </div>

                <div className="description-container">
                    <p style={formatDesc()}>{service?.description ?? "Please contact us for more information on this service."}</p>

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
                        <div className="btn">Learn More</div> : <></>
                    }
                    <div className="btn main">Book</div>
                </div>
            </div>
        </div>
    )
}