export async function POST(req) {
  try {
    const body = await req.json()

    const title = body.title || "Habit"
    const streak = Number(body.streak) || 0

    let situation = "Encourage them to keep going."
    if (streak === 0) {
      situation = "User has broken the streak or is just starting. Tell them it's okay to restart today. Don't be rude."
    } else if (streak > 5) {
      situation = "User is on a roll! Highly praise their consistency."
    }

    const prompt = `
Act as a supportive Indian friend (Desi friend).

User's Habit: "${title}"
Current Streak: ${streak} days.
Situation: ${situation}

Task: Write a very short, punchy motivation line in Hinglish.
Tone: Casual, real, best-friend type.

Constraints:
1. Max 2 sentences.
2. NO emojis.
3. Daily spoken language only.
    `.trim()

    const apiKey = process.env.GEMINI_API_KEY

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    )

    const data = await res.json()

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Aaj se dubara shuru kar, bas wahi kaafi hai."

    return Response.json({ review: text })
  } catch (err) {
    console.error(err)
    return Response.json(
      { error: "Failed to generate motivation." },
      { status: 500 }
    )
  }
}
