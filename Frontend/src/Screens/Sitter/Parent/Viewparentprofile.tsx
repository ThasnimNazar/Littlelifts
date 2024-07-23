import { useState, useEffect, FormEvent } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/react";
import Parentlayout from "../../../Components/Parent/Parentlayout";
import axios from "axios";
import { RootState } from "../../../Store";
import { setParentCredentials } from "../../../Slices/Parentslice";

interface FormErrors {
    [key: string]: string;
}

const Viewparentprofile: React.FC = () => {
    const [profileImage, setProfileimage] = useState<File | null>(null);
    const [name, setName] = useState<string>('');
    const [phoneno, setPhoneno] = useState<number>(0);
    const [profileImageUrl,setProfileimageurl] = useState<string>('')


    const toast = useToast();
    const dispatch = useDispatch()
    const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
    const parentId = parentInfo?._id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`/api/parent/profile/${parentId}`);
                console.log(response.data)
                setName(response.data.parent.name);
                setPhoneno(response.data.parent.phoneno);
                setProfileimageurl(response.data.parent.profileImage)
                console.log(profileImageUrl,'pic')
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
        };
        fetchProfile();
    }, [name,phoneno,profileImageUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileimage(e.target.files[0]);
        }
    };

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formErrors: FormErrors = {};

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        } else if (name.length < 3) {
            formErrors.name = 'Length of the name should be greater than 3 characters';
        }

        if (!phoneno) {
            formErrors.phoneno = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phoneno.toString())) {
            formErrors.phoneno = 'Phone number must be 10 digits';
        }

        if (Object.keys(formErrors).length === 0) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phoneno', phoneno.toString());
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            try {
                const response = await axios.put(`/api/parent/edit-profile/${parentId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                dispatch(setParentCredentials({...response.data.parent}))

                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
                console.log(response.data);
                setProfileimageurl(response.data.parent.profileImage)
                
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
        } else {
            toast({
                title: 'Validation Error',
                description: 'Please correct the errors in the form',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
    };

    return (
        <>
            <Parentlayout>
                <div className="h-screen bg-white m-5">
                    <div className="max-w-sm bg-white rounded-lg overflow-hidden shadow-lg mx-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-medium font-mono text-gray-800 mb-2">Your profile!</h2>

                            <form onSubmit={submitHandler}>
                                <div className="mb-6 flex items-center justify-center">
                                    <div className="relative">
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
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-bold font-mono mb-2" htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        className="shadow appearance-none border font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="username"
                                        type="text"
                                        value={name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 font-bold font-mono mb-2" htmlFor="phoneno">
                                        Phone Number
                                    </label>
                                    <input
                                        className="shadow appearance-none border font-mono rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="phoneno"
                                        type="number"
                                        value={phoneno}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneno(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        className="hover:bg-black text-white font-bold bg-sky-800 font-mono py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Parentlayout>
        </>
    );
};

export default Viewparentprofile;
