import Header from "./Header";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "./Axiosconfig";

interface Subscription {
  _id:string;
  name: string;
  features: string[];
  description: string;
  price: number;
  billingcycle: string;
}

const Subscription: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        const response = await api.get("/get-subscriptions");
        console.log(response);

        const sortedSubscriptions = response.data.subscription.sort((a: Subscription, b: Subscription) => a.price - b.price);

        setSubscriptions(sortedSubscriptions);
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
    getSubscriptions();
  }, []);

  const submitHandler = async(subscriptionId:string) =>{
    try{
      const response = await api.post(`/confirm-subscription/${subscriptionId}`)
      console.log(response) 
      if (response.data.session) {
        toast({
            title: "Success",
            description: "Subscription addedd successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        const { session } = response.data;
        window.location.href = session.url;
      }
    else{
        navigate('/')
    }

    }
    catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
  }



  return (
    <>
      <Header />
      <div className="ml-10">
        <div>
          <h2 className="text-3xl font-bold tracki text-center mt-12 sm:text-5xl">Pricing</h2>
          <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
            Get started on our free plan and upgrade when you are ready.
          </p>
        </div>
        <div className="mt-24 container space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {subscriptions.map((subscription, index) => (
            <div
              key={index}
              className="relative p-8 border border-gray-200 rounded-2xl shadow-sm flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{subscription.name}</h3>
                {subscription.name === "Pro" && (
                  <p className="absolute top-0 py-1.5 px-4 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                    Most popular
                  </p>
                )}
                <p className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">₹{subscription.price}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </p>
                <p className="mt-6">{subscription.description}</p>
                <ul role="list" className="mt-6 space-y-6">
                  {subscription.features.map((feature, i) => (
                    <li key={i} className="flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 w-6 h-6 text-emerald-500"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span className="ml-3">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                  subscription.name === "Free"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}

                onClick={() => submitHandler(subscription._id)}
              >
                Signup for {subscription.name.toLowerCase()}
              </button>
            </div>
          ))}
        </div>
      </div>
      <br>
      </br>
    </>
  );
};

export default Subscription;
