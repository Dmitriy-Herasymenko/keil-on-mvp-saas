"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceStore, VoiceState } from "../store/voiceStore";
import { Mic, Loader2, Volume2, AlertCircle, Square } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}



export default function VoiceInterface() {
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

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser");
      return;
    }

    // Initialize SpeechRecognition
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
        // Network error - often happens with some browsers or in development
        // Try to restart recognition
        console.log("Network error, attempting to restart...");
        setTimeout(() => {
          if (state === "listening" && recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              recognitionRef.current.start();
            } catch {
              // Ignore restart errors
            }
          }
        }, 500);
      } else if (event.error === "no-speech") {
        // Ignore no-speech errors
      } else if (event.error === "aborted") {
        // Ignore aborted errors (user stopped manually)
      } else {
        setError(`Speech recognition error: ${event.error}`);
        setState("error");
      }
    };

    recognitionRef.current.onend = () => {
      if (state === "listening") {
        // Restart recognition if still in listening state
        try {
          recognitionRef.current?.start();
        } catch {
          // Already started
        }
      }
    };

    // Initialize SpeechSynthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState("processing");

    // Add user message to history
    messagesRef.current.push({ role: "user", content: text });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesRef.current }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantMessage = data.message;

      // Add assistant message to history
      messagesRef.current.push({ role: "assistant", content: assistantMessage });
      setResponse(assistantMessage);

      // Speak the response
      speakResponse(assistantMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response from assistant");
      setState("error");
    }
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current) {
      setState("idle");
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "uk-UA"; // Set Ukrainian language for TTS

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

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not initialized. Please refresh the page.");
      return;
    }

    try {
      // Reset any previous state
      setError(null);
      recognitionRef.current.start();
      setState("listening");
    } catch (err) {
      console.error("Error starting recognition:", err);
      // If already started, stop and restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
          setState("listening");
        }, 100);
      } catch {
        setError("Could not start speech recognition. Please try again.");
      }
    }
  }, []);

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
    synthRef.current?.cancel();
    setState("idle");
    setTranscript("");
    // Restart listening after interrupt
    setTimeout(() => startListening(), 100);
  }, [startListening]);

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
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6">
      {/* Status indicator */}
      <div className="mb-8 text-center">
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

      {/* Main orb/button */}
      <div className="relative mb-8">
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
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === "idle"
              ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              : getStateColor(state)
          } ${state === "processing" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
          animate={
            state === "listening"
              ? {
                  scale: [1, 1.1, 1],
                  transition: { repeat: Infinity, duration: 1.5 },
                }
              : state === "speaking"
              ? {
                  scale: [1, 1.05, 1],
                  transition: { repeat: Infinity, duration: 0.8 },
                }
              : {}
          }
        >
          {state === "idle" && <Mic className="w-12 h-12 text-gray-600 dark:text-gray-400" />}
          {state === "listening" && <Mic className="w-12 h-12 text-white" />}
          {state === "processing" && <Loader2 className="w-12 h-12 text-white animate-spin" />}
          {state === "speaking" && <Square className="w-12 h-12 text-white fill-white" />}
          {state === "error" && <AlertCircle className="w-12 h-12 text-white" />}
        </motion.button>

        {/* Ripple effect when listening */}
        {state === "listening" && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
          </>
        )}
      </div>

      {/* Transcript display */}
      <AnimatePresence>
        {transcript && state === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">You said:</p>
            <p className="text-gray-900 dark:text-white">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response display */}
      <AnimatePresence>
        {response && state === "speaking" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Assistant:</p>
            <p className="text-gray-900 dark:text-white">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
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

      {/* Instructions */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        {state === "idle" && <p>Натисніть мікрофон щоб почати розмову</p>}
        {state === "listening" && <p>Натисніть щоб зупинити запис</p>}
        {state === "speaking" && <p className="text-blue-500 font-medium">Натисніть щоб перервати відповідь</p>}
      </div>
    </div>
  );
}
