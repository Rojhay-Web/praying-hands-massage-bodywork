import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Images
import logoB from '../../assets/logos/logo_b.png';
import logoC from '../../assets/logos/logo_color.png';
import AdminBtn from "./adminBtn";

function MobileNav({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (s:boolean) => void }) {
    const navActivityClass = ({ isActive, additionalClass }: { isActive: boolean, additionalClass?:string }) => (isActive ? `sel m-sidenav-link ${additionalClass}`: `m-sidenav-link ${additionalClass}`);

    return (
        <div className={`m-sidenav-container ${(isOpen ? "active": "")}`}>
            <div className="m-nav-close" onClick={() => setIsOpen(false)}><span className="close-nav" /></div>
            <div className="m-sidenav-section">
                <NavLink className={({ isActive }) => navActivityClass({ isActive })} to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
                <NavLink className={({ isActive }) => navActivityClass({ isActive })} to="/aboutUs" onClick={() => setIsOpen(false)}>About Us</NavLink>
                <NavLink className={({ isActive }) => navActivityClass({ isActive })} to="/services" onClick={() => setIsOpen(false)}>Bookings + Services</NavLink>
                <NavLink className={({ isActive }) => navActivityClass({ isActive })} to="/gallery" onClick={() => setIsOpen(false)}>Gallery</NavLink>
                <NavLink className={({ isActive }) => navActivityClass({ isActive, additionalClass:"mini-link" })} to="/contactUs" onClick={() => setIsOpen(false)}>Contact Us</NavLink>
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
    
    const setSidebarDisplay = (status: boolean) => {
        document.body.classList.toggle('noscroll', status);
        setSideNav(status);
    }

    const navActivityClass = ({ isActive }: { isActive: boolean }) => (isActive ? `sel nav-item nav-link`: `nav-item nav-link`);

    useEffect(()=> {
        function handleScroll() {
            const height = 75;

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
            <MobileNav isOpen={sideNav} setIsOpen={setSidebarDisplay}/>
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

                <button className="navbar-toggler" type="button" aria-label="Toggle navigation" onClick={() => setSidebarDisplay(true) }>
                    <span className="material-symbols-outlined navbar-toggler-icon">menu_open</span>
                </button>

                <div className="collapse navbar-collapse">
                    <div className="collapse-container">
                        <div className='page-nav-container'>
                            <NavLink className={navActivityClass} to="/aboutUs">About Us</NavLink>
                            <NavLink className={navActivityClass} to="/services">Bookings + Services</NavLink>
                            <NavLink className={navActivityClass} to="/gallery">Gallery</NavLink>
                        </div>

                        <div className="page-nav-container extra">
                            <NavLink className={navActivityClass}  to="/contactUs">Contact Us</NavLink>
                            <AdminBtn />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Header;