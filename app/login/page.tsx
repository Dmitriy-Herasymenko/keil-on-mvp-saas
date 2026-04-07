"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "../hooks/useTranslations";

const LANGUAGES = ["English", "Deutsch", "Русский"] as const;
type Language = typeof LANGUAGES[number];

const nameMap: Record<string, Language> = {
  en: "English",
  de: "Deutsch",
  ru: "Русский"
};

const InputField = ({ icon, type, placeholder, value, onChange, showEye = false }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="group flex items-center border-[2px] border-white/5 bg-[#D9D9D912] rounded-[20px] px-5 focus-within:border-[#B24CFA]/50 transition-all">
      <div className="flex-shrink-0 w-[18px] h-[18px] relative">
        <Image src={`/icons/${icon}.svg`} alt="" fill />
      </div>
      <input
        type={showEye ? (isVisible ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-transparent text-[#FFFFFF78] px-4 py-4 lg:py-4.5 outline-none text-[15px]"
        placeholder={placeholder}
      />
      {showEye && (
        <button type="button" onClick={() => setIsVisible(!isVisible)} className="cursor-pointer hover:opacity-100 transition-opacity flex-shrink-0 w-[20px] h-[20px] relative">
          <Image src="/icons/eye.svg" alt="Toggle" fill />
        </button>
      )}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [uiState, setUiState] = useState<any>({ error: "", loading: false, isLangOpen: false, currentLang: "English" });

  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const { t, locale, setLocale, isLoaded } = useTranslations();

  useEffect(() => {
    if (isLoaded) setUiState((p: any) => ({ ...p, currentLang: nameMap[locale] || "English" }));
  }, [locale, isLoaded]);

  const handleLanguageSelect = (lang: string) => {
    const code = lang === "Русский" ? "ru" : lang === "Deutsch" ? "de" : "en";
    setLocale(code as any);
    localStorage.setItem("locale", code);
    setUiState((p: any) => ({ ...p, currentLang: lang, isLangOpen: false }));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if ((!desktopLangRef.current || !desktopLangRef.current.contains(target)) && (!mobileLangRef.current || !mobileLangRef.current.contains(target))) {
        setUiState((p: any) => ({ ...p, isLangOpen: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUiState((p: any) => ({ ...p, loading: true, error: "" }));
    const res = await signIn("credentials", { ...formData, redirect: false });
    if (res?.error) setUiState((p: any) => ({ ...p, error: "Error", loading: false }));
    else { router.push("/"); router.refresh(); }
  };

  return (
    <div className="relative min-h-screen h-dvh lg:h-auto w-full flex flex-col bg-[#0C0A10] antialiased font-sans overflow-hidden selection:bg-[#B24CFA]/20">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full z-0 pointer-events-none flex justify-center">
        <Image src="/headerLight.svg" alt="" width={1440} height={488} className="w-full h-auto object-cover" priority />
      </div>

      <header className="relative w-full pt-8 lg:pt-16 px-6 z-50 shrink-0">
        <div className="max-w-[1150px] mx-auto w-full flex justify-center lg:justify-start">
          <Image src="/imgs/logo.svg" alt="Logo" width={110} height={32} className="cursor-pointer" priority />
        </div>
      </header>

      <main className="relative flex-grow flex items-center justify-center z-10 px-6 py-2 lg:py-10 overflow-hidden">
        <div className="w-full max-w-[1150px] flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-32">

          {/* Mobile/iPad Sphere */}
          <div className="block lg:hidden relative shrink-0">
            <div className="relative w-[110px] h-[110px] mx-auto">
              <div className="absolute inset-0 bg-[#B24CFA]/20 blur-[60px] rounded-full" />
              <Image src="/imgs/sphere.png" alt="" fill className="object-contain" priority />
            </div>
          </div>

          {/* Login Section */}
          <section className="flex-1 w-full max-w-[480px] shrink-0">
            <div className="mb-6 lg:mb-12 text-center lg:text-start">
              <h1 className="text-[34px] lg:text-[44px] font-sora font-semibold text-white mb-1 lg:mb-3 tracking-tight leading-tight">{t("loginPage.title")}</h1>
              <p className="text-[#967ABD] font-medium text-[16px] lg:text-[18px] opacity-80">{t("loginPage.subtitle")}</p>
            </div>

            <div className="relative p-[1px] rounded-[24px] bg-gradient-to-b from-white/15 to-transparent shadow-2xl">
              <div className="bg-[#1B1624]/60 backdrop-blur-3xl rounded-[23px] p-6 lg:p-10 flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField icon="mail" type="email" placeholder={t("loginPage.placeholderMail")} value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
                  <InputField icon="password" type="password" placeholder={t("loginPage.placeholderPassword")} value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} showEye />

                  {uiState.error && <p className="text-red-400 text-sm font-medium text-center lg:text-left">{uiState.error}</p>}

                  <button type="submit" disabled={uiState.loading} className="cursor-pointer bg-gradient-to-r from-[#6C2BFF] via-[#B24CFA] to-[#6C2BFF] py-4 text-white rounded-[18px] w-full mt-4 lg:mt-6 text-[16px] font-bold shadow-lg hover:brightness-110 transition-all">
                    {uiState.loading ? "..." : t("loginPage.bthLogin")}
                  </button>
                </form>

                <div className="hidden lg:flex justify-between items-center mt-10">
                  <div className="relative" ref={desktopLangRef}>
                    <button
                      onClick={() => setUiState((p: any) => ({ ...p, isLangOpen: !p.isLangOpen }))}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#2D2639]/80 rounded-full text-[#9B4DFF] hover:text-white transition-all text-[14px] border border-white/5 font-semibold"
                    >
                      {uiState.currentLang}
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${uiState.isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {uiState.isLangOpen && (
                      <div className="
      absolute z-50 p-1 min-w-[140px] bg-[#1B1624] border border-white/10 rounded-xl shadow-2xl 
      /* Позиціонування справа по верхньому краю кнопки */
      top-0 left-[calc(100%+12px)] 
      flex flex-col
      animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200
    ">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => handleLanguageSelect(lang)}
                            className="w-full px-4 py-2.5 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" className="text-[14px] text-white/40 hover:text-white transition-colors font-medium cursor-pointer">{t("loginPage.forgotPassword")}</button>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Divider & Sphere */}
          <div className="hidden lg:block w-[1px] h-[684px] bg-gradient-to-b from-transparent via-[#A855F7] to-transparent shadow-[4px_0px_20.3px_0px_rgba(168,85,247,0.5)]" />

          <section className="hidden lg:flex relative flex-1 justify-center">
            <div className="absolute inset-0 bg-[#B24CFA]/20 blur-[100px] rounded-full scale-125 animate-pulse" />
            <div className="relative w-[420px] h-[420px]">
              <Image src="/imgs/sphere.png" alt="" fill className="object-contain" priority />
            </div>
          </section>
        </div>
      </main>

      {/* Mobile/iPad Footer */}
      <footer className="relative z-50 pb-8 lg:hidden shrink-0" ref={mobileLangRef}>
        <button onClick={() => setUiState((p: any) => ({ ...p, isLangOpen: !p.isLangOpen }))} className="mx-auto block cursor-pointer px-4 py-2 bg-[#2D2639]/80 rounded-full text-[#9B4DFF] text-[14px] border border-white/5 font-semibold">
          {uiState.currentLang}
        </button>
        {uiState.isLangOpen && (
          <div className="absolute z-50 p-1 min-w-[140px] bg-[#1B1624] border border-white/10 rounded-xl shadow-2xl bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200">
            {LANGUAGES.map((lang) => (
              <button key={lang} onClick={() => handleLanguageSelect(lang)} className="w-full px-4 py-2.5 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer">{lang}</button>
            ))}
          </div>
        )}
      </footer>

      {/* Footer Glow */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none flex justify-center overflow-hidden shrink-0">
        <Image src="/footerLight.svg" alt="" width={1440} height={100} className="w-full h-auto object-contain translate-y-[35%]" />
      </div>
    </div>
  );
}