import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api.js";

// Fix Leaflet's default marker icon path issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

const LAYER_OPTIONS = [
  { key: "dark", label: "🌑 Dark", url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ' },
  { key: "satellite", label: "🛰 Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Tiles &copy; Esri" },
  { key: "street", label: "🗺 Street", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
];

export default function WeatherMap({ currentPlace, onSelectPlace }) {
  const [activeLayer, setActiveLayer] = useState("dark");
  const [clickMarker, setClickMarker] = useState(null);
  const [clickWeather, setClickWeather] = useState(null);
  const [loadingClick, setLoadingClick] = useState(false);
  const center = currentPlace
    ? [currentPlace.lat, currentPlace.lon]
    : [20, 77];

  const layer = LAYER_OPTIONS.find((l) => l.key === activeLayer);

  const handleMapClick = async ({ lat, lng }) => {
    setClickMarker({ lat, lng });
    setLoadingClick(true);
    setClickWeather(null);
    try {
      const [place, weather] = await Promise.all([
        api.reverseGeocode(lat, lng),
        api.getCurrentWeather(lat, lng, "", ""),
      ]);
      setClickWeather({ place, weather });
    } catch (e) {
      setClickWeather({ error: e.message });
    } finally {
      setLoadingClick(false);
    }
  };

  const goToClickedPlace = () => {
    if (clickWeather?.place) {
      onSelectPlace({
        name: clickWeather.place.name,
        country: clickWeather.place.country,
        lat: clickMarker.lat,
        lon: clickMarker.lng,
      });
    }
  };

  return (
    <section className="map-section">
      <div className="map-header">
        <h2 className="forecast-card__title" style={{ margin: 0 }}>
          <span className="title-icon">🗺️</span> Interactive Weather Map
        </h2>
        <div className="map-layer-tabs">
          {LAYER_OPTIONS.map((l) => (
            <button
              key={l.key}
              className={`map-layer-btn ${activeLayer === l.key ? "is-active" : ""}`}
              onClick={() => setActiveLayer(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <p className="map-hint">Click anywhere on the map to get weather for that location</p>

      <div className="map-container-wrap">
        <MapContainer
          center={center}
          zoom={currentPlace ? 10 : 4}
          style={{ height: "420px", width: "100%", borderRadius: "16px" }}
          key={activeLayer}
        >
          <TileLayer url={layer.url} attribution={layer.attribution} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Current searched city marker */}
          {currentPlace && (
            <Marker position={[currentPlace.lat, currentPlace.lon]} icon={selectedIcon}>
              <Popup>
                <strong>{currentPlace.name}</strong>
                {currentPlace.country && <div>{currentPlace.country}</div>}
              </Popup>
            </Marker>
          )}

          {/* Clicked location marker */}
          {clickMarker && (
            <Marker position={[clickMarker.lat, clickMarker.lng]}>
              <Popup>
                {loadingClick ? (
                  <div>Loading weather…</div>
                ) : clickWeather?.error ? (
                  <div>Error: {clickWeather.error}</div>
                ) : clickWeather ? (
                  <div className="map-popup">
                    <strong>{clickWeather.place?.name || "Unknown"}</strong>
                    {clickWeather.place?.country && <div>{clickWeather.place.country}</div>}
                    {clickWeather.weather?.current && (
                      <div className="map-popup__temp">
                        🌡 {Math.round(clickWeather.weather.current.temperature_2m)}°C
                      </div>
                    )}
                    <button className="map-popup__btn" onClick={goToClickedPlace}>
                      View Full Weather →
                    </button>
                  </div>
                ) : null}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </section>
  );
}
