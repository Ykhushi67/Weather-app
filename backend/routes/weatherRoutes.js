import express from "express";
import { geocodeCity, getCurrentWeather, getWeatherHistory } from "../controllers/weatherController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/geocode", geocodeCity);
router.get("/current", optionalAuth, getCurrentWeather);
router.get("/history", getWeatherHistory);

export default router;
