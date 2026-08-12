"use client";

import { useEffect, useRef, useState } from "react";
import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";

type Language = {
  code: string;
  label: string;
  native: string;
};

const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

const STORAGE_KEY = "preferred-language";
const COOKIE_NAME = "googtrans";

function setGoogtransCookie(lang: string) {
  const value = lang === "en" ? "" : `/en/${lang}`;
  const expires = new Date();
  expires.setDate(expires.getDate() + 365);
  const base = `path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  document.cookie = `${COOKIE_NAME}=${value}; ${base}`;
  const host = window.location.hostname;
  if (host && host !== "localhost") {
    document.cookie = `${COOKIE_NAME}=${value}; domain=${host}; ${base}`;
    const root = host.split(".").slice(-2).join(".");
    if (root && root !== host) {
      document.cookie = `${COOKIE_NAME}=${value}; domain=.${root}; ${base}`;
    }
  }
}

function applyViaCombo(lang: string): boolean {
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!select) return false;
  select.value = lang === "en" ? "" : lang;
  select.dispatchEvent(new Event("change"));
  return true;
}

function readStoredLanguage(): string {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && LANGUAGES.some((l) => l.code === stored) ? stored : "en";
}

// Exposed so other modules (e.g. CleverTap profile sync) can read the
// user's chosen language without duplicating the LANGUAGES table.
export function getPreferredLanguageLabel(): string {
  const code = readStoredLanguage();
  return LANGUAGES.find((l) => l.code === code)?.label ?? "English";
}

export default function LanguageToggle() {
  const [current, setCurrent] = useState<string>(readStoredLanguage);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = readStoredLanguage();
    if (initial !== "en") setGoogtransCookie(initial);

    const w = window as unknown as {
      googleTranslateElementInit?: () => void;
      google?: { translate?: { TranslateElement?: new (cfg: unknown, id: string) => unknown } };
    };

    w.googleTranslateElementInit = () => {
      const Ctor = w.google?.translate?.TranslateElement as
        | (new (cfg: unknown, id: string) => unknown)
        | undefined;
      if (!Ctor) return;
      new Ctor(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const choose = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    setCurrent(code);
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, code);
    setGoogtransCookie(code);
    cleverTapTrackEvent(CLEVERTAP_EVENTS.LANGUAGE_SELECTED, {
      Language: lang?.label ?? code,
    });
    if (!applyViaCombo(code)) {
      // Widget not mounted yet — reload so the cookie takes effect.
      window.location.reload();
      return;
    }
    if (code === "en") {
      // Some browsers need a reload to fully strip Google's rewrites.
      window.location.reload();
    }
  };

  return (
    <>
      <div id="google_translate_element" aria-hidden className="hidden" />
      <div
        ref={containerRef}
        className="notranslate fixed top-3 right-3 z-[60] sm:bottom-4 sm:left-4 sm:top-auto sm:right-auto"
        translate="no"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border-2 border-[#6232FF] shadow-lg transition hover:shadow-xl"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="absolute left-2 top-1.5 text-sm font-bold leading-none text-[#6232FF]">अ</span>
          <span className="absolute bottom-1.5 right-2 text-xs font-bold leading-none text-[#6232FF]">A</span>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute top-full right-0 mt-2 max-h-[60vh] w-44 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)] sm:bottom-full sm:top-auto sm:left-0 sm:right-auto sm:mb-2 sm:mt-0"
          >
            {LANGUAGES.map((lang) => {
              const selected = lang.code === current;
              return (
                <li key={lang.code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => choose(lang.code)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "bg-[#6232FF]/8 text-[#6232FF]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{lang.native}</span>
                      <span className="text-[10px] text-gray-400">{lang.label}</span>
                    </span>
                    {selected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
