import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chats } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const [newChat] = await db.insert(chats).values({
      userId: session.user.id,
      title: "Новий чат",
    }).returning({ id: chats.id });

    return NextResponse.json({
      chatId: newChat.id,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { error: "Помилка створення чату" },
      { status: 500 }
    );
  }
}
