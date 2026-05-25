"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MouseTrail from '../components/MouseTrail';
import { supabase } from '../../lib/supabaseClient';

// Types
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

export default function Optimizer() {
  const [syllabus, setSyllabus] = useState('');
  const [days, setDays] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [protocol, setProtocol] = useState<DayProtocol[]>([]);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const toggleComplete = (day: number) => {
    setCompletedDays(prev => {
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

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus, days }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Neural Engine connection failed.");
      }

      // ✅ FIX: Backend 'protocol' (array) use kar, purana 'plan' (string) nahi
      const planData: DayProtocol[] = data.protocol;
      setProtocol(planData);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('study_plans')
        .insert([{ syllabus, days, plan: JSON.stringify(planData) }]);

      if (dbError) console.error("Supabase Save Error:", dbError);

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-center">
        <div className="w-[70vw] h-[70vw] md:w-[40vw] md:h-[40vw] rounded-full bg-cyan-900/10 blur-[150px] animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-0 w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="hidden md:block"><MouseTrail /></div>
      <Navbar />

      <div className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto relative z-10 flex flex-col min-h-[90vh]">

        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase drop-shadow-2xl">
            Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Analyzer.</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto">
            Input raw syllabus text or upload documents. The AI will deconstruct it into an optimized, bite-sized daily execution protocol.
          </p>
        </div>

        {/* Input Terminal */}
        <div className="cyber-box p-[1.5px] rounded-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative bg-[#07070a]/95 backdrop-blur-2xl rounded-2xl p-6 border border-white/5 flex flex-col gap-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-mono flex items-center gap-3 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-grow space-y-2">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest ml-1">Raw Syllabus Input</label>
                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Paste your syllabus here..."
                  className="w-full h-32 bg-[#000000] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm resize-none custom-scrollbar"
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
                    className="w-full bg-[#000000] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest ml-1">Import Data</label>
                  <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-gray-300 hover:text-cyan-400 cursor-pointer transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="text-sm font-semibold">Upload PDF/IMG</span>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={() => alert("File upload connected!")} />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${isGenerating ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.01] active:scale-95'}`}
            >
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

        {/* ✅ FIXED: Protocol Display — JSON array se render karta hai */}
        {protocol.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-cyan-500/50"></div>
              <span className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase border border-cyan-500/30 px-4 py-1 rounded-full bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                PROTOCOL DEPLOYED — {protocol.length} DAYS
              </span>
              <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-cyan-500/50"></div>
            </div>

            {/* Day Cards */}
            <div className="relative border-l-2 border-cyan-900/50 ml-4 md:ml-8 space-y-8 pb-10">
              {protocol.map((dayItem, index) => (
                <div
                  key={dayItem.day}
                  className="relative pl-8 md:pl-12 animate-fade-in-right"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-4 w-4 h-4 bg-[#020203] border-2 rounded-full shadow-[0_0_15px_#06b6d4] transition-all ${completedDays.has(dayItem.day) ? 'border-green-400 shadow-[0_0_15px_#4ade80]' : 'border-cyan-400'}`}></div>

                  <div className={`group relative bg-[#07070a]/80 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${completedDays.has(dayItem.day) ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]' : 'border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'}`}>

                    {/* Day number + title */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">DAY {dayItem.day}</span>
                        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">
                          {dayItem.title}
                        </h3>
                      </div>
                      {completedDays.has(dayItem.day) && (
                        <span className="text-xs font-mono text-green-400 border border-green-500/30 px-2 py-1 rounded-full bg-green-500/10">✓ DONE</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                      {dayItem.description}
                    </p>

                    {/* Timetable slots */}
                    {dayItem.timetable && dayItem.timetable.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-mono text-purple-400 uppercase tracking-widest">Timetable</p>
                        {dayItem.timetable.map((slot, i) => (
                          <div key={i} className="flex gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                            <span className="text-xs font-mono text-cyan-500 whitespace-nowrap pt-0.5">{slot.time}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{slot.slotTitle}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{slot.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Complete button */}
                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                      <input
                        type="checkbox"
                        checked={completedDays.has(dayItem.day)}
                        onChange={() => toggleComplete(dayItem.day)}
                        className="w-5 h-5 accent-cyan-500 rounded bg-[#000] border-gray-600 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-cyan-500 tracking-widest uppercase cursor-pointer" onClick={() => toggleComplete(dayItem.day)}>
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
        .cyber-box { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        @keyframes fade-in-right { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-right { animation: fade-in-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
        .animate-pulse-slow { animation: pulse-slow 8s infinite; }
      `}} />
    </div>
  );
}