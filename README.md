# Skyline — Full-Stack Weather & Environmental Intelligence Platform

Skyline is a full-stack MERN application engineered for real-time weather analytics, interactive atmospheric mapping, air quality tracking, and multi-city comparisons. Built using **React (Vite)**, **Node.js / Express**, **MongoDB Atlas**, and **Open-Meteo APIs** (free, open access without rate-limit friction or API keys).

---

## 🌟 Key Features

### 📊 Weather Dashboard & Analytics
- **Live Auto-Location & Search**: Auto-detects user coordinates or searches any city worldwide with instant autocomplete geocoding.
- **Rich Weather Metrics**: Temperature, apparent ("feels like") temperature, humidity, atmospheric pressure, visibility, cloud cover, UV index, and wind direction/speed.
- **Unit Conversion System**: Global seamless toggle between **Metric (°C, km/h)** and **Imperial (°F, mph)** with local storage persistence.
- **Severe Weather Alerts**: Dynamic banner warnings for extreme temperatures, rainstorms, high winds, and low visibility.

### 🕐 24-Hour Hourly Forecast
- Interactive horizontal tile strip displaying hour-by-hour weather icons, temperatures, and rain chances.
- Integrated **Recharts AreaChart** sparkline showing dual-trend curves for temperature and precipitation likelihood.

### 📅 7-Day Daily Forecast
- Multi-day breakdown showing daily min/max temperature range bars, precipitation accumulation, weather condition badges, and sunrise/sunset times.

### 🌿 Air Quality & UV Health Dashboard
- Dual **US AQI** and **European AQI** gauge meters with status severity indicators (Good, Moderate, Poor, Hazardous).
- Detailed pollutant concentrations: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{O}_3$, $\text{SO}_2$, and $\text{CO}$.
- **UV Index Meter** with peak sun hours and protective advisory (sunscreen, sunglasses, shade recommendations).
- Actionable health recommendations tailored to current air pollution levels.

### 🗺 Interactive Weather Map
- Powered by **Leaflet & React-Leaflet** featuring **Esri Dark Canvas**, **Esri Satellite**, and **OpenStreetMap** tile layers (100% clean, no API keys or watermarks).
- Pins current searched location automatically.
- **Click-to-Weather**: Click anywhere on the map to trigger reverse geocoding and display a popup with instant local weather.

### ⚖️ Side-by-Side City Comparison Mode
- Compare weather metrics for two cities simultaneously.
- Stat comparison table featuring delta indicators (e.g., `+5°C warmer`, `15% less humid`).

### 📈 7-Day Historical Weather
- Visualizes past 7 days of historical temperature ranges using **Open-Meteo Historical Archive API**.

### 🔒 User Accounts & Favorites
- User registration and login using **JWT (JSON Web Tokens)** and bcrypt password hashing.
- Password reset request workflow via token verification.
- Persistent favorite cities list and search history stored in **MongoDB Atlas**.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Recharts, Leaflet, React-Leaflet, Lucide React, Vanilla CSS (Glassmorphism design system)
- **Backend**: Node.js, Express.js, Mongoose / MongoDB Atlas, JWT, Node-Fetch, Dotenv
- **Data Providers**: Open-Meteo (Forecast API, Air Quality API, Geocoding API, Historical Archive API)

---

## 📂 Project Structure

```
weather-app/
├── backend/
│   ├── config/          # Database connection setup
│   ├── controllers/     # Express logic for weather, auth, & favorites
│   ├── middleware/      # Auth JWT verification middleware
│   ├── models/          # Mongoose schemas (User, Favorite, SearchHistory)
│   ├── routes/          # API route definitions
│   ├── server.js        # Express application entry point
│   └── .env.example     # Backend environment template
└── frontend/
    ├── src/
    │   ├── components/  # WeatherCard, HourlyForecast, DailyForecast, AirQualityCard, WeatherMap, CityCompare, etc.
    │   ├── context/     # AuthContext & UnitContext (°C/°F)
    │   ├── api.js       # Centralized API service layer
    │   ├── App.jsx      # Core view router & layout controller
    │   └── App.css      # Custom Glassmorphic design tokens & styles
    └── .env.example     # Frontend environment template
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas database URI (optional for weather features, required for Auth & Favorites)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/weather-app?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=*
```

Start the backend dev server:
```bash
npm run dev
# Server running on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
# App running on http://localhost:5173 (or http://localhost:5174)
```

---

## 🛰 API Reference

| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register a new user account |
| `POST` | `/api/auth/login` | No | Log in and receive JWT token |
| `POST` | `/api/auth/forgot-password` | No | Request password reset email/token |
| `POST` | `/api/auth/reset-password` | No | Reset password with valid token |
| `GET` | `/api/weather/geocode` | No | Search city names to coordinates |
| `GET` | `/api/weather/reverse-geocode` | No | Convert lat/lon coordinates to city name |
| `GET` | `/api/weather/current` | Optional | Get current weather, 24h hourly, and 7-day forecast |
| `GET` | `/api/weather/history` | No | Get past 7 days historical weather data |
| `GET` | `/api/weather/air-quality` | No | Get AQI pollutants & UV index data |
| `GET` | `/api/weather/compare` | No | Compare metrics for multiple cities |
| `GET` | `/api/favorites` | Yes | Get user's saved favorite cities |
| `POST` | `/api/favorites` | Yes | Add a new favorite city |
| `DELETE`| `/api/favorites/:id` | Yes | Remove a favorite city |
| `GET` | `/api/favorites/history` | Yes | Get user's recent search history |

---

## 📄 License

MIT License — free for personal and educational use.
