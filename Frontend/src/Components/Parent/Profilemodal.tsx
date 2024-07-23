import React from 'react';

const Profilemodal = ({ isOpen, onClose, sitter }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-1/2 p-6">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ×
                </button>
                
                <div className="flex">
                    <div className="w-32 h-32 rounded-full overflow-hidden mr-4 mt-10">
                        <img
                            src={sitter.profileImage}
                            alt={sitter.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className='m-10'>
                        <h2 className="text-2xl font-bold font-mono mb-4">{sitter.name}</h2>
                        <p className="mb-2 font-medium font-mono"><strong>Email:</strong> {sitter.email}</p>
                        <p className="mb-2 font-medium font-mono"><strong>Phone:</strong> {sitter.phoneno}</p>
                        <p className="mb-2 font-medium font-mono"><strong>Gender:</strong> {sitter.gender}</p>
                        <p className="mb-2 font-medium font-mono"><strong>Maximum children will watch:</strong> {sitter.maxchildren}</p>
                        <p className="mb-2 font-medium font-mono"><strong>Year of experience in babysitting:</strong> {sitter.yearofexperience}</p>
                        <p className="mb-2 font-medium font-mono"><strong>service Pay:</strong> {sitter.servicepay}</p>
                        <p className="mb-2 font-medium font-mono"><strong>Willing to work with pet:{sitter.workwithpet}</strong></p>
                        <p className="mb-2 font-medium font-mono"><strong>About she/him:{sitter.about}</strong>
                        </p>

                    </div>
                </div>
                <div className="mt-4">
                    <button
                        className="px-4 py-2 bg-custom-pink text-white rounded hover:bg-pink-200"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profilemodal;
