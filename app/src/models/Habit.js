import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true, 
  },
  completedDates: {
    type: [String], 
    default: [],
  }
}, { timestamps: true });

export default mongoose.models.Habit || mongoose.model("Habit", HabitSchema);