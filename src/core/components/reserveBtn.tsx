import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import Rodal from "rodal";
import parse from 'html-react-parser';
import { ripples } from 'ldrs';
import { addDays, addMinutes, format } from "date-fns";

import { Service } from "../../datatypes";
import { handleGQLError, priceString, tagEvent, timeString } from "../../utils";
import { Link } from "react-router-dom";

type ReserveBtnType = {
    service: Service
};

type ReserveModalType = {
    service: Service,
    visible: boolean,
    closeAction: () => void
};

const GET_TIMES_QUERY = gql`
query getEventAvailability($startDt: String!, $endDt:String!, $time:Int){
	eventAvailability(startDt: $startDt, endDt:$endDt, time:$time){
      dateTime
      timeZone
    }
 }`,
 CREATE_EVENT = gql`
 mutation createEvent($service: String!, $name: String!, $email:String!, $phone:String!, $price:Int, $startTime: String, $endTime: String){
	createEvent(service: $service, name: $name, email: $email, phone: $phone, price: $price, startTime: $startTime, endTime: $endTime)
 }`;

function ReserveModal({ service, visible, closeAction }: ReserveModalType) {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [selDate, setSelDate] = useState<Date | null>(null);
    const [selTime, setSelTime] = useState<Date|null>(null);
    const [completed, setCompleted] = useState(false);

    const [contactInfo, setContactInfo] = useState({ name:'', email:'', phone:''});
    const [invalidFields, setInvalidFields] = useState<{ [key:string]:boolean }>({});

    const formInit = useRef(false);

    const [retrieveTimes,{ loading, data }] = useLazyQuery(GET_TIMES_QUERY, {fetchPolicy: 'no-cache', onError: handleGQLError});
    const [createEvent,{ loading: create_event_loading, data: create_event_data }] = useMutation(CREATE_EVENT, {fetchPolicy: 'no-cache', onError: handleGQLError });

    const isWeekday = (date: Date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    };

    const calcModalSize = () => {
        let ret = { width: 400, height: 300 };
        try {
            ret.width = (windowSize.width > 832 ? 800 : .85 * windowSize.width);
            ret.height = (windowSize.height < 200 ? 200 : .85 * windowSize.height);
        }
        catch(ex){
            console.log(`Calculating Modal Size: ${ex}`);
        }
        return ret;
    }

    const formatTime = (time:any) =>{
        try {
            if(time?.dateTime){
                const d = new Date(time?.dateTime);
                let tmpStr = format(d, 'h:mm aaa');
                return tmpStr;
            }
        }
        catch(ex){
            console.log(`Formating Time: ${ex}`);
        }

        return "N/A";
    }

    const toggleSelTime = (time:Date) => {
        try {
            if(!completed){
                setSelTime((d) => {
                    return time === d ? null : time;
                });
            }
        }
        catch(ex){
            console.log(`Toggling Sel Time: ${ex}`);
        }
    }

    const handleChange = (e:any) => {
        try {
            let name = e.target.name,
                value = e.target.value;

            setContactInfo((d)=> {
                return {...d, [name]:value };
            });

            formInit.current = true;
        }
        catch(ex){
            console.log(`Handling Change: ${ex}`);
        }
    }

    const validateContact = (fields:string[]) => {
        try {
            const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                validPhoneRegex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
      
            let tmpFields:{ [key:string]:boolean } = {};

            for(let i=0; i < fields.length;i++){
                let field = fields[i];
                switch(field){
                    case "name":
                        if(!contactInfo?.name || contactInfo.name.length === 0){
                            tmpFields["name"] = true;
                        }
                        break;
                    case "email":
                        const email_valid = (contactInfo?.email?.length > 0 && contactInfo?.email.match(validEmailRegex));

                        if(!contactInfo?.email || !email_valid){
                            tmpFields["email"] = true;
                        }
                        break;
                    case "phone":
                        const phone_valid = (contactInfo?.phone?.length > 0 && contactInfo?.phone.match(validPhoneRegex));

                        if(!contactInfo?.phone || !phone_valid){
                            tmpFields["phone"] = true;
                        }
                        break;
                }
            }

            setInvalidFields(tmpFields);
        }
        catch(ex){
            console.log(`Validating Contact Form: ${ex}`);
        }
    }

    const checkInvalidFields = () => {
        try {
            let ret = Object.keys(invalidFields);
            return ret;
        }
        catch(ex){
            console.log(`Error Checking Invalid Fields: ${ex}`);
        }
        return ["error"];
    }

    const submitForm = () => {
        try {
            if(selTime && checkInvalidFields()?.length === 0){
                const st = service?.time ? service.time : 60;
                const endTime = addMinutes(selTime, st);

                createEvent({ variables: {
                    "service":service.title,
                    "price":service.price,
                    "startTime": format(selTime,'yyyy-MM-dd HH:mm:ss'),
                    "endTime": format(endTime,'yyyy-MM-dd HH:mm:ss'),
                    ...contactInfo
                }});

                tagEvent("Service Reservation",`Reserve: ${service.title}`);
            }
        }
        catch(ex){
            console.log(`Submitting Form: ${ex}`);
        }
    }

    const resetForm = (close: boolean) => {
        setSelDate(null); setSelTime(null);
        setContactInfo({ name:'', email:'', phone:''});
        setCompleted(false); setInvalidFields({});
        formInit.current = false;
        if(close){ closeAction(); }
    }

    useEffect(()=> { 
        if(selDate){
            const stDt = format(selDate,'yyyy-MM-dd'),
                endDt = format(addDays(selDate, 1),'yyyy-MM-dd'),
                timeRange = service?.time;

            validateContact(["name", "email", "phone"]);
            retrieveTimes({ variables: { startDt: stDt, endDt: endDt, ...(timeRange ? { time: timeRange } : {}) }});
        }
        else {
            setSelTime(null);
        }
    },[selDate]);

    useEffect(()=>{
        if(formInit.current && contactInfo) {
            validateContact(["name", "email", "phone"]);
        }
    },[contactInfo]);

    useEffect(()=>{
        if(create_event_data?.createEvent){
            setCompleted(!!create_event_data?.createEvent)
        }
    },[create_event_data]);

    useEffect(()=> {
        function handleResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
          
        ripples.register(); resetForm(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize); 
    },[]);

    return(
        <Rodal className="reservation-form" visible={visible} onClose={closeAction} 
            width={calcModalSize().width} height={calcModalSize().height} animation={"slideRight"}>
            <div className={`form-container ${completed ? 'complete' : ''}`}>
                <div className="form-actions">
                    <div className="title">{service.title}</div>
                    <div className="subtitle">{timeString(service.time)} | {priceString(service.price)}</div>

                    <p className="description">{parse(service?.description ?? "Please contact us for more information on this service.")}</p>
                    <div className="selection-container">
                        <div className="selection-title">Contact Information</div>

                        <div className="contact-form">
                            <input className={`sel-input sz-10 ${"name" in invalidFields ? 'err' : ''}`} type="text" name="name" placeholder="Name" value={contactInfo.name} onChange={handleChange} disabled={completed}/>
                            <input className={`sel-input sz-5 ${"email" in invalidFields ? 'err' : ''}`} type="text" name="email" placeholder="Email" value={contactInfo.email} onChange={handleChange} disabled={completed}/>
                            <input className={`sel-input sz-5 ${"phone" in invalidFields ? 'err' : ''}`} type="text" name="phone" placeholder="Phone Number" value={contactInfo.phone} onChange={handleChange} disabled={completed}/>
                        </div>
                    </div>

                    <div className="selection-container">
                        <div className="selection-title">Select A Date</div>
                        <DatePicker
                            selected={selDate}
                            onChange={(date) => setSelDate(date)}
                            isClearable={true}
                            filterDate={isWeekday}
                            disabled={completed}
                            minDate={addDays(new Date(), 2)}
                        />
                    </div>
                    <div className="selection-container">
                        <div className="selection-title">Select A Time</div>
                        <div className="time-container">
                            {!selDate ? 
                                <span className="empty-message">Please select a date to see available times</span> :
                                <>
                                    {loading ?
                                        <div className='loading-container'>
                                            <l-ripples size="150" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                                        </div> :
                                        <>
                                            {data?.eventAvailability?.length > 0 ?
                                                <>
                                                    {data.eventAvailability.map((time:any, i:number) =>
                                                        <div className={`time-slot ${selTime === time.dateTime ? 'sel' :''} ${completed ? 'disabled': ''}`} onClick={()=>{ toggleSelTime(time.dateTime) }}>
                                                            {formatTime(time)}
                                                        </div>
                                                    )}
                                                </> :
                                                <div className="empty-message">
                                                    Sorry we don't have any avalibilities for that date.  
                                                    Please choose another date, or <Link to="/contactUs">contact us</Link> for additional options. 
                                                </div>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </div>
                    </div>
                </div>
                <div className="form-status">
                    {create_event_loading ?
                        <div className='icon-loading-container'>
                            <l-ripples size="72" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                        </div> :
                        <div className={`form-icon ${completed ? 'complete' : ''}`}>
                            <span className="material-symbols-outlined">{completed ? 'check' : 'calendar_month'}</span>
                        </div>
                    }
                    

                    <div className="title">{completed ? 'Requested' : 'Requesting'} a new appointment</div>
                    <p>Thank you for your interest in our <b>{service.title}</b>.</p>
                    <p>{completed ? 'We will follow up with you pending your request.' : 'Please complete the form with the required information to proceed.'}</p>

                    <div className="btn-container">
                        <div className={`btn main c1 ${selTime && checkInvalidFields()?.length === 0 && !completed ? '' : 'disable'}`} onClick={submitForm}>Request Appointment</div>
                        <div className="btn" onClick={()=> resetForm(true)}>Return to services</div>
                    </div>
                </div>
            </div>
        </Rodal>
    );
}

function ReserveBtn({ service }: ReserveBtnType){
    const [open, setOpen] = useState(false);
    
    return(
        <>
            <div className="btn main c1" onClick={()=> { setOpen(true); }}>Reserve</div>
            <ReserveModal service={service} visible={open} closeAction={()=>{ setOpen(false); }} />
        </>
    );
}

export default ReserveBtn;