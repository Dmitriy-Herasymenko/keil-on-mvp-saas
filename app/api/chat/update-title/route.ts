import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const { chatId, title } = await req.json();

    if (!chatId || !title) {
      return NextResponse.json(
        { error: "Missing chatId or title" },
        { status: 400 }
      );
    }

    await db.update(chats)
      .set({ title: title.slice(0, 50) + (title.length > 50 ? "..." : "") })
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update title error:", error);
    return NextResponse.json(
      { error: "Помилка оновлення назви" },
      { status: 500 }
    );
  }
}
