import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const title = body.title || "Unknown Habit";
    const streak = Number(body.streak) || 0;
    const completedDates = Array.isArray(body.completedDates)
      ? body.completedDates
      : [];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a friendly habit coach.

Habit: ${title}
Current streak: ${streak} days
Total completions: ${completedDates.length}

Give 2 short motivating lines in Hinglish.
No emojis. Real human tone.
              `
            }
          ]
        }
      ]
    });

    const response = result.response;

    return Response.json({
      review: response.text(),
      raw: response
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
