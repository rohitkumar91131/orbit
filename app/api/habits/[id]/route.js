import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";
import { differenceInDays, parseISO, subDays, format } from "date-fns";

// --- HELPER: Streak Calculation (Code reuse) ---
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const latest = sorted[0];

  if (latest !== todayStr && latest !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = parseISO(sorted[i]);
    const next = parseISO(sorted[i + 1]);
    const diff = differenceInDays(current, next);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// 1. PATCH: Save Journal Entry
export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const habitId = params.id;
    const { date, journal } = await req.json(); // { date: "2024-01-01", journal: "..." }

    await connectDB();

    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id });
    if (!habit) return Response.json({ error: "Not found" }, { status: 404 });

    // Check if log exists for this date
    const existingLogIndex = habit.logs.findIndex(l => l.date === date);

    if (existingLogIndex > -1) {
      // Update existing
      habit.logs[existingLogIndex].journal = journal;
    } else {
      // Create new
      habit.logs.push({ date, journal });
    }

    // Optional: Agar journal likha hai to usse "Completed" maan lena chahiye ya nahi?
    // Usually log likhna alag hota hai, par agar aap chahte hain ki journal save karne par tick bhi lag jaye:
    // if (!habit.completedDates.includes(date)) {
    //    habit.completedDates.push(date);
    //    habit.streak = calculateStreak(habit.completedDates);
    // }

    await habit.save();

    // Return the updated log entry
    const updatedLog = habit.logs.find(l => l.date === date);

    return Response.json({ success: true, log: updatedLog });

  } catch (error) {
    console.error("Journal Save Error:", error);
    return Response.json({ error: "Failed to save journal" }, { status: 500 });
  }
}

// 2. DELETE: Reset Data for Specific Day (Uncheck & Delete Journal)
export async function DELETE(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const habitId = params.id;
    const { date } = await req.json(); // { date: "2024-01-01" }

    await connectDB();

    const habit = await Habit.findOne({ _id: habitId, userId: session.user.id });
    if (!habit) return Response.json({ error: "Not found" }, { status: 404 });

    // 1. Remove Log
    habit.logs = habit.logs.filter(l => l.date !== date);

    // 2. Remove from Completed Dates (Uncheck)
    habit.completedDates = habit.completedDates.filter(d => d !== date);

    // 3. Recalculate Streak
    habit.streak = calculateStreak(habit.completedDates);

    await habit.save();

    return Response.json({ 
      success: true, 
      newStreak: habit.streak,
      message: "Data cleared for this date" 
    });

  } catch (error) {
    console.error("Delete Log Error:", error);
    return Response.json({ error: "Failed to delete log" }, { status: 500 });
  }
}