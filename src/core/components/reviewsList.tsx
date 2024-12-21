import Slider from "react-slick";
import { gql, useQuery } from '@apollo/client';

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { emptyList, handleGQLError } from "../../utils";
import { Review } from "../../datatypes";

const GET_REVIEWS_QUERY = gql`
    query GetReviews { 
        reviews {
            name
            starRating
            comment
            createTime
        }
    }`;

export default function ReviewsList(){
    const { loading, data } = useQuery(GET_REVIEWS_QUERY, {variables: {}, fetchPolicy: 'cache-and-network', onError: handleGQLError});
    
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
    
    const ratingBuilder = (starRating: string | null) => {
        let ret: number = 0;
        try {
            if(starRating && starRating in ratingDict){
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
            {loading ?
                <></> :
                <Slider {...review_settings}>
                    {data?.reviews?.map((review: Review, i:number)=>
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
                                                    <span className={`material-symbols-outlined rating ${ratingBuilder(review.starRating) >= (i+1) ? 'fill':''}`} key={i}>star_rate</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>                              
                                </div>
                            </div>
                        </div>
                    )}
                </Slider>
            }
        </div>
    );
}