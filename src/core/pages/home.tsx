import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

import { Service } from '../../datatypes';

import ServiceItem from '../components/serviceItem';
import PagerCtrl from '../components/pageCtrl';
import ReviewsList from '../components/reviewsList';

// Images
import background from '../../assets/landing-background-2.png';
import massuese_logo from '../../assets/logo3.png';

import massage_1 from '../../assets/stock/massage_1.jpg';
import massage_2 from '../../assets/stock/massage_2.jpg';
import massage_chair from '../../assets/stock/massage_chair.jpg';


const fullServiceList: Service[] = [
    { 
        _id: "0", title: "Relax and Trust God Swedish Massage", price: 90,
        bookingSite: "massagebook", time: 60, image: null,
        type:"massage", description: "After a massage with prayer, clients often feel a profound sense of calm and renewal that touches both their body and spirit. Physically, noticing reduced muscle tension, lighter limbs, and a deep sense of relaxation, as though stress has melted away. Spiritually, the prayer element brings a feeling of peace, comfort, and support, leaving you uplifted and connected. Many describe feeling refreshed, centered, and at ease, with a sense of hope and clarity. This holistic experience can foster emotional release and healing, helping clients leave with a stronger sense of well-being and inner harmony."
    },
    { 
        _id: "1", title: "Deep Tissue Massage", price: 95,
        bookingSite: "massagebook", time: 60, image: null,
        type:"massage", description: "A deep tissue massage is an intensive, targeted therapy designed to release chronic muscle tension, alleviate pain, and improve mobility. Your therapist works deeply into the layers of muscle and connective tissue to break up knots, release adhesions, and promote healing. Ideal for those with persistent soreness, muscle stiffness, or limited range of motion, deep tissue massage addresses specific problem areas to provide lasting relief. This therapeutic approach not only reduces physical discomfort but also promotes a sense of relaxation and rejuvenation, helping you feel restored and revitalized."
    },
    { 
        _id: "2", title: "Bamboo Bliss", price: 100,
        bookingSite: "massagebook", time: 60, image: null,
        type:"massage", description: "The Bamboo Bliss Massage with warmed bamboo is a rejuvenating experience that combines traditional massage techniques with the soothing warmth and firm pressure of smooth bamboo sticks. During this treatment, heated bamboo is rolled and pressed along the body, melting away muscle tension and enhancing circulation. The warmth of the bamboo helps release deep-seated knots, while the unique texture offers a therapeutic depth that eases aches and promotes flexibility. This massage brings a calming, grounding energy, leaving clients feeling revitalized, refreshed, and deeply relaxed. Perfect for those seeking a soothing yet effective approach to stress relief and muscle relaxation."
    },
    { 
        _id: "3", title: "BLS Basic Life Support CPR training", price: null,
        bookingSite: null, time: 60, image: null,
        type:"group", description: "Our BLS Basic Life Support CPR training service offers comprehensive instruction in lifesaving techniques for medical professionals and healthcare providers. Our certified instructors provide hands-on training in basic CPR skills, AED usage, and airway management to ensure participants are equipped to respond effectively in emergency situations. With a focus on professionalism and quality education, our course is designed to meet the highest standards of care and safety in the healthcare industry."
    },
    { 
        _id: "4", title: "Loving Touch Workshop", price: 199,
        bookingSite: "heallist", time: 90, image: null,
        type: "workshop", description: "A Date Night Experience for Couples At Praying Hands Massage And Bodywork, the Loving Touch Workshop is designed to help couples reconnect, relax, and pamper each other through the art of massage. This workshop provides practical tips and techniques for easing pain and discomfort, allowing partners to give each other loving, therapeutic touch in between professional massage sessions. The experience is set up like a date night, complete with a special ambiance. Couples begin by sharing the story of how they met, creating a heartwarming atmosphere to deepen their connection. Throughout the workshop, you’ll learn massage techniques focused on areas where tension and discomfort often arise, and ways to offer gentle, caring touch to your partner. The session also includes time for pampering and practicing these skills with guidance, enhancing your bond. To elevate the experience, you’ll enjoy a delicious dessert together, perfect for anniversaries, birthdays, or simply a “just because” romantic night. The Loving Touch Workshop isn’t just for couples—it’s also suitable for caregivers, close friends, or family members who want to learn how to nurture and care for one another through touch. Workshops are available in both group settings or as private sessions tailored to your needs, ensuring you leave with newfound skills and a deeper connection. Whether you’re celebrating a special occasion or just wanting to spend quality time together, this workshop is a beautiful way to show love and care."
    },
    { 
        _id: "5", title: "Couples Massage", price: 199,
        bookingSite: "massagebook", time: 90, image: null,
        type:"massage", description: "The Couples Prayer Massage is a unique, heart-centered experience designed to nurture both body and soul while bringing partners closer together. This intimate session begins with each partner receiving a soothing massage that combines gentle, relaxing massage with prayers for peace, connection, and mutual support. The therapist prays over the couple, inviting a sense of unity, love, and shared purpose to fill the room. After the massage, the couple is welcomed to a cozy space where they can enjoy a delicious dessert and sparkling cider together. This sweet moment allows them to savor the relaxation and spiritual renewal they’ve just experienced, making it a perfect date night or celebration of their relationship. The Couples Prayer Massage is a beautiful way to unwind, reconnect, and deepen their bond in a peaceful, faith-filled atmosphere."
    },
    { 
        _id: "6", title: "Reiki Session", price: 90,
        bookingSite: "heallist", time: 60, image: null,
        type:"healing", description: "A Holy Fire Reiki healing session is a deeply spiritual and transformative experience that channels pure, gentle energy to cleanse, heal, and uplift the mind, body, and spirit. Holy Fire Reiki—a powerful, refined form of Reiki energy known for its purifying and nurturing qualities. As they lightly place their hands on or just above different areas of the body, clients may feel warmth, tingling, or a gentle wave of calm as stress and tension dissolve. Holy Fire Reiki has a profound capacity to release blockages, ease emotional pain, and bring a sense of clarity and peace. This sacred healing session fosters an atmosphere of safety and support, helping clients reconnect with their inner light and embrace a path of healing and self-compassion."
    }
];

const TOTAL_SERVICE_SIZE = 3;

function Home(){
    // Services Paging
    const [services, setServices] = useState<Service[]>([]);
    const [pages, setPages] = useState({ page: 0, total: 0 });

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
            let tmpServices = fullServiceList.slice(start, (start + TOTAL_SERVICE_SIZE));

            setServices(tmpServices);
        }
    },[pages]);

    useEffect(()=>{ 
        if(fullServiceList?.length > 0){ 
            setPages({ 
                page:1, total: Math.ceil(fullServiceList?.length / TOTAL_SERVICE_SIZE)
            });
        }
    },[fullServiceList]);
    
    return (
        <div className="core-page home">              
            <section className="home-landing">
                <img src={background} className="landing-background" />
                <div className="landing-content-container">
                    <div className="landing-content">
                        <h1>Experience Healing & Restoration</h1>
                        <h1>Through Prayer Massage</h1>
                        <span>Experience the healing power of massage at our Praying Hands Massage and Bodywork studio.</span>

                        <div className="btn-container">
                            <div className="btn main">Book You Healing Session</div>
                            <div className="btn">Email Us</div>
                        </div>
                    </div>
                    <img src={massuese_logo} className="landing-img" />   
                </div>

                <div className='contact-info-container'>
                    <div className="spacer sz-1" />
                    <a href="" target="_blank" className='icon-container'>
                        <FontAwesomeIcon icon={faFacebookF} />
                    </a>

                    <div className="spacer sz-f-20" />
                    <a href="" target="_blank" className='icon-container'>
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>

                    <div className="spacer sz-f-20" />
                    <a href="" target="_blank" className='icon-container'>
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
                        <img src={massage_1} className='sz-2' />
                        <img src={massage_2} className='sz-1' />
                        <img src={massage_chair} className='sz-1' />
                    </div>

                    <div className='text-content'>
                        <h1>Are you feeling the need to hit the reset button & feel refreshed?</h1>

                        <p>
                            Owner Trish has been a  Massage technician for over 20 years, and loves what she does.
                            She is dedicated to seeing results and brings awareness to prevention of illness to everyone around her.
                        </p>
                        <p>Treat yourself or loved one to a massage today, why wait.</p>

                        <div className="btn-container ctr">
                            <div className="btn main">About Us</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='home-section contained alt-color'>
                <h1 className='section-title'>Services + Sessions</h1>
                <span className='section-subtitle'>Relax and Rejuvenate with Praying Hands Massage and Bodywork</span>

                <div className='services-container paged'>
                    {services?.map((service, i)=>
                        <ServiceItem key={i} service={service} size={3} max_lines={3} show_learn_more={true} show_more_toggle={false} />
                    )}
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