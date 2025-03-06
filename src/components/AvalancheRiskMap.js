// src/components/AvalancheRiskMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Funzione per calcolare il rischio di valanghe
const calcolaRischioValanghe = (temperatura, umidita) => {
  if (temperatura > 0 && umidita > 80) {
    return 100; // Rischio massimo
  } else if (temperatura < 5 && umidita > 60) {
    return 75; // Rischio alto
  } else if (temperatura < 10 && umidita > 40) {
    return 50; // Rischio medio
  } else {
    return 25; // Rischio basso
  }
};

const AvalancheRiskMap = () => {
  const [riskData, setRiskData] = useState([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      // Esempio di coordinate per alcune montagne
      const montagne = [
        {lat: 27.9883, lon: 86.9250 },
        {lat: 35.8825, lon: 76.5134 },
        {lat: 27.7025, lon: 88.1475 },
        {lat: 27.9617, lon: 86.9375 },
        {lat: 27.8897, lon: 87.0869 },
        {lat: 28.0958, lon: 86.6644 },
        {lat: 28.6972, lon: 83.4861 },
        {lat: 28.5497, lon: 84.5611 },
        {lat: 35.2361, lon: 74.5893 },
        {lat: 28.5961, lon: 83.8203 },
        {lat: 35.7225, lon: 76.6975 },
        {lat: 35.8133, lon: 76.5644 },
        {lat: 35.7589, lon: 76.6494 },
        {lat: 28.3542, lon: 85.7700 },
        {lat: 45.8326, lon: 6.8656 },
        {lat: -32.6531,lon: -70.0106 },
        {lat: -3.0674, lon: 37.3556 },
        {lat: 63.0695, lon: -151.0074 },
        {lat: 43.3497, lon: 42.4425 },
        {lat: -78.5250,lon: -85.6167 },
        {lat: -4.0789, lon: 137.1839 },
      ];

      const promises = montagne.map(async (montagna) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${montagna.lat}&longitude=${montagna.lon}&current_weather=true`;
        const response = await axios.get(url);
        const temperatura = response.data.current_weather.temperature;
        const umidita = response.data.current_weather.humidity; // Nota: Open-Meteo potrebbe non fornire l'umidità direttamente
        const rischio = calcolaRischioValanghe(temperatura, umidita);
        console.log(`Montagna (${montagna.lat}, ${montagna.lon}): Temperatura: ${temperatura}°C, Umidità: ${umidita}%`);
        return { ...montagna, rischio };
      });

      const data = await Promise.all(promises);
      setRiskData(data);
    };

    fetchWeatherData();
  }, []);

  const getColor = (rischio) => {
    return rischio > 75 ? 'red' :
           rischio > 50 ? 'orange' :
           rischio > 25 ? 'yellow' : 'green';
  };

  return (
    <MapContainer center={[45.4642, 9.1900]} zoom={5} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {riskData.map((montagna, index) => (
        <Circle
          key={index}
          center={[montagna.lat, montagna.lon]}
          radius={5000}
          pathOptions={{ color: getColor(montagna.rischio), fillColor: getColor(montagna.rischio), fillOpacity: 0.5 }}
        />
      ))}
    </MapContainer>
  );
};

export default AvalancheRiskMap;
