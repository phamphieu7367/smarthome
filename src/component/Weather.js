import React, { useEffect, useState } from "react";

import { fetchWeather } from "../api/fetchWeather";

const Weather = () => {
  const [weather, setWeather] = useState({});

  useEffect(() => {
    const getAPi = async () => {
      const data = await fetchWeather();
      setWeather(data);
    };
    getAPi();
  }, []);
  return (
    <div className="main-container">
      {weather.main && (
        <div className="city">
          <h2 className="city-name">
            <span>{weather.name}</span>
            <sup>{weather.sys.country}</sup>
          </h2>
          <div className="city-temp">
            {Math.round(weather.main.temp - 273.15)}
            <sup>&deg;C</sup>
          </div>
          <div className="info">
            <img
              className="city-icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>{weather.weather[0].description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
