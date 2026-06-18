"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

const SCRAMBLE = "!@#$%^&*()_+-=[]01";

interface GlitchTextProps {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "span" | "p";
  glitchOnHover?: boolean;
  autoGlitch?: boolean;
  autoGlitchInterval?: number;
  rgbSplit?: boolean;
}

export default function GlitchText({
  text,
  className = "",
  tag: Tag = "span",
  glitchOnHover = true,
  autoGlitch = false,
  autoGlitchInterval = 5000,
  rgbSplit = true,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setDisplayText(text); }, [text]);

  const triggerGlitch = useCallback(() => {
    if (isGlitching) return;
    setIsGlitching(true);
    let i = 0;
    const max = 12;
    const iv = setInterval(() => {
      setDisplayText(
        text.split("").map((ch, idx) => {
          if (idx < (i * text.length) / max) return text[idx];
          return ch === " " ? " " : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        }).join("")
      );
      setIntensity(Math.sin((i / max) * Math.PI));
      i++;
      if (i > max) {
        clearInterval(iv);
        setDisplayText(text);
        setIntensity(0);
        setIsGlitching(false);
      }
    }, 40);
  }, [text, isGlitching]);

  useEffect(() => {
    if (autoGlitch) {
      intervalRef.current = setInterval(triggerGlitch, autoGlitchInterval);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [autoGlitch, autoGlitchInterval, triggerGlitch]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const prefersReduced = usePrefersReducedMotion();

  const clipA = useMemo(() => "inset(" + (30 + Math.random() * 20) + "% 0 " + (20 + Math.random() * 20) + "% 0)", [intensity]);
  const clipB = useMemo(() => "inset(" + (10 + Math.random() * 30) + "% 0 " + (30 + Math.random() * 30) + "% 0)", [intensity]);
  const clipC = useMemo(() => "inset(" + (Math.random() * 50) + "% 0 " + (Math.random() * 50) + "% 0)", [intensity]);

  if (prefersReduced) {
    return <Tag className={"relative inline-block " + className}><span className="relative z-10">{text}</span></Tag>;
  }

  return (
    <Tag
      className={"relative inline-block " + className}
      onMouseEnter={glitchOnHover ? triggerGlitch : undefined}
      style={{ cursor: "default" }}
    >
      <span className="relative z-10">{displayText}</span>

      {rgbSplit && intensity > 0 && (
        <>
          <span
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              color: "rgba(255, 0, 0, 0.5)",
              transform: "translate(" + intensity * 3 + "px, " + intensity * -1 + "px)",
              clipPath: clipA,
              mixBlendMode: "screen" as const,
            }}
          >
            {displayText}
          </span>
          <span
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              color: "rgba(0, 100, 255, 0.5)",
              transform: "translate(" + intensity * -3 + "px, " + intensity + "px)",
              clipPath: clipB,
              mixBlendMode: "screen" as const,
            }}
          >
            {displayText}
          </span>
          <span
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              color: "rgba(0, 255, 100, 0.3)",
              transform: "translate(" + intensity + "px, " + intensity * 2 + "px)",
              clipPath: clipC,
              mixBlendMode: "screen" as const,
            }}
          >
            {displayText}
          </span>
        </>
      )}

      {intensity > 0 && (
        <div
          className="absolute left-0 right-0 h-[2px] bg-white/10 pointer-events-none z-30"
          style={{
            top: (30 + Math.random() * 40) + "%",
            transform: "translateX(" + (Math.random() - 0.5) * 20 + "px)",
            opacity: intensity,
          }}
        />
      )}
    </Tag>
  );
}
