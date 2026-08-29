import fetch from "node-fetch";
import SearchHistory from "../models/SearchHistory.js";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const AQI_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

// GET /api/weather/geocode?city=Jaipur
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

// GET /api/weather/reverse-geocode?lat=&lon=
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: "lat and lon are required" });

    // Use Open-Meteo geocoding API with search radius approach
    // We do a point lookup by querying nearby names
    const url = `${GEOCODE_URL}?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      return res.json({ name: r.name, country: r.country, admin1: r.admin1, lat: r.latitude, lon: r.longitude });
    }

    res.json({ name: "Unknown Location", country: "", admin1: "", lat: Number(lat), lon: Number(lon) });
  } catch (err) {
    res.status(500).json({ message: "Reverse geocode failed", error: err.message });
  }
};

// GET /api/weather/current?lat=&lon=&city=&country=
// Returns current weather + hourly 24h + 7-day daily forecast
export const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon, city, country } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon query params are required" });
    }

    const url =
      `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,weather_code,cloud_cover,uv_index` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,sunrise,sunset,uv_index_max` +
      `&forecast_days=8` +
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
        console.error("Failed to save search history:", historyErr.message);
      }
    }

    res.json({
      current: data.current,
      units: data.current_units,
      timezone: data.timezone,
      hourly: data.hourly,
      hourly_units: data.hourly_units,
      daily: data.daily,
      daily_units: data.daily_units,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch current weather", error: err.message });
  }
};

// GET /api/weather/history?lat=&lon=
export const getWeatherHistory = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon query params are required" });
    }

    const end = new Date();
    end.setDate(end.getDate() - 1);
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

// GET /api/weather/air-quality?lat=&lon=
export const getAirQuality = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: "lat and lon are required" });

    const url =
      `${AQI_URL}?latitude=${lat}&longitude=${lon}` +
      `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi,uv_index` +
      `&hourly=pm2_5,uv_index` +
      `&timezone=auto&forecast_days=1`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({ current: data.current, units: data.current_units, hourly: data.hourly });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch air quality", error: err.message });
  }
};

// GET /api/weather/compare?cities=JSON_encoded_array_of_{lat,lon,name,country}
export const compareCities = async (req, res) => {
  try {
    const { cities } = req.query;
    if (!cities) return res.status(400).json({ message: "cities param required" });

    let parsedCities;
    try {
      parsedCities = JSON.parse(cities);
    } catch {
      return res.status(400).json({ message: "cities must be valid JSON array" });
    }

    if (!Array.isArray(parsedCities) || parsedCities.length < 2) {
      return res.status(400).json({ message: "Provide at least 2 cities" });
    }

    const results = await Promise.all(
      parsedCities.map(async (city) => {
        const url =
          `${FORECAST_URL}?latitude=${city.lat}&longitude=${city.lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,weather_code,cloud_cover,uv_index` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
          `&forecast_days=1&timezone=auto`;

        const aqUrl =
          `${AQI_URL}?latitude=${city.lat}&longitude=${city.lon}` +
          `&current=european_aqi,us_aqi,pm2_5,uv_index&timezone=auto&forecast_days=1`;

        const [weatherRes, aqiRes] = await Promise.all([fetch(url), fetch(aqUrl)]);
        const [weatherData, aqiData] = await Promise.all([weatherRes.json(), aqiRes.json()]);

        return {
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
          current: weatherData.current,
          units: weatherData.current_units,
          daily: weatherData.daily,
          daily_units: weatherData.daily_units,
          aqi: aqiData.current,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to compare cities", error: err.message });
  }
};
