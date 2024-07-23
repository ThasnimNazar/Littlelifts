import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom'
import {
  useToast,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import Header from '../../../Header';
import Availabilitymodal from '../../../Components/Parent/Availabilitymodal';
import { FiMail, FiPhone } from 'react-icons/fi';

interface Babysitter {
  _id: string;
  name: string;
  profileImage?: string;
  about: string;
  gender: string;
  childcategory: { _id: string; name: string }[];
  sittingcategory: { _id: string; name: string }[];
  availableDates: string[];
}

const Babysitters: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<string>('');
  const [selectedSittingCategory, setSelectedSittingCategory] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  const [selectedBabysitter, setSelectedBabysitter] = useState<Babysitter | null>(null);
  const [babysitters, setBabysitters] = useState<any[]>([]);
  const [filteredBabysitters, setFilteredBabysitters] = useState<any[]>([]);

  const [childCategories, setChildCategories] = useState<{ _id: string; name: string }[]>([]);
  const [sittingCategories, setSittingCategories] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSitter, setSelectedsitter] = useState<Babysitter | null>(null)
  const [categoryNames, setCategoryNames] = useState<string[]>([])

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState([]);



  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();




  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };



  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const response = await axios.get('/api/parent/getsitter', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        console.log(response)
        setBabysitters(response.data.sitters);
        setFilteredBabysitters(response.data.sitters);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchBabysitters();
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    console.log('Page change requested to:', newPage);
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const childCategoryResponse = await axios.get('/api/parent/get-childcategory');
        setChildCategories(childCategoryResponse.data.category);

        const sittingCategoryResponse = await axios.get('/api/parent/getsittingcat');
        setSittingCategories(sittingCategoryResponse.data.category);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    fetchCategories();
  }, []);

  const handleViewProfile = (babysitter: Babysitter) => {
    setSelectedBabysitter(babysitter);
    onOpen();
  };

  useEffect(() => {
    if (selectedBabysitter && selectedBabysitter.childcategory) {
      console.log('Child Categories:', selectedBabysitter.childcategory);
      const ids = selectedBabysitter.childcategory.map(category => category);
      const fetchCategories = async () => {
        try {
          const categoryResponse = await axios.post('/api/parent/getnames', {
            ids: ids
          })
          console.log(categoryResponse, 'ggg')
          setCategoryNames(categoryResponse.data.names)
        }
        catch (error) {
          handleAxiosError(error);
        }
      }
      fetchCategories()
      console.log(ids, 'kkk');
    }
  }, [selectedBabysitter]);


  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBabysitters(babysitters);
      return;
    }

    const filteredResults = babysitters.filter((babysitter) =>
      matchSearchQuery(babysitter, searchQuery)
    );
    console.log(filteredResults, 'fff')
    setFilteredBabysitters(filteredResults);
  }, [searchQuery, babysitters]);


  const matchSearchQuery = (babysitter: Babysitter, query: string): boolean => {
    const lowerCaseQuery = query.toLowerCase();
    return (
      babysitter.name.toLowerCase().includes(lowerCaseQuery) ||
      babysitter.about.toLowerCase().includes(lowerCaseQuery) ||
      babysitter.gender.toLowerCase().includes(lowerCaseQuery)
    );
  };

  console.log(selectedGender, 'gen')

  const handleAvailabilityClick = (babysitter: Babysitter) => {
    setSelectedsitter(babysitter);
    setIsModalOpen(true);
  };

  const handleFilterChange = () => {
    let filteredBabysitters = babysitters;

    if (selectedGender) {
      filteredBabysitters = filteredBabysitters.filter(
        (babysitter) => babysitter.gender === selectedGender
      );
    }

    if (selectedChildCategory) {
      filteredBabysitters = filteredBabysitters.filter((babysitter) =>
        babysitter.childcategory.includes(selectedChildCategory)
      );
    }

    if (selectedSittingCategory) {
      filteredBabysitters = filteredBabysitters.filter(
        (babysitter) => babysitter.selectedSittingOption === selectedSittingCategory
      );
    }

    setFilteredBabysitters(filteredBabysitters);
  };

  const handleDateChange = async (date: Date | Date[]) => {
    try {
      let isoDate: string;

      if (Array.isArray(date)) {
        const selectedDate = date[0];
        isoDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      } else {
        isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      console.log('Selected ISO Date:', isoDate);

      const response = await axios.get(`/api/parent/filter-ByDate?selectedDate=${isoDate}`);
      setFilteredBabysitters(response.data.babysitters);
      setSelectedDate(Array.isArray(date) ? date[0] as Date : date as Date);
    } catch (error) {
      handleAxiosError(error);
    }
  };
  console.log(filteredBabysitters, 'hhh')


  useEffect(() => {
    handleFilterChange();
  }, [selectedGender, selectedChildCategory, selectedSittingCategory]);

  const handleAxiosError = (error: any) => {
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
  };

  console.log(selectedBabysitter, 'ssss')

  const submitBooking = () => {
    navigate('/parent/confirmbooking', { state: { selectedBabysitter: selectedBabysitter } })
  }



  return (
    <>
      <Header />
      <div className="p-4 bg-gray-100 flex h-screen">
        <div className="w-1/4 p-2 mt-10">

          <div className="relative">
            <label htmlFor="Search" className="sr-only"> Search </label>

            <input
              type="text"
              id="Search"
              placeholder="Search for..."
              className="w-full rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />

            <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
              <button type="button" className="text-gray-600 hover:text-gray-700">
                <span className="sr-only">Search</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </span>
          </div>
          <br></br>
          <Calendar
            onChange={(date) => handleDateChange(date)}
            value={selectedDate}
            minDate={new Date()}
          />
        </div>
        <div className="w-3/4 p-2 ml-10">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-4 mb-4">
              <select
                className="w-50 p-2 bg-gray-200 border rounded-lg font-mono font-semibold"
                value={selectedChildCategory}
                onChange={(e) => setSelectedChildCategory(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Select Child Category</option>
                {childCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className="w-50 p-2 bg-gray-200 border rounded-lg font-mono font-semibold"
                value={selectedSittingCategory}
                onChange={(e) => setSelectedSittingCategory(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Select Sitting Category</option>
                {sittingCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className="w-50 p-2 border bg-gray-200 rounded-lg font-mono font-semibold"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Select Gender</option>
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </div>
            {filteredBabysitters.length === 0 ? (
              <div className="text-center font-mono mt-4">
                No babysitters found based on the selected criteria.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {filteredBabysitters.map((babysitter) => (
                  <div key={babysitter._id} className="border p-4 rounded-lg bg-white shadow">
                    <div className="relative w-full h-36 overflow-hidden rounded-lg">
                      <img
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        src={babysitter.profileImage || 'https://via.placeholder.com/150'}
                        alt={babysitter.name}
                      />
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-center mt-2">
                        <span className="font-mono font-semibold">{babysitter.name}</span>
                      </div>                      <div className="flex items-center justify-center mt-2">
                        <FiMail className="mr-2 text-xl" />
                        <span className="font-mono">{babysitter.email}</span>
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <FiPhone className="mr-2 text-xl" />
                        <span className="font-mono">{babysitter.phoneno}</span>
                      </div>
                      <br></br>
                      <button
                        className="flex items-center justify-center w-full rounded-md bg-sky-800 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        onClick={() => handleViewProfile(babysitter)}
                      >
                        View Profile
                      </button>
                      &nbsp;
                      <button
                        className="flex items-center justify-center w-full rounded-md bg-sky-800 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        onClick={() => handleAvailabilityClick(babysitter)}
                      >
                        Check Availability
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button
              title="previous"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="mx-2">Page {currentPage} of {totalPages}</span>
            <button
              title="next"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow"
              onClick={() => {
                console.log('Next button clicked');
                handlePageChange(currentPage + 1);
              }}
              disabled={currentPage > totalPages || totalPages === 1}
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent bg='gray.200'>
          <DrawerCloseButton />
          <DrawerBody>
            {selectedBabysitter && (
              <>
                <div className="flex-start">
                  <img
                    src={selectedBabysitter.profileImage || 'https://via.placeholder.com/150'}
                    alt={selectedBabysitter.name}
                    className="rounded-full w-24 h-24 object-cover mx-auto"
                  />
                </div>
                <div className="mt-4 px-4">
                  <h2 className="text-center font-bold font-mono text-xl">{selectedBabysitter.name}</h2>
                  <p className="mt-2 text-center font-mono">{selectedBabysitter.about}</p>

                  <div className="flex justify-center gap-2 mt-2">
                    {categoryNames.map((name, index) => (
                      <button
                        key={index}
                        className="bg-gray-300 py-1 px-3 rounded-full text-black font-mono"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {selectedBabysitter.activities.map((activity: string) => (
                      <button
                        key={activity}
                        className="bg-sky-800 py-2 px-4 rounded-full text-white font-mono"
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    {selectedBabysitter.more.map((option: string) => (
                      <button
                        key={option}
                        className="bg-sky-800 py-2 px-4 rounded-full text-white font-mono"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <br></br>
                  <div className='flex justify-center'>
                    <button onClick={submitBooking} className='bg-black py-2 px-4 rounded-full text-white font-mono'>Book now</button>
                  </div>
                </div>
              </>
            )}
          </DrawerBody>


        </DrawerContent>
      </Drawer>

      {selectedSitter && (
        <Availabilitymodal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          babysitterId={selectedSitter._id}
        />
      )}
    </>
  );
};

export default Babysitters;
