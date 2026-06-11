"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Lang, type TKey } from "./translations";

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
};

const LanguageContext = createContext<LangCtx>({
  lang: "pt",
  setLang: () => {},
  t: (key) => translations.pt[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("campanha_lang") as Lang | null;
    // "he" was removed from the UI — treat it as "pt"
    if (saved && saved in translations && saved !== "he") setLangState(saved);
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
    document.documentElement.dir = "ltr";
    localStorage.setItem("campanha_lang", lang);
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
  }

  function t(key: TKey): string {
    return translations[lang][key] ?? translations.pt[key];
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
