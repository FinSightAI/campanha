"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

// One-time legal acknowledgment (AI use + TSE labeling responsibility) plus a
// persistent disclosure footer shown across the authenticated app.
export default function LegalNotice() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("campanha_legal_ack")) setShow(true);
  }, []);

  function accept() {
    try { localStorage.setItem("campanha_legal_ack", new Date().toISOString()); } catch { /* ignore */ }
    setShow(false);
  }

  return (
    <>
      {show && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("legal_ack_title")}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.82)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--card)", border: "1px solid var(--gold)" }}
          >
            <p className="text-lg mb-3">⚠️</p>
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--gold)" }}>
              {t("legal_ack_title")}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text)", lineHeight: 1.6 }}>
              {t("legal_ack_body")}
            </p>
            <button
              onClick={accept}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              {t("legal_ack_accept")}
            </button>
          </div>
        </div>
      )}

      {/* Persistent disclosure — always present in the DOM */}
      <div
        className="px-4 py-3 text-center"
        style={{ borderTop: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, lineHeight: 1.5 }}
      >
        {t("legal_footer")}
      </div>
    </>
  );
}
