import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit"; // Streak update ke liye
import { differenceInDays, parseISO } from "date-fns"; // Streak calculation ke liye
import HabitLog from "@/app/src/models/HabitLog";

export async function PATCH(req, props) {
  const params = await props.params; // Next.js 15 requirement
  const habitId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { date, journal } = await req.json();

    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    // Upsert logic: Find and update, or create new
    const log = await HabitLog.findOneAndUpdate(
      {
        userId: session.user.id,
        habitId: habitId,
        date: date,
      },
      {
        $set: { journal: journal }
      },
      {
        new: true,   // Return updated document
        upsert: true, // Create if not exists
        setDefaultsOnInsert: true
      }
    );

    return Response.json({ success: true, log });

  } catch (error) {
    console.error("Journal Save Error:", error);
    return Response.json({ error: "Failed to save journal" }, { status: 500 });
  }
}



export async function DELETE(req, props) {
  const params = await props.params;
  const habitId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { date } = await req.json(); // Body se date lo

    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    // 1. Log Delete karo
    const deletedLog = await HabitLog.findOneAndDelete({
      userId: session.user.id,
      habitId: habitId,
      date: date,
    });

    if (!deletedLog) {
      return Response.json({ message: "No log found to delete" });
    }

    // 2. STREAK RECALCULATE (Zaroori hai kyunki log delete hone se streak toot sakti hai)
    // Same logic jo Toggle API me tha
    const allLogs = await HabitLog.find({
      userId: session.user.id,
      habitId: habitId,
      completed: true,
    }).sort({ date: -1 }).lean();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (allLogs.length > 0) {
        const latestLogDate = parseISO(allLogs[0].date);
        const diffFromToday = differenceInDays(today, latestLogDate);

        if (diffFromToday <= 1) {
            streak = 1; 
            for (let i = 0; i < allLogs.length - 1; i++) {
                const current = parseISO(allLogs[i].date);
                const previous = parseISO(allLogs[i + 1].date);
                if (differenceInDays(current, previous) === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    // Update Parent Habit
    await Habit.findByIdAndUpdate(habitId, { streak: streak });

    return Response.json({ success: true, newStreak: streak });

  } catch (error) {
    console.error("Delete Log Error:", error);
    return Response.json({ error: "Failed to delete log" }, { status: 500 });
  }
}