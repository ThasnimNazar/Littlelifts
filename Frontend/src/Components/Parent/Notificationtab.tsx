import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import useSocket from '../Socket/Usesocket';

interface CustomNotification {
    message: string;
    bookingDetails: {
        sitterName: string;
    };
    read: boolean;
}

const NotificationTab: React.FC = () => {
    const [notifications, setNotifications] = useState<CustomNotification[]>([]);
    
    const socket = useSocket();
    console.log(socket, 'sooo')

    const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
    const parentId = parentInfo?._id;

    useEffect(() => {
        if (socket) {
            console.log('ha');
            socket.on('bookingApproval', (notification: CustomNotification) => {
                const newNotification = { ...notification, read: false };
                setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
                console.log(`Notification sent to parentId ${parentId}:`, newNotification);
            });
            
            socket.on('bookingRejected', (notification: CustomNotification) => {
                const newNotification = { ...notification, read: false };
                setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
                console.log(`Notification sent to parentId ${parentId}:`, newNotification);
            });
            

            socket.emit('joinParentRoom', parentId);
        }
    }, [socket, parentId]);

    const handleClose = (index: number) => {
        setNotifications((prevNotifications) => prevNotifications.filter((_, i) => i !== index));
    };

    const handleMarkAsRead = (index: number) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification, i) =>
                i === index ? { ...notification, read: true } : notification
            )
        );
    };

    return (
        <div className="notification-tab">
            {notifications.length === 0 ? (
                <div className="no-notifications-message text-slate-200">
                    No new notifications
                </div>
            ) : (
                notifications.map((notification, index) => (
                    <div
                        key={index}
                        className={`flex flex-col max-w-full px-4 py-3 overflow-hidden text-sm rounded shadow-lg w-80 ${
                            notification.read ? 'bg-gray-500' : 'bg-slate-700'
                        } text-slate-200 shadow-slate-500/20 ring-1 ring-inset ring-slate-900`}
                        role="status"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <h3 className="flex-1 font-semibold">
                                {notification.message} for {notification.bookingDetails.sitterName}
                            </h3>
                            <button
                                aria-label="Close"
                                className="inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full justify-self-center whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-slate-100 focus:bg-slate-500 focus:text-slate-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-transparent"
                                onClick={() => handleClose(index)}
                            >
                                <span className="relative only:-mx-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        role="graphics-symbol"
                                        aria-labelledby={`title-${index} desc-${index}`}
                                    >
                                        <title id={`title-${index}`}>Close Icon</title>
                                        <desc id={`desc-${index}`}>Close the notification</desc>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div className="text-slate-300">
                            {!notification.read && (
                                <button
                                    aria-label="Mark as Read"
                                    className="inline-flex items-center justify-center h-8 gap-2 px-4 text-xs font-medium tracking-wide transition duration-300 rounded-full justify-self-center whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-slate-100 focus:bg-slate-500 focus:text-slate-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-transparent"
                                    onClick={() => handleMarkAsRead(index)}
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default NotificationTab;
