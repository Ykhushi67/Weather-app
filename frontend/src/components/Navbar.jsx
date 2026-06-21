import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__glyph">⛅</span>
        <span className="navbar__name">Skyline</span>
      </div>

      <div className="navbar__actions">
        {user ? (
          <>
            <span className="navbar__greeting">Hi, {user.name.split(" ")[0]}</span>
            <button className="btn btn--ghost" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <button className="btn btn--ghost" onClick={onAuthClick}>
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
