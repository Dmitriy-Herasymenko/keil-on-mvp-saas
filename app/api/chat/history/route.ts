import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Не авторизовано" },
        { status: 401 }
      );
    }

    const userMessages = await db.query.messages.findMany({
      where: eq(messages.userId, session.user.id),
      orderBy: desc(messages.createdAt),
      limit: 50,
    });

    // Return in chronological order (oldest first)
    return NextResponse.json({
      messages: userMessages.reverse(),
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

    await db.delete(messages).where(eq(messages.userId, session.user.id));

    return NextResponse.json({
      message: "Історію очищено",
    });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
