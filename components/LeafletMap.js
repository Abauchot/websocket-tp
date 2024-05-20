import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const LeafletMap = ({ center, positions }) => (
  <MapContainer center={center} zoom={6} style={{ height: "70vh", width: "100%" }}>
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
);

export default LeafletMap;