"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "../hooks/useTranslations";


interface HeaderProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (val: boolean) => void;
}

const SELECT_OPTIONS = [
    { label: "Friendly", value: "friend" },
    { label: "Formal", value: "formal" },
    { label: "Casual", value: "casual" },
    { label: "Professional", value: "professional" },
];

export const Header = ({ isMenuOpen, setIsMenuOpen }: HeaderProps) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(SELECT_OPTIONS[0]);
    const selectRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth < 1024) return;

            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: typeof SELECT_OPTIONS[0]) => {
        console.log("Вибрано:", option.value);
        setSelectedValue(option);
        setTimeout(() => {
            setIsSelectOpen(false);
        }, 100);
    };

    return (
        <>
            <header className="relative z-[100] flex items-center justify-between px-6 py-5 lg:px-[60px] lg:py-8">
                <div className="flex-1 flex justify-start">
                    <Image src="/imgs/logo.svg" alt="Logo" width={100} height={28} className="lg:w-[110px] lg:h-[32px] cursor-pointer" priority />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex justify-center z-[110]" ref={selectRef}>
                    <button
                        onClick={() => setIsSelectOpen(true)}
                        className="flex items-center gap-2 bg-white/24 border border-white/24 px-4 py-1.5 lg:px-5 lg:py-2 rounded-full hover:bg-white/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                        <span className="text-[14px] lg:text-[15px] font-semibold text-white">{selectedValue.label}</span>
                        <Image src="/icons/chevron-down.svg" alt="" width={10} height={10} />
                    </button>

                    {isSelectOpen && (
                        <div className="hidden lg:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[160px] bg-[#1B1624]/90 border border-white/10 rounded-[18px] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                            {SELECT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-left cursor-pointer px-4 py-2.5 rounded-[12px] text-[14px] transition-all ${selectedValue.value === option.value ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex justify-end items-center">
                    <div className="hidden lg:flex items-center gap-8">
                        <button className="flex items-center gap-2 text-[14px] font-medium"><Image src="/icons/settings.svg" alt="" width={18} height={18} />{t("header.settings")}</button>
                        <button className="flex items-center gap-2 text-[14px] font-medium"><Image src="/icons/logout.svg" alt="" width={18} height={18} /> {t("header.logout")}</button>
                    </div>

                    <button onClick={() => setIsMenuOpen(true)} className="lg:hidden flex flex-col gap-[5px] p-2">
                        <div className="w-6 h-[2px] bg-white" />
                        <div className="w-4 h-[2px] bg-white" />
                        <div className="w-2 h-[2px] bg-white" />
                    </button>
                </div>
            </header>

            <div className={`fixed inset-0 z-[1000] w-full h-[100dvh] bg-[#0C0714]/80 backdrop-blur-[40px] transition-all duration-300 lg:hidden flex flex-col items-center justify-center ${isSelectOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-full px-6 flex flex-col gap-4">
                    <h3 className="text-center text-white/40 uppercase tracking-widest text-[12px] mb-4">{t("header.selectModeTitle")}</h3>
                    {SELECT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            className={`w-full py-5 rounded-[24px] text-[20px] font-semibold border transition-all duration-200 ${selectedValue.value === option.value
                                    ? 'bg-white/20 border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]'
                                    : 'bg-transparent border-transparent text-white/40 active:bg-white/5'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setIsSelectOpen(false)}
                        className="mt-10 text-white/60 text-[16px] font-medium p-4"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    );
};