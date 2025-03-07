// src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AvalancheRiskMap from './components/AvalancheRiskMap';
import TrentinoDataViewer from './components/TrentinoDataViewer';
import Home from './components/Home';

import "./styles/Home.css"

const Mappa = () => <div>Visualizza Mappa (puoi aggiungere la tua mappa qui)</div>;

const App = () => {
  const [view, setView] = useState('home');

  return (
    <div>
      <Navbar setView={setView} />
      {view === 'home' && <Home />}
      {view === 'mappa' && <sitemap />}
      {view === 'rischio-valanghe' && <AvalancheRiskMap />}
      {view === 'dati-trentino' && <TrentinoDataViewer />}
    </div>
  );
};

export default App;
