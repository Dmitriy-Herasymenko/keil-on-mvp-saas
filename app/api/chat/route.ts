import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { messages, chats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT_UA = `Ти - корисний голосовий асистент. ВАЖЛИВО:
1. Завжди відповідай українською мовою, незалежно від мови запитання
2. Відповідай коротко та зрозуміло (1-3 речення)
3. Будь дружелюбним та ввічливим
4. Якщо не розумієш питання - попроси повторити`;

const SYSTEM_PROMPT_EN = `You are a helpful voice assistant. IMPORTANT:
1. Always respond in English, regardless of the question language
2. Keep responses short and clear (1-3 sentences)
3. Be friendly and polite
4. If you don't understand the question, ask to repeat`;

const SYSTEM_PROMPT_DE = `Sie sind ein hilfreicher Sprachassistent. WICHTIG:
1. Antworten Sie immer auf Deutsch, unabhängig von der Sprache der Frage
2. Halten Sie Antworten kurz und klar (1-3 Sätze)
3. Seien Sie freundlich und höflich
4. Wenn Sie die Frage nicht verstehen, bitten Sie um Wiederholung`;

function getSystemPrompt(language: string): string {
  if (language.startsWith("uk")) return SYSTEM_PROMPT_UA;
  if (language.startsWith("de")) return SYSTEM_PROMPT_DE;
  return SYSTEM_PROMPT_EN;
}

function generateSlug(title: string): string {
  const timestamp = Date.now().toString(36).slice(-4);
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return normalized ? `${normalized}-${timestamp}` : `chat-${timestamp}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { messages: userMessages, chatId, isVoice = false, saveToHistory = true, browserLanguage = "en-US", locale = "en" } = await req.json();

    const systemPrompt = getSystemPrompt(locale);

    const messagesWithSystem = [
      { role: "system", content: systemPrompt },
      ...userMessages,
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content || "No response";

    if (saveToHistory && userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      
      if (lastUserMessage.role === "user") {
        let currentChatId = chatId;
        
        if (!currentChatId) {
          const title = lastUserMessage.content.slice(0, 50) + (lastUserMessage.content.length > 50 ? "..." : "");
          const [newChat] = await db.insert(chats).values({
            userId: session.user.id,
            title,
            slug: generateSlug(title),
          }).returning({ id: chats.id, slug: chats.slug });
          currentChatId = newChat.id;
        } else {
          await db.update(chats)
            .set({ lastMessageAt: new Date() })
            .where(eq(chats.id, currentChatId));
        }

        await db.insert(messages).values({
          chatId: currentChatId,
          content: lastUserMessage.content,
          role: "user",
          isVoice,
        });

        await db.insert(messages).values({
          chatId: currentChatId,
          content: assistantMessage,
          role: "assistant",
          isVoice: false,
        });

        return NextResponse.json({
          message: assistantMessage,
          chatId: currentChatId,
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
