require('dotenv').config();
const { google } = require('googleapis');

const log = require('./log.service'),
    util = require('../utils/util');

const { EVENT_PRIVATE_KEY, EVENT_CLIENT_EMAIL } = process.env;

module.exports = {
    getReviews: async function(){
        try {
            // const business_account = google.mybusinessaccountmanagement({ version: 'v1', auth: googleAuth });
            // const review_res = await business_account.accounts.locations.reviews.list({
            //     account_id: "",
            //     location_id: ""
            // });
/*
            const token = authenticate();
            const accountId='YOUR ACCOUNT ID';
            const locationId='YOUR LOCATION ID';
            const url=`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`;

            const ret = await fetch(url, {
                method: "GET", headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            if(ret.status != 200){
                log.error(`Unable to retrieve G-User Data [E00]`);
                return { error: `Unable to retrieve G-User Data [E00]` };
            }

            let res = await ret.json();

            console.log(res.data);
*/  
            const tmpReviews = [
                { 
                    name: 'Theresa Legar', reviewId: '',
                    reviewer: { displayName: "Theresa Legar" },
                    starRating: 'FIVE', comment: "Trish was amazing.  Everyone needs to feel as good as I do after a magical pampering session.  This time of year can be hard on us, why not treat yourself or family and friends to a massage or other pampering sessions she offers.?",
                    createTime: new Date(),
                },
                { 
                    name: 'Vichelle Bling', reviewId: '',
                    reviewer: { displayName: "Vichelle Bling" },
                    starRating: 'FIVE', comment: "This was an amazing experience I shared with my mother for our birthdays (she was the 11th and I’m the 23rd) and Trish went all out to make it special for the both of us! We received a full body massages with Reiki. The atmosphere was very clean and comfortable, and the massage was nothing short of perfect! The price point is incredibly reasonable considering the professionalism and precision of work…I would highly recommend Praying Hands Massage for your massage needs, reiki, AND sound healing! One stop shop for holistic healing ❤️‍🩹",
                    createTime: new Date(),
                },
                { 
                    name: 'Alec Marker', reviewId: '',
                    reviewer: { displayName: "Alec Marker" },
                    starRating: 'FIVE', comment: "Trish was amazing! I love that she prayed for me at the beginning of my massage and was so personable and sweet! My back and shoulders feel amazing! I can’t wait to go back!",
                    createTime: new Date(),
                },
                { 
                    name: `autochthonous dawata (L'Nabi n Saponi Roots)`, reviewId: '',
                    reviewer: { displayName: "autochthonous dawata (L'Nabi n Saponi Roots)" },
                    starRating: 'FIVE', comment: "I walked in with knotted and tight and left relaxed. Trish instinctively knew where my muscles needed attention. Her professionalism and skill is unmatched. She truly has blessed hands! I've already scheduled for another session. May God continue to bless her abundantly🙌🏼🦋🌻",
                    createTime: new Date(),
                },{ 
                    name: 'Hunter Dorris', reviewId: '',
                    reviewer: { displayName: "Hunter Dorris" },
                    starRating: 'FIVE', comment: "Amazing experience. My wife and I went for a couples massage (backstory is that we have two young children and don’t get out too often). We had a couples massage (which was incredible) and then when we were done they brought us two pieces of cake and sparkling cider and told us to stay as long as we wanted and enjoy our afternoon without the kids. I could not recommend this place more. We already booked another appointment for next month.",
                    createTime: new Date(),
                },
                { 
                    name: 'BlueWatersHorses Santomenna', reviewId: '',
                    reviewer: { displayName: "BlueWatersHorses Santomenna" },
                    starRating: 'FIVE', comment: "Praying Hands Massage and Bodywork is an absolute gem! From the moment you step inside, you're enveloped in a calming atmosphere that instantly soothes the spirit. Trish is incredibly professional and attentive. My Healing Prayer Stress Relief Massage began with a prayer and was nothing short of miraculous. My tension departed and left me feeling completely rejuvenated. I highly recommend this place for anyone seeking top-notch massage therapy and a blissful escape from daily stress!",
                    createTime: new Date(),
                },
                { 
                    name: 'Valerie Baul', reviewId: '',
                    reviewer: { displayName: "Valerie Baul" },
                    starRating: 'FIVE', comment: "Excellent Massage and Reiki session!  Trish does have praying and healing hands!",
                    createTime: new Date(),
                },
                { 
                    name: 'jackie whittle', reviewId: '',
                    reviewer: { displayName: "jackie whittle" },
                    starRating: 'FIVE', comment: "Trish did a fantastic job!!! If your looking for a amazing massage (she hits all the points ) you will feel amazing & refreshed afterwards. I’ve had many massages before, she is def my favorite!!",
                    createTime: new Date(),
                },{ 
                    name: 'Lynn Luu', reviewId: '',
                    reviewer: { displayName: "Lynn Luu" },
                    starRating: 'FIVE', comment: "I had a wonderful experience with Trish at Praying hands. The space was clean and comfortable. I felt very relaxed and soo good after my 2 hour massage with Trish! I love that she incorporated a little bit of Reiki for me towards the end. I will definitely be coming back.",
                    createTime: new Date(),
                },{ 
                    name: 'Carlos Brinkley', reviewId: '',
                    reviewer: { displayName: "Carlos Brinkley" },
                    starRating: 'FIVE', comment: "I decided to come to Trish for my first ever massage and I am glad I did. This experience was very relaxing, calm, and comfortable for me. It truly healed some parts of me. I am grateful!!!",
                    createTime: new Date(),
                },
                { 
                    name: 'Londyn Hackett', reviewId: '',
                    reviewer: { displayName: "Londyn Hackett" },
                    starRating: 'FIVE', comment: "The best customer service I’ve experienced in a long time! They are the best",
                    createTime: new Date(),
                }
            ];
            return { results: tmpReviews};
        }
        catch(ex){
            log.error(`Getting Reviews: ${ex}`);
            return { error: "Getting Reviews [E00]" };
        }
    }
}

async function authenticate() {
    let ret = null;
    try {   
        const jwt = getGoogleAuth();
        const resp = await jwt.authorize();

        ret = resp.access_token.replace(/\.{2,}/g, '');
    }
    catch(ex){
        log.error(`Authenticating: ${ex}`);
    }
    return ret;
}

function getGoogleAuth(){
    let ret = null;
    try {
        const privateKey = EVENT_PRIVATE_KEY;
        
        ret = new google.auth.JWT(
            EVENT_CLIENT_EMAIL,
            null,
            privateKey.replace(/\\n/g, '\n'),
            'https://www.googleapis.com/auth/business.manage'
        );
    }
    catch(ex){
        log.error(`Authenticating Google Account: ${ex}`);
    }

    return ret;
}