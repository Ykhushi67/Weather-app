import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUnit } from "../context/UnitContext.jsx";

export default function Navbar({ onAuthClick, activeView, onViewChange }) {
  const { user, logout } = useAuth();
  const { unit, toggleUnit } = useUnit();

  const views = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "map", label: "🗺 Map" },
    { key: "compare", label: "⚖️ Compare" },
  ];

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__glyph">⛅</span>
        <span className="navbar__name">Skyline</span>
      </div>

      {/* View Tabs */}
      <nav className="navbar__tabs">
        {views.map((v) => (
          <button
            key={v.key}
            className={`navbar__tab ${activeView === v.key ? "is-active" : ""}`}
            onClick={() => onViewChange(v.key)}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div className="navbar__actions">
        {/* Unit Toggle */}
        <button className="unit-toggle" onClick={toggleUnit} title="Toggle temperature unit">
          <span className={unit === "C" ? "unit-toggle__opt is-active" : "unit-toggle__opt"}>°C</span>
          <span className="unit-toggle__divider">|</span>
          <span className={unit === "F" ? "unit-toggle__opt is-active" : "unit-toggle__opt"}>°F</span>
        </button>

        {user ? (
          <>
            <span className="navbar__greeting">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn btn--ghost" onClick={logout}>Log out</button>
          </>
        ) : (
          <button className="btn btn--ghost" onClick={onAuthClick}>Log in</button>
        )}
      </div>
    </header>
  );
}
