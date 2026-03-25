"use client";

import { useEffect, useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

interface ChatHistoryProps {
  onSelectMessage?: (content: string) => void;
}

export default function ChatHistory({ onSelectMessage }: ChatHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chat/history");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Ви впевнені, що хочете очистити історію?")) return;

    try {
      const res = await fetch("/api/chat/history", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Історія чату</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Поки що немає повідомлень
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Історія чату</h2>
        <button
          onClick={clearHistory}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Очистити історію"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => onSelectMessage?.(message.content)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              message.role === "user"
                ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className={`w-3 h-3 ${
                message.role === "user" ? "text-blue-500" : "text-gray-500"
              }`} />
              <span className={`text-xs font-medium ${
                message.role === "user" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
              }`}>
                {message.role === "user" ? "Ви" : "Асистент"}
              </span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
              {message.content}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(message.createdAt).toLocaleString("uk-UA", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
