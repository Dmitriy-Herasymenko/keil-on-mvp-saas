import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { messages } from "@/db/schema";

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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { messages: userMessages, saveToHistory = true } = await req.json();

    // Add system prompt as first message
    const messagesWithSystem = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content || "No response";

    // Save to database if enabled
    if (saveToHistory && userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (lastUserMessage.role === "user") {
        // Save user message
        await db.insert(messages).values({
          content: lastUserMessage.content,
          role: "user",
          userId: session.user.id,
        });

        // Save assistant response
        await db.insert(messages).values({
          content: assistantMessage,
          role: "assistant",
          userId: session.user.id,
        });
      }
    }

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Groq" },
      { status: 500 }
    );
  }
}
