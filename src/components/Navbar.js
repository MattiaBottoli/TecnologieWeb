// src/components/Navbar.js
import React, { useState } from 'react';
import '../styles/navbar.css';

const Navbar = ({ setView }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* <button onClick={() => setView('home')}>Home</button>
        <button onClick={() => setView('mappa')}>Mappa</button>
        <button onClick={() => setView('rischio-valanghe')}>Rischio Valanghe</button>
        <button onClick={() => setView('dati-trentino')}>Dati Trentino</button> */}

        <div><h1>TRENTINO EXPLORER</h1></div>
        
        <button className="hamburger" onClick={() => setMenuOpen(true)}>☰</button>
      </nav>

      {menuOpen && (
        <div className="fullscreen-menu">
          <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
          <button className="Choose" onClick={() => { setView('meteo'); setMenuOpen(false); }}>METEO</button>
          <button className="Choose" onClick={() => { setView('estate'); setMenuOpen(false); }}>ESTATE</button>
          <button className="Choose"onClick={() => { setView('inverno'); setMenuOpen(false); }}>INVERNO</button>    
        </div>
      )}
    </>
  );
};

export default Navbar;