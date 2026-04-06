"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LANGUAGES = ["English", "Deutsch", "Русский"] as const;
type Language = typeof LANGUAGES[number];


interface InputFieldProps {
  icon: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showEye?: boolean;
}

interface LanguageSelectorProps {
  currentLang: Language;
  isLangOpen: boolean;
  setIsLangOpen: (val: boolean) => void;
  onLangSelect: (lang: Language) => void;
  langRef: React.RefObject<HTMLDivElement | null>;
  containerClass?: string;
}

interface UserFormData {
  email: string;
  password: string;
}

interface UIState {
  error: string;
  loading: boolean;
  isLangOpen: boolean;
  currentLang: Language;
}


const InputField = ({ icon, type, placeholder, value, onChange, showEye = false }: InputFieldProps) => (
  <div className="group flex items-center border-[2px] border-white/5 bg-white/5 rounded-[20px] px-5 focus-within:border-[#B24CFA]/50 transition-all">
    <div className="flex-shrink-0 w-[18px] h-[18px] relative">
      <Image src={`/icons/${icon}.svg`} alt="" fill className="opacity-50" />
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required
      className="w-full bg-transparent text-white/80 px-4 py-4.5 outline-none text-[15px]"
      placeholder={placeholder}
    />
    {showEye && (
      <div className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 w-[20px] h-[20px] relative">
        <Image src="/icons/eye.svg" alt="" fill />
      </div>
    )}
  </div>
);

const LanguageSelector = ({ currentLang, isLangOpen, setIsLangOpen, onLangSelect, langRef, containerClass = "" }: LanguageSelectorProps) => (
  <div className={`relative ${containerClass}`} ref={langRef}>
    <button
      type="button"
      onClick={() => setIsLangOpen(!isLangOpen)}
      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#2D2639]/80 rounded-full text-[#9B4DFF] hover:text-white transition-all text-[14px] border border-white/5 font-semibold"
    >
      {currentLang}
      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isLangOpen && (
      <div className="
    absolute z-50 p-1 min-w-[140px] bg-[#1B1624] border border-white/10 rounded-xl shadow-2xl
    bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 
    lg:bottom-auto lg:top-0 lg:left-[calc(100%+12px)] lg:translate-x-0
    animate-in fade-in zoom-in-95 duration-200
  ">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onLangSelect(lang)}
            className="w-full px-4 py-2.5 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {lang}
          </button>
        ))}
      </div>
    )}
  </div>
);


export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({ email: "user1@gmail.com", password: "user123" });
  const [uiState, setUiState] = useState<UIState>({
    error: "",
    loading: false,
    isLangOpen: false,
    currentLang: "English"
  });

  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setUiState(prev => ({ ...prev, isLangOpen: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, loading: true, error: "" }));

    const result = await signIn("credentials", { ...formData, redirect: false });

    if (result?.error) {
      setUiState(prev => ({ ...prev, error: "Невірний email або пароль", loading: false }));
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0C0A10] antialiased font-sans overflow-hidden selection:bg-[#B24CFA]/20">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full z-0 pointer-events-none flex justify-center">
        <Image src="/headerLight.svg" alt="" width={1440} height={488} className="w-full h-auto object-cover" priority />
      </div>

      <header className="relative w-full pt-12 md:pt-16 px-6 z-50">
        <div className="max-w-[1150px] mx-auto w-full flex justify-center lg:justify-start">
          <Image src="/imgs/logo.svg" alt="Logo" width={110} height={32} className="cursor-pointer" priority />
        </div>
      </header>

      <main className="relative flex-grow flex items-center justify-center z-10 px-6 py-10">
        <div className="w-full max-w-[1150px] flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-32">

          {/* Mobile Sphere */}
          <div className="block md:hidden relative flex-1">
            <div className="relative w-[180px] h-[180px] mx-auto">
              <div className="absolute inset-0 bg-[#B24CFA]/20 blur-[100px] rounded-full" />
              <div className="relative z-10 w-full h-full drop-shadow-[0_0_60px_rgba(178,76,250,0.3)]">
                <Image src="/imgs/sphere.png" alt="" fill className="object-contain" priority />
              </div>
            </div>
          </div>

          {/* Login Section */}
          <section className="flex-1 w-full max-w-[480px]">
            <div className="mb-12 text-center lg:text-start">
              <h1 className="text-[44px] font-sora font-semibold text-white mb-3 tracking-tight">Welcome back</h1>
              <p className="text-[#967ABD] font-medium text-[18px] opacity-80">Sign in to your account</p>
            </div>

            <div className="relative p-[1px] rounded-[24px] bg-gradient-to-b from-white/15 to-transparent shadow-2xl">
              <div className="bg-[#1B1624]/60 backdrop-blur-3xl rounded-[23px] p-8 md:p-10 flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField
                    icon="mail" type="email" placeholder="Enter your email"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <InputField
                    icon="password" type="password" placeholder="Enter your password"
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    showEye
                  />

                  {uiState.error && <p className="text-red-400 text-sm font-medium animate-pulse text-center lg:text-left">{uiState.error}</p>}

                  <button
                    type="submit"
                    disabled={uiState.loading}
                    className="cursor-pointer bg-gradient-to-r from-[#6C2BFF] via-[#B24CFA] to-[#6C2BFF] py-4 text-white rounded-[18px] w-full mt-6 text-[16px] font-bold shadow-[0_10px_30px_-5px_rgba(108,43,255,0.4)] hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {uiState.loading ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div className="hidden lg:flex justify-between items-center mt-10">
                  <LanguageSelector
                    currentLang={uiState.currentLang} isLangOpen={uiState.isLangOpen} langRef={langRef}
                    setIsLangOpen={val => setUiState({ ...uiState, isLangOpen: val })}
                    onLangSelect={lang => setUiState({ ...uiState, currentLang: lang, isLangOpen: false })}
                  />
                  <button type="button" className="text-[14px] text-white/40 hover:text-white transition-colors font-medium cursor-pointer">Forgot password</button>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Divider & Sphere */}
          <div className="hidden lg:block w-[1px] h-[684px] bg-gradient-to-b from-transparent via-[#A855F7] to-transparent shadow-[4px_0px_20.3px_0px_rgba(168,85,247,0.5)]" />
          

          <section className="hidden md:flex relative flex-1 justify-center">
            <div className="absolute inset-0 bg-[#B24CFA]/20 blur-[100px] rounded-full scale-125 animate-pulse" />
            <div className="relative w-[420px] h-[420px]">
              <div className="absolute inset-0 bg-[#B24CFA]/20 blur-[100px] rounded-full scale-125" />
              <div className="relative z-10 w-full h-full drop-shadow-[0_0_60px_rgba(178,76,250,0.3)]">
                <Image src="/imgs/sphere.png" alt="" fill className="object-contain" priority />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Language Selector */}
      <LanguageSelector
        containerClass="block md:hidden mx-auto mt-auto mb-[33px]"
        currentLang={uiState.currentLang} isLangOpen={uiState.isLangOpen} langRef={langRef}
        setIsLangOpen={val => setUiState({ ...uiState, isLangOpen: val })}
        onLangSelect={lang => setUiState({ ...uiState, currentLang: lang, isLangOpen: false })}
      />

      {/* Footer Glow */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none flex justify-center overflow-hidden">
        <Image src="/footerLight.svg" alt="" width={1440} height={100} className="w-full h-auto object-contain translate-y-[35%]" />
      </div>
    </div>
  );
}