"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new chat on load
    const createAndRedirect = async () => {
      try {
        const res = await fetch("/api/chat/create", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          router.push(`/chat/${data.chatId}`);
        }
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    };
    createAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
