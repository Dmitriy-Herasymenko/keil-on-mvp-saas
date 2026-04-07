"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LANGUAGES = ["English", "Deutsch", "Русский"] as const;
const MODES = ["friendly", "formal", "casual", "professional"] as const;
const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

type SelectionType = "lang" | "mode" | "voice" | null;

interface OnboardingState {
    name: string;
    language: string;
    mode: string;
    voice: string;
}


const InfoTooltip = ({ text }: { text: string }) => (

    <div className="hidden lg:block absolute top-2 right-2 w-[36px] h-[36px] flex items-center justify-center group/info z-20 cursor-pointer">
        <div className="bg-white/10 p-[10px] rounded-full transition-all duration-200 group-hover/info:opacity-0 group-hover/info:scale-50">
            <Image src="/icons/info.svg" alt="info" width={16} height={16} />
        </div>
        <div className="absolute left-0 top-0 flex items-center gap-2 bg-[#2D2639] border border-white/10 rounded-full py-2 px-[14px] text-[14px] text-white font-medium whitespace-nowrap shadow-2xl transition-all duration-300 origin-left opacity-0 scale-95 translate-x-2 pointer-events-none group-hover/info:opacity-100 group-hover/info:scale-100 group-hover/info:translate-x-0 group-hover/info:pointer-events-auto">
            <div className="shrink-0 text-[#B24CFA]">
                <Image src="/icons/info.svg" alt="" width={16} height={16} />
            </div>
            <span className="pr-4">{text}</span>
        </div>
    </div>
);

const OnboardingCard = ({ icon, label, tooltip, children, menuType, activeMenu, options, selectedValue, onSelect }: any) => (
    <div className="relative rounded-[20px] border-[2px] border-white/10 bg-[#1B1624]/60  py-[16px] px-[20px] lg:py-[23px] lg:px-[26px] flex items-center gap-3 lg:gap-4 transition-all max-w-[393px]">
        <div className="w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] shrink-0">
            <Image src={icon} alt="" width={48} height={48} />
        </div>
        <div className="flex-grow pr-6 lg:pr-0">
            <label className="block font-sora font-semibold text-[16px] lg:text-[18px] text-white mb-[6px] lg:mb-[11px] leading-tight">{label}</label>
            {children}
        </div>
        <InfoTooltip text={tooltip} />

        {activeMenu === menuType && options && (
            <div className="cursor-pointer absolute left-0 lg:left-[calc(100%+20px)] top-[105%] lg:top-0 w-full lg:w-[180px] 
            bg-white/12 backdrop-blur-[36px] border border-white/10 rounded-[18px] p-2 shadow-2xl 
            z-[9999] animate-in fade-in zoom-in-95" 
>
                {options.map((opt: string) => (
                    <button
                        key={opt}
                        onClick={() => onSelect?.(opt)}
                        className={`cursor-pointer   w-full text-center lg:text-left px-5 py-3 rounded-[10px] text-[15px] transition-all ${selectedValue === opt ? 'bg-white/10 text-white' : 'text-white'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<OnboardingState>({
        name: "Alex",
        language: "English",
        mode: "Mode 1",
        voice: "Voice 1",
    });

    const [activeMenu, setActiveMenu] = useState<SelectionType>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleStart = () => router.push("/dashboard");
    const toggleMenu = (type: SelectionType) => setActiveMenu(activeMenu === type ? null : type);

    const selectStyle = "w-full rounded-[18px] bg-[#1B1623] outline-none text-[14px] lg:text-[15px] text-[#9B4DFF] py-[8px] px-[14px] lg:py-[9px] lg:px-[16px] border border-white/5 flex items-center justify-between hover:bg-[#A855F7]/20 transition-all cursor-pointer";

    return (
        <div className="fixed lg:relative inset-0 lg:inset-auto h-[100dvh] lg:min-h-screen lg:h-auto w-full flex flex-col  font-manrope text-white overflow-hidden lg:overflow-visible touch-none lg:touch-auto bg-[#0C0714]">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[300px] lg:h-[400px] pointer-events-none z-0">
                <Image src="/imgs/topOnboardingGlow.png" alt="" width={1200} height={400} className="object-contain" priority />
            </div>

            <main className="relative z-10 w-full max-w-[600px] mx-auto flex flex-col items-center px-6 pt-6 lg:py-20 h-full lg:h-auto overflow-hidden lg:overflow-visible">

                {/* Header */}
                <div className="text-center mb-5 lg:mb-14 shrink-0">
                    <h1 className="font-sora text-[32px] lg:text-[48px] font-semibold mb-1 lg:mb-3">Welcome to KeilOn</h1>
                    <p className="text-[#967ABD] font-medium text-[16px] lg:text-[20px]">Your personal voice AI assistant</p>
                </div>


                <div
                    className="w-full flex-grow overflow-y-auto lg:overflow-visible flex flex-col scrollbar-hide touch-auto [-webkit-overflow-scrolling:touch]"
                    ref={menuRef}
                >
                    <div className="w-full my-auto flex flex-col gap-3 lg:gap-[28px] py-4 items-center">

                        {/* Name */}
                        <div className="relative shrink-0 z-[10] w-full max-w-[393px]">
                            <OnboardingCard icon="/icons/onboardingName.svg" label="Your KeilOn's name is" tooltip="Can be set with voice later" menuType={null} activeMenu={null}>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-[20px] bg-white/10 outline-none text-[14px] lg:text-[15px] text-white py-[8px] px-[14px] lg:py-[9px] lg:px-[16px] border border-white/5 focus:border-[#B24CFA]/50 transition-all placeholder:text-white/20"
                                    placeholder="Alex"
                                />
                            </OnboardingCard>
                        </div>

                        {/* Language */}
                        <div className={`relative shrink-0 w-full max-w-[393px] ${activeMenu === 'lang' ? 'z-[50]' : 'z-[9]'}`}>
                            <OnboardingCard icon="/icons/onboardingLang.svg" label="KeilOn's language is" tooltip="Can be set with language later" menuType="lang" activeMenu={activeMenu} options={LANGUAGES} selectedValue={formData.language} onSelect={(val: any) => { setFormData({ ...formData, language: val }); setActiveMenu(null); }}>
                                <button onClick={() => toggleMenu("lang")} className={selectStyle}>
                                    <span>{formData.language}</span>
                                    <Image src="/icons/chevron-right.svg" alt="" width={10} height={10} className={`transition-transform duration-300 ${activeMenu === "lang" ? "rotate-90" : ""}`} />
                                </button>
                            </OnboardingCard>
                        </div>

                        {/* Mode */}
                        <div className={`relative shrink-0 w-full max-w-[393px] ${activeMenu === 'mode' ? 'z-[50]' : 'z-[8]'}`}>
                            <OnboardingCard icon="/icons/onboardingMode.svg" label="KeilOn maintains" tooltip="Can be set with mode later" menuType="mode" activeMenu={activeMenu} options={MODES} selectedValue={formData.mode} onSelect={(val: any) => { setFormData({ ...formData, mode: val }); setActiveMenu(null); }}>
                                <button onClick={() => toggleMenu("mode")} className={selectStyle}>
                                    <span>{formData.mode}</span>
                                    <Image src="/icons/chevron-right.svg" alt="" width={10} height={10} className={`transition-transform duration-300 ${activeMenu === "mode" ? "rotate-90" : ""}`} />
                                </button>
                            </OnboardingCard>
                        </div>

                        {/* Voice */}
                        <div className={`relative shrink-0 w-full max-w-[393px] ${activeMenu === 'voice' ? 'z-[50]' : 'z-[7]'}`}>
                            <OnboardingCard icon="/icons/onboardingMode.svg" label="KeilOn has" tooltip="Can be set with voice later" menuType="voice" activeMenu={activeMenu} options={VOICES} selectedValue={formData.voice} onSelect={(val: any) => { setFormData({ ...formData, voice: val }); setActiveMenu(null); }}>
                                <button onClick={() => toggleMenu("voice")} className={selectStyle}>
                                    <span>{formData.voice}</span>
                                    <Image src="/icons/chevron-right.svg" alt="" width={10} height={10} className={`transition-transform duration-300 ${activeMenu === "voice" ? "rotate-90" : ""}`} />
                                </button>
                            </OnboardingCard>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto w-full flex flex-col items-center gap-4 lg:gap-6 shrink-0 pt-4 pb-6 lg:pb-0 bg-[#0C0A10] ">
                    <button
                        onClick={handleStart}
                        className="w-full lg:w-auto cursor-pointer rounded-full text-white font-[600] text-[18px] lg:text-[20px] py-[14px] lg:py-[16px] px-[60px] lg:px-[102px] transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-gradient-to-b from-[#E986FA] to-[#9739C0] border-[2px] border-transparent bg-origin-border [background-clip:padding-box,border-box] [background-image:linear-gradient(to_bottom,#E986FA,#9739C0),linear-gradient(to_bottom,#6C2BFF_0%,#FFFFFF_19%,#FFFFFF_29%,transparent_100%)]"
                    >
                        Get Started
                    </button>
                    <button onClick={() => router.push("/")} className="text-white/40 text-[16px] lg:text-[20px] font-[500] hover:text-white transition-colors cursor-pointer">
                        Skip for now
                    </button>
                </div>
            </main>
        </div>
    );
}