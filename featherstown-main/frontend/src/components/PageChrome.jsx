/* ═══════════════════════════════════════════════════
   Site-wide chrome: custom cursor dot, scroll progress
   bar, back-to-top button, toast notifications.
   Mounted once in App.jsx so it persists across pages.
═══════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from "react";
import ToastContainer from "./ui/Toast";
import { UpIco } from "./ui/Icons";
import useScrollReveal from "../hooks/useScrollReveal";

export default function PageChrome() {
  const [showBtt, setShowBtt] = useState(false);
  const [prog, setProg] = useState(0);

  /* Activates the real-time reveal engine once, app-wide. It keeps
     working on its own afterwards — no need to re-run on route
     change, it auto-detects new content as it's added. */
  useScrollReveal();

  useEffect(() => {
    const h = () => {
      setShowBtt(window.scrollY > 400);
      const el = document.documentElement;
      setProg((window.scrollY / (el.scrollHeight - el.clientHeight || 1)) * 100);
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <ToastContainer />
      <div id="prog" style={{ width: `${prog}%` }} />
      <button
        className={`btt${showBtt ? "" : " hide"}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <UpIco />
      </button>
    </>
  );
}
