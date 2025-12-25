import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";
import HabitLog from "@/app/src/models/HabitLog";
import { differenceInDays, parseISO } from "date-fns";

export async function PATCH(req, props) {
  // 1. Fix for Next.js 15: params ko await karna padta hai
  const params = await props.params;
  const habitId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { date } = await req.json(); // Expected format: "YYYY-MM-DD"

    if (!date) {
      return Response.json({ error: "Date is required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check karo ki habitId valid hai ya nahi
    if (!habitId) {
      return Response.json({ error: "Habit ID missing" }, { status: 400 });
    }

    // 1. Check if Log exists for this date
    let log = await HabitLog.findOne({
      userId,
      habitId,
      date,
    });

    if (log) {
      // Agar log hai, to status flip kar do
      log.completed = !log.completed;
      await log.save();
    } else {
      // Agar log nahi hai, to naya banao
      log = await HabitLog.create({
        userId,
        habitId, // Ab ye undefined nahi hoga
        date,
        completed: true,
      });
    }

    // 2. RECALCULATE STREAK
    const allLogs = await HabitLog.find({
      userId,
      habitId,
      completed: true,
    })
    .sort({ date: -1 })
    .lean();

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
                
                const diff = differenceInDays(current, previous);

                if (diff === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    // 3. Update Parent Habit
    await Habit.findByIdAndUpdate(
      habitId,
      { streak: streak },
      { new: true }
    );

    return Response.json({ 
      success: true, 
      log, 
      newStreak: streak 
    });

  } catch (error) {
    console.error("Toggle Error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}