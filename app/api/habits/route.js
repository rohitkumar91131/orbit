import { getServerSession } from "next-auth";
// googleapis import hata diya
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";
import HabitLog from "@/app/src/models/HabitLog";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  let habitData = {
    title: body.title,
    // Agar schema me time nahi hai to ye ignore ho jayenge
    startTime: body.startTime, 
    endTime: body.endTime,
  };

  // 1. AI Logic (Agar user ne prompt likha hai)
  if (body.prompt) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Calendar sync hata diya, bas Title aur Time mang rahe hain
      const prompt = `
Return ONLY valid JSON:
{
  "title": "string",
  "startTime": "HH:mm", 
  "endTime": "HH:mm"
}
Text: "${body.prompt}"
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      habitData = JSON.parse(text);
      
    } catch (error) {
      return Response.json(
        { error: "AI failed. Try manual entry." },
        { status: 500 }
      );
    }
  }

  // 2. Database Save (Google Calendar logic hata diya gaya hai)
  const habit = await Habit.create({
    userId: session.user.id,
    title: habitData.title,
    // Note: Agar tumhare Habit Schema me startTime/endTime nahi hai, 
    // to ye fields DB me save nahi honge (Strict Schema).
    startTime: habitData.startTime, 
    endTime: habitData.endTime,
    syncToCalendar: false, // Ab ye hamesha false rahega
    streak: 0
  });

  return Response.json(habit);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Lean queries are faster
  const habits = await Habit.find({ userId: session.user.id }).lean();
  const logs = await HabitLog.find({ userId: session.user.id }).lean();

  // Habits aur unke Logs ko merge karna
  const merged = habits.map(h => ({
    ...h,
    logs: logs.filter(
      l => l.habitId.toString() === h._id.toString()
    )
  }));

  return Response.json(merged);
}