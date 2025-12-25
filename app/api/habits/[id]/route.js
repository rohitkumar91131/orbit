import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";
import HabitLog from "@/app/src/models/HabitLog";

// DELETE Habit
export async function DELETE(req, props) {
  const params = await props.params; // Next.js 15 fix
  const habitId = params.id;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Delete all logs associated with this habit (Cleanup)
    await HabitLog.deleteMany({ habitId: habitId, userId: session.user.id });

    // 2. Delete the Habit itself
    const deletedHabit = await Habit.findOneAndDelete({ 
        _id: habitId, 
        userId: session.user.id 
    });

    if (!deletedHabit) {
      return Response.json({ error: "Habit not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Habit deleted successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    return Response.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}

// PUT/Update Habit (Agar pehle se nahi hai to ye bhi add kar lo)
export async function PUT(req, props) {
    const params = await props.params;
    const habitId = params.id;
    // ... Update logic here if needed
}