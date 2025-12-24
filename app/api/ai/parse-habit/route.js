import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt: userPrompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ success: false, error: "API Key missing!" });
    }

    // FIX: 2025 Latest Model Path
    // "gemini-1.5-flash" hi chalega, pro versions beta mein issue dete hain
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a habit parser. 
      Extract habit from: "${userPrompt}". 
      Return ONLY a JSON object: {"title": "string", "startTime": "HH:mm", "endTime": "HH:mm"}
      No markdown, no talk.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Safety check for JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    return Response.json({ success: true, habit: JSON.parse(jsonMatch[0]) });

  } catch (error) {
    console.error("SDK Error Details:", error);
    return Response.json({ 
      success: false, 
      error: "AI SDK Issue", 
      details: error.message 
    });
  }
}