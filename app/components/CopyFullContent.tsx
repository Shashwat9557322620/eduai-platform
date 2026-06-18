"use client";
import { useState } from 'react';

interface CopyFullContentProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyFullContent({ text, label = "Copy Full Content", className = "" }: CopyFullContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${
        copied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
          : 'bg-white/[0.06] text-white/80 border border-white/[0.10] hover:bg-white/[0.10] hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied to Clipboard!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
