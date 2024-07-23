import { useParams } from "react-router-dom"
import { useLocation } from "react-router-dom";
import Editregularsitting from "../../Components/Sitter/Editregularsitting";

const Editslotscreen : React.FC = () =>{
  const { slotId } = useParams<{ slotId: string }>();
  console.log(slotId)
  const location = useLocation();
  const selectedsitting = location.state?.selectedsitting as string;
  console.log(selectedsitting)
  const renderComponent = () => {
    switch (selectedsitting) {
        case 'Regular Sitting':
            return <Editregularsitting slotId={slotId}/>;
        // case 'Weekend Sitting':
        //     return <Editweekendsitting slotId={slotId} />;
        default:
            return <div>No specific component found for this sitting option</div>;
    }
};

return (
    <div>
        {renderComponent()}
    </div>
);
};

export default Editslotscreen