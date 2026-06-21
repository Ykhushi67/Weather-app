import React from "react";
import { describeWeatherCode } from "../utils.js";

export default function WeatherCard({ place, weather, onSaveFavorite, isFavorite }) {
  if (!weather) return null;

  const c = weather.current;
  const u = weather.units;
  const { label, glyph } = describeWeatherCode(c.weather_code);

  const stats = [
    { label: "Feels like", value: `${Math.round(c.apparent_temperature)}${u.apparent_temperature}` },
    { label: "Humidity", value: `${Math.round(c.relative_humidity_2m)}${u.relative_humidity_2m}` },
    { label: "Pressure", value: `${Math.round(c.pressure_msl)}${u.pressure_msl}` },
    { label: "Wind speed", value: `${Math.round(c.wind_speed_10m)}${u.wind_speed_10m}` },
    { label: "Visibility", value: `${(c.visibility / 1000).toFixed(1)} km` },
  ];

  return (
    <section className="weather-card">
      <div className="weather-card__top">
        <div>
          <h1 className="weather-card__place">{place.name}</h1>
          {place.country && <p className="weather-card__region">{place.country}</p>}
        </div>
        <button
          className={`btn btn--star ${isFavorite ? "is-active" : ""}`}
          onClick={onSaveFavorite}
          title={isFavorite ? "Saved to favorites" : "Save to favorites"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="weather-card__hero">
        <span className="weather-card__glyph">{glyph}</span>
        <span className="weather-card__temp">
          {Math.round(c.temperature_2m)}
          <span className="weather-card__unit">{u.temperature_2m}</span>
        </span>
      </div>
      <p className="weather-card__label">{label}</p>

      <div className="weather-card__stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat__value">{s.value}</span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
