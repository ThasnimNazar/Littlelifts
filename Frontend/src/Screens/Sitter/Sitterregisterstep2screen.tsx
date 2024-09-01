import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Types } from 'mongoose';
import { sitterApi } from '../../Axiosconfig';


import Header from '../../Header';

interface SitterInfo {
    yearofexperience: number;
    workwithpet: string;
    maxchildren: number;
    servicepay: number;
    about: string;
    _id: Types.ObjectId;
}

interface ChildCategory {
    _id:string;
    name: string;
    description: string;
}



interface Response {
    message: string;
    sitter: SitterInfo;
}

const Sitterregisterstep2screen: React.FC = () => {
    const [yearofexperience, setYearofexperience] = useState<number | ''>('');
    const [workwithpet, setWorkwithpet] = useState<string>('');
    const [maxchildren, setMaxchildren] = useState<number | ''>('');
    const [servicepay, setServicepay] = useState<number | ''>('');
    const [about, setAbout] = useState<string>('');
    const [selectedcategories, setSelectedCategories] = useState<string[]>([])
    const [childcategory, setChildcategory] = useState<ChildCategory[]>([]);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await sitterApi.get('/get-childcategory')
                console.log(response, 'child')
                if (response.data.category) {
                    setChildcategory(response.data.category)
                }

            }
            catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        }
        fetchCategory();
    }, [])
    const [sitterId, setSitterId] = useState<string>('');
    console.log(sitterId)

    const toast = useToast();
    const navigate = useNavigate();

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWorkwithpet(event.target.value);
    };

    const handleYearOfExperienceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setYearofexperience(value ? parseInt(value) : '');
    };

    const handleMaxchild = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMaxchildren(value ? parseInt(value) : '');
    };

    const handleServicepay = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setServicepay(value ? parseInt(value) : '');
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, id]);
        } else {
            setSelectedCategories(prev => prev.filter(catId => catId !== id));
        }
    };
    
    const isSelected = (name: string) => selectedcategories.includes(name); 
    console.log(selectedcategories,'childcat')
    

    const handleRegisterstep2 = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors: { [key: string]: string } = {};

        if (!yearofexperience || yearofexperience <= 0) {
            errors.yearOfExperience = 'Please enter a valid number of years of experience';
        }

        if (!workwithpet) {
            errors.selectedOption = 'Please select an option for pet preference';
        }

        if (!maxchildren || maxchildren <= 0) {
            errors.maxChildren = 'Please enter a valid number of children';
        }

        if (!servicepay || servicepay <= 0) {
            errors.servicePay = 'Please enter a valid service pay';
        }
        if(!selectedcategories){
            errors.selectedcategories = 'please select a category you have experience with'
        }

        if (!about.trim()) {
            errors.about = 'Please write something about yourself';
        } else if (about.length < 10) {
            errors.about = 'About section should have at least 10 characters';
        } else if (about.length > 500) {
            errors.about = 'About section should not exceed 200 characters';
        } 
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, errorMessage]) => {
                toast({
                    title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
                    description: errorMessage,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            });
        } else {
            try {
                const sitterInfoString = localStorage.getItem('sitterInfo');
                if (sitterInfoString) {
                    const sitterInfo = JSON.parse(sitterInfoString);
                    setSitterId(sitterInfo._id);

                    const response = await sitterApi.put<Response>(`/register-step2/${sitterInfo._id}`, {
                        yearofexperience,
                        workwithpet,
                        maxchildren,
                        servicepay,
                        selectedcategories,
                        about,
                    });

                    if (response.status === 200 && response.data.sitter) {
                        localStorage.setItem('sitterInfo', JSON.stringify(response.data.sitter));
                        toast({
                            title: 'Success',
                            description: 'Sitter information updated successfully',
                            status: 'success',
                            duration: 3000,
                            isClosable: true,
                            position: 'top-right',
                        });
                        navigate('/sitter/sitterregisteration');
                    }
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        }
};

   

    return (
        <>
            <Header />
            <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <form onSubmit={handleRegisterstep2}>
                            <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Register for your service, complete your second step of registration</h3>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="border-b w-1/5 lg:w-1/4"></span>
                                <a href="#" className="text-xs text-center text-black uppercase">or login with email</a>
                                <span className="border-b w-1/5 lg:w-1/4"></span>
                            </div>
                            <div className="mt-2">
                                <input
                                    placeholder="Enter Year of experience"
                                    value={yearofexperience}
                                    onChange={handleYearOfExperienceChange}
                                    className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                                    type="number"
                                />
                            </div>
                            <br></br>

                            <fieldset>
                                <legend className="text-sm font-bold font-medium text-gray-900">category of child you have experience with</legend>
                                <div className="mt-4 space-y-2">
                                    {childcategory.map((category, index) => (
                                        <label key={index} htmlFor={`Option${index}`} className="flex cursor-pointer items-start gap-4">
                                            <div className="flex items-center">
                                            <input
                                                    type="checkbox"
                                                    className="size-4 rounded border-gray-300"
                                                    id={`Option${index}`}
                                                    value={category._id}
                                                    onChange={(e) => handleCheckboxChange(category._id, e.target.checked)}
                                                    checked={isSelected(category._id)}
                                                />
                                            </div>
                                            <div>
                                                <strong className="font-medium text-gray-900">{category.name}</strong>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                            </fieldset>




                            <div className="mt-2">
                                <label htmlFor="gender" className="flex-items self-start mt-3 text-xs font-bold">Will you work with pet?: </label><br></br>
                                <label className="self-start mt-3 text-xs font-bold">
                                    <input
                                        type="radio"
                                        value="yes"
                                        checked={workwithpet === 'yes'}
                                        onChange={handleOptionChange}
                                    />
                                    Yes
                                </label>
                                <label className="self-start mt-3 text-xs font-bold">
                                    <input
                                        type="radio"
                                        value="no"
                                        checked={workwithpet === 'no'}
                                        onChange={handleOptionChange}
                                    />
                                    No
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    placeholder="Max children you watch"
                                    value={maxchildren}
                                    onChange={handleMaxchild}
                                    className="bg-white text-black font-semibold text-sm  focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                                    type="number"
                                />
                            </div>
                            <div className="mt-2">
                                <input
                                    placeholder="Service pay/hour" 
                                    value={servicepay}
                                    onChange={handleServicepay}
                                    className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                                    type="number"
                                />
                            </div>
                            <div className="mt-2">
                                <textarea
                                    id="about"
                                    className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                                    rows={4}
                                    value={about}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value)}
                                    placeholder="Write about yourself"
                                ></textarea>
                            </div>
                            <div className="mt-4">
                                <button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded">Continue</button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="border-b w-1/5 md:w-1/4"></span>
                                <a href="#" className="text-xs text-gray-500 uppercase">or sign up</a>
                                <span className="border-b w-1/5 md:w-1/4"></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sitterregisterstep2screen;
