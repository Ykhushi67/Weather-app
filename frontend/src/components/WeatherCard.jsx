import React from "react";
import { describeWeatherCode } from "../utils.js";
import { useUnit } from "../context/UnitContext.jsx";

const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function windDirection(deg) {
  if (deg == null) return "—";
  return WIND_DIRS[Math.round(deg / 45) % 8];
}

export default function WeatherCard({ place, weather, onSaveFavorite, isFavorite }) {
  const { convertTemp, convertWind, tempUnit, windUnit } = useUnit();
  if (!weather) return null;

  const c = weather.current;
  const { label, glyph } = describeWeatherCode(c.weather_code);

  const stats = [
    { label: "Feels Like", value: `${convertTemp(c.apparent_temperature)}${tempUnit}`, icon: "🌡" },
    { label: "Humidity", value: `${Math.round(c.relative_humidity_2m)}%`, icon: "💧" },
    { label: "Pressure", value: `${Math.round(c.pressure_msl)} hPa`, icon: "🔵" },
    { label: "Wind", value: `${convertWind(c.wind_speed_10m)} ${windUnit} ${windDirection(c.wind_direction_10m)}`, icon: "💨" },
    { label: "Visibility", value: `${(c.visibility / 1000).toFixed(1)} km`, icon: "👁" },
    { label: "UV Index", value: c.uv_index != null ? `${c.uv_index}` : "—", icon: "☀️" },
    { label: "Cloud Cover", value: c.cloud_cover != null ? `${c.cloud_cover}%` : "—", icon: "☁️" },
    { label: "Wind Dir", value: windDirection(c.wind_direction_10m), icon: "🧭" },
  ];

  return (
    <section className="weather-card glass-card">
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
        <div>
          <span className="weather-card__temp">
            {convertTemp(c.temperature_2m)}
            <span className="weather-card__unit">{tempUnit}</span>
          </span>
        </div>
      </div>
      <p className="weather-card__label">{label}</p>

      <div className="weather-card__stats">
        {stats.map((s) => (
          <div className="stat glass-stat" key={s.label}>
            <span className="stat__icon">{s.icon}</span>
            <span className="stat__value">{s.value}</span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
