import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chats } from "@/db/schema";

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

    const title = "Новий чат";
    const [newChat] = await db.insert(chats).values({
      userId: session.user.id,
      title,
      slug: generateSlug(title),
    }).returning({ id: chats.id, slug: chats.slug });

    return NextResponse.json({
      chatId: newChat.id,
      slug: newChat.slug,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { error: "Помилка створення чату" },
      { status: 500 }
    );
  }
}
