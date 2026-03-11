import Slider from "react-slick";
import { gql, useLazyQuery } from '@apollo/client';
import { ripples } from 'ldrs';

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { emptyList, handleGQLError } from "../../utils";
import { Review } from "../../datatypes";
import { useEffect, useState } from "react";

const GET_REVIEWS_QUERY = gql`
    query GetReviews($type:String) { 
        reviews(type:$type) {
            name
            starRating
            title
            comment
            createTime
        }
    }`;

export default function ReviewsList(){
    const [reviewType, setReviewType] = useState("massagebook");
    const [getReview, { loading, data }] = useLazyQuery(GET_REVIEWS_QUERY, {variables: {}, fetchPolicy: 'cache-and-network', onError: handleGQLError});
    
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

    useEffect(()=>{
        getReview({ variables: { type: reviewType }});
    },[reviewType]);

    useEffect(()=> { ripples.register(); },[])

    return(
        <div className="review-tab-container">
            <div className='review-tab-outer-container'>
                <div className='review-tab-inner-container'>
                    <div className={`type-sel ${reviewType === "massagebook" ? 'sel':''}`} onClick={()=> setReviewType("massagebook") }>Massagebook</div>
                    <div className={`type-sel ${reviewType === "google" ? 'sel':''}`} onClick={()=> setReviewType("google") }>Google</div>                    
                </div>
            </div>

            <div className="slider-container">
                {loading ?
                    <div className='loading-container'>
                        <l-ripples size="150" speed="0.9" color="rgba(160, 82, 45,1)"></l-ripples>   
                    </div> :
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
                                                    {emptyList(5).map((_item,i)=>
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
        </div>
    );
}