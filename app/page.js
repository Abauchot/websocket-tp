'use client'
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamic imports for Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

const center = {
  lat: 46.603354,
  lng: 1.888334
};

// Set up the default icon for Leaflet to avoid missing icon issue
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const isBrowser = () => typeof window !== 'undefined';

export default function Home() {
  const [positions, setPositions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    if (isBrowser()) {
      socketRef.current = io();
  
      socketRef.current.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
  
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { user: username, text: message };
      socketRef.current.emit('sendMessage', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
    }
  };

  const handleLogin = () => {
    if (username.trim()) {
      setIsChatVisible(true);
    }
  };

  const handleKeyPress = (event, callback) => {
    if (event.key === 'Enter') {
      callback();
    }
  }

  useEffect(() => {
    if (isBrowser() && navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPositions((prev) => [...prev, { lat: latitude, lng: longitude }]);
      });
    }
  }, []);

  useEffect(() => {
    if (isBrowser() && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        userVideo.current.srcObject = stream;

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream
        });

        peer.on('signal', signal => {
          // Send the signal to other users
        });

        peer.on('stream', stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          document.body.append(video);
        });

        peersRef.current.push(peer);
      });
    }
  }, []);

  return (
    <div>
      <h1>Application de Suivi en Temps Réel et Visioconférence</h1>
      <div>
        {isBrowser() && (
          <MapContainer center={center} zoom={4} style={{ width: '100%', height: '400px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {positions.map((position, index) => (
              <Marker key={index} position={[position.lat, position.lng]} />
            ))}
          </MapContainer>
        )}
      </div>
      <div>
        <video ref={userVideo} autoPlay playsInline style={{ width: '300px', height: '200px' }} />
      </div>
      {isChatVisible ? (
        <div>
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.user}: </strong>{msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
            placeholder="Type a message"
            style={{ color:'black' }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleLogin)}
            placeholder="Enter your username"
            style={{ color:'black' }}
          />
          <button onClick={handleLogin}>Join Chat</button>
        </div>
      )}
      <style jsx>{`
        .chat-box {
          border: 1px solid #ccc;
          padding: 10px;
          width: 300px;
          height: 200px;
          overflow-y: scroll;
        }
      `}</style>
    </div>
  );
}
