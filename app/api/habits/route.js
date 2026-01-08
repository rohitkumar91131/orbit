import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Path fixed using @ alias
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit"; 

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
    // 1. Create Habit (Updated Schema ke hisab se)
    const habit = await Habit.create({
      userId: session.user.id,
      title: body.title,
      completedDates: [], // Default empty
      logs: [],           // Default empty
      streak: 0           // Default 0
    });

    return Response.json(habit);
  } catch (error) {
    console.error("Create Habit Error:", error);
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
    // Kyunki ab sara data (logs, completedDates) Habit model ke andar hi hai,
    // Humein koi complex Join/Lookup karne ki zaroorat nahi hai.
    const habits = await Habit.find({ userId: session.user.id })
      .sort({ createdAt: -1 }); // Newest habits top par

    return Response.json(habits);
  } catch (error) {
    console.error("Fetch Habit Error:", error);
    return Response.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}