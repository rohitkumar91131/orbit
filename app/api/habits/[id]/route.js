import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";
import { format, subDays, differenceInDays, parseISO } from "date-fns";

// HELPER: Streak Calculate karne ke liye
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  // Dates ko Newest First sort karein
  const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
  
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const latest = sorted[0];

  // Agar latest entry aaj ya kal ki nahi hai, to streak toot gayi
  if (latest !== todayStr && latest !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = parseISO(sorted[i]);
    const next = parseISO(sorted[i + 1]);
    const diff = differenceInDays(current, next);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// 1. PATCH: Toggle Habit (Check/Uncheck)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params; // Next.js 15 fix
    const { date } = await req.json(); // "yyyy-MM-dd"

    await connectDB();
    
    const habit = await Habit.findOne({ _id: id, userId: session.user.id });
    if (!habit) return Response.json({ error: "Not found" }, { status: 404 });

    // Toggle Logic
    const exists = habit.completedDates.includes(date);
    let updatedDates = [...habit.completedDates];

    if (exists) {
      updatedDates = updatedDates.filter(d => d !== date);
    } else {
      updatedDates.push(date);
    }

    // Update Streak
    const newStreak = calculateStreak(updatedDates);

    // Save to DB
    habit.completedDates = updatedDates;
    habit.streak = newStreak;
    await habit.save();

    return Response.json({ 
      success: true, 
      completedDates: updatedDates, 
      newStreak 
    });

  } catch (error) {
    console.error("Toggle Error:", error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. DELETE: Habit Delete karne ke liye
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    
    await Habit.deleteOne({ _id: id, userId: session.user.id });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Delete Failed" }, { status: 500 });
  }
}