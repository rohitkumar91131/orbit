import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { title, streak, completedDates } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `A user is tracking a habit called "${title}". 
    Current streak: ${streak} days. 
    Total completions: ${completedDates.length}. 
    Give a short, motivating 2-line feedback in Hinglish (Hindi + English) like a friendly coach.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return Response.json({ review: response.text() });
}