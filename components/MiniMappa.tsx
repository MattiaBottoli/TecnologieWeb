"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";

export default function MiniMappa({
  posizione,
  nome,
}: {
  posizione: LatLngExpression;
  nome: string;
}) {
  return (
    <div className="mini-map">
      <MapContainer
        center={posizione}
        zoom={13}
        scrollWheelZoom={false}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "10px",
          marginTop: "0px",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={posizione}>
          <Popup>{nome}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}