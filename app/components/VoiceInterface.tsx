"use client";

import { useEffect, useRef, useCallback, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceStore, VoiceState } from "../store/voiceStore";
import { Mic, Loader2, Volume2, AlertCircle, Square, Send, Type, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceInterfaceProps {
  chatId?: string;
  chatUuid?: string;
  onChatCreated?: (chatId: string, slug?: string) => void;
  initialMessages?: Message[];
}

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const MemoizedMessage = memo(({ msg, index, onPlay }: { msg: Message; index: number; onPlay?: (text: string) => void }) => (
  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
    {msg.role === "assistant" && (
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
        <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
      </div>
    )}
    <div className="flex flex-col gap-1 max-w-[90%] sm:max-w-[85%] lg:max-w-[80%]">
      <div
        className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base leading-relaxed ${
          msg.role === "user"
            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-md"
            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-bl-md"
        }`}
      >
        {msg.content}
      </div>
      {msg.role === "assistant" && isIOSDevice() && onPlay && (
        <button
          onClick={() => onPlay(msg.content)}
          className="self-start flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <Volume2 className="w-3 h-3" />
          <span>Прослухати</span>
        </button>
      )}
    </div>
  </div>
));

MemoizedMessage.displayName = "MemoizedMessage";

export default function VoiceInterface({ chatId, chatUuid, onChatCreated, initialMessages = [] }: VoiceInterfaceProps) {
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
  } = useVoiceStore();

  const [textInput, setTextInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>(initialMessages);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatUuid || chatId);
  const [currentSlug, setCurrentSlug] = useState<string | undefined>(chatId);
  const [isTextMode, setIsTextMode] = useState(false);
  const messagesRef = useRef<Message[]>(initialMessages);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    setCurrentChatId(chatUuid || chatId);
    setCurrentSlug(chatId);
    const idToFetch = chatUuid || chatId;
    if (idToFetch) {
      fetchChatMessages(idToFetch);
    } else {
      setChatHistory(initialMessages);
      messagesRef.current = initialMessages;
    }
  }, [chatId, chatUuid, initialMessages]);

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
    if (typeof window === "undefined" || isInitialized.current) return;
    isInitialized.current = true;

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

    let lastProcessedTranscript = "";
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript && finalTranscript !== lastProcessedTranscript) {
        lastProcessedTranscript = finalTranscript;
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

  const isIOS = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
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

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setState("idle");
    };

    if (isIOS() && synthRef.current.paused) {
      synthRef.current.resume();
    }

    synthRef.current.speak(utterance);
  }, [isIOS]);

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

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState("processing");

    const userMessage: Message = { role: "user", content: text };
    
    const alreadyExists = messagesRef.current.some(
      m => m.role === "user" && m.content === text
    );
    
    if (!alreadyExists) {
      messagesRef.current.push(userMessage);
      setChatHistory(prev => [...prev, userMessage]);
    }

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
        const errorData = await res.json().catch(() => ({}));
        console.error("API error:", res.status, errorData);
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      const assistantMessage: Message = { role: "assistant", content: data.message };

      messagesRef.current.push(assistantMessage);
      setChatHistory(prev => [...prev, assistantMessage]);
      setResponse(data.message);

        if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
        setCurrentSlug(data.slug);
        onChatCreated?.(data.chatId, data.slug);
      }

      if (!isTextMode) {
        stopListening();
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
  }, [currentChatId, state, onChatCreated, speakResponse, stopListening]);

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
    <div className="flex flex-col items-center justify-start w-full max-w-3xl xl:max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-3 sm:mb-6">
        <button
          onClick={() => setIsTextMode(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium min-w-[80px] justify-center ${
            !isTextMode 
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Голос</span>
        </button>
        <button
          onClick={() => setIsTextMode(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium min-w-[80px] justify-center ${
            isTextMode 
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Текст</span>
        </button>
      </div>

      {isTextMode ? (
        <>
          <div className="w-full h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[300px] max-h-[600px] mb-4 sm:mb-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3 sm:mb-4">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Почніть текстову розмову
                  </p>
                </div>
              ) : (
                <>
                  {chatHistory.map((msg, index) => (
                    <MemoizedMessage 
                      key={`${msg.role}-${index}`} 
                      msg={msg} 
                      index={index}
                    />
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleTextSubmit} className="w-full max-w-2xl mx-auto flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Введіть повідомлення..."
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent dark:text-white outline-none transition-all text-sm sm:text-base"
                disabled={state === "processing"}
              />
            </div>
            <button
              type="submit"
              disabled={!textInput.trim() || state === "processing"}
              className="px-4 sm:px-5 py-3 sm:py-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white dark:text-zinc-900 rounded-xl transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-4 sm:mb-6 text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400"
              >
                {getStateText(state)}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mb-4 sm:mb-6">
        <motion.button
          onClick={() => {
            if (state === "idle") {
              startListening();
            } else if (state === "listening") {
              stopListening();
            } else if (state === "speaking") {
              interruptSpeaking();
            }
          }}
          disabled={state === "processing"}
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            state === "idle"
              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105"
              : state === "listening"
              ? "bg-red-500 text-white"
              : state === "speaking"
              ? "bg-indigo-500 text-white"
              : state === "processing"
              ? "bg-amber-500 text-white cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
          animate={
            state === "listening"
              ? { scale: [1, 1.08, 1] }
              : state === "processing"
              ? { rotate: 360 }
              : { scale: 1 }
          }
          transition={
            state === "listening"
              ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
              : state === "processing"
              ? { repeat: Infinity, duration: 1, ease: "linear" }
              : { duration: 0.2 }
          }
          whileHover={state === "idle" || state === "speaking" ? { scale: 1.05 } : {}}
          whileTap={state === "idle" || state === "speaking" ? { scale: 0.95 } : {}}
        >
          {state === "idle" && <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          {state === "listening" && <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          {state === "processing" && <Loader2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          {state === "speaking" && <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
          {state === "error" && <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.button>

        {state === "listening" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400 pointer-events-none"
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400 pointer-events-none"
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        {state === "speaking" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-400 pointer-events-none"
            animate={{ scale: [1, 1.4], opacity: [0.2, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
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

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl w-full flex items-center gap-2 border border-red-100 dark:border-red-900/30"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {state === "idle" && "Натисніть мікрофон щоб почати"}
          {state === "listening" && "Натисніть щоб зупинити"}
          {state === "speaking" && "Натисніть щоб перервати"}
          {state === "processing" && "Обробка..."}
        </p>
      </div>
        </>
      )}
    </div>
  );
}
