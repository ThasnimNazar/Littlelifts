import { useState,useEffect } from 'react'
import { useToast } from '@chakra-ui/react';
import axios from 'axios'
import api from '../../Axiosconfig'


interface ReviewProps{
    sitterId:string;
}



interface Review{
    sitterId:string;
    comment:string;
    rating:number;
    parent:{
      name:string;
      profileImage:string;
    }

}

const Reviewcard:React.FC<ReviewProps> = ({sitterId}) =>{

  const [ review,setReview ] = useState<Review[]>([])
  const toast = useToast();

  useEffect(()=>{
    const getReviews = async() =>{
        try{
            const response = await api.get(`/get-reviews/${sitterId}`)
            setReview(response.data.review)
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              console.error(error.response?.data);
              toast({
                title: 'Error',
                description: error.response?.data?.message || 'An unknown error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
              });
            } else if (error instanceof Error) {
              console.error(error.message);
              toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
              });
            } else {
              console.error('An unknown error occurred');
              toast({
                title: 'Error',
                description: 'An unknown error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
              });
            }
          }
    }
    getReviews()
  },[toast])

  
  return (
    <div className="overflow-hidden mt-4 rounded bg-slate-100 text-slate-500 shadow-md shadow-slate-200">
      <div className="p-6">
        <div className="flex flex-col items-center gap-4">
          {review.length > 0 ? (
            review.map((review, index) => (
              <div key={index} className="flex flex-col items-center gap-4">
                {/* Display the rating */}
                <span className="flex items-center gap-4 rounded text-sm text-slate-500">
                    <img className="rounded-full" src={review.parent.profileImage}/>
                <p>{review.comment}</p>

                  <span className="flex gap-1 text-amber-400" role="img" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                    {/* Render stars based on the rating */}
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={i < review.rating ? 'currentColor' : 'none'}
                        className="h-6 w-6"
                        stroke={i < review.rating ? '' : 'currentColor'}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </span>
                </span>

              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviewcard