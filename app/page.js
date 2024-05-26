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
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on('receiveMessage', (message) => {
      console.log('Message received:', message);
    });

    socketRef.current.on('signal', (data) => {
      const peer = peersRef.current.find(p => p.peerID === data.from);
      if (peer) {
        peer.peer.signal(data.signal);
      }
    });

    socketRef.current.on('userJoined', (userID) => {
      const peer = createPeer(userID, socketRef.current.id, userVideo.current.srcObject);
      peersRef.current.push({
        peerID: userID,
        peer,
      });
      setPeers([...peersRef.current]);
    });

    socketRef.current.on('userLeft', (userID) => {
      const peerObj = peersRef.current.find(p => p.peerID === userID);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      const peers = peersRef.current.filter(p => p.peerID !== userID);
      peersRef.current = peers;
      setPeers(peers);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', { to: userToSignal, from: callerID, signal });
    });

    peer.on('stream', stream => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      document.body.append(video);
    });

    return peer;
  };

  const handleLogin = () => {
    if (username.trim()) {
      setIsChatVisible(true);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        userVideo.current.srcObject = stream;

        socketRef.current.emit('join', 'room-id');
      });
    }
  };

  const handleLogout = () => {
    setIsChatVisible(false);
    setUsername('');
    socketRef.current.emit('leave', 'room-id');
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
      <div id="videos"></div>
      {peers.map((peer, index) => (
        <Video key={index} peer={peer.peer} />
      ))}
    </div>
  );
}

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline />;
};
