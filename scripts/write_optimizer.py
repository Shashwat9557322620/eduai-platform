#!/usr/bin/env python3
"""Write the complete optimizer page TSX file."""
import os

content = r'''"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import MouseTrail from '../components/MouseTrail';
import AmbientBackground from '../components/AmbientBackground';
import { supabase } from '../../lib/supabaseClient';

interface TimetableSlot {
  time: string;
  slotTitle: string;
  details: string;
}

interface DayProtocol {
  day: number;
  title: string;
  description: string;
  timetable: TimetableSlot[];
}

/* Typing Placeholder Component */
function TypingPlaceholder({ texts, className }: { texts: string[]; className?: string }) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    let innerTimeout: ReturnType<typeof setTimeout> | null = null;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          innerTimeout = setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 60 + Math.random() * 40);
    return () => { clearTimeout(timeout); if (innerTimeout) clearTimeout(innerTimeout); };
  }, [charIndex, isDeleting, textIndex, texts]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-block w-[2px] h-[1em] bg-cyan-400 ml-0.5 align-text-bottom animate-pulse" />
    </span>
  );
}

const GENERATION_PHASES = [
  "Initializing Neural Pipeline...",
  "Parsing syllabus structure...",
  "Deconstructing academic modules...",
  "Optimizing day-by-day allocation...",
  "Generating execution protocol...",
  "Finalizing neural data stream...",
];

/* Terminal Line Component */
function TerminalLine({ prefix, text, color = "text-cyan-400" }: { prefix: string; text: string; color?: string }) {
  return (
    <div className="flex items-start gap-3 text-sm font-mono animate-[slide-up_0.4s_ease-out_forwards]">
      <span className="text-gray-600 shrink-0">{prefix}</span>
      <span className={color}>{text}</span>
    </div>
  );
}

/* Progress Ring Component */
function ProgressRing({ progress, size = 48, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#progressGradient)" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Optimizer() {
  const { user } = useUser();
  const [syllabus, setSyllabus] = useState('');
  const [days, setDays] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [protocol, setProtocol] = useState<DayProtocol[]>([]);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [generatingPhase, setGeneratingPhase] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);

  const completedPercent = protocol.length > 0
    ? Math.round((completedDays.size / protocol.length) * 100)
    : 0;

  const toggleComplete = (day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!syllabus.trim() || !days) {
      setError("SYSTEM ALERT: Please input both Syllabus and Target Days.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setProtocol([]);
    setGeneratingPhase(0);

    for (let i = 0; i < GENERATION_PHASES.length; i++) {
      setGeneratingPhase(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus, days, userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Neural Engine connection failed.");
      }

      const planData: DayProtocol[] = data.protocol;
      setProtocol(planData);

      for (let i = 0; i < planData.length; i++) {
        setGeneratedCount(i + 1);
        await new Promise((r) => setTimeout(r, 120));
      }

      const { error: dbError } = await supabase
        .from('study_plans')
        .insert([{ syllabus, days, plan: JSON.stringify(planData) }]);

      if (dbError) console.error("Supabase Save Error:", dbError);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
      setGeneratingPhase(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">
      <AmbientBackground />
      <div className="hidden md:block"><MouseTrail /></div>
      <Navbar />

      <div className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto relative z-10 flex flex-col min-h-[90vh]">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
            </span>
            <span className="text-gray-400 uppercase">Neural Protocol Engine Online</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase drop-shadow-2xl">
            Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Optimizer.</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto">
            Input raw syllabus text or upload documents. The AI will deconstruct it into an optimized, bite-sized daily execution protocol.
          </p>
        </div>

        {/* Input Terminal */}
        <div className="relative group mb-12">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 rounded-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
          <div className="relative bg-[#07070a] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">

            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">neural-input-v3.2</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono text-emerald-500/80 tracking-wider">ACTIVE</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono flex items-center gap-3 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            {/* Typing placeholder terminal preview */}
            {!syllabus && !isGenerating && (
              <div className="bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-sm">
                <div className="text-gray-600 text-xs mb-2">$ neural-engine --init</div>
                <TypingPlaceholder
                  texts={["Waiting for syllabus input...", "Ready to deconstruct academic structure...", "Awaiting raw curriculum data...", "Neural pipeline standing by..."]}
                  className="text-cyan-400/60"
                />
              </div>
            )}

            {/* Generating animation */}
            {isGenerating && (
              <div className="bg-black/50 rounded-xl p-5 border border-cyan-500/10 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ProgressRing progress={(generatingPhase / 5) * 100} size={32} strokeWidth={2} />
                    <span className="text-xs font-mono text-cyan-400 tracking-wider">NEURAL PROCESSING</span>
                  </div>
                  <span className="text-xs font-mono text-gray-600">PHASE {generatingPhase + 1}/6</span>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-hidden">
                  {Array.from({ length: generatingPhase + 1 }, (_, i) => (
                    <TerminalLine key={i} prefix="[SYS]" text={GENERATION_PHASES[i]} />
                  ))}
                </div>
                <div className="relative h-[1px] bg-white/5 overflow-hidden mt-3">
                  <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[data-stream_1.5s_linear_infinite]" />
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-grow space-y-2">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest ml-1">Raw Syllabus Input</label>
                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Paste your syllabus here — exam patterns, topics, chapters..."
                  className="w-full h-32 bg-[#000000] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 font-mono text-sm resize-none custom-scrollbar hover:border-white/15"
                />
              </div>

              <div className="md:w-64 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-purple-400 uppercase tracking-widest ml-1">Target Days</label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-300 font-mono text-sm hover:border-white/15"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(String(d))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                        days === String(d)
                          ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                          : 'bg-white/[0.03] border border-white/5 text-gray-500 hover:border-white/15 hover:text-white'
                      }`}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
                isGenerating
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'bg-white text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {!isGenerating && (
                <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
              )}
              {isGenerating ? (
                <>
                  <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></span>
                  ANALYZING NEURAL DATA...
                </>
              ) : (
                <>
                  INITIALIZE ANALYZER
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar when protocol exists */}
        {protocol.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-500 tracking-wider uppercase">Completion Progress</span>
              <span className="text-xs font-mono text-cyan-400">{completedDays.size}/{protocol.length} DAYS — {completedPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${completedPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[data-stream_2s_linear_infinite]" />
              </div>
            </div>
          </div>
        )}

        {/* Protocol Display */}
        {protocol.length > 0 && (
          <div className="animate-[slide-up_0.6s_ease-out]">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-cyan-500/50"></div>
              <span className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase border border-cyan-500/30 px-4 py-1 rounded-full bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                PROTOCOL DEPLOYED — {protocol.length} DAYS
              </span>
              <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-cyan-500/50"></div>
            </div>

            <div className="relative border-l-2 border-cyan-900/50 ml-4 md:ml-8 space-y-8 pb-10">
              {protocol.map((dayItem, index) => (
                <div
                  key={dayItem.day}
                  className="relative pl-8 md:pl-12"
                  style={{
                    opacity: index < generatedCount ? 1 : 0,
                    transform: index < generatedCount ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
                  }}
                >
                  <div className={`absolute -left-[9px] top-4 w-4 h-4 bg-[#020203] border-2 rounded-full transition-all duration-500 ${
                    completedDays.has(dayItem.day)
                      ? 'border-green-400 shadow-[0_0_20px_#4ade80]'
                      : 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  }`}></div>

                  <div className={`group relative bg-[#07070a] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                    completedDays.has(dayItem.day)
                      ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]'
                      : 'border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                  }`}>
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12" />
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">DAY {dayItem.day}</span>
                        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">
                          {dayItem.title}
                        </h3>
                      </div>
                      {completedDays.has(dayItem.day) && (
                        <span className="text-xs font-mono text-green-400 border border-green-500/30 px-2 py-1 rounded-full bg-green-500/10 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          DONE
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                      {dayItem.description}
                    </p>

                    {dayItem.timetable && dayItem.timetable.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-mono text-purple-400 uppercase tracking-widest">Timetable</p>
                        {dayItem.timetable.map((slot, i) => (
                          <div key={i} className="flex gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors">
                            <span className="text-xs font-mono text-cyan-500 whitespace-nowrap pt-0.5">{slot.time}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{slot.slotTitle}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{slot.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                      <div
                        onClick={() => toggleComplete(dayItem.day)}
                        className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-all duration-300 ${
                          completedDays.has(dayItem.day)
                            ? 'bg-green-500 border-green-500 shadow-[0_0_10px_rgba(74,222,128,0.4)]'
                            : 'border-gray-600 hover:border-cyan-400'
                        }`}
                      >
                        {completedDays.has(dayItem.day) && (
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <span className="text-xs font-mono text-cyan-500 tracking-widest uppercase cursor-pointer select-none" onClick={() => toggleComplete(dayItem.day)}>
                        Mark as Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
      `}} />
    </div>
  );
}
'''

target = os.path.join('app', 'optimizer', 'page.tsx')
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Written {len(content)} chars to {target}')
