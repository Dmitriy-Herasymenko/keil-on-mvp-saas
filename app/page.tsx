import VoiceInterface from "./components/VoiceInterface";
import ChatHistory from "./components/ChatHistory";
import LogoutButton from "./components/LogoutButton";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Sidebar with chat history */}
      <ChatHistory />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              KeilOn Voice Assistant
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Groq AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        {/* Main voice interface */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
          <VoiceInterface />
        </main>
      </div>
    </div>
  );
}
