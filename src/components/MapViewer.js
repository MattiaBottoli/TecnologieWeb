// src/components/MapViewer.js
import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

const MapViewer = ({ data }) => {
  if (!data || !data.features) {
    return <div>Nessun dato da visualizzare</div>;
  }

  return (
    <MapContainer center={[46.5, 11.5]} zoom={8} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON data={data} />
    </MapContainer>
  );
};

export default MapViewer;
