import { auth } from "@/auth";
import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import ChatPageClient from "./ChatPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const chat = await db.query.chats.findFirst({
    where: and(
      eq(chats.id, id),
      eq(chats.userId, session.user.id)
    ),
  });

  if (!chat) {
    redirect("/");
  }

  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, id),
    orderBy: desc(messages.createdAt),
    limit: 100,
  });

  const initialMessages = chatMessages.reverse().map(m => ({
    role: m.role,
    content: m.content,
  }));

  return (
    <ChatPageClient 
      initialChat={chat} 
      initialMessages={initialMessages}
    />
  );
}
