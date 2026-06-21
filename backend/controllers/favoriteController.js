import Favorite from "../models/Favorite.js";
import SearchHistory from "../models/SearchHistory.js";

// GET /api/favorites
export const getFavorites = async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(favorites);
};

// POST /api/favorites
export const addFavorite = async (req, res) => {
  try {
    const { city, country, lat, lon } = req.body;
    if (!city || lat === undefined || lon === undefined) {
      return res.status(400).json({ message: "city, lat and lon are required" });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      city,
      country,
      lat,
      lon,
    });

    res.status(201).json(favorite);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This city is already in your favorites" });
    }
    res.status(500).json({ message: "Failed to add favorite", error: err.message });
  }
};

// DELETE /api/favorites/:id
export const removeFavorite = async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!favorite) return res.status(404).json({ message: "Favorite not found" });

  res.json({ message: "Removed from favorites" });
};

// GET /api/favorites/history
export const getHistoryList = async (req, res) => {
  const history = await SearchHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(history);
};
