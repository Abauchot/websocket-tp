'use client'
import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = [46.603354, 1.888334];

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
    socketRef.current = io();

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
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
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPositions((prev) => [...prev, { lat: latitude, lng: longitude }]);
      });
    }
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      userVideo.current.srcObject = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      });

      peer.on('signal', signal => {
        // Envoyer le signal à d'autres utilisateurs
      });

      peer.on('stream', stream => {
        if (typeof window !== 'undefined') {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          document.body.append(video);
        }
      });

      peersRef.current.push(peer);
    });
  }, []);
/*
  return (
    <div>
      <h1>Application de Suivi en Temps Réel et Visioconférence</h1>
      <div>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
            {positions.map((position, index) => (
              <Marker key={index} position={{ lat: position.lat, lng: position.lng }} />
            ))}
          </GoogleMap>
        </LoadScript>
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
            onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
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
*/
return (
  <div>
    <h1>Application de Suivi en Temps Réel et Visioconférence</h1>
    <div>
      <MapContainer center={center} zoom={6} style={containerStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.map((position, index) => (
          <Marker key={index} position={[position.lat, position.lng]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        ))}
      </MapContainer>
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
          placeholder="Enter your username"
          style={{ color:'black' }}
        />
        <button onClick={handleLogin}>Join Chat</button>
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
    ) : null}
  </div>
);
}
