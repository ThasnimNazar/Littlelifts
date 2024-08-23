

interface CustomNotification {
    message: string;
    bookingDetails: {
        sitterName: string;
    };
    read: boolean;
}


interface NotificationModalProps {
    notifications: CustomNotification[];
}

const NotificationTab: React.FC<NotificationModalProps> = ({notifications}) => {
    

    return (
        <div className="p-4">
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((notification, index) => (
          <div
            key={index}
            className={`p-4 mb-2 rounded-lg ${notification.read ? 'bg-gray-200' : 'bg-blue-100'}`}
          >
            <p className="font-semibold">{notification.message}</p>
            {notification.message} for {notification.bookingDetails.sitterName}
          </div>
        ))
      )}
    </div>
    );
}



export default NotificationTab;
