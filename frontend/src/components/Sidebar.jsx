import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({ onSelectPlace, refreshKey }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.getFavorites().then(setFavorites).catch(() => {});
    api.getSearchHistory().then(setHistory).catch(() => {});
  }, [user, refreshKey]);

  const removeFavorite = async (id) => {
    await api.removeFavorite(id);
    setFavorites((prev) => prev.filter((f) => f._id !== id));
  };

  if (!user) {
    return (
      <aside className="sidebar sidebar--locked">
        <p>Log in to save favorite cities and keep a search history.</p>
      </aside>
    );
  }

  const list = tab === "favorites" ? favorites : history;

  return (
    <aside className="sidebar">
      <div className="sidebar__tabs">
        <button
          className={tab === "favorites" ? "is-active" : ""}
          onClick={() => setTab("favorites")}
        >
          Favorites
        </button>
        <button
          className={tab === "history" ? "is-active" : ""}
          onClick={() => setTab("history")}
        >
          Recent
        </button>
      </div>

      {list.length === 0 ? (
        <p className="sidebar__empty">
          {tab === "favorites" ? "No saved cities yet." : "No searches yet."}
        </p>
      ) : (
        <ul className="sidebar__list">
          {list.map((item) => (
            <li key={item._id}>
              <button
                className="sidebar__item"
                onClick={() => onSelectPlace({ name: item.city, country: item.country, lat: item.lat, lon: item.lon })}
              >
                <span className="sidebar__city">{item.city}</span>
                <span className="sidebar__country">{item.country}</span>
              </button>
              {tab === "favorites" && (
                <button className="sidebar__remove" onClick={() => removeFavorite(item._id)} title="Remove">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
