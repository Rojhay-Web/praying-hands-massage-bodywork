import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

// Images
import background from '../../assets/landing-background.png';
import massuese_logo from '../../assets/logo3.png';


function Home(){
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
                    <div className='icon-container'>
                        <FontAwesomeIcon icon={faFacebookF} />
                    </div>

                    <div className="spacer sz-f-20" />
                    <div className='icon-container'>
                        <FontAwesomeIcon icon={faInstagram} />
                    </div>

                    <div className="spacer sz-f-20" />
                    <div className='icon-container'>
                        <FontAwesomeIcon icon={faGoogle} />
                    </div>

                    <div className="spacer sz-f-40" />
                    <a href="tel:302-650-3183" className='icon-container text'>
                        <span>(302) 650-3183</span>
                    </a>

                    <div className="spacer sz-f" />
                </div>             
            </section>
        </div>
    );
}

export default Home;