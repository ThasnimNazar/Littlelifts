import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Occasionalsitting from '../../Components/Sitter/Occasionalsitting';
import Weekendsitting from '../../Components/Sitter/Weekendsitting';
import Specialcaresitting from '../../Components/Sitter/Specialcaresitting';



const Sitterregisterstep4screen: React.FC = () => {
    const { selectedOptionid } = useParams<{ selectedOptionid?: string }>();
    const location = useLocation();
    const { selectedname } = location.state as { selectedname: string };

    if (typeof selectedOptionid !== 'string') {
        return <p>Invalid selectedOptionid</p>;
    }

    console.log('Selected Sitting Option Name:', selectedname);
    console.log('Selected Sitting Option Id:', selectedOptionid);

    const renderSittingOptionComponent = () => {
        switch (selectedname) {
            case 'Weekend Sitting':
                return <Weekendsitting selectedOptionid={selectedOptionid}/>
            case 'Occasional Sitting':
                return <Occasionalsitting selectedOptionid={selectedOptionid}/>
            case 'Specialcare Sitting':
                return <Specialcaresitting selectedOptionid={selectedOptionid}/>
            default:
                return <p>No component found for selected sitting option</p>;
        }
    };

    return (
        <>
            {renderSittingOptionComponent()}
        </>
    );
};

export default Sitterregisterstep4screen;
