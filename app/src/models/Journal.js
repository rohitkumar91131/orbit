import mongoose from "mongoose";

const JournalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, 
    required: true,
  },
  content: {
    type: String, 
    default: "",
  },
  mood: {
    type: String, 
    default: "Neutral"
  }
}, { timestamps: true });

JournalSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Journal || mongoose.model("Journal", JournalSchema);