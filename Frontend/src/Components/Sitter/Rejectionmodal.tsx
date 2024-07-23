import { useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const Rejectionmodal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState<string>("");

    const handleSubmit = () => {
        onSubmit(reason);
        setReason("");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
                <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md w-full p-6 relative z-50">
                    <h2 className="text-2xl font-mono font-medium mb-4">Reason for rejecting the booking</h2>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        placeholder="Enter the reason for rejection"
                    />
                    <div className="flex justify-end">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                        <button
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Rejectionmodal