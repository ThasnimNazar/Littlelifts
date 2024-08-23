import React from "react"
import { useState, useEffect } from "react";
import Header from "../../Header"
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { Types } from 'mongoose'
import { AxiosError } from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
// import api from '../../Axiosconfig';



interface FormErrors {
	[key: string]: string;
}

interface SitterInfo {
	name: string;
	email: string;
	phoneno: string;
	gender: string;
	_id: Types.ObjectId;
	sitterToken:string;
	role:string
}

interface RegisterResponse {
	message: string;
	sitter: SitterInfo;
	sitterToken:string;
}

const Sitterregisterstep1screen: React.FC = () => {
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('')
	const [confirmPassword, setconfirmPassword] = useState<string>('')
	const [phoneno, setPhoneno] = useState<string>('')
	const [gender, setGender] = useState<string>('')
	const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
	const toast = useToast()

	const navigate = useNavigate()
	const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth)

	useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLatitude(latitude);
                    setLongitude(longitude);
                },
                (error) => {
                    console.error('Error fetching location:', error);
                }
            );
        } else {
            console.log('Geolocation is not supported by this browser.');
        }
    }, []);

	const handleRegisterstep1 = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formErrors: FormErrors = {};

		if (!name.trim()) {
			formErrors.name = 'Name is required';
		} else if (name.length < 3 || name.length > 50) {
			formErrors.name = 'Name must be between 3 and 50 characters';
		}

		if (!email.trim()) {
			formErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			formErrors.email = 'Invalid email address';
		}

		if (!phoneno.trim()) {
			formErrors.phoneNo = 'Phone number is required';
		} else if (!/^\d{10}$/.test(phoneno.trim())) {
			formErrors.phoneNo = 'Phone number must be 10 digits';
		}

		if (!password.trim()) {
			formErrors.password = 'Password is required';
		} else if (password.length < 6) {
			formErrors.password = 'Password must be at least 6 characters long';
		}

		if (password !== confirmPassword) {
			formErrors.confirmPassword = 'Passwords do not match';
		}
		if (!['male', 'female'].includes(gender.toLowerCase())) {
			formErrors.gender = 'Please select a valid gender';
		}

		if (latitude === null || longitude === null) {
            formErrors.location = 'Location is required';
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
		}
		else {
			try {
				const res = await axios.post<RegisterResponse>('/api/sitter', {
					name, email, phoneno, password, confirmPassword, gender, location: { latitude, longitude }
				})
				const response = { ...res }
				const sitterToken = response.data.sitterToken
				const role = response.data.sitter.role
				
				console.log(res, 'kk')
				if (res.data) {
					localStorage.setItem('sitterToken',sitterToken)
					localStorage.setItem('role',role)
					localStorage.setItem('sitterInfo', JSON.stringify(res.data.sitter));

					toast({
						title: "Registration Successful",
						description: res.data.message,
						status: 'success',
						duration: 3000,
						isClosable: true,
						position: "top-right",
					});
					navigate('/sitter/sitterotp')
				}
			}
			catch (error) {
				if (axios.isAxiosError(error)) {
					const axiosError = error as AxiosError<RegisterResponse>;
					if (axiosError.response?.data.message) {
						const errorMessage = axiosError.response.data.message;
						toast({
							title: 'Registration Error',
							description: errorMessage,
							status: 'error',
							duration: 5000,
							isClosable: true,
							position: "top-right",
						});
					} else {
						console.log('Error:', error.message);
					}
				}
			}
		}
	}

	useEffect(() => {
		if (sitterInfo) {
			navigate('/sitter/sitterhome')
		}
	})


	return (
		<>
			<Header />
			<div className="py-10" style={{ marginBottom: '10px' }}>
				<div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
					<div className="hidden lg:block lg:w-1/2 bg-cover"
						style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
					</div>
					<div className="w-full p-8 lg:w-1/2">
						<h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Register for ur service,complete your first step of registration </h3>
						<div className="mt-4 flex items-center justify-between">
							<span className="border-b w-1/5 lg:w-1/4"></span>
							<a href="#" className="text-xs text-center text-black uppercase">or login with email</a>
							<span className="border-b w-1/5 lg:w-1/4"></span>
						</div>
						<form onSubmit={handleRegisterstep1}>
							<div className="mt-2">
								<input placeholder="Enter your name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="text" />
							</div>
							<div className="mt-2">
								<input placeholder="Enter your email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="email" />
							</div>
							<div className="mt-2">
								<input placeholder="Enter your phoneno" value={phoneno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneno(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="number" />
							</div>
							<div className="mt-2">
								<input placeholder="Enter your password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
							</div>
							<div className="mt-2">
								<input placeholder="confirm your password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setconfirmPassword(e.target.value)} className="bg-white font-semibold text-sm text-black focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
							</div>
							<div className="mt-2">
								<select
									id="childCategory"
									className="input-field w-full bg-white text-black focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
									value={gender}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}

								>
									<option value="">Select gender</option>
									<option value="male">male</option>
									<option value="female">female</option>

								</select>
							</div>
							

							<div className="mt-4">
								<button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600">Continue</button>
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
	)
}

export default Sitterregisterstep1screen