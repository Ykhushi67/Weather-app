import React, { useEffect, useState, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthForm from "./components/AuthForm.jsx";
import SearchBar from "./components/SearchBar.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import HistoryChart from "./components/HistoryChart.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AlertBanner from "./components/AlertBanner.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import { api } from "./api.js";
import { skyMoodForHour } from "./utils.js";

function AppContent() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favRefresh, setFavRefresh] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On first load, try to use the browser's geolocation automatically,
  // same behavior as the original app.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        selectPlace({
          name: "My location",
          country: "",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) api.getFavorites().then(setFavorites).catch(() => {});
    else setFavorites([]);
  }, [user, favRefresh]);

  // Clear the currently displayed city's data the moment the user logs out,
  // so nothing lingers on screen until a manual refresh.
  useEffect(() => {
    if (!user) {
      setPlace(null);
      setWeather(null);
      setHistory(null);
    }
  }, [user]);

  const selectPlace = useCallback(async (p) => {
    setPlace(p);
    setError("");
    setLoading(true);
    try {
      const [w, h] = await Promise.all([
        api.getCurrentWeather(p.lat, p.lon, p.name, p.country),
        api.getWeatherHistory(p.lat, p.lon),
      ]);
      setWeather(w);
      setHistory(h);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFavorite = async () => {
    if (!user) return setShowAuth(true);
    try {
      await api.addFavorite(place.name, place.country, place.lat, place.lon);
      setFavRefresh((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  // Coordinates from geolocation/geocoding can differ by tiny fractions,
  // so compare with a small tolerance instead of exact equality.
  const isFavorite =
    place &&
    favorites.some(
      (f) => Math.abs(f.lat - place.lat) < 0.05 && Math.abs(f.lon - place.lon) < 0.05
    );

  const hour = weather ? new Date().getHours() : 12;
  const mood = skyMoodForHour(hour);

  return (
    <div className={`app sky--${mood}`}>
      <Navbar onAuthClick={() => setShowAuth(true)} />

      <main className="layout">
        <Sidebar onSelectPlace={selectPlace} refreshKey={favRefresh} />

        <div className="main-column">
          <SearchBar onSelectPlace={selectPlace} />

          {error && <p className="form-error main-error">{error}</p>}
          {loading && <p className="loading-text">Fetching the sky…</p>}

          {place && weather && (
            <>
              <AlertBanner weatherCode={weather.current.weather_code} />
              <WeatherCard
                place={place}
                weather={weather}
                onSaveFavorite={saveFavorite}
                isFavorite={isFavorite}
              />
              <HistoryChart history={history} />
            </>
          )}

          {!place && !loading && (
            <p className="empty-state">
              Search a city above, or allow location access to see the weather there.
            </p>
          )}
        </div>
      </main>

      {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  if (window.location.pathname === "/reset-password") {
    return <ResetPassword />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
