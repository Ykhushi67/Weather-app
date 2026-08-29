import React from "react";
import { describeWeatherCode } from "../utils.js";
import { useUnit } from "../context/UnitContext.jsx";

export default function DailyForecast({ daily, daily_units }) {
  const { convertTemp, tempUnit } = useUnit();

  if (!daily || !daily.time) return null;

  // Skip today (index 0), show next 7 days
  const days = daily.time.slice(1, 8).map((date, i) => {
    const idx = i + 1;
    return {
      date,
      max: daily.temperature_2m_max[idx],
      min: daily.temperature_2m_min[idx],
      precip: daily.precipitation_sum[idx] ?? 0,
      precipProb: daily.precipitation_probability_max[idx] ?? 0,
      code: daily.weather_code[idx],
      sunrise: daily.sunrise?.[idx],
      sunset: daily.sunset?.[idx],
      uvMax: daily.uv_index_max?.[idx],
    };
  });

  const globalMax = Math.max(...days.map((d) => d.max));
  const globalMin = Math.min(...days.map((d) => d.min));
  const range = globalMax - globalMin || 1;

  return (
    <section className="forecast-card">
      <h2 className="forecast-card__title">
        <span className="title-icon">📅</span> 7-Day Forecast
      </h2>

      <div className="daily-list">
        {days.map((d) => {
          const { glyph, label } = describeWeatherCode(d.code);
          const dayLabel = new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          const sunriseTime = d.sunrise ? new Date(d.sunrise).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : null;
          const sunsetTime = d.sunset ? new Date(d.sunset).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : null;

          // Bar widths for min-max range visualization
          const minOffset = ((convertTemp(d.min) - convertTemp(globalMin)) / (convertTemp(globalMax) - convertTemp(globalMin) || 1)) * 100;
          const barWidth = ((convertTemp(d.max) - convertTemp(d.min)) / (convertTemp(globalMax) - convertTemp(globalMin) || 1)) * 100;

          return (
            <div className="daily-row" key={d.date}>
              <div className="daily-row__day">{dayLabel}</div>
              <div className="daily-row__glyph" title={label}>{glyph}</div>
              <div className="daily-row__precip">
                {d.precipProb > 0 && <span className="precip-badge">💧 {d.precipProb}%</span>}
              </div>
              <div className="daily-row__temp-min">{convertTemp(d.min)}{tempUnit}</div>
              <div className="daily-row__bar-wrap">
                <div
                  className="daily-row__bar"
                  style={{ marginLeft: `${Math.max(0, minOffset)}%`, width: `${Math.max(4, barWidth)}%` }}
                />
              </div>
              <div className="daily-row__temp-max">{convertTemp(d.max)}{tempUnit}</div>
              {sunriseTime && (
                <div className="daily-row__sun">
                  <span title="Sunrise">🌅 {sunriseTime}</span>
                  <span title="Sunset">🌇 {sunsetTime}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
