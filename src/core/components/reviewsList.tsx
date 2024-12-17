import Slider from "react-slick";

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { emptyList } from "../../utils";

const reviews = [
    {
        name:"Vince Lasalle", starRating: "FIVE", createdTime:"2024-10-02T15:01:23Z",
        comment:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
        name:"TJ Detwhiler", starRating: "FIVE", createdTime:"2024-05-02T15:01:23Z",
        comment:"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
    {
        name:"Ashley S", starRating: "FOUR", createdTime:"2024-07-02T15:01:23Z",
        comment:"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.",
    },
    {
        name:"Little Bill", starRating: "FOUR", createdTime:"2022-10-02T15:01:23Z",
        comment:"Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
    },
    {
        name:"Gerald J.", starRating: "FIVE", createdTime:"2021-10-02T15:01:23Z",
        comment:"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.",
    },
    {
        name:"Helga P.", starRating: "FOUR", createdTime:"2021-10-02T15:01:23Z",
        comment:"Et harum quidem rerum facilis est et expedita distinctio.",
    },
];


export default function ReviewsList(){
    const review_settings = {
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "60px",
        slidesToShow: 3,
        speed: 500,
        responsive: [
            {
                breakpoint: 770,
                settings: {
                    slidesToShow: 1,
                    infinite: true
                }
            }
        ]
    },
    ratingDict: { [key:string]:number } = {
        "ONE":1, "TWO":2, "THREE":3, "FOUR":4,"FIVE":5
    };

    const ratingBuilder = (starRating: string) => {
        let ret: number = 0;
        try {
            if(starRating in ratingDict){
                ret = ratingDict[starRating];
            }
        }
        catch(ex){
            console.log(`Building Star Rating: ${ex}`);
        }

        return ret;
    }

    return(
        <div className="slider-container">
            <Slider {...review_settings}>
                {reviews?.map((review, i)=>
                    <div className="review-container" key={i}>
                        <div className="review-content">
                            <p>{review.comment}</p>

                            <div className="review-info-container">
                                <div className="review-user">
                                    <div className="icon" />
                                    <div className="rate-container">
                                        <span className="name">{review.name}</span>
                                        <div className="rate-inner-container">
                                            {emptyList(5).map((item,i)=>
                                                <span className={`material-symbols-outlined rating ${ratingBuilder(review.starRating) > (i+1) ? 'fill':''}`} key={i}>star_rate</span>
                                            )}
                                        </div>
                                    </div>
                                </div>                              
                            </div>
                        </div>
                    </div>
                )}
            </Slider>
        </div>
    );
}