import { useEffect, useState } from 'react';
import Holidays from 'date-holidays';

import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker  } from 'react-leaflet';

const hoursOfOperations: { [key:string]:any} = {
    "1": { id: "1", "day": "Mon", "isOpened": true, "open": 900, "close":1700 },
    "2": { id: "2", "day": "Tue", "isOpened": true, "open": 900, "close":1700 },
    "3": { id: "3", "day": "Wed", "isOpened": true, "open": 900, "close":1700 },
    "4": { id: "4", "day": "Thu", "isOpened": true, "open": 900, "close":1700 },
    "5": { id: "5", "day": "Fri", "isOpened": true, "open": 900, "close":1700 },
    "6": { id: "6", "day": "Sat", "isOpened": false, "open": 0, "close":0 },
    "0": { id: "0", "day": "Sun", "isOpened": false, "open": 0, "close":0 }
}

const position:LatLngTuple = [39.5146744,-75.7216415], zoom: number = 14,
    icon = L.icon({ iconUrl: "/images/marker-icon.png" });

function ContactUs(){
    const [hoursList, setHoursList] = useState<any[]>([]);
    const [curDay, setCurDay] = useState<any>();
    const [toggleDay, setToggleDay] = useState(true);
    const [isHoliday, setIsHoliday] = useState(false);

    const buildHoursList = () => {
        try {
            let tmpKeys:string[] = Object.keys(hoursOfOperations), tmpList: any[] = [];
            
            let tmpEnd = null;
            tmpKeys.forEach((key) => {
                if(key === "0"){
                    tmpEnd = hoursOfOperations[key]
                }
                else {
                    tmpList.push(hoursOfOperations[key]);
                }
            });

            if(tmpEnd) {tmpList.push(tmpEnd); }
            setHoursList(tmpList);
        }
        catch(ex){
            console.log(`Building Hours List: ${ex}`);
        }
    }

    const getCurDayHours = () => {
        try {
            const d = new Date();
            let curDayHours = hoursOfOperations[`${d.getDay()}`];
            
            if(curDayHours){
                setCurDay(curDayHours);
            }
        }
        catch(ex){
            console.log(`Getting Current Day Hours: ${ex}`);
        }
    }

    const getTimeStr = (time: number) =>{
        try {
            const isPM = time >= 1200;
            const timeStr = `0000${time}`.split("");

            let mStr = timeStr.splice(-2,2).join("");
            let hStr = timeStr.splice(-2,2).join("");

            let h = Number(hStr);
            h = (h > 12 ? (h - 12) : h);

            return `${h}:${mStr} ${isPM ? 'pm' : 'am'}`;
        }
        catch(ex){
            console.log(`Getting Time Str: ${ex}`);
        }

        return "~";
    }

    const toggle = () => {
        setToggleDay((d)=> { return !d; });
    }

    const checkHoliday = () => {
        try {
            const hd = new Holidays('US');
            const tmp_check = hd.isHoliday(new Date());

            setIsHoliday(!!tmp_check);
        }
        catch(ex){
            console.log(`Checking if today is holiday: ${ex}`)
        }
    }

    useEffect(()=> { 
        document.title = "Contact Us";
        buildHoursList(); getCurDayHours();
        checkHoliday();
    },[]);

    return(
        <div className="core-page contactus">
            <section className="internal-landing back">
                <h1>Contact Us</h1>
            </section>
            <section className='core-section contained'>
                <div className='contact-us-container'>
                    <div className='content'>
                        <h1 className='section-title'>Your healing awaits!</h1>
                        <span className='section-subtitle'>Email, call, or complete the form to reach out to us with and book an appointment, questions, or to get more information. We love our clients, but please no walk-ins</span>

                        <p className='l2'>Praying Hands Massage and Bodywork</p>
                        <p>4411 Summit Bridge Road, <br/>Middletown, Delaware 19709, <br/>United States</p>
                        <p>302-650-3183</p>
                        <p>Prayinghandswellness@gmail.com</p>

                        <p className='l2'>By Appointment Only</p>
                        <div className='hours-container'>
                            <span className="material-symbols-outlined toggle" onClick={toggle}>{toggleDay ? 'expand_content' : 'collapse_content'}</span>                          

                            <div className='day-container'>
                                {toggleDay ? 
                                    <>
                                        {curDay ?
                                            <>
                                                <div className='day cur'>
                                                    <span>{curDay?.isOpened ? "Open today" : "Sorry We're Closed Today"}</span>
                                                    {curDay?.isOpened ?
                                                        <span className='hours'>{getTimeStr(curDay?.open)} - {getTimeStr(curDay?.close)}</span> :
                                                        <></>
                                                    }
                                                </div> 
                                                {isHoliday ? <span className='holiday-text'>~ Holiday hours may differ</span> : <></>}
                                            </>: <></>
                                        }
                                    </> :
                                    <>
                                        <div className='week-container'>
                                            {hoursList?.map((day,i) =>
                                                <div className={`day week ${day.id === curDay?.id ? 'sel' : ''}`} key={i}>
                                                    <span className='day-str'>{day?.day}</span>
                                                    {day?.isOpened ?
                                                        <span className='hours'>{getTimeStr(day?.open)} - {getTimeStr(day?.close)}</span> :
                                                        <span className='hours'>Closed</span>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    <div className='map'>
                        <div className='map-container'>
                            <MapContainer center={position} zoom={zoom} scrollWheelZoom={false}
                                style={{ width: "100%", height: "500px" }} zoomControl={true}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <Marker position={position} icon={icon} />
                            </MapContainer>
                        </div>
                    </div>
                </div>                
            </section>
        </div>
    );
}

export default ContactUs;