import React from "react";

function getAqiMeta(aqi) {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", advice: "Air quality is great. Enjoy outdoor activities!", outdoor: "✅ Safe to go outdoors" };
  if (aqi <= 100) return { label: "Moderate", color: "#eab308", advice: "Unusually sensitive people should limit prolonged exertion.", outdoor: "⚠️ Sensitive groups should limit outdoor exertion" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#f97316", advice: "Wear a mask if sensitive. Reduce outdoor activities.", outdoor: "😷 Mask advised for sensitive groups" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444", advice: "Everyone should limit outdoor exertion. Wear a mask.", outdoor: "😷 Mask advised for everyone" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7", advice: "Avoid outdoor activity. Keep windows closed.", outdoor: "🚫 Avoid outdoor activities" };
  return { label: "Hazardous", color: "#7f1d1d", advice: "Emergency conditions. Stay indoors.", outdoor: "🚨 Stay indoors — emergency" };
}

function getUvMeta(uv) {
  if (uv <= 2) return { label: "Low", color: "#22c55e", advice: "No protection needed" };
  if (uv <= 5) return { label: "Moderate", color: "#eab308", advice: "Wear sunscreen SPF 30+" };
  if (uv <= 7) return { label: "High", color: "#f97316", advice: "Sunscreen, hat, and sunglasses essential" };
  if (uv <= 10) return { label: "Very High", color: "#ef4444", advice: "Avoid sun 10am–4pm. Full protection needed." };
  return { label: "Extreme", color: "#7f1d1d", advice: "Stay indoors during peak hours" };
}

function GaugeMeter({ value, max, color, label }) {
  const pct = Math.min((value / max) * 100, 100);
  const angle = (pct / 100) * 180;
  const r = 45;
  const cx = 60, cy = 60;
  const x = cx + r * Math.cos(((180 + angle) * Math.PI) / 180);
  const y = cy + r * Math.sin(((180 + angle) * Math.PI) / 180);

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 120 70" className="gauge-svg">
        <path d="M 15 60 A 45 45 0 0 1 105 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
        <path
          d={`M 15 60 A 45 45 0 ${angle > 90 ? 1 : 0} 1 ${x} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{Math.round(value)}</text>
      </svg>
      <div className="gauge-label" style={{ color }}>{label}</div>
    </div>
  );
}

function PollutantBar({ name, value, unit, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="pollutant-row">
      <div className="pollutant-row__name">{name}</div>
      <div className="pollutant-row__bar-wrap">
        <div className="pollutant-row__bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="pollutant-row__value">{value != null ? value.toFixed(1) : "—"} <span>{unit}</span></div>
    </div>
  );
}

export default function AirQualityCard({ aqiData }) {
  if (!aqiData || !aqiData.current) return null;

  const c = aqiData.current;
  const usAqi = c.us_aqi ?? 0;
  const euAqi = c.european_aqi ?? 0;
  const uv = c.uv_index ?? 0;

  const { label: aqiLabel, color: aqiColor, advice, outdoor } = getAqiMeta(usAqi);
  const { label: uvLabel, color: uvColor, advice: uvAdvice } = getUvMeta(uv);

  return (
    <section className="forecast-card aqi-card">
      <h2 className="forecast-card__title">
        <span className="title-icon">🌬️</span> Air Quality & UV Index
      </h2>

      <div className="aqi-top">
        <div className="aqi-gauge-group">
          <div className="aqi-gauge-item">
            <p className="gauge-subtitle">US AQI</p>
            <GaugeMeter value={usAqi} max={300} color={aqiColor} label={aqiLabel} />
          </div>
          <div className="aqi-gauge-item">
            <p className="gauge-subtitle">European AQI</p>
            <GaugeMeter value={euAqi} max={100} color={aqiColor} label={aqiLabel} />
          </div>
          <div className="aqi-gauge-item">
            <p className="gauge-subtitle">UV Index</p>
            <GaugeMeter value={uv} max={12} color={uvColor} label={uvLabel} />
          </div>
        </div>

        <div className="aqi-advice">
          <div className="advice-box" style={{ borderColor: aqiColor }}>
            <span className="advice-box__icon">🏃</span>
            <div>
              <div className="advice-box__title">Outdoor Activity</div>
              <div className="advice-box__text">{outdoor}</div>
            </div>
          </div>
          <div className="advice-box" style={{ borderColor: uvColor }}>
            <span className="advice-box__icon">☀️</span>
            <div>
              <div className="advice-box__title">Sun Protection</div>
              <div className="advice-box__text">{uvAdvice}</div>
            </div>
          </div>
          <div className="advice-box" style={{ borderColor: aqiColor }}>
            <span className="advice-box__icon">💨</span>
            <div>
              <div className="advice-box__title">Air Quality</div>
              <div className="advice-box__text">{advice}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pollutants-section">
        <h3 className="pollutants-title">Pollutant Breakdown</h3>
        <div className="pollutants-grid">
          <PollutantBar name="PM₂.₅" value={c.pm2_5} unit="μg/m³" max={150} color="#f97316" />
          <PollutantBar name="PM₁₀" value={c.pm10} unit="μg/m³" max={200} color="#eab308" />
          <PollutantBar name="NO₂" value={c.nitrogen_dioxide} unit="μg/m³" max={200} color="#a855f7" />
          <PollutantBar name="O₃" value={c.ozone} unit="μg/m³" max={180} color="#5EC9F2" />
          <PollutantBar name="SO₂" value={c.sulphur_dioxide} unit="μg/m³" max={350} color="#ef4444" />
          <PollutantBar name="CO" value={c.carbon_monoxide} unit="μg/m³" max={10000} color="#22c55e" />
        </div>
      </div>
    </section>
  );
}
