import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store'; // Adjust the import based on your project structure

interface ChildCategory {
    id: number;
    name: string;
}

const EditProfile: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phoneno, setPhoneno] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [yearofexperience, setYearofexperience] = useState<number | ''>('');
    const [workwithpet, setWorkwithpet] = useState<string>('');
    const [maxchildren, setMaxchildren] = useState<number | ''>('');
    const [servicepay, setServicepay] = useState<number | ''>('');
    const [about, setAbout] = useState<string>('');
    const [childcategory, setChildcategory] = useState<ChildCategory[]>([]);
    const [selectedChildCategories, setSelectedChildCategories] = useState<number[]>([]);
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const toast = useToast();
    const navigate = useNavigate();
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`/api/sitter/getprofile/${sitterInfo._id}`);
                if (response.data) {
                    const { sitter } = response.data;
                    setName(sitter.name);
                    setEmail(sitter.email);
                    setPhoneno(sitter.phoneno);
                    setGender(sitter.gender);
                    setMaxchildren(sitter.maxchildren);
                    setYearofexperience(sitter.yearofexperience);
                    setWorkwithpet(sitter.workwithpet);
                    setServicepay(sitter.servicepay);
                    setAbout(sitter.about);
                    setSelectedChildCategories(sitter.childcategory);
                }
                fetchChildCategoryNames();
            } catch (error) {
                handleError(error);
            }
        };
        fetchDetails();
    }, [sitterInfo._id]);

    const fetchChildCategoryNames = async () => {
        try {
            const response = await axios.get('/api/sitter/getnames');
            if (response.data) {
                setChildcategory(response.data.names);
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error: unknown) => {
        toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value); 
        setSelectedChildCategories((prevSelected) =>
            prevSelected.includes(value)
                ? prevSelected.filter((category) => category !== value)
                : [...prevSelected, value]
        );
    };
    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phoneno', phoneno);
            formData.append('gender', gender);
            formData.append('yearofexperience', yearofexperience.toString());
            formData.append('workwithpet', workwithpet);
            formData.append('maxchildren', maxchildren.toString());
            formData.append('servicepay', servicepay.toString());
            formData.append('about', about);
            formData.append('childcategory', JSON.stringify(selectedChildCategories));

            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            await axios.put(`/api/sitter/editprofile/${sitterInfo._id}`, formData);

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });

        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-24">
            <form className="p-4" onSubmit={submitHandler}>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="phoneno" className="block text-gray-700 font-bold mb-2">Phone Number</label>
                    <input
                        type="text"
                        id="phoneno"
                        name="phoneno"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter your phone number"
                        value={phoneno}
                        onChange={(e) => setPhoneno(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="gender" className="block text-gray-700 font-bold mb-2">Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">male</option>
                        <option value="Female">female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="yearofexperience" className="block text-gray-700 font-bold mb-2">Years of Experience</label>
                    <input
                        type="number"
                        id="yearofexperience"
                        name="yearofexperience"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter your years of experience"
                        value={yearofexperience}
                        onChange={(e) => setYearofexperience(Number(e.target.value))}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Work with Pets</label>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="workwithpetYes"
                            name="workwithpet"
                            value="yes"
                            className="mr-2"
                            checked={workwithpet === 'yes'}
                            onChange={(e) => setWorkwithpet(e.target.value)}
                        />
                        <label htmlFor="workwithpetYes" className="mr-4">Yes</label>
                        <input
                            type="radio"
                            id="workwithpetNo"
                            name="workwithpet"
                            value="no"
                            className="mr-2"
                            checked={workwithpet === 'no'}
                            onChange={(e) => setWorkwithpet(e.target.value)}
                        />
                        <label htmlFor="workwithpetNo">No</label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="maxchildren" className="block text-gray-700 font-bold mb-2">Maximum Number of Children</label>
                    <input
                        type="number"
                        id="maxchildren"
                        name="maxchildren"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter the maximum number of children you can take care of"
                        value={maxchildren}
                        onChange={(e) => setMaxchildren(Number(e.target.value))}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="servicepay" className="block text-gray-700 font-bold mb-2">Service Payment</label>
                    <input
                        type="number"
                        id="servicepay"
                        name="servicepay"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Enter your service payment"
                        value={servicepay}
                        onChange={(e) => setServicepay(Number(e.target.value))}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="about" className="block text-gray-700 font-bold mb-2">About</label>
                    <textarea
                        id="about"
                        name="about"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        placeholder="Tell us about yourself"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Child Categories</label>
                    <div>
                        {childcategory.map((category) => (
                            <div key={category._id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={category.name}
                                    name="childcategory"
                                    value={category._id}
                                    checked={selectedChildCategories.includes(category._id)}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox dark:bg-gray-800"
                                />
                                <label htmlFor={category.name} className="ml-2 dark:text-white">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="profileImage" className="block text-gray-700 font-bold mb-2">Profile Image</label>
                    <input
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        className="w-full py-2 px-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:border-blue-500"
                        onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <a href="#" className="text-gray-500 hover:text-blue-500 focus:outline-none focus:underline transition duration-150 ease-in-out">Forgot Password?</a>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
