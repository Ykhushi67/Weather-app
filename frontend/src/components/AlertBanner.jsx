import React from "react";

// Codes considered severe enough to call out: thunderstorms, violent showers,
// heavy snow. Based on WMO weather codes returned by Open-Meteo.
const SEVERE_CODES = {
  65: "Heavy rain is falling right now — possible local flooding.",
  75: "Heavy snowfall is happening right now.",
  82: "Violent rain showers right now — stay alert for flooding.",
  95: "Thunderstorm in progress — stay indoors if possible.",
  96: "Thunderstorm with hail in progress.",
  99: "Severe thunderstorm with hail in progress.",
};

export default function AlertBanner({ weatherCode }) {
  const message = SEVERE_CODES[weatherCode];
  if (!message) return null;

  return (
    <div className="alert-banner">
      <span className="alert-banner__icon">⚠</span>
      <span>{message}</span>
    </div>
  );
}
