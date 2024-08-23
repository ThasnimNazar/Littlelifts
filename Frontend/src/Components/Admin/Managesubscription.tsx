import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../Axiosconfig";
import { useToast } from "@chakra-ui/react";


interface Subscriptions{
    _id:string;
    name:string;
    description:string;
    price:number;
    billingcycle:string;

}

const Managesubscription: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscriptions[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddSubscription = () => {
    navigate("/admin/adminhome/add-subscription");
  };

  const handleEditSubscription = (id: string) => {
    navigate(`/admin/adminhome/edit-subscription/${id}`);
  };



  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        const response = await api.get("/get-subscriptions");
        setSubscriptions(response.data.subscriptions);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    };
    getSubscriptions();
  }, [toast]);



  return (
    <>
      <button
        type="button"
        onClick={handleAddSubscription}
        className="px-8 py-3 font-semibold rounded bg-black text-white"
      >
        Add new Subscription
      </button>
      &nbsp;
      <div className="container p-2 mx-auto sm:p-4 dark:text-gray-800">
        <h2 className="mb-4 text-2xl font-semibold leading-tight">
          Subscription Plans
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <colgroup>
              <col />
              <col />
              <col />
              <col className="w-24" />
            </colgroup>
            <thead className="dark:bg-gray-300">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Description</th>
                <th className="p-3">Billing Cycle</th>
                <th className="p-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription._id}
                  className="border-b border-opacity-20 dark:border-gray-300 dark:bg-gray-50"
                >
                  <td className="p-3">
                    <p className="font-bold">{subscription.name}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">${subscription.price}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{subscription.description}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{subscription.billingcycle}</p>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleEditSubscription(subscription._id)}
                      className="px-8 py-3 font-semibold rounded bg-black dark:text-gray-100 text-white"
                    >
                      Edit
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Managesubscription;
