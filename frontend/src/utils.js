// WMO weather codes -> human label + a simple glyph (kept text-based, no icon library needed)
const WEATHER_CODES = {
  0: { label: "Clear sky", glyph: "☀" },
  1: { label: "Mostly clear", glyph: "🌤" },
  2: { label: "Partly cloudy", glyph: "⛅" },
  3: { label: "Overcast", glyph: "☁" },
  45: { label: "Foggy", glyph: "🌫" },
  48: { label: "Freezing fog", glyph: "🌫" },
  51: { label: "Light drizzle", glyph: "🌦" },
  53: { label: "Drizzle", glyph: "🌦" },
  55: { label: "Heavy drizzle", glyph: "🌧" },
  61: { label: "Light rain", glyph: "🌧" },
  63: { label: "Rain", glyph: "🌧" },
  65: { label: "Heavy rain", glyph: "🌧" },
  71: { label: "Light snow", glyph: "🌨" },
  73: { label: "Snow", glyph: "🌨" },
  75: { label: "Heavy snow", glyph: "❄" },
  80: { label: "Rain showers", glyph: "🌦" },
  81: { label: "Rain showers", glyph: "🌧" },
  82: { label: "Violent showers", glyph: "⛈" },
  95: { label: "Thunderstorm", glyph: "⛈" },
  96: { label: "Thunderstorm, hail", glyph: "⛈" },
  99: { label: "Thunderstorm, hail", glyph: "⛈" },
};

export function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { label: "Unknown", glyph: "—" };
}

// Picks a sky "mood" for the backdrop based on local hour (0-23)
export function skyMoodForHour(hour) {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

export function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
