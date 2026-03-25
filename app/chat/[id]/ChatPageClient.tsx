"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VoiceInterface from "../../components/VoiceInterface";
import ChatSidebar from "../../components/ChatSidebar";
import LogoutButton from "../../components/LogoutButton";
import { useSession } from "next-auth/react";

interface Chat {
  id: string;
  title: string;
}

interface ChatPageClientProps {
  initialChat: Chat | null;
  initialMessages: any[];
}

export default function ChatPageClient({ initialChat, initialMessages }: ChatPageClientProps) {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const chatId = params.id as string;
  const [chat, setChat] = useState<Chat | null>(initialChat);

  // Update chat when URL changes
  useEffect(() => {
    if (chatId !== chat?.id) {
      fetchChat();
    }
  }, [chatId]);

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChat(data.chat);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    }
  };

  const handleSelectChat = (id: string) => {
    router.push(`/chat/${id}`, { scroll: false });
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.chatId}`, { scroll: false });
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black">
      <ChatSidebar 
        onSelectChat={handleSelectChat} 
        onNewChat={handleNewChat}
        currentChatId={chatId}
      />

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {chat?.title || initialChat?.title || "Новий чат"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              KeilOn Voice Assistant
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
          <VoiceInterface chatId={chatId} initialMessages={initialMessages} />
        </main>
      </div>
    </div>
  );
}
