import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { messages, chats } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/chat/history - Get user's chats
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    // If chatId provided, return messages for that chat
    if (chatId) {
      const chatMessages = await db.query.messages.findMany({
        where: eq(messages.chatId, chatId),
        orderBy: desc(messages.createdAt),
        limit: 100,
      });

      return NextResponse.json({
        messages: chatMessages.reverse(),
      });
    }

    // Otherwise return user's chats
    const userChats = await db.query.chats.findMany({
      where: eq(chats.userId, session.user.id),
      orderBy: desc(chats.lastMessageAt),
      limit: 50,
    });

    return NextResponse.json({
      chats: userChats,
    });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/history - Delete chat or all chats
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (chatId) {
      // Delete specific chat (cascade will delete messages)
      await db.delete(chats).where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, session.user.id)
        )
      );

      return NextResponse.json({
        message: "Чат видалено",
      });
    } else {
      // Delete all user's chats
      await db.delete(chats).where(eq(chats.userId, session.user.id));

      return NextResponse.json({
        message: "Всі чати очищено",
      });
    }
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
