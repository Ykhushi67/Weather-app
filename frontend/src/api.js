const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const api = {
  // --- Auth ---
  signup: (name, email, password) =>
    fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).then(handle),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  forgotPassword: (email) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then(handle),

  resetPassword: (token, newPassword) =>
    fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    }).then(handle),

  // --- Weather ---
  geocodeCity: (city) =>
    fetch(`${BASE_URL}/weather/geocode?city=${encodeURIComponent(city)}`).then(handle),

  getCurrentWeather: (lat, lon, city, country) =>
    fetch(
      `${BASE_URL}/weather/current?lat=${lat}&lon=${lon}&city=${encodeURIComponent(
        city || ""
      )}&country=${encodeURIComponent(country || "")}`,
      { headers: authHeaders() }
    ).then(handle),

  getWeatherHistory: (lat, lon) =>
    fetch(`${BASE_URL}/weather/history?lat=${lat}&lon=${lon}`).then(handle),

  // --- Favorites ---
  getFavorites: () =>
    fetch(`${BASE_URL}/favorites`, { headers: authHeaders() }).then(handle),

  addFavorite: (city, country, lat, lon) =>
    fetch(`${BASE_URL}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ city, country, lat, lon }),
    }).then(handle),

  removeFavorite: (id) =>
    fetch(`${BASE_URL}/favorites/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle),

  getSearchHistory: () =>
    fetch(`${BASE_URL}/favorites/history`, { headers: authHeaders() }).then(handle),
};
