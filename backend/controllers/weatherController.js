import fetch from "node-fetch";
import SearchHistory from "../models/SearchHistory.js";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

// GET /api/weather/geocode?city=Jaipur
// Turns a typed city name into a list of matching places (name, country, lat, lon)
export const geocodeCity = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "city query param is required" });

    const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    const results = (data.results || []).map((r) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      lat: r.latitude,
      lon: r.longitude,
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to search city", error: err.message });
  }
};

// GET /api/weather/current?lat=&lon=&city=&country=
// Returns current weather. If the request is authenticated, also logs the
// search into the user's history.
export const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon, city, country } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon query params are required" });
    }

    const url =
      `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,visibility,weather_code` +
      `&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    if (req.user) {
      try {
        await SearchHistory.create({
          user: req.user._id,
          city: city || "Unknown",
          country: country || "",
          lat: Number(lat),
          lon: Number(lon),
        });
      } catch (historyErr) {
        // Don't fail the weather request just because history logging failed
        console.error("Failed to save search history:", historyErr.message);
      }
    }

    res.json({ current: data.current, units: data.current_units, timezone: data.timezone });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch current weather", error: err.message });
  }
};

// GET /api/weather/history?lat=&lon=
// Returns the last 7 days of real historical weather for a location
export const getWeatherHistory = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon query params are required" });
    }

    const end = new Date();
    end.setDate(end.getDate() - 1); // archive data usually lags by a day
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const fmt = (d) => d.toISOString().split("T")[0];

    const url =
      `${ARCHIVE_URL}?latitude=${lat}&longitude=${lon}` +
      `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
      `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max` +
      `&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data.daily);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch weather history", error: err.message });
  }
};
