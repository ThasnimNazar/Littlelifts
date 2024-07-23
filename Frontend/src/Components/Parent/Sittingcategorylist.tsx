import { useEffect, useState } from "react";
import { useToast, Box, Image, Text, Button, Flex } from "@chakra-ui/react";
import axios from "axios";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface SittingcategorylistProps {
  onSelectCategory: (category: string) => void; 
}

const Sittingcategorylist: React.FC<SittingcategorylistProps> = ({ handleCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useToast();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get("/api/parent/getsittingcat");
        console.log(response);
        setCategories(response.data.category);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast({
            title: "Error",
            description:
              error.response.data.message || "An unknown error occurred",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        } else {
          toast({
            title: "Error",
            description: "An unknown error occurred",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      }
    };
    fetchCategory();
  }, []);

  return (
    <div className="mt-10" style={{marginRight:'20px'}}>
      {categories.map((category) => (
        <div
          key={category._id}
          className="flex bg-base-100 w-full shadow-xl rounded-md p-4 mb-4 border-l-4" style={{borderLeftColor:'#ffa2b6'}}
        >
          <div className="rounded-full overflow-hidden w-96 h-32 mr-4">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="card-title text-xl font-bold font-serif">{category.name}</h2>
            <br></br>
            <p className="text-gray-700 font-serif font-medium">{category.description}</p>
            <div className="card-actions justify-end mt-4">
              <button className="button rounded-xs w-28 h-11 font-semibold font-mono" 
              style={{backgroundColor:'#ffa2b6'}}
              onClick={() => handleCategorySelect(category._id)}
              >Reserve</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sittingcategorylist;
