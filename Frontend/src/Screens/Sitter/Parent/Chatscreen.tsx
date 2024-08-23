import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Store';
import useSocket from '../../../Components/Socket/Usesocket';
import Chatsidebar from '../../../Components/Parent/Chatsidebar';
import ChatBubble from '../../../Components/Parent/Chatbubble';
import api from '../../../Axiosconfig'


interface BabySitter {
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
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  seenBy: string[];
}

const Chatscreen: React.FC = () => {
  const [selectedSitter, setSelectedSitter] = useState<BabySitter | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string>('');
  const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
  const parentId = parentInfo?._id;
  const socket = useSocket();

  useEffect(() => {
    const fetchChat = async () => {
      if (selectedSitter) {
        try {
          const response = await axios.post('/api/parent/createchat', {
            parentId: parentId,
            sitterId: selectedSitter._id,
          });

          const chatData = response.data;
          setChatId(chatData._id);

          const messagesResponse = await api.get(`/get-messages/${chatData._id}`);
          setChatMessages(messagesResponse.data.messages);

          if (socket) {
            socket.emit('joinRoom', { roomId: response.data._id });
          }
        } catch (error) {
          console.error('Error fetching chat data:', error);
        }
      }
    };

    fetchChat();
  }, [selectedSitter, parentId, socket]);

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

  const handleSelectChat = (sitter: BabySitter) => {
    setSelectedSitter(sitter);
  };

  const handleSendMessage = async (message: Message, image: File | null, video: File | null, audio: File | null) => {
    if (chatId && parentId && (message.content.trim() || image || video || audio)) {
      try {
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('senderId', parentId);
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

        const response = await api.post('/send-message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

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
    if (chatId && parentId) {
      api.post('/mark-seen', { chatId, userId: parentId });
      if (socket) {
        socket.emit('markSeen', { chatId, userId: parentId });
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
        <Chatsidebar onSelectChat={handleSelectChat} />
      </div>
      <div className="w-3/4 h-full bg-white p-4 flex flex-col">
        {selectedSitter ? (
          <ChatBubble
            sitter={selectedSitter}
            chatId={chatId!}
            chatMessages={chatMessages}
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

export default Chatscreen;
