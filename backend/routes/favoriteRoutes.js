import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getHistoryList,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.delete("/:id", protect, removeFavorite);
router.get("/history", protect, getHistoryList);

export default router;
