// app/src/models/Habit.js
import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  
  // Completed Dates Array
  completedDates: { type: [String], default: [] }, 
  
  // Streak
  streak: { type: Number, default: 0 },
  
  // 👇 NEW: Logs Array (Journaling ke liye)
  logs: [{
    date: { type: String, required: true }, // Format: "yyyy-MM-dd"
    journal: { type: String, default: "" }
  }],

}, { timestamps: true });

export default mongoose.models.Habit || mongoose.model("Habit", HabitSchema);