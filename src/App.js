// src/App.js
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AvalancheRiskMap from './components/AvalancheRiskMap';

const Home = () => <div>Benvenuto nella Home Page!</div>;
const Mappa = () => <div>Visualizza Mappa (puoi aggiungere la tua mappa qui)</div>;

const App = () => {
  const [view, setView] = useState('home');

  return (
    <div>
      <Navbar setView={setView} />
      {view === 'home' && <Home />}
      {view === 'mappa' && <Mappa />}
      {view === 'rischio-valanghe' && <AvalancheRiskMap />}
    </div>
  );
};

export default App;
