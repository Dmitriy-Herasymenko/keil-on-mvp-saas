"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "../hooks/useTranslations";
import { locales, localeNames, type Locale } from "@/i18n/config";

interface LanguageSelectorProps {
  onChange?: (locale: Locale) => void;
}

export default function LanguageSelector({ onChange }: LanguageSelectorProps) {
  const { t } = useTranslations();
  const [locale, setLocale] = useState<Locale>('uk');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && locales.includes(saved)) {
      setLocale(saved);
    }
  }, []);

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    onChange?.(newLocale);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
        {t("language.title")}:
      </span>
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
