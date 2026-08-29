import React, { useEffect, useState, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UnitProvider } from "./context/UnitContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthForm from "./components/AuthForm.jsx";
import SearchBar from "./components/SearchBar.jsx";
import WeatherCard from "./components/WeatherCard.jsx";
import HistoryChart from "./components/HistoryChart.jsx";
import HourlyForecast from "./components/HourlyForecast.jsx";
import DailyForecast from "./components/DailyForecast.jsx";
import AirQualityCard from "./components/AirQualityCard.jsx";
import WeatherMap from "./components/WeatherMap.jsx";
import CityCompare from "./components/CityCompare.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AlertBanner from "./components/AlertBanner.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import { api } from "./api.js";
import { skyMoodForHour } from "./utils.js";

function AppContent() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favRefresh, setFavRefresh] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!user) {
      setPlace(null);
      setWeather(null);
      setHistory(null);
      setAqiData(null);
    }
  }, [user]);

  const selectPlace = useCallback(async (p) => {
    setPlace(p);
    setError("");
    setLoading(true);
    try {
      const [w, h, aqi] = await Promise.all([
        api.getCurrentWeather(p.lat, p.lon, p.name, p.country),
        api.getWeatherHistory(p.lat, p.lon),
        api.getAirQuality(p.lat, p.lon),
      ]);
      setWeather(w);
      setHistory(h);
      setAqiData(aqi);
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

  const isFavorite =
    place &&
    favorites.some(
      (f) => Math.abs(f.lat - place.lat) < 0.05 && Math.abs(f.lon - place.lon) < 0.05
    );

  const hour = weather ? new Date().getHours() : 12;
  const mood = skyMoodForHour(hour);

  return (
    <div className={`app sky--${mood}`}>
      <Navbar
        onAuthClick={() => setShowAuth(true)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="layout">
        {/* Sidebar only in dashboard view */}
        {activeView === "dashboard" && (
          <Sidebar onSelectPlace={selectPlace} refreshKey={favRefresh} />
        )}

        <div className={`main-column ${activeView !== "dashboard" ? "main-column--full" : ""}`}>

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <>
              <SearchBar onSelectPlace={selectPlace} />

              {error && <p className="form-error main-error">{error}</p>}
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner" />
                  <p>Fetching the sky…</p>
                </div>
              )}

              {place && weather && (
                <>
                  <AlertBanner weatherCode={weather.current.weather_code} />
                  <WeatherCard
                    place={place}
                    weather={weather}
                    onSaveFavorite={saveFavorite}
                    isFavorite={isFavorite}
                  />
                  <HourlyForecast hourly={weather.hourly} hourly_units={weather.hourly_units} />
                  <DailyForecast daily={weather.daily} daily_units={weather.daily_units} />
                  <AirQualityCard aqiData={aqiData} />
                  <HistoryChart history={history} />
                </>
              )}

              {!place && !loading && (
                <div className="empty-state-card">
                  <div className="empty-state__glyph">🌍</div>
                  <p className="empty-state__title">Explore the weather anywhere</p>
                  <p className="empty-state__sub">Search a city above, or allow location access to auto-detect your weather.</p>
                </div>
              )}
            </>
          )}

          {/* Map View */}
          {activeView === "map" && (
            <div className="full-view-section">
              <SearchBar onSelectPlace={selectPlace} />
              <WeatherMap currentPlace={place} onSelectPlace={(p) => { selectPlace(p); setActiveView("dashboard"); }} />
            </div>
          )}

          {/* Compare View */}
          {activeView === "compare" && (
            <div className="full-view-section">
              <CityCompare onSelectPlace={(p) => { selectPlace(p); setActiveView("dashboard"); }} />
            </div>
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
    <UnitProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </UnitProvider>
  );
}
