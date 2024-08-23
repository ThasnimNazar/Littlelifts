interface Babysitter {
    _id: string;
    name: string;
    profileImage: string;
}

interface BabysitterProps {
    babysitters?: Babysitter[]; // Make it optional
}

const Sittingcards: React.FC<BabysitterProps> = ({ babysitters = [] }) => { // Default to an empty array
    return (
        <>
            <div className='text-center mt-10 ml-10'>
                <h1 className='font-serif text-black font-bold'>Your nearest babysitters</h1>
            </div>
            <div className="grid grid-cols-1 gap-4 w-52 ml-10">
                {babysitters.map((babysitter) => (
                    <div key={babysitter._id} className="card bg-white rounded shadow-md p-4 flex items-center">
                        <img
                            src={babysitter.profileImage}
                            alt={`${babysitter.name}'s profile`}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <h3 className="text-lg font-medium font-serif">{babysitter.name}</h3>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Sittingcards;
