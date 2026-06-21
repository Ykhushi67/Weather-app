import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    country: { type: String },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent the same user from saving the exact same city twice
favoriteSchema.index({ user: 1, city: 1, lat: 1, lon: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
