import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit"; // Ensure path matches your folder structure

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();

  // Simple Validation
  if (!body.title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    // 1. Create Simple Habit
    // No startTime, No endTime, No AI
    const habit = await Habit.create({
      userId: session.user.id,
      title: body.title,
      completedDates: [] // Shuru mein khali rahega
    });

    return Response.json(habit);
  } catch (error) {
    return Response.json({ error: "Failed to create habit" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    // 2. Fetch Habits
    // HabitLog merge karne ki zaroorat nahi, data ab 'completedDates' array mein hai
    const habits = await Habit.find({ userId: session.user.id })
      .sort({ createdAt: -1 }); // Newest first

    return Response.json(habits);
  } catch (error) {
    return Response.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}