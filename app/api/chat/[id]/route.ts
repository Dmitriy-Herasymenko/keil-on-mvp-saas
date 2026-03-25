import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/chat/[id] - Get chat details and messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get chat
    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, id),
        eq(chats.userId, session.user.id)
      ),
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Чат не знайдено" },
        { status: 404 }
      );
    }

    // Get messages
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, id),
      orderBy: desc(messages.createdAt),
      limit: 100,
    });

    return NextResponse.json({
      chat,
      messages: chatMessages.reverse(),
    });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/[id] - Delete specific chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await db.delete(chats).where(
      and(
        eq(chats.id, id),
        eq(chats.userId, session.user.id)
      )
    );

    return NextResponse.json({ message: "Чат видалено" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
