import express from "express";
import {
  geocodeCity,
  getCurrentWeather,
  getWeatherHistory,
  getAirQuality,
  reverseGeocode,
  compareCities,
} from "../controllers/weatherController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/geocode", geocodeCity);
router.get("/reverse-geocode", reverseGeocode);
router.get("/current", optionalAuth, getCurrentWeather);
router.get("/history", getWeatherHistory);
router.get("/air-quality", getAirQuality);
router.get("/compare", compareCities);

export default router;
