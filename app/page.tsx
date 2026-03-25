import VoiceInterface from "./components/VoiceInterface";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            KeilOn Voice Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Powered by Groq AI
          </p>
        </div>
        <VoiceInterface />
      </main>
    </div>
  );
}
