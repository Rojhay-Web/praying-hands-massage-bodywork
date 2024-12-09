// Images
import logoB from '../../assets/logos/logo_b.png';
import hands1 from '../../assets/stock/hands1.jpg';
import background from '../../assets/background.png';

function UC(){

    return (
        <div className="app-body">              
            {/* HEADER */}
            <nav className='navbar navbar-expand-lg'>
                <div className="navbar-brand">
                    <div className="initial-wrapper">
                        <img src={logoB} alt="Praying Hands Massage & Wellness Logo"/>
                        <div className="title">
                            <span>Praying Hands</span>
                            <span>Massage & Bodywork</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Body */}
            <div className='page-body'>
                <div className="core-page uc">
                    <img src={background} className="uc-background" />
                    <div className='uc-container'>
                        <div className='img-container'>
                            <img src={hands1} alt="Simple massage sketch" />
                        </div>

                        <div className='content-container'>
                            <h1>Welcome To</h1>
                            <p>Praying Hands Massage and Bodywork</p>

                            <span>Our website is currently being updated, but please feel free to reach out to us with any questions or to request an appointment.</span>

                            <div className="contact-info">
                                <a href="tel:302-650-3183" className='contact-row'>
                                    <span className="material-symbols-outlined">call</span>
                                    <span>302-650-3183</span>
                                </a>
                                <a href="mailto:sparklewithtrish@gmail.com" className='contact-row'>
                                    <span className="material-symbols-outlined">mail</span>
                                    <span>sparklewithtrish@gmail.com</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UC;