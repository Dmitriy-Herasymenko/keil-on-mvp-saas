import { create } from "zustand";

export type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

interface VoiceStore {
  state: VoiceState;
  transcript: string;
  response: string;
  error: string | null;
  isSupported: boolean;
  
  setState: (state: VoiceState) => void;
  setTranscript: (transcript: string) => void;
  setResponse: (response: string) => void;
  setError: (error: string | null) => void;
  setIsSupported: (isSupported: boolean) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: "idle",
  transcript: "",
  response: "",
  error: null,
  isSupported: true,

  setState: (state) => set({ state }),
  setTranscript: (transcript) => set({ transcript }),
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  setIsSupported: (isSupported) => set({ isSupported }),
  reset: () => set({ state: "idle", transcript: "", response: "", error: null }),
}));
