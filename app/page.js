// pages/index.js
'use client'
import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';
import Chatbox from '../components/Chatbox';

const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const center = [46.603354, 1.888334];

export default function Home() {
  const [positions, setPositions] = useState([]);
  const [username, setUsername] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      setIsChatVisible(true);
    }
  };

  const handleLogout = () => {
    setIsChatVisible(false);
    setUsername('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPositions((prev) => [...prev, { lat: latitude, lng: longitude }]);
      });
    }
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      userVideo.current.srcObject = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on('signal', (signal) => {
        // Envoyer le signal à d'autres utilisateurs
      });

      peer.on('stream', (stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        document.body.append(video);
      });

      peersRef.current.push(peer);
    });
  }, []);

  return (
    <div>
      <h1>Application de Suivi en Temps Réel et Visioconférence</h1>
      <div>
        <LeafletMap center={center} positions={positions} />
      </div>
      <div>
        <video ref={userVideo} autoPlay playsInline style={{ width: '300px', height: '200px' }} />
      </div>
      {isChatVisible ? (
        <Chatbox username={username} socket={socketRef.current} onLogout={handleLogout} />
      ) : (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your username"
            style={{ color: 'black' }}
          />
          <button onClick={handleLogin}>Join Chat</button>
        </div>
      )}
    </div>
  );
}
