"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "../components/Header";
import { useTranslations } from "../hooks/useTranslations";


const NavLink = ({ icon, label }: { icon: string; label: string }) => (
    <button className="flex items-center gap-[10px] text-white hover:text-white/60 transition-colors cursor-pointer text-[14px] font-medium">
        <Image src={icon} alt="" width={18} height={18} />
        <span>{label}</span>
    </button>
);

const TipCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
    <div className="group relative w-full lg:max-w-[302px] p-[1px] rounded-[20px] bg-white/10">
        <div className="rounded-[18px] px-[20px] py-[20px] h-full transition-all hover:bg-white/5 cursor-pointer bg-[#1B1624]/40 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-[12px]">
                <div className="bg-[#3D2C5E54] p-[10px] rounded-[10px]">
                    <Image src={icon} alt="" width={24} height={24} />
                </div>
                <Image src="/icons/arrow-up-right.svg" alt="" width={14} height={14} className="opacity-40" />
            </div>
            <h3 className="text-white font-semibold text-[16px] mb-[8px]">{title}</h3>
            <p className="text-[#FFFFFF8A] text-[13px] font-normal leading-relaxed">{desc}</p>
        </div>
    </div>
);

// --- Main Page ---

export default function AssistantPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t } = useTranslations();


    return (
        <div className="relative min-h-screen w-full bg-[#0C0714] font-manrope text-white overflow-hidden flex flex-col lg:h-auto">

            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full z-0 pointer-events-none flex justify-center">
                <Image src="/headerLight.svg" alt="" width={1440} height={488} className="w-full h-auto object-cover " priority />
            </div>


            <div className="text-center lg:mt-[20px]">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <h2 className="text-[32px] lg:text-[48px] font-sora font-semibold tracking-tight">{t("assistantPage.greeting")}</h2>
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 flex-grow container mx-auto flex flex-col lg:flex-row items-center lg:items-stretch px-6 lg:px-[2px]">

                <aside className="hidden lg:flex w-full lg:w-[320px] flex-col justify-center gap-6 z-10 mt-10">
                    <div className="text-[14px] font-sora font-semibold text-white/40 tracking-[0.2em] uppercase mb-2">{t("assistantPage.tipsTitle")}</div>
                    <TipCard
                        icon="/icons/calendar.svg"
                        title={t("assistantPage.tips.calendar.title")}
                        desc={t("assistantPage.tips.calendar.desc")}
                    />
                    <TipCard
                        icon="/icons/whatsapp.svg"
                        title={t("assistantPage.tips.whatsapp.title")}
                        desc={t("assistantPage.tips.whatsapp.desc")}
                    />
                </aside>

                {/* Center - Visualizer */}
                <section className="flex-grow flex flex-col items-center justify-center py-10 lg:py-0">

                    <div className="flex flex-col items-center">
                        <p className="text-white/40 font-medium text-[15px] mb-8 animate-pulse lg:animate-none">
                            <span className="lg:hidden">{t("assistantPage.statusListening")}</span>
                            <span className="hidden lg:inline">{t("assistantPage.statusSpeaking")}</span>
                        </p>

                        <div className="relative w-[210px] h-[210px] lg:w-[360px] lg:h-[360px] flex items-center justify-center">
                            <Image src="/imgs/sphere.png" alt="Visualizer" fill className="object-contain" priority />
                        </div>
                    </div>
                </section>

                <div className="hidden lg:block lg:w-[320px]" />
            </main>

            {/* Footer */}
            <footer className="relative z-20 flex flex-col items-center pb-12 gap-4">
                <button className="
                    w-[168px] h-[168px] lg:w-[64px] lg:h-[64px] rounded-full flex items-center justify-center  cursor-pointer 
                ">
                    <Image
                        src={isMenuOpen ? "/icons/mic-off.svg" : "/icons/mic-off.svg"}
                        alt="mic"
                        width={64}
                        height={64}
                        className="hidden lg:block lg:w-[64px] lg:h-[64px] group-hover:scale-110 transition-transform"
                    />
                    <Image
                        src={"/icons/mic-on.svg"}
                        alt="mic"
                        width={164}
                        height={164}
                        className="block lg:hidden group-hover:scale-110 transition-transform"
                    />
                </button>
                <p className="hidden lg:block text-[15px] font-semibold text-[#B24CFA] tracking-wide">
                    {t("assistantPage.micStatusOff")}
                </p>

            </footer>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[150] bg-[#0C0714]/90 backdrop-blur-[40px] transition-all duration-300 lg:hidden flex flex-col ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

                {/* Menu Header */}
                <div className="flex items-center justify-between px-6 py-5">
                    <Image src="/imgs/logo.svg" alt="Logo" width={100} height={28} priority />
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 cursor-pointer">
                        <div className="relative w-6 h-6">
                            <div className="absolute top-1/2 left-0 w-6 h-[2px] bg-white rotate-45" />
                            <div className="absolute top-1/2 left-0 w-6 h-[2px] bg-white -rotate-45" />
                        </div>
                    </button>
                </div>

                {/* Menu Content */}
                <div className="flex-grow px-6 flex flex-col">
                    <div className="mt-8 mb-6 w-full">
                        <div className=" text-[14px] font-sora font-semibold text-white/51 tracking-[0.2em] uppercase mb-5">{t("assistantPage.tipsTitle")}</div>
                        <div className=" flex flex-col gap-3">
                            <TipCard
                                icon="/icons/calendar.svg"
                                title={t("assistantPage.tips.calendar.title")}
                                desc={t("assistantPage.tips.calendar.desc")}
                            />
                            <TipCard
                                icon="/icons/whatsapp.svg"
                                title={t("assistantPage.tips.whatsapp.title")}
                                desc={t("assistantPage.tips.whatsapp.desc")}
                            />
                        </div>
                    </div>

                    {/* Action Buttons (Settings & Log out) */}
                    <div className="mt-auto pb-12 flex flex-col gap-3">
                        <button className="w-full flex items-center gap-3 bg-white/6 border border-white/10 rounded-[20px] py-[18px] px-6 text-[16px] font-semibold hover:bg-white/10 transition-all">
                            <Image src="/icons/settings.svg" alt="" width={22} height={22} />
                            <span>Settings</span>
                        </button>

                        <button className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-[20px] py-[18px] px-6 text-[16px] font-semibold hover:bg-white/10 transition-all text-white">
                            <Image src="/icons/logout.svg" alt="" width={22} height={22} />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#B24CFA]/20 blur-[120px] pointer-events-none -z-10" />
            </div>

            {/* Footer Glow */}
            <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none flex justify-center">
                <div className="w-full h-[150px] relative">
                    <Image src="/footerLight.svg" alt="" fill className="object-cover translate-y-[40%]" />
                </div>
            </div>

        </div>
    );
}