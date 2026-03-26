"use client";

import { useState, useEffect } from "react";
import { Locale } from "@/i18n/config";

import en from "@/messages/en.json";
import de from "@/messages/de.json";
import uk from "@/messages/uk.json";

const messages = { en, de, uk };

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>("uk");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && ["en", "de", "uk"].includes(saved)) {
      setLocale(saved);
    }
    setIsLoaded(true);
  }, []);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return { t, locale, setLocale, isLoaded };
}
