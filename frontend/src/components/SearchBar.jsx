import React, { useState, useRef } from "react";
import { api } from "../api.js";

export default function SearchBar({ onSelectPlace }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const places = await api.geocodeCity(value.trim());
        setResults(places);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const pick = (place) => {
    setQuery(`${place.name}, ${place.country}`);
    setResults([]);
    onSelectPlace(place);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelectPlace({
          name: "My location",
          country: "",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setQuery("My location");
        setResults([]);
      },
      () => {
        // Silently ignore — user can still search manually
      }
    );
  };

  return (
    <div className="search">
      <div className="search__row">
        <input
          className="search__input"
          type="text"
          placeholder="Search any city…"
          value={query}
          onChange={handleChange}
        />
        <button className="btn btn--ghost search__locate" onClick={useMyLocation} title="Use my location">
          ⌖
        </button>
      </div>

      {loading && <div className="search__hint">Searching…</div>}

      {results.length > 0 && (
        <ul className="search__results">
          {results.map((place, i) => (
            <li key={i} onClick={() => pick(place)}>
              <span className="search__place">{place.name}</span>
              <span className="search__region">
                {[place.admin1, place.country].filter(Boolean).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
