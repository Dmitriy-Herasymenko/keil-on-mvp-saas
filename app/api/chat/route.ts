import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Ти - корисний голосовий асистент. ВАЖЛИВО:
1. Завжди відповідай українською мовою, незалежно від мови запитання
2. Відповідай коротко та зрозуміло (1-3 речення)
3. Будь дружелюбним та ввічливим
4. Якщо не розумієш питання - попроси повторити`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Add system prompt as first message
    const messagesWithSystem = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return NextResponse.json({
      message: response.choices[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Groq" },
      { status: 500 }
    );
  }
}
