'use client'
import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Peer from 'simple-peer';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 46.603354,
  lng: 1.888334
};

export default function Home() {
  const [positions, setPositions] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);

  // Fonction pour récupérer la géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPositions((prev) => [...prev, { lat: latitude, lng: longitude }]);
      });
    }
  }, []);

  // Fonction pour la visioconférence
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
        <LoadScript googleMapsApiKey="NEXT_PUBLIC_GOOGLE_MAPS_API_KEY">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
            {positions.map((position, index) => (
              <Marker key={index} position={{ lat: position.lat, lng: position.lng }} />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
      <div>
        <video ref={userVideo} autoPlay playsInline style={{ width: '300px', height: '200px' }} />
      </div>
    </div>
  );
}
