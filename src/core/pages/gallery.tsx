import { useEffect } from 'react';

function Gallery(){
    useEffect(()=> { document.title = "Gallery"; },[]);

    return(
        <div className="core-page aboutus">
            <section className="internal-landing back">
                <h1>Gallery</h1>
            </section>

            <section className='core-section contained'>
                
            </section>
        </div>
    );
}

export default Gallery;