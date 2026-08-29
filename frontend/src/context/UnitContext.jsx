import React, { createContext, useContext, useState, useEffect } from "react";

const UnitContext = createContext();

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState(() => localStorage.getItem("unit") || "C");

  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  const toggleUnit = () => setUnit((u) => (u === "C" ? "F" : "C"));

  // Conversion helpers
  const convertTemp = (celsius) => {
    if (unit === "F") return Math.round((celsius * 9) / 5 + 32);
    return Math.round(celsius);
  };

  const convertWind = (kmh) => {
    if (unit === "F") return Math.round(kmh * 0.621371); // mph
    return Math.round(kmh);
  };

  const tempUnit = unit === "C" ? "°C" : "°F";
  const windUnit = unit === "C" ? "km/h" : "mph";

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, convertTemp, convertWind, tempUnit, windUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
