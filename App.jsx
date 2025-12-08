import React, { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  // --- Sound engine (WebAudio) ---
  const playBeep = (opts = {}) => {
    const { type = "sine", frequency = 880, duration = 0.09, gain = 0.08 } = opts;
    try {
      const ac = (window.audioCtx ||= new (window.AudioContext || window.webkitAudioContext)());
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.value = frequency;
      g.gain.value = 0;
      o.connect(g);
      g.connect(ac.destination);
      const now = ac.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 0.005);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      o.stop(now + duration + 0.02);
    } catch (e) {
      // ignore if AudioContext blocked (e.g., not allowed)
      // console.warn("Audio error", e);
    }
  };

  const playClick = () => playBeep({ type: "triangle", frequency: 900, duration: 0.07, gain: 0.06 });
  const playOp = () => playBeep({ type: "sawtooth", frequency: 520, duration: 0.10, gain: 0.08 });
  const playEq = () => {
    // little ascending arpeggio for equals
    playBeep({ type: "sine", frequency: 660, duration: 0.07, gain: 0.08 });
    setTimeout(() => playBeep({ type: "sine", frequency: 880, duration: 0.08, gain: 0.09 }), 80);
    setTimeout(() => playBeep({ type: "sine", frequency: 1100, duration: 0.12, gain: 0.10 }), 160);
  };

  // --- Safe evaluation ---
  const safeEvaluate = (s) => {
    try {
      if (!/^[0-9+\-*/(). %]*$/.test(s)) return "Err";
      const replaced = s.replace(/%(?=\D|$)/g, "/100");
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${replaced})`)();
      if (Number.isFinite(val)) return String(val);
      return "Err";
    } catch {
      return "Err";
    }
  };

  useEffect(() => {
    if (expr === "") return setResult("");
    const r = safeEvaluate(expr);
    setResult(r === "Err" ? "" : r);
  }, [expr]);

  const triggerButtonVisual = (char) => {
    // find one matching button (first occurrence)
    const els = Array.from(document.querySelectorAll(".key"));
    const found = els.find((el) => el.textContent.trim() === char);
    if (found) {
      found.classList.add("pressed");
      setTimeout(() => found.classList.remove("pressed"), 140);
    }
  };

  const add = (ch) => {
    const last = expr.slice(-1);
    if (/[+\-*/. ]/.test(last) && /[+*/.]/.test(ch)) return;
    setExpr((p) => p + ch);
  };

  const calc = () => {
    const r = safeEvaluate(expr);
    if (r === "Err") setResult("Err");
    else {
      setExpr(String(r));
      setResult("");
    }
  };

  const clearAll = () => {
    setExpr("");
    setResult("");
  };

  const backspace = () => setExpr((p) => p.slice(0, -1));

  // keyboard support
  const handleKey = (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      add(k);
      playClick();
      triggerButtonVisual(k);
    } else if (k === ".") {
      add(".");
      playClick();
      triggerButtonVisual(".");
    } else if (["+", "-", "*", "/"].includes(k)) {
      add(k);
      playOp();
      triggerButtonVisual(k);
    } else if (k === "Enter" || k === "=") {
      calc();
      playEq();
      triggerButtonVisual("=");
    } else if (k === "Backspace") {
      backspace();
      playClick();
      triggerButtonVisual("←");
    } else if (k === "Escape") {
      clearAll();
      // C button visual
      triggerButtonVisual("C");
      playBeep({ frequency: 220, duration: 0.12, gain: 0.09 });
    } else if (k === "%") {
      add("%");
      playOp();
      triggerButtonVisual("%");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr]);

  // button set
  const buttons = [
    "C", "←", "%", "/",
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "0", ".", "="
  ];

  const handleClick = (k) => {
    if (k === "C") {
      clearAll();
      playBeep({ frequency: 240, duration: 0.12, gain: 0.09 });
    } else if (k === "←") {
      backspace();
      playClick();
    } else if (k === "=") {
      calc();
      playEq();
    } else if (["/", "*", "-", "+", "%"].includes(k)) {
      add(k);
      playOp();
    } else {
      add(k);
      playClick();
    }
  };

  return (
    <div className="arcade-root">
      <div className="arcade-shell" role="application" aria-label="Arcade Calculator">
        <div className="arcade-top">
          <div className="arcade-title">கணிப்பொறி</div>

          <div className="arcade-screen" aria-live="polite">
            <div className="expr" title={expr}>{expr || "0"}</div>
            <div className="result">{result ? `≈ ${result}` : ""}</div>
          </div>
        </div>

        <div className="arcade-keys">
          {buttons.map((k, i) => {
            const isOp = ["/", "*", "-", "+", "="].includes(k);
            const cls = `key ${k === "C" ? "key-clear" : ""} ${k === "=" ? "key-eq" : ""} ${isOp ? "key-op" : ""}`;
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleClick(k)}
                onMouseDown={() => { /* visual handled in CSS :active & JS pressed class for keyboard */ }}
                aria-label={`Key ${k}`}
                type="button"
              >
                <span>{k}</span>
              </button>
            );
          })}
        </div>

        <div className="arcade-footer">
          Tip: Use keyboard (0–9, + - * /, Enter, Backspace, Esc)
        </div>
      </div>
    </div>
  );
}
