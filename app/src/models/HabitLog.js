import mongoose from "mongoose";

const HabitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  journal: {
    type: String,
    default: "",
  },
  aiInsight: {
    type: String,
    default: "",
  },
  mood: {
    type: String,
    enum: ["Happy", "Sad", "Tired", "Energetic", "Neutral"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitLog || mongoose.model("HabitLog", HabitLogSchema);
