// src/components/Weather.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Weather = ({ lat, lon }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

      try {
        const response = await axios.get(url);
        setWeatherData(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  if (error) {
    return <div>Errore nel caricamento dei dati meteo: {error}</div>;
  }

  if (!weatherData) {
    return <div>Caricamento dei dati meteo...</div>;
  }

  return (
    <div>
      <h2>Condizioni Meteo</h2>
      <p>Temperatura: {weatherData.current_weather.temperature}°C</p>
      <p>Velocità del Vento: {weatherData.current_weather.windspeed} km/h</p>
      <p>Direzione del Vento: {weatherData.current_weather.winddirection}°</p>
    </div>
  );
};

export default Weather;
