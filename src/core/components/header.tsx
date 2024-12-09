import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Images
import logoB from '../../assets/logos/logo_b.png';
import logoC from '../../assets/logos/logo_color.png';
import AdminBtn from "./adminBtn";

function Header({ }){
    const [navChange, setNavChange] = useState(false);
    const [sideNav, setSideNav] = useState(false);
    
    useEffect(()=> {
        function handleScroll() {
            const height = 500;

            if(window.scrollY <= height && navChange) { 
                setNavChange(false);                    
            }
            else if(window.scrollY > height && !navChange){
                setNavChange(true);
            }
        }
      
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); 
    },[]);

    return (
        <>
            {/* TODO: Mobile Nav*/}
            <nav className={`navbar navbar-expand-lg ${navChange ? 'back' : ''}`}>
                <Link className="navbar-brand" to="/">
                    <div className="initial-wrapper">
                        <img src={(navChange ? logoC : logoB)} alt="Praying Hands Massage & Wellness Logo"/>
                        <div className="title">
                            <span>Praying Hands</span>
                            <span>Massage & Bodywork</span>
                        </div>
                    </div>
                </Link>

                <button className="navbar-toggler" type="button" aria-label="Toggle navigation" onClick={() => setSideNav(true) }>
                    <span className="material-symbols-outlined navbar-toggler-icon">menu</span>
                </button>

                <div className="collapse navbar-collapse">
                    <div className="collapse-container">
                        <div className='page-nav-container'>
                            <NavLink className={`nav-item nav-link`}  to="/">About Us</NavLink>
                            <NavLink className={`nav-item nav-link`}  to="/">Bookings + Services</NavLink>
                            <NavLink className={`nav-item nav-link`}  to="/">Gallery</NavLink>
                        </div>

                        <div className="page-nav-container extra">
                            <NavLink className={`nav-item nav-link`}  to="/">Contact Us</NavLink>
                            <AdminBtn />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Header;