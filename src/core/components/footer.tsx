import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faGoogle } from '@fortawesome/free-brands-svg-icons';

// Images
import logoB from '../../assets/logos/logo_b.png';

function Footer(){
    return (
        <div className="footer-container">
            <div className="footer-section">
                <div className="footer-content">
                    <Link className="navbar-brand" to="/">
                        <div className="initial-wrapper">
                            <img src={logoB} alt="Praying Hands Massage & Wellness Logo"/>
                            <div className="title">
                                <span>Praying Hands</span>
                                <span>Massage & Bodywork</span>
                            </div>
                        </div>
                    </Link>

                    <div className='contact-info-container'>
                        <a href="" target="_blank" className='icon-container'>
                            <FontAwesomeIcon icon={faFacebookF} />
                        </a>

                        <a href="" target="_blank" className='icon-container'>
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>

                        <a href="" target="_blank" className='icon-container'>
                            <FontAwesomeIcon icon={faGoogle} />
                        </a>

                        <a href="tel:302-650-3183" className='icon-container text'>
                            <span>(302) 650-3183</span>
                        </a>
                    </div>           
                </div>

                <div className="footer-content">
                    <Link className={`footer-item nav-link`}  to="/aboutUs">About Us</Link>
                    <Link className={`footer-item nav-link`}  to="/">Bookings + Services</Link>
                    <Link className={`footer-item nav-link`}  to="/">Gallery</Link>
                    <Link className={`footer-item nav-link`}  to="/">Contact Us</Link>
                </div>
            </div>
        </div>
    );
}

export default Footer;