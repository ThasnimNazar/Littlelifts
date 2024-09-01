import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { publicApi } from './Axiosconfig';

interface Parent{
    name:string,
    profileImage:string;
}

interface Reviews {
  comment: string;
  name: string;
  parent:Parent;
  id: string;
}

const Reviews = () => {
  const [allreviews, setReviews] = useState<Reviews[]>([]);
  const toast = useToast();

  useEffect(() => {
    const getAllreviews = async () => {
      try {
        const response = await publicApi.get('/api/parent/get-allreviews');
        setReviews(response.data.reviews || []);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    };
    getAllreviews();
  }, [toast]);

  return (
    <div className="text-gray-600 dark:text-gray-300 pt-8 dark:bg-gray-900" id="reviews">
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6">
        <div className="mb-10 space-y-4 px-6 md:px-0">
          <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">
            We have some fans.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allreviews.length > 0 ? (
            allreviews.map((review) => (
              <div
                key={review.id}
                className="p-8 border border-gray-100 rounded-3xl bg-amber-50 dark:bg-gray-800 dark:border-gray-700 shadow-2xl shadow-gray-600/10 dark:shadow-none"
              >
                <div className="flex gap-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={review.parent.profileImage}
                    alt={`${review.name} avatar`}
                    loading="lazy"
                  />
                  <div>
                    <h6 className="text-lg font-medium text-gray-700 dark:text-white">{review.name}</h6>
                  </div>
                </div>
                <p className="mt-8">{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
