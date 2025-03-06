// src/components/Navbar.js
import React from "react";

const Navbar = ({ setView }) => {
    return (
        <nav style={{ padding: "10px", backgroundColor: "#eee", display: "flex", justifyContent: "space-between" }}>
            <h3>Leaflet 7 Map</h3>
            <select onChange={(e) => setView(e.target.value)}>
                <option value="home">Home</option>
                <option value="mappa">Visualizza Mappa</option>
                <option value="rischio-valanghe">Mappa del Rischio Valanghe</option>
            </select>
        </nav>
    );
};

export default Navbar;
