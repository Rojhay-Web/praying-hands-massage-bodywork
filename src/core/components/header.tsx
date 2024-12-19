import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Images
import logoB from '../../assets/logos/logo_b.png';
import logoC from '../../assets/logos/logo_color.png';
import AdminBtn from "./adminBtn";

function MobileNav({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (s:boolean) => void }) {
    return (
        <div className={`m-sidenav-container ${(isOpen ? "active": "")}`}>
            <div className="m-nav-close" onClick={() => setIsOpen(false)}><span className="close-nav" /></div>
            <div className="m-sidenav-section">
                <NavLink className="m-sidenav-link" to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
                <NavLink className="m-sidenav-link" to="/aboutUs" onClick={() => setIsOpen(false)}>About Us</NavLink>
                <NavLink className="m-sidenav-link" to="/services" onClick={() => setIsOpen(false)}>Bookings + Services</NavLink>
                <NavLink className="m-sidenav-link" to="/gallery" onClick={() => setIsOpen(false)}>Gallery</NavLink>
                <NavLink className="m-sidenav-link mini-link" to="/" onClick={() => setIsOpen(false)}>Contact Us</NavLink>
                <div className="m-sidenav-admin-access-container">
                    <AdminBtn />
                </div>
            </div>
        </div>
    );
}

function Header(){
    const [navChange, setNavChange] = useState(false);
    const [sideNav, setSideNav] = useState(false);
    
    useEffect(()=> {
        function handleScroll() {
            const height = 100;

            setNavChange((d)=>{
                if(window.scrollY <= height && d) { 
                    return false;                  
                }
                else if(window.scrollY > height && !d){
                    return true; 
                }

                return d;
            });
        }
      
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); 
    },[]);

    return (
        <>
            <MobileNav isOpen={sideNav} setIsOpen={setSideNav}/>
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
                    <span className="material-symbols-outlined navbar-toggler-icon">menu_open</span>
                </button>

                <div className="collapse navbar-collapse">
                    <div className="collapse-container">
                        <div className='page-nav-container'>
                            <NavLink className={`nav-item nav-link`}  to="/aboutUs">About Us</NavLink>
                            <NavLink className={`nav-item nav-link`}  to="/services">Bookings + Services</NavLink>
                            <NavLink className={`nav-item nav-link`}  to="/gallery">Gallery</NavLink>
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