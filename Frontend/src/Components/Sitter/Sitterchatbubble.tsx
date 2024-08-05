import React, { useState, useEffect, useRef } from 'react';
import { faPaperPlane, faImages, faFileVideo, faHeadphones, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { format } from 'date-fns';
import useSocket from '../Socket/Usesocket';

interface Message {
    _id: string;
    chatId: string;
    sender: string;
    content: string;
    timestamp: string;
    ImageUrl?: string;
    VideoUrl?: string;
    AudioUrl?: string;
    seenBy: string[];

}

interface ChatBubbleProps {
    parent: {
        _id: string;
        name: string;
        profileImage: string;
    };
    chatId: string;
    chatMessage: Message[];
    onSendMessage: (message: Message, image: File | null, video: File | null, audio: File | null) => void;
}



const formatTime = (timestamp?: string) => {
    if (!timestamp) {
        console.error('Missing timestamp:', timestamp);
        return 'Invalid Date';
    }
    try {
        return format(new Date(timestamp), 'p');
    } catch (error) {
        console.error('Error formatting date:', timestamp, error);
        return 'Invalid Date';
    }
};

const Sitterchatbubble: React.FC<ChatBubbleProps> = ({ parent, chatId, chatMessage, onSendMessage }) => {
    const [message, setMessage] = useState<string>('');
    const [video, setVideo] = useState<File | null>(null)
    const [audio, setAudio] = useState<File | null>(null)
    const [image, setImage] = useState<File | null>(null);
    const [isCalling, setIsCalling] = useState<boolean>(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
    const sitterId = sitterInfo?._id;
    const socket = useSocket();

    const handleSendMessage = () => {
        if (message.trim() || image || video || audio) {
            const newMessage: Message = {
                _id: Date.now().toString(),
                chatId: chatId,
                sender: sitterId!,
                content: message,
                timestamp: new Date().toISOString(),
                seenBy: []

            };

            console.log(newMessage, 'n');

            onSendMessage(newMessage, image, video, audio);
            setMessage('');
            setImage(null);
        }
    }

    useEffect(() => {
        if (socket) {
            socket.emit('joinRoom', { roomId: chatId });

            socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
                if (!peerConnectionRef.current) return;

                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit('answer', { roomId: chatId, answer });
            });

            socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
                if (!peerConnectionRef.current) return;

                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            });

            socket.on('candidate', async (candidate: RTCIceCandidate) => {
                if (!peerConnectionRef.current) return;

                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            });

            return () => {
                socket.off('offer');
                socket.off('answer');
                socket.off('candidate');
            };
        }
    }, [chatId]);

    const startVideoCall = async () => {
        setIsCalling(true);

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(localStream);

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }

        const peerConnection = new RTCPeerConnection();
        peerConnectionRef.current = peerConnection;

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        if (socket) {
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('candidate', { roomId: chatId, candidate: event.candidate });
                }

            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { roomId: chatId, offer });
        }
    };

    return (
        <div className="relative flex flex-col flex-grow h-full px-4 justify-end" style={{ backgroundColor: 'white' }}>
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-white">
                <div className="flex items-center">
                    <img src={parent.profileImage} alt={parent.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                    <span className="font-bold text-lg">{parent.name}</span>
                </div>
                <FontAwesomeIcon icon={faVideo} className="text-gray-800 hover:text-emerald-600 cursor-pointer" onClick={startVideoCall} />
            </div>
            <div className="flex flex-col space-y-4 mb-4 mt-20 overflow-y-auto custom-scrollbar">
                {Array.isArray(chatMessage) && chatMessage.map((msg) => {
                    const isSeen = msg.seenBy.includes(sitterId!);
                    console.log('Message timestamp:', msg.timestamp);
                    return (
                        <div key={msg._id} className={`rounded-lg p-2 text-sm ${msg.sender === sitterId ? 'bg-gray-800 self-end rounded-tr-none text-white' : 'bg-gray-200 self-start rounded-tl-none text-black'} flex flex-col relative`}>
                            <p className={`${msg.sender === sitterId ? 'text-white' : 'text-black'}`}>{msg.content}</p>
                            {msg.ImageUrl && <img src={msg.ImageUrl} alt="Attachment" className="mt-2 max-w-xs rounded-md" />}
                            {msg.VideoUrl && <video src={msg.VideoUrl} controls className="mt-2 max-w-xs rounded-md" />}
                            {msg.AudioUrl && <audio src={msg.AudioUrl} controls className="mt-2 max-w-xs rounded-md" />}
                            <p className="text-gray-400 text-xs text-right leading-none">{formatTime(msg.timestamp)}</p>
                            <br></br>
                            <span className="text-xs absolute bottom-0 right-0 mr-2 mb-2">
                                {isSeen ? (
                                    <span className="text-gray-400">Seen</span>
                                ) : (
                                    <span className="text-red-400">Unseen</span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-gray-200 flex items-center">
                <input
                    type="text"
                    className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <label className="ml-4 cursor-pointer">
                    <FontAwesomeIcon icon={faImages} className="text-gray-800 hover:text-emerald-600" />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                </label>
                <label className="ml-4 cursor-pointer">
                    <FontAwesomeIcon icon={faFileVideo} className="text-gray-800 hover:text-emerald-600" />
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => setVideo(e.target.files ? e.target.files[0] : null)}
                    />
                </label>
                <label className="ml-4 cursor-pointer">
                    <FontAwesomeIcon icon={faHeadphones} className="text-gray-800 hover:text-emerald-600" />
                    <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => setAudio(e.target.files ? e.target.files[0] : null)}
                    />
                </label>
                <button
                    onClick={handleSendMessage}
                    className="ml-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
            {isCalling && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-4">
                        <div className="flex flex-col items-center">
                            <video ref={localVideoRef} autoPlay muted className="w-64 h-48 rounded-lg bg-black mb-4"></video>
                            <video ref={remoteVideoRef} autoPlay className="w-64 h-48 rounded-lg bg-black"></video>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sitterchatbubble;
