"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./translations";

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
};

const LanguageContext = createContext<LangCtx>({
  lang: "he",
  setLang: () => {},
  t: (key) => translations.he[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const saved = localStorage.getItem("campanha_lang") as Lang | null;
    if (saved && saved in translations) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    localStorage.setItem("campanha_lang", lang);
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
  }

  function t(key: TKey): string {
    return translations[lang][key] ?? translations.he[key];
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
