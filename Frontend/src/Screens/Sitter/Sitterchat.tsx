import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import Sitterchatsidebar from '../../Components/Sitter/Sitterchatsidebar';
import Sitterchatbubble from '../../Components/Sitter/Sitterchatbubble';
import useSocket from '../../Components/Socket/Usesocket';
import { sitterApi } from '../../Axiosconfig';


interface Parent {
  _id: string;
  name: string;
  profileImage: string;
}

interface Message {
    _id: string;
    chatId: string;
    sender: string;
    content: string;
    timestamp: string;
    imageUrl?:string;
    VideoUrl?: string;
    AudioUrl?:string;
    seenBy: string[];

  }


const Sitterchat: React.FC = () => {
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string>('');
  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const sitterId = sitterInfo?._id;
  const socket = useSocket();
  console.log(socket,'socket')


  useEffect(() => {
    const fetchChat = async () => {
      if (selectedParent) {
        try {
          const response = await sitterApi.post('/createchat', {
            sitterId: sitterId,
            parentId: selectedParent._id,
          });
          console.log(response.data._id,'resp')

          const chatData = response.data;
          console.log(chatData,'chats')
          console.log(chatData._id,'id')
          setChatId(chatData._id);

          const messagesResponse = await sitterApi.get(`/get-messages/${chatData._id}`);
          console.log(messagesResponse.data.messages,'mes')
          setChatMessages(messagesResponse.data.messages);

          if (socket) {
            console.log(socket,'socket')
            socket.emit('joinRoom', { roomId: response.data._id });
          }

        } catch (error) {
          console.error('Error fetching chat data:', error);
        }
      }
    };

    fetchChat();
  }, [selectedParent,sitterId,socket]);

  const handleSelectChat = (parent: Parent) => {
    setSelectedParent(parent);
  };

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message: Message) => {
        setChatMessages((prevMessages) => {
          if (!prevMessages.some(msg => msg._id === message._id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      };

      const handleMessagesMarkedSeen = ({ userId }: { userId: string }) => {
        setChatMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            seenBy: msg.seenBy.includes(userId)
              ? msg.seenBy
              : [...msg.seenBy, userId],
          }))
        );
      };

      socket.on('receiveMessage', handleReceiveMessage);
      socket.on('messagesMarkedSeen', handleMessagesMarkedSeen);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('messagesMarkedSeen', handleMessagesMarkedSeen);
      };
    }
  }, [socket]);


  const handleSendMessage = async (message: Message, image: File | null, video: File | null, audio: File | null) => {
    if (chatId && sitterId && (message.content.trim() || image || video || audio)) {
      try {

        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('senderId', sitterId);
        formData.append('content', message.content);
        formData.append('timestamp', message.timestamp);

        if (image) {
          formData.append('image', image);
        }

        if (video) {
          formData.append('video', video);
        }

        if (audio) {
          formData.append('audio', audio);
        }

        const response = await sitterApi.post('/send-message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response,'resss')

        const newMessage = response.data.message;
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);

        if (socket) {
          socket.emit('sendMessage', newMessage);
        }

      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleMarkSeen = () => {
    if (chatId && sitterId) {
      sitterApi.post('/mark-seen', { chatId, userId: sitterId });
      if (socket) {
        socket.emit('markSeen', { chatId, userId: sitterId });
      }
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      handleMarkSeen(); 
    }
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 h-full bg-white p-4">
        <Sitterchatsidebar onSelectChat={handleSelectChat} />
      </div>
      <div className="w-3/4 h-full bg-white p-4 flex flex-col">
        {selectedParent ? (
          <Sitterchatbubble
            parent={selectedParent}
            chatId={chatId!}
            chatMessage={chatMessages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Click or select a chat to message
          </div>
        )}
      </div>
    </div>
  );
};

export default Sitterchat;
