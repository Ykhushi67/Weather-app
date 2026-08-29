import React, { useState } from "react";
import { api } from "../api.js";
import { describeWeatherCode } from "../utils.js";
import { useUnit } from "../context/UnitContext.jsx";

function CitySearchInput({ value, onChange, onSelect, placeholder }) {
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(null);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(timer);
    if (v.length < 2) { setResults([]); return; }
    setTimer(setTimeout(async () => {
      try {
        const data = await api.geocodeCity(v);
        setResults(data);
      } catch { setResults([]); }
    }, 350));
  };

  const pick = (r) => {
    onSelect(r);
    setResults([]);
    onChange(r.name);
  };

  return (
    <div className="compare-search-wrap">
      <input
        className="compare-search-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {results.length > 0 && (
        <ul className="compare-search-results">
          {results.map((r) => (
            <li key={`${r.lat}-${r.lon}`} onClick={() => pick(r)}>
              <span className="search__place">{r.name}</span>
              <span className="search__region">{r.admin1 ? `${r.admin1}, ` : ""}{r.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MetricDiff({ label, val1, val2, unit, higherIsBetter = false }) {
  const diff = val1 - val2;
  const absDiff = Math.abs(Math.round(diff));
  let tag = null;
  if (absDiff > 0) {
    const city1Better = higherIsBetter ? diff > 0 : diff < 0;
    tag = (
      <span className={`diff-badge ${city1Better ? "diff-badge--better" : "diff-badge--worse"}`}>
        {diff > 0 ? "+" : "-"}{absDiff}{unit}
      </span>
    );
  }
  return (
    <div className="compare-metric-row">
      <span className="compare-metric__label">{label}</span>
      <div className="compare-metric__values">
        <span className="compare-val">{Math.round(val1)}{unit}</span>
        {tag}
        <span className="compare-val">{Math.round(val2)}{unit}</span>
      </div>
    </div>
  );
}

export default function CityCompare({ onSelectPlace }) {
  const { convertTemp, convertWind, tempUnit, windUnit } = useUnit();
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [city1, setCity1] = useState(null);
  const [city2, setCity2] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const compare = async () => {
    if (!city1 || !city2) { setError("Please select both cities from the dropdown."); return; }
    setError("");
    setLoading(true);
    setResults(null);
    try {
      const data = await api.compareCities([
        { lat: city1.lat, lon: city1.lon, name: city1.name, country: city1.country },
        { lat: city2.lat, lon: city2.lon, name: city2.name, country: city2.country },
      ]);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCityPanel = (data) => {
    if (!data?.current) return null;
    const c = data.current;
    const { glyph, label } = describeWeatherCode(c.weather_code);
    return (
      <div className="compare-panel">
        <div className="compare-panel__city">
          <h3>{data.name}</h3>
          <p className="compare-panel__country">{data.country}</p>
        </div>
        <div className="compare-panel__hero">
          <span className="compare-glyph">{glyph}</span>
          <span className="compare-temp">{convertTemp(c.temperature_2m)}{tempUnit}</span>
        </div>
        <p className="compare-panel__label">{label}</p>
        <div className="compare-panel__stats">
          <div className="compare-stat"><span>{convertTemp(c.apparent_temperature)}{tempUnit}</span><small>Feels Like</small></div>
          <div className="compare-stat"><span>{c.relative_humidity_2m}%</span><small>Humidity</small></div>
          <div className="compare-stat"><span>{convertWind(c.wind_speed_10m)} {windUnit}</span><small>Wind</small></div>
          <div className="compare-stat"><span>{c.uv_index ?? "—"}</span><small>UV Index</small></div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => onSelectPlace({ name: data.name, country: data.country, lat: data.lat, lon: data.lon })}>
          View Full Forecast →
        </button>
      </div>
    );
  };

  return (
    <section className="compare-section">
      <h2 className="forecast-card__title" style={{ marginBottom: "20px" }}>
        <span className="title-icon">⚖️</span> Compare Cities
      </h2>

      <div className="compare-inputs">
        <CitySearchInput value={input1} onChange={setInput1} onSelect={setCity1} placeholder="Search first city…" />
        <div className="compare-vs">VS</div>
        <CitySearchInput value={input2} onChange={setInput2} onSelect={setCity2} placeholder="Search second city…" />
      </div>

      <button className="btn btn--primary compare-btn" onClick={compare} disabled={loading}>
        {loading ? "Comparing…" : "Compare Weather"}
      </button>

      {error && <p className="form-error" style={{ textAlign: "center", marginTop: "12px" }}>{error}</p>}

      {results && results.length === 2 && (
        <div className="compare-results">
          {renderCityPanel(results[0])}

          <div className="compare-diff-panel">
            <h4>Differences</h4>
            <MetricDiff
              label="Temperature"
              val1={convertTemp(results[0].current.temperature_2m)}
              val2={convertTemp(results[1].current.temperature_2m)}
              unit={tempUnit}
              higherIsBetter={false}
            />
            <MetricDiff label="Humidity" val1={results[0].current.relative_humidity_2m} val2={results[1].current.relative_humidity_2m} unit="%" higherIsBetter={false} />
            <MetricDiff
              label="Wind Speed"
              val1={convertWind(results[0].current.wind_speed_10m)}
              val2={convertWind(results[1].current.wind_speed_10m)}
              unit={` ${windUnit}`}
              higherIsBetter={false}
            />
            <MetricDiff label="UV Index" val1={results[0].current.uv_index ?? 0} val2={results[1].current.uv_index ?? 0} unit="" higherIsBetter={false} />
            {results[0].aqi && results[1].aqi && (
              <MetricDiff label="US AQI" val1={results[0].aqi.us_aqi ?? 0} val2={results[1].aqi.us_aqi ?? 0} unit="" higherIsBetter={false} />
            )}
          </div>

          {renderCityPanel(results[1])}
        </div>
      )}
    </section>
  );
}
