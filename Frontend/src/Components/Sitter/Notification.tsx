

interface Notification {
    message: string;
    bookingDetails: {
        selectedDate: string;
        startTime: string;
        endTime: string;
        parentName: string;
    };
    read: boolean;
}

interface NotificationModalProps {
    notifications: Notification[];
}



const Notification: React.FC<NotificationModalProps> = ({ notifications}) => {

    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); 
    };

    console.log('Notifications in component:', notifications);

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
            From {notification.bookingDetails.parentName} on {formatDate(notification.bookingDetails.selectedDate)}, 
            from {formatTime(notification.bookingDetails.startTime)} to {formatTime(notification.bookingDetails.endTime)}.
          </div>
        ))
      )}
    </div>
  );
}

export default Notification