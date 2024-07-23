import axios from 'axios';
import React, { useState } from 'react';
import { useToast } from '@chakra-ui/react';

const Search = () => {
  const [name, setName] = useState<string>('');
  const [selectedSittingOption, setselectedSittingOption] = useState<string>('');
  const [childcategory, setChildCategory] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const toast = useToast();
  const [showCategories, setShowCategories] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/parent/search-babysitters', {
        params: { name, selectedSittingOption, childcategory }
      });
      console.log(response.data);
      setResults(response.data.sitters);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast({
          title: 'Error',
          description: error.response.data.message || 'An unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
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
  };

  const handleMouseEnter = () => {
    setShowCategories(true);
  };

  const handleMouseLeave = () => {
    setShowCategories(false);
  };

  return (
    <div className="w-80 bg-white rounded-md shadow-lg p-4">
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex-1 font-mono rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
          />
          <button 
            type="submit"
            className="bg-custom-pink font-mono text-white rounded-md px-4 py-1 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-opacity-50"
          >
            Search
          </button>
        </div>
        {showCategories && (
          <>
            <input 
              type="text" 
              placeholder="Search by child category"
              value={childcategory}
              onChange={(e) => setChildCategory(e.target.value)}
              className="w-full rounded-md font-mono px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
            />
            <input 
              type="text" 
              placeholder="Search by sitting category"
              value={selectedSittingOption}
              onChange={(e) => setselectedSittingOption(e.target.value)}
              className="w-full rounded-md px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
            />
          </>
        )}
      </form>
      <div className="mt-4">
        {results.length > 0 ? (
          <ul>
            {results.map((sitter) => (
              <li key={sitter._id} className="p-2 border-b border-gray-200">
                {sitter.name}
              </li>
            ))}
          </ul>
        ) : (
         <>
         </>
        )}
      </div>
    </div>
  );
};

export default Search;
