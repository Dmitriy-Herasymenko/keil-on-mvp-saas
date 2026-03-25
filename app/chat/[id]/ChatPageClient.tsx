"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VoiceInterface from "../../components/VoiceInterface";
import ChatSidebar from "../../components/ChatSidebar";
import LogoutButton from "../../components/LogoutButton";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setSidebarOpen(false);
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.chatId}`, { scroll: false });
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black overflow-hidden">
      {/* */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChatSidebar 
          onSelectChat={handleSelectChat} 
          onNewChat={handleNewChat}
          currentChatId={chatId}
        />
      </div>

      {/* */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {chat?.title || initialChat?.title || "Новий чат"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                KeilOn Voice Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[200px]">
              {session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        {/* */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
          <VoiceInterface chatId={chatId} initialMessages={initialMessages} />
        </main>
      </div>
    </div>
  );
}
