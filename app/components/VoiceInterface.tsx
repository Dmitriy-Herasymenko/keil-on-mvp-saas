"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceStore, VoiceState } from "../store/voiceStore";
import { Mic, Loader2, Volume2, AlertCircle, Square, Send, Type, VolumeX } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceInterfaceProps {
  chatId?: string;
  onChatCreated?: (chatId: string) => void;
  initialMessages?: Message[];
}

export default function VoiceInterface({ chatId, onChatCreated, initialMessages = [] }: VoiceInterfaceProps) {
  const {
    state,
    transcript,
    response,
    error,
    isSupported,
    setState,
    setTranscript,
    setResponse,
    setError,
    setIsSupported,
    reset,
  } = useVoiceStore();

  const [textInput, setTextInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>(initialMessages);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const [isTextMode, setIsTextMode] = useState(false);
  const messagesRef = useRef<Message[]>(initialMessages);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    setCurrentChatId(chatId);
    if (chatId) {
      fetchChatMessages(chatId);
    } else {
      setChatHistory(initialMessages);
      messagesRef.current = initialMessages;
    }
  }, [chatId, initialMessages]);

  const fetchChatMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/history?chatId=${id}`);
      if (res.ok) {
        const data = await res.json();
        const messages = data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
        setChatHistory(messages);
        messagesRef.current = messages;
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "uk-UA";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        handleSendMessage(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
        setState("error");
      } else if (event.error === "network") {
        console.log("Network error, attempting to restart...");
        setTimeout(() => {
          if (state === "listening" && recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              recognitionRef.current.start();
            } catch {}
          }
        }, 500);
      } else if (event.error === "no-speech") {
      } else if (event.error === "aborted") {
      } else {
        setError(`Speech recognition error: ${event.error}`);
        setState("error");
      }
    };

    recognitionRef.current.onend = () => {};

    synthRef.current = window.speechSynthesis;

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current) {
      setState("idle");
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "uk-UA";

    utterance.onstart = () => {
      setState("speaking");
    };

    utterance.onend = () => {
      setState("idle");
      setTranscript("");
    };

    utterance.onerror = () => {
      setState("idle");
    };

    synthRef.current.speak(utterance);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState("processing");

    // Add user message to history
    const userMessage: Message = { role: "user", content: text };
    messagesRef.current.push(userMessage);
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: messagesRef.current,
          chatId: currentChatId,
          isVoice: state === "listening",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantMessage: Message = { role: "assistant", content: data.message };

      // Add assistant message to history
      messagesRef.current.push(assistantMessage);
      setChatHistory(prev => [...prev, assistantMessage]);
      setResponse(data.message);

        if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
        onChatCreated?.(data.chatId);
      }

      if (!isTextMode) {
        speakResponse(data.message);
      } else {
        setState("idle");
      }
      
      if (messagesRef.current.length === 2 && currentChatId) {
        updateChatTitle(currentChatId, text.slice(0, 50));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response from assistant");
      setState("error");
    }
  }, [currentChatId, state, onChatCreated, speakResponse]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setIsTextMode(true);
      handleSendMessage(textInput);
      setTextInput("");
    }
  };

  const updateChatTitle = async (id: string, title: string) => {
    try {
      await fetch(`/api/chat/update-title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: id, title }),
      });
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not initialized. Please refresh the page.");
      return;
    }

    if (state === "listening") return;

    try {
      recognitionRef.current.stop();
    } catch {}

    setTimeout(() => {
      try {
        setError(null);
        recognitionRef.current?.start();
        setState("listening");
      } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Could not start speech recognition. Please try again.");
      }
    }, 50);
  }, [state]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      synthRef.current?.cancel();
      setState("idle");
    } catch (err) {
      console.error("Error stopping recognition:", err);
    }
  }, []);

  const interruptSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState("idle");
    setResponse("");
    setTranscript("");
  }, []);

  const getStateColor = (state: VoiceState) => {
    switch (state) {
      case "listening":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "speaking":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStateText = (state: VoiceState) => {
    switch (state) {
      case "listening":
        return "Слухаю...";
      case "processing":
        return "Думаю...";
      case "speaking":
        return "Говорю... (натисніть щоб перервати)";
      case "error":
        return "Помилка";
      default:
        return "Натисніть щоб говорити";
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Browser Not Supported
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please use a modern browser like Chrome, Edge, or Safari for voice features.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6">
      {/* */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setIsTextMode(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !isTextMode 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Голос
        </button>
        <button
          onClick={() => setIsTextMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isTextMode 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Type className="w-4 h-4" />
          Текст
        </button>
      </div>

      {/* */}
      <div className="w-full h-48 sm:h-56 lg:h-64 mb-4 sm:mb-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {chatHistory.length === 0 && (
            <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
              Почніть розмову голосом або текстом
            </p>
          )}
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* */}
      <div className="mb-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-lg font-medium text-gray-700 dark:text-gray-300"
          >
            {getStateText(state)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* */}
      <div className="relative mb-4 sm:mb-8">
        <motion.button
          onClick={() => {
            console.log("Button clicked, current state:", state);
            if (state === "idle") {
              console.log("Starting listening...");
              startListening();
            } else if (state === "listening") {
              console.log("Stopping listening...");
              stopListening();
            } else if (state === "speaking") {
              console.log("Interrupting speaking...");
              interruptSpeaking();
            } else {
              console.log("Button clicked but state is:", state, "- no action taken");
            }
          }}
          disabled={state === "processing"}
          className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            state === "idle"
              ? "bg-gradient-to-br from-gray-100 to-gray-300 hover:from-gray-200 hover:to-gray-400 dark:from-gray-700 dark:to-gray-900 dark:hover:from-gray-600 dark:hover:to-gray-800"
              : getStateColor(state)
          } ${state === "processing" ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${state === "speaking" ? "pointer-events-auto" : ""}`}
          animate={
            state === "listening"
              ? { scale: [1, 1.05, 1] }
              : state === "processing"
              ? { scale: [1, 0.95, 1] }
              : { scale: 1 }
          }
          transition={
            state === "listening"
              ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
              : state === "processing"
              ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          whileHover={state === "idle" || state === "speaking" ? { scale: 1.05 } : {}}
          whileTap={state === "idle" || state === "speaking" ? { scale: 0.95 } : {}}
        >
          {state === "idle" && <Mic className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 dark:text-gray-400" />}
          {state === "listening" && <Mic className="w-8 h-8 sm:w-12 sm:h-12 text-white" />}
          {state === "processing" && <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />}
          {state === "speaking" && <Square className="w-8 h-8 sm:w-12 sm:h-12 text-white fill-white" />}
          {state === "error" && <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />}
        </motion.button>

        {/* */}
        {state === "listening" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400 pointer-events-none"
              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400 pointer-events-none"
              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        {/* */}
        {state === "speaking" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400 pointer-events-none"
            animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
          />
        )}
      </div>

      {/* */}
      <AnimatePresence>
        {transcript && state === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ви сказали:</p>
            <p className="text-gray-900 dark:text-white">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* */}
      <AnimatePresence>
        {response && state === "speaking" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Асистент:</p>
            <p className="text-gray-900 dark:text-white">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg w-full flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* */}
      <form onSubmit={handleTextSubmit} className="w-full mt-4 sm:mt-6 flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Введіть повідомлення..."
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white outline-none transition-all text-sm sm:text-base"
          disabled={state === "processing"}
        />
        <button
          type="submit"
          disabled={!textInput.trim() || state === "processing"}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>

      {/* */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {state === "idle" && <p>Натисніть мікрофон щоб почати розмову</p>}
        {state === "listening" && <p>Натисніть щоб зупинити запис</p>}
        {state === "speaking" && <p className="text-blue-500 font-medium">Натисніть щоб перервати відповідь</p>}
      </div>
    </div>
  );
}
