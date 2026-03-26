"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // If not authenticated, redirect to login
    if (!session) {
      router.push("/login");
      return;
    }

    // User is authenticated, create chat and redirect
    const createAndRedirect = async () => {
      try {
        const res = await fetch("/api/chat/create", { method: "POST" });
        
        if (res.ok) {
          const data = await res.json();
          router.push(`/chat/${data.chatId}`);
        } else {
          console.error("Failed to create chat, status:", res.status);
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to create chat:", error);
        router.push("/login");
      }
    };
    
    createAndRedirect();
    setIsChecking(false);
  }, [session, status, router]);

  // Show spinner while checking auth or creating chat
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
