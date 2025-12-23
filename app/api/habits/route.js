import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/app/lib/db";
import Habit from "@/app/src/models/Habit";


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();

    const userId = session.user.id;

    const newHabit = await Habit.create({
      userId: userId,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      syncToCalendar: data.syncToCalendar,
      completedDates: [],
      streak: 0
    });

    // Google Calendar Sync Logic
    if (data.syncToCalendar && session.accessToken) {
      try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: session.accessToken });
        const calendar = google.calendar({ version: "v3", auth });

        const today = new Date().toISOString().split("T")[0];

        await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary: data.title,
            description: "Habit tracked by Orbit App",
            start: { dateTime: `${today}T${data.startTime}:00Z` },
            end: { dateTime: `${today}T${data.endTime}:00Z` },
          },
        });
      } catch (calError) {
        console.error("Calendar Sync Failed:", calError.message);
        // Habit save ho gayi hai, calendar fail hone par bhi response bhejenge
      }
    }

    return Response.json(newHabit);
  } catch (error) {
    console.error("POST API ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const habits = await Habit.find({ userId: session.user.id });
    
    return Response.json(habits);
  } catch (error) {
    console.error("GET API ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}