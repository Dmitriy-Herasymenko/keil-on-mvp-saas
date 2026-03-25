import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { messages, chats } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

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

    if (chatId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId);
      
      let actualChatId = chatId;
      if (!isUuid) {
        const chat = await db.query.chats.findFirst({
          where: and(
            eq(chats.slug, chatId),
            eq(chats.userId, session.user.id)
          ),
        });
        if (!chat) {
          return NextResponse.json(
            { error: "Чат не знайдено" },
            { status: 404 }
          );
        }
        actualChatId = chat.id;
      }
      
      const chatMessages = await db.query.messages.findMany({
        where: eq(messages.chatId, actualChatId),
        orderBy: desc(messages.createdAt),
        limit: 100,
      });

      return NextResponse.json({
        messages: chatMessages.reverse(),
      });
    }

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
