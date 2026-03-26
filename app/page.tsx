"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        const res = await fetch('/api/chat/create', { method: 'POST' });
        
        if (res.status === 401 || res.status === 403) {
          // Not authenticated
          router.push('/login');
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          router.push(`/chat/${data.chatId}`);
        } else {
          // Other errors
          console.error('Failed to create chat, status:', res.status);
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to create chat:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    createAndRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return null;
}
