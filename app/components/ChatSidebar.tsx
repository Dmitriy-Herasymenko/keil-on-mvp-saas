"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Plus, MessageSquare, Trash2, Mic, Trash, Sparkles } from "lucide-react";

interface Chat {
  id: string;
  userId: string;
  title: string;
  slug?: string;
  isActive: boolean;
  lastMessageAt: string;
  createdAt: string;
}

interface ChatSidebarProps {
  onSelectChat: (chatId: string, slug?: string) => void;
  onNewChat: () => void;
  currentChatId?: string;
}

const ChatItem = memo(({ chat, isActive, onSelect, onDelete }: {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string, slug?: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчора";
    } else {
      return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
    }
  };

  return (
    <div
      onClick={() => onSelect(chat.id, chat.slug)}
      className={`group relative w-full text-left p-2.5 sm:p-3 rounded-lg transition-all cursor-pointer ${
        isActive
          ? "bg-zinc-100 dark:bg-zinc-900"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isActive
            ? "bg-indigo-500 text-white"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        }`}>
          <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${
            isActive
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-700 dark:text-zinc-300"
          }`}>
            {chat.title}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatDate(chat.lastMessageAt)}
          </p>
        </div>
      </div>
      
      <button
        onClick={(e) => onDelete(e, chat.id)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
});

ChatItem.displayName = "ChatItem";

export default function ChatSidebar({ onSelectChat, onNewChat, currentChatId }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/history");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteChat = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Видалити цей чат?")) return;

    try {
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setChats(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }, []);

  const clearAllHistory = useCallback(async () => {
    if (!confirm("Ви впевнені, що хочете очистити всю історію?")) return;

    try {
      const res = await fetch("/api/chat/history", { method: "DELETE" });
      if (res.ok) {
        setChats([]);
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, [onNewChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchChats();
    }
  }, [currentChatId, fetchChats]);

  return (
    <div className="w-64 sm:w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">KeilOn AI</span>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Новий чат</span>
          <span className="sm:hidden">Новий</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Поки що немає чатів
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Створіть новий чат щоб почати
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={currentChatId === chat.id || currentChatId === chat.slug}
                onSelect={onSelectChat}
                onDelete={deleteChat}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={clearAllHistory}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Очистити історію
        </button>
      </div>
    </div>
  );
}
