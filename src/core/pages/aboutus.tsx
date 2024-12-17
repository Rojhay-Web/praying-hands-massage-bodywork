import parse from 'html-react-parser';

// Images
import trish1 from '../../assets/stock/trish1.jpg';
import trish2 from '../../assets/stock/trish2.jpg';
import trish3 from '../../assets/stock/trish3.jpg';
import about1 from '../../assets/stock/about1.jpg';
import about2 from '../../assets/stock/about2.jpg';

function AboutUs(){
    const story_text = `
    <p>Owner Trish has been a Massage technician for over 20 years, and loves what she does. She's always thriving to learn more to serve better.  As a <b>Massage practitioner</b>, <b>CPR instructor</b>, <b>Holy Fire® Reiki Master</b>, <b>Life Coach</b>, and <b>Sound Healer</b> and a faith filled servant. Faith can move mountains and  at Praying Hands Massage and Bodywork prayer is incorporated into your massage.</p>  
    <p>With a history of chronic pain and a servants heart she has always been passionate abut helping others. Having lost several family members and friends to cancer.  She is dedicated to seeing results and brings awareness to prevention of illness to everyone around her. "I have seen prayer work, says owner Trish Blakey ..our minds are an asset we can't afford to loose, keeping our thoughts on the positive and our hearts with God.  May you stay full of faith and the grace of the Lord be upon you always. " Now offering life coaching and sound healing in private and group settings. Call to schedule and check heallist for upcoming events.</p>
    <p>At Praying Hands you'll experience relaxation and personalization with every massage. Are you feeling the need to hit the reset button and feel refreshed?  With a desire to see results and help with overall health, your wellness needs are taken seriously...  Oh and Snoring is a compliment...Treat yourself or loved one to a massage today, why wait.  Ask about our Loving Touch workshops where couples rekindle the flames with a touch workshop, perfect for a memorable and romantic date.</p> 
    <p>Praying Hands Massage and Bodywork only uses non toxic cleaners, laundry detergents,  paraben-free creams, vegan massage cream, and/or organic oils with your best health in mind.</p>`;

    return(
        <div className="core-page aboutus">
            <section className="internal-landing">
                <h1>About Us</h1>
            </section>
            <section className='core-section contained'>
                <div className='about-img-grid'>
                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={trish1} alt="about praying hands massage" />
                        </div>
                    </div>

                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={trish2} alt="about praying hands massage" />
                        </div>
                        <div className='img-container'>
                            <img src={trish3} alt="about praying hands massage" />
                        </div>
                    </div>

                    <div className='img-col'>
                        <div className='img-container'>
                            <img src={about1} alt="about praying hands massage" />
                        </div>
                    </div>
                    
                </div>

                <h1 className='section-title'>Our Story</h1>

                <div className='story-content'>{parse(story_text)}</div>
            </section>
        </div>
    );
}

export default AboutUs;