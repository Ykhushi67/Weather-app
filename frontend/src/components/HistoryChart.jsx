import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDay } from "../utils.js";

export default function HistoryChart({ history }) {
  if (!history || !history.time) return null;

  const data = history.time.map((date, i) => ({
    day: formatDay(date),
    max: Math.round(history.temperature_2m_max[i]),
    min: Math.round(history.temperature_2m_min[i]),
  }));

  return (
    <section className="history">
      <h2 className="history__title">Last 7 days</h2>
      <div className="history__chart">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B5E" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF6B5E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5EC9F2" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#5EC9F2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="day" stroke="#8C93AB" tickLine={false} axisLine={false} />
            <YAxis stroke="#8C93AB" tickLine={false} axisLine={false} width={36} />
            <Tooltip
              contentStyle={{
                background: "#1B2340",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#ECEFF6",
              }}
            />
            <Area type="monotone" dataKey="max" stroke="#FF6B5E" fill="url(#maxGradient)" strokeWidth={2} name="High" />
            <Area type="monotone" dataKey="min" stroke="#5EC9F2" fill="url(#minGradient)" strokeWidth={2} name="Low" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="history__legend">
        <span><i className="dot dot--max" /> High</span>
        <span><i className="dot dot--min" /> Low</span>
      </div>
    </section>
  );
}
