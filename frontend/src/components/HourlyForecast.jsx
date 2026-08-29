import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { describeWeatherCode } from "../utils.js";
import { useUnit } from "../context/UnitContext.jsx";

export default function HourlyForecast({ hourly, hourly_units, timezone }) {
  const { convertTemp, convertWind, tempUnit, windUnit } = useUnit();

  if (!hourly || !hourly.time) return null;

  // Get next 24 hours from current time
  const now = new Date();
  const currentHour = now.getHours();

  const sliced = hourly.time
    .map((t, i) => ({
      time: t,
      temp: hourly.temperature_2m[i],
      precip: hourly.precipitation_probability[i],
      wind: hourly.wind_speed_10m[i],
      code: hourly.weather_code[i],
    }))
    .filter((_, i) => {
      const d = new Date(hourly.time[i]);
      return d >= now;
    })
    .slice(0, 24);

  const chartData = sliced.map((h) => ({
    label: new Date(h.time).toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
    temp: convertTemp(h.temp),
    precip: h.precip,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-temp">{payload[0]?.value}{tempUnit}</p>
          {payload[1] && <p className="tooltip-precip">💧 {payload[1].value}%</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="forecast-card">
      <h2 className="forecast-card__title">
        <span className="title-icon">🕐</span> 24-Hour Forecast
      </h2>

      {/* Scrollable hourly tiles */}
      <div className="hourly-scroll">
        {sliced.map((h, i) => {
          const { glyph } = describeWeatherCode(h.code);
          const t = new Date(h.time);
          const label = i === 0
            ? "Now"
            : t.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
          return (
            <div className="hourly-tile" key={h.time}>
              <span className="hourly-tile__time">{label}</span>
              <span className="hourly-tile__glyph">{glyph}</span>
              <span className="hourly-tile__temp">{convertTemp(h.temp)}{tempUnit}</span>
              <span className="hourly-tile__precip">💧 {h.precip ?? 0}%</span>
            </div>
          );
        })}
      </div>

      {/* Temperature sparkline */}
      <div className="forecast-chart-wrap">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2A93B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#F2A93B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5EC9F2" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#5EC9F2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#8C93AB" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={3} />
            <YAxis stroke="#8C93AB" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temp" stroke="#F2A93B" fill="url(#hourlyGrad)" strokeWidth={2} name="Temp" />
            <Area type="monotone" dataKey="precip" stroke="#5EC9F2" fill="url(#precipGrad)" strokeWidth={1.5} name="Rain %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
