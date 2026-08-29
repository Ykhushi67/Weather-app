import React, { useRef } from "react";
import { describeWeatherCode } from "../utils.js";
import { useUnit } from "../context/UnitContext.jsx";

export default function ReportModal({ place, weather, aqiData, history, onClose }) {
  const reportRef = useRef();
  const { convertTemp, tempUnit } = useUnit();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#10172A",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `skyline-weather-${place?.name || "report"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  if (!weather || !place) return null;
  const c = weather.current;
  const u = weather.units;
  const { label, glyph } = describeWeatherCode(c.weather_code);
  const now = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });
  const usAqi = aqiData?.current?.us_aqi;

  const getAqiLabel = (aqi) => {
    if (!aqi) return "—";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    return "Very Unhealthy";
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="report-modal-wrap">
        <div className="report-modal-actions">
          <button className="btn btn--primary" onClick={handleDownload}>⬇ Download PNG</button>
          <button className="btn btn--ghost" onClick={handlePrint}>🖨 Print</button>
          <button className="btn btn--ghost" onClick={onClose}>✕ Close</button>
        </div>

        <div className="report-card" ref={reportRef}>
          {/* Header */}
          <div className="report-header">
            <div className="report-brand">⛅ Skyline Weather Report</div>
            <div className="report-date">{now}</div>
          </div>

          {/* Location & Main Temp */}
          <div className="report-hero">
            <div>
              <h1 className="report-city">{place.name}</h1>
              {place.country && <p className="report-country">{place.country}</p>}
            </div>
            <div className="report-temp-block">
              <span className="report-glyph">{glyph}</span>
              <span className="report-temp">{convertTemp(c.temperature_2m)}{tempUnit}</span>
            </div>
          </div>
          <p className="report-condition">{label}</p>

          {/* Stats Grid */}
          <div className="report-stats-grid">
            <div className="report-stat"><span>{convertTemp(c.apparent_temperature)}{tempUnit}</span><small>Feels Like</small></div>
            <div className="report-stat"><span>{c.relative_humidity_2m}%</span><small>Humidity</small></div>
            <div className="report-stat"><span>{Math.round(c.wind_speed_10m)} {u.wind_speed_10m}</span><small>Wind</small></div>
            <div className="report-stat"><span>{Math.round(c.pressure_msl)} hPa</span><small>Pressure</small></div>
            <div className="report-stat"><span>{(c.visibility / 1000).toFixed(1)} km</span><small>Visibility</small></div>
            <div className="report-stat"><span>{c.uv_index ?? "—"}</span><small>UV Index</small></div>
            <div className="report-stat"><span>{c.cloud_cover ?? "—"}%</span><small>Cloud Cover</small></div>
            {usAqi != null && (
              <div className="report-stat"><span>{usAqi}</span><small>US AQI ({getAqiLabel(usAqi)})</small></div>
            )}
          </div>

          {/* 7-day Summary */}
          {weather.daily && weather.daily.time && (
            <div className="report-daily">
              <h3 className="report-section-title">7-Day Outlook</h3>
              <div className="report-daily-row">
                {weather.daily.time.slice(1, 8).map((date, i) => {
                  const idx = i + 1;
                  const { glyph: dg } = describeWeatherCode(weather.daily.weather_code[idx]);
                  return (
                    <div className="report-day" key={date}>
                      <div className="report-day__name">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="report-day__glyph">{dg}</div>
                      <div className="report-day__range">
                        <span style={{ color: "#FF6B5E" }}>{convertTemp(weather.daily.temperature_2m_max[idx])}</span>
                        <span style={{ color: "#8C93AB" }}>/</span>
                        <span style={{ color: "#5EC9F2" }}>{convertTemp(weather.daily.temperature_2m_min[idx])}</span>
                        <span style={{ fontSize: "0.7rem" }}>{tempUnit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="report-footer">Generated by Skyline — skyline.weather</div>
        </div>
      </div>
    </div>
  );
}
