import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    country: { type: String },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SearchHistory", searchHistorySchema);
