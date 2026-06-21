# Skyline — Full-Stack Weather App

A geolocation weather app upgraded into a full MERN-style project:
**React (Vite) + Node/Express + MongoDB**, using **Open-Meteo** (free, no API key needed) for live weather, geocoding, and real 7-day history.

## Features
- Auto-detects your location on load, just like the original app
- Search any city (autocomplete via Open-Meteo geocoding)
- Current temperature, feels-like, humidity, pressure, wind, visibility
- Real **last 7 days** temperature chart (Open-Meteo Archive API)
- User signup/login (JWT)
- Save favorite cities (MongoDB)
- Search history saved per logged-in user (MongoDB)

## Project structure
```
weather-app/
  backend/     -> Express API + MongoDB
  frontend/    -> React (Vite) app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string (or local `mongodb://localhost:27017/weather-app`)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — your frontend URL (`http://localhost:5173` for local dev)

Run it:
```bash
npm run dev
```
Server starts on `http://localhost:5000`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` already points to `http://localhost:5000/api` for local dev — change `VITE_API_URL` when you deploy the backend.

Run it:
```bash
npm run dev
```
App opens on `http://localhost:5173`.

## 3. Deploying

- **Backend**: Render, Railway, or Fly.io work well for a free Express + MongoDB API. Set the same env vars there, and use a MongoDB Atlas free-tier cluster (don't use `localhost` in production).
- **Frontend**: keep using Vercel like before — just set `VITE_API_URL` to your deployed backend's URL in Vercel's project environment variables.

## API overview

| Method | Route                     | Auth required | Purpose                          |
|--------|----------------------------|----------------|-----------------------------------|
| POST   | /api/auth/signup           | No             | Create account                   |
| POST   | /api/auth/login            | No             | Log in                           |
| GET    | /api/auth/me               | Yes            | Get current user                 |
| GET    | /api/weather/geocode       | No             | City name -> coordinates         |
| GET    | /api/weather/current       | Optional       | Current weather (logs history if logged in) |
| GET    | /api/weather/history       | No             | Last 7 days of weather           |
| GET    | /api/favorites             | Yes            | List saved cities                |
| POST   | /api/favorites             | Yes            | Save a city                      |
| DELETE | /api/favorites/:id         | Yes            | Remove a saved city               |
| GET    | /api/favorites/history     | Yes            | Recent searches                  |

## Why Open-Meteo?
No signup, no API key, no rate-limit headaches while you're learning — and it has a genuine historical archive endpoint, which most free weather APIs don't offer. If you outgrow it later, swapping in OpenWeatherMap only means changing `weatherController.js`.
