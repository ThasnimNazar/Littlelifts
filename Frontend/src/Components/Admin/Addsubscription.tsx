import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { adminApi } from '../../Axiosconfig';


interface FormErrors {
    [key: string]: string;
}

const Addsubscription: React.FC = () => {

    const availableFeatures = [
        'Unlimited bookings',
        'Book best rated babysitters',
        'Cost free booking cancellation',
        'Can add favourite babysitters',
        'Only limited bookings',
        'Cancellation charge',
        'Cant book best rated babysitters'
    ];

    const [name, setName] = useState<string>('')
    const [price, setPrice] = useState<number | string>('');
    const [features, setFeatures] = useState<string[]>([])
    const [billingcycle, setBillingcycle] = useState('');
    const [maxcredits, setMaxcredits] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState<boolean>(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/^0+/, '');
        setPrice(numericValue);
    };

    const handleFeatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFeatures(prevFeatures => [...prevFeatures, value]);
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        const formErrors: FormErrors = {};

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        } else if (name.length < 3 || name.length > 50) {
            formErrors.name = 'Name must be between 3 and 50 characters';
        }

        const numericPrice = Number(price); 
        if ( numericPrice < 0) {
            formErrors.price = 'Price must be a positive number';
        }

        if (!billingcycle.trim()) {
            formErrors.billingcycle = 'billing cycle is required'
        } else if (billingcycle.length > 50 || billingcycle.length < 3) {
            formErrors.billingcycle = 'length should between 3 and 50'
        }

        if (!features) {
            formErrors.features = 'features is required'
        }

        if (maxcredits<0) {
            formErrors.credits = 'maxcredits id required'
        }

        if (!description) {
            formErrors.description = 'description is required'
        }
        if (description.length > 500 || description.length < 3) {
            formErrors.description = 'length should between 3 and 500'
        }

        if (!isActive) {
            formErrors.isActive = 'you should tick the plan is active or not'
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
        } else {
            try {
                const response = await adminApi.post('/add-subscription', {
                    name,
                    price,
                    features,
                    billingcycle,
                    maxcredits,
                    description,
                    isActive
                })
                console.log(response)
                if (response.data) {
                    toast({
                        title: "added category Successful",
                        description: response.data.message,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                        position: "top-right",
                    });
                }
                navigate('/admin/adminhome/manage-subscription')
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
    }

    return (
        <>
            <div className="container mx-auto p-4 justify-center items-center">
                <h1 className="text-2xl font-bold mb-4">Add New Subscription</h1>
                <form onSubmit={submitHandler} className="space-y-4 rounded shadow-lg p-2 justify-center items-center">
                    <div className="items-center justify-center">
                        <label htmlFor="name" className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-96 h-10 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium">Price</label>
                        <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={handlePriceChange}
                            className="mt-1 block w-96 h-10 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="features" className="block text-sm font-medium">Features</label>
                        <select
                            id="features"
                            onChange={handleFeatureChange}
                            className="mt-1 block w-96 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select a feature</option>
                            {availableFeatures.map((feature) => (
                                <option key={feature} value={feature}>
                                    {feature}
                                </option>
                            ))}
                        </select>
                        <div className="mt-2 ">
                            <strong>Selected Features:</strong>
                            <ul>
                                {features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="billingcycle" className="block text-sm font-medium">Billing Cycle</label>
                        <input
                            type="text"
                            id="billingcycle"
                            value={billingcycle}
                            onChange={(e) => setBillingcycle(e.target.value)}
                            className="mt-1 block w-96 h-10 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="maxcredits" className="block text-sm font-medium">Max Credits</label>
                        <input
                            type="number"
                            id="maxcredits"
                            value={maxcredits}
                            onChange={(e) => setMaxcredits(Number(e.target.value))}
                            className="mt-1 block w-96 h-10 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-96 border border-gray-300 rounded-md shadow-sm"
                            rows={4}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="isActive" className="block text-sm font-medium">Is Active</label>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="mt-1"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                        Add Subscription
                    </button>
                </form>
            </div>

        </>
    )
}

export default Addsubscription