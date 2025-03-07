// src/components/TrentinoDataViewer.js
import React, { useEffect, useState } from 'react';
import MapViewer from './MapViewer';

const TrentinoDataViewer = () => {
  const [data, setData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('IT-32-BZ_micro-regions');

  useEffect(() => {
    fetch(`http://localhost:5000/api/bollettini?name=${selectedRegion}`)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Errore nel caricamento dei dati:', error));
  }, [selectedRegion]);

  return (
    <div>
      <h2>Dati Regione</h2>
      <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
        <option value="IT-32-BZ_micro-regions">IT-32-BZ_micro-regions</option>
        <option value="AT-07_micro-regions">AT-07_micro-regions</option>
        <option value="IT-32-TN_micro-regions">IT-32-TN_micro-regions</option>
      </select>
      {data ? (
        <MapViewer data={data} />
      ) : (
        <div>Caricamento dei dati...</div>
      )}
    </div>
  );
};

export default TrentinoDataViewer;
