import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { RootState } from '../../Store';
import Sitterlayout from '../../Components/Sitter/Sitterlayout';
import { setSitterCredentials } from '../../Slices/Sitterslice';

interface FormErrors {
  [key: string]: string;
}

const Profiledetailcard: React.FC = () => {

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  console.log(sitterInfo)
  const sitterId = sitterInfo?._id;
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneno, setPhoneno] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [yearofexperience, setYearofexperience] = useState<number>(0);
  const [maxchildren, setMaxchildren] = useState<number>(0);
  const [gender, setGender] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [workwithpet, setWorkwithpet] = useState<'yes' | 'no'>('no');
  const [childcategory, setChildcategory] = useState<string[]>([]);
  const [servicePay, setServicepay] = useState<number>(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [profileImageUrl, setProfileimageurl] = useState<string>('')

  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchCategoryNames = async () => {
      try {
        const response = await axios.get('/api/sitter/get-childcategory');
        const categoryData = response.data.category;

        const mappedCategories = categoryData.map((category: any) => category.name);
        setCategoryNames(mappedCategories);

        setCategoryData(categoryData);

        if (sitterInfo) {
          const sitterCategoryIds = sitterInfo.childcategory;
          const sitterCategoryNames = sitterCategoryIds.map((categoryId: string) =>
            categoryData.find((category: any) => category._id === categoryId)?.name || ''
          );
          setChildcategory(sitterCategoryNames);
        }
      } catch (error) {
        console.error('Error fetching category names:', error);
      }
    };

    fetchCategoryNames();
  }, [sitterInfo]);

  useEffect(() => {
    if (sitterInfo) {
      setName(sitterInfo.name);
      setEmail(sitterInfo.email);
      setProfileimageurl(sitterInfo.profileImage);
      setPhoneno(sitterInfo.phoneno);
      setYearofexperience(sitterInfo.yearofexperience);
      setMaxchildren(sitterInfo.maxchildren);
      setGender(sitterInfo.gender);
      setAbout(sitterInfo.about);
      setWorkwithpet(sitterInfo.workwithpet);
      setServicepay(sitterInfo.servicepay);
    }
  }, [sitterInfo]);

  const handleCategoryChange = (categoryName: string) => {
    if (childcategory.includes(categoryName)) {
      setChildcategory(childcategory.filter(name => name !== categoryName));
    } else {
      setChildcategory([...childcategory, categoryName]);
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors: FormErrors = {};

    if (!name.trim()) {
      formErrors.name = 'Name is required';
    } else if (name.length < 3 || name.length > 50) {
      formErrors.name = 'Name must be between 3 and 50 characters';
    }

    if (!phoneno) {
      formErrors.phoneno = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneno.toString())) {
      formErrors.phoneno = 'Phone number must be 10 digits';
    }

    if (!yearofexperience) {
      formErrors.yearofexperience = 'Years of experience is required';
    } else if (yearofexperience < 0 || yearofexperience > 50) {
      formErrors.yearofexperience = 'Years of experience must be between 0 and 50';
    }

    if (!maxchildren) {
      formErrors.maxchildren = 'Max children is required';
    } else if (maxchildren < 1 || maxchildren > 10) {
      formErrors.maxchildren = 'Max children must be between 1 and 10';
    }

    if (!['male', 'female'].includes(gender.toLowerCase())) {
      formErrors.gender = 'Please select a valid gender';
    }

    if (!about.trim()) {
      formErrors.about = 'About section is required';
    }else if (about.length < 10) {
      formErrors.about = 'About section should have at least 10 characters';
    } else if (about.length > 500) {
      formErrors.about = 'About section should not exceed 200 characters';
    }

    if (servicePay <= 0) {
      formErrors.servicePay = 'Service pay must be a positive number';
    }

    if (Object.keys(formErrors).length > 0) {
      Object.entries(formErrors).forEach(([field, errorMessage]) => {
        toast({
          title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });
      return;
    }

    const selectedCategoryIds = childcategory.map((categoryName) =>
      categoryData.find((category: any) => category.name === categoryName)?._id || ''
    );

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phoneno', String(phoneno));
    formData.append('yearofexperience', String(yearofexperience));
    formData.append('maxchildren', String(maxchildren));
    formData.append('gender', gender);
    formData.append('about', about);
    formData.append('workwithpet', workwithpet);
    formData.append('servicepay', String(servicePay));
    formData.append('childcategory', JSON.stringify(selectedCategoryIds));
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const response = await axios.put(`/api/sitter/editprofile/${sitterId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(setSitterCredentials({ ...response.data.sitter }));
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/sitter/viewprofile')

      console.log('Profile updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };


  return (
    <Sitterlayout>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center justify-center">
            <div className="relative rounded-full">
            <div className="w-24 h-24 rounded-full border overflow-hidden">
              {profileImage ? (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Upload
                </div>
              )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="shadow appearance-none border rounded font-medium font-mono w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Email</label>
            <input
              type="text"
              value={email}
              disabled
              className="shadow appearance-none border rounded font-medium font-mono w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Phone no</label>
            <input
              type="text"
              value={phoneno}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneno(Number(e.target.value))}
              className="shadow appearance-none border rounded font-medium font-mono w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Years of work experience you have</label>
            <input
              type="number"
              value={yearofexperience}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYearofexperience(Number(e.target.value))}
              className="shadow appearance-none border rounded font-medium font-mono w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Max children you watch</label>
            <input
              type="number"
              value={maxchildren}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxchildren(Number(e.target.value))}
              className="shadow appearance-none border font-medium font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Service pay</label>
            <input
              type="number"
              value={servicePay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServicepay(Number(e.target.value))}
              className="shadow appearance-none border rounded font-medium font-mono w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Gender</label>
            <select
              value={gender}
              onChange={handleGenderChange}
              className="font-medium font-mono shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm  font-bold font-mono mb-2">About</label>
            <textarea
              value={about}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value)}
              className="shadow appearance-none font-medium font-mono border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Do you work with pets</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="yes"
                  checked={workwithpet === 'yes'}
                  onChange={() => setWorkwithpet('yes')}
                  className="form-radio font-medium font-mono"
                />
                <span className="ml-2 font-medium font-mono">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="no"
                  checked={workwithpet === 'no'}
                  onChange={() => setWorkwithpet('no')}
                  className="form-radio font-medium font-mono"
                />
                <span className="ml-2 font-medium font-mono">No</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold font-mono mb-2">Child Categories</label>
            {categoryNames.map((categoryName) => (
              <label key={categoryName} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={childcategory.includes(categoryName)}
                  onChange={() => handleCategoryChange(categoryName)}
                  className="form-checkbox"
                />
                <span className="ml-2 font-medium font-mono">{categoryName}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold font-mono py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </Sitterlayout>
  );
};

export default Profiledetailcard;
