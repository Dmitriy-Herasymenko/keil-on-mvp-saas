"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VoiceInterface from "../../components/VoiceInterface";
import ChatSidebar from "../../components/ChatSidebar";
import LogoutButton from "../../components/LogoutButton";
import LanguageSelector from "../../components/LanguageSelector";
import { useTranslations } from "../../hooks/useTranslations";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  slug?: string;
}

interface ChatPageClientProps {
  initialChat: Chat | null;
  initialMessages: any[];
}

export default function ChatPageClient({ initialChat, initialMessages }: ChatPageClientProps) {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslations();
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

  const handleSelectChat = (id: string, slug?: string) => {
    const urlSlug = slug || id;
    router.push(`/chat/${urlSlug}`, { scroll: false });
    setSidebarOpen(false);
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chat/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.slug || data.chatId}`, { scroll: false });
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

      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
        <header className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {chat?.title || initialChat?.title || t("chat.newChat")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
            <LanguageSelector onChange={(locale) => window.location.reload()} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </div>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium hidden md:block truncate max-w-[100px] lg:max-w-[150px]">
                {session?.user?.name || session?.user?.email?.split("@")[0]}
              </span>
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start pt-8 sm:pt-12 lg:pt-4 pb-4 px-4 overflow-auto">
          <VoiceInterface 
            chatId={chatId} 
            chatUuid={chat?.id}
            initialMessages={initialMessages} 
          />
        </main>
      </div>
    </div>
  );
}
