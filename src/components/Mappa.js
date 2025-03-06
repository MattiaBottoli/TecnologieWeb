import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Mappa = () => {
    return (
        <div style={{ height: "500px", width: "100%", marginTop: "20px" }}>
            <MapContainer center={[45.4642, 9.1900]} zoom={10} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[45.4642, 9.1900]}>
                    <Popup>
                        📍 Milano <br /> Esempio di mappa con Leaflet 7
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default Mappa;
