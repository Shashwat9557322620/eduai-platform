"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from '@clerk/nextjs';
import LearningPathRoadmapBackground from '../components/backgrounds/LearningPathRoadmapBackground';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ShareButton from '../components/ShareButton';
import CopyFullContent from '../components/CopyFullContent';
import RatingWidget from '../components/RatingWidget';
import AdvancedImportButton from '../components/AdvancedImportButton';
import { Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';

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
  const { user } = useUser();
  const [syllabus, setSyllabus] = useState('');
  const [days, setDays] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [protocol, setProtocol] = useState<DayProtocol[]>([]);
  const [error, setError] = useState('');
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [typingText, setTypingText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const toggleComplete = (day: number) => {
    setCompletedDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const toggleExpand = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Typing animation for loading state
  useEffect(() => {
    if (!isGenerating) return;
    const messages = [
      "Analyzing curriculum structure...",
      "Mapping knowledge dependencies...",
      "Optimizing learning sequences...",
      "Generating daily protocols...",
      "Finalizing execution plan..."
    ];
    let msgIndex = 0;
    let charIndex = 0;
    let currentText = '';
    
    const typeInterval = setInterval(() => {
      if (msgIndex >= messages.length) {
        msgIndex = 0;
      }
      const currentMsg = messages[msgIndex];
      if (charIndex < currentMsg.length) {
        currentText += currentMsg[charIndex];
        setTypingText(currentText);
        charIndex++;
      } else {
        charIndex = 0;
        msgIndex++;
        currentText = '';
        setTypingText('');
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if ((!syllabus.trim() && attachedFiles.length === 0) || !days) {
      setError("SYSTEM ALERT: Please input Syllabus/Images and Target Days.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setProtocol([]);

    try {
      const images: {mimeType: string, data: string}[] = [];
      let extraText = "";

      for (const file of attachedFiles) {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const b64 = await fileToBase64(file);
          images.push({ mimeType: file.type, data: b64 });
        } else if (file.type === 'text/plain') {
          const fileText = await file.text();
          extraText += "\n\n" + fileText;
        }
      }

      const finalText = syllabus + extraText;
      const userApiKey = localStorage.getItem('gemini_api_key');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-user-gemini-key': userApiKey } : {})
        },
        body: JSON.stringify({ syllabus: finalText, days, images, userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Neural Engine connection failed.");
      }

      const planData: DayProtocol[] = data.protocol;
      setProtocol(planData);

      const { error: dbError } = await supabase
        .from('study_plans')
        .insert([{ syllabus: finalText, days, plan: JSON.stringify(planData) }]);

      if (dbError) console.error("Supabase Save Error:", dbError);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
      setTypingText('');
    }
  };

  const progress = protocol.length > 0 ? (completedDays.size / protocol.length) * 100 : 0;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30 pb-32">

      <LearningPathRoadmapBackground />

      <Navbar />

      <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto relative z-10 flex flex-col min-h-[90vh]">

        {/* Header */}
        <div className="mb-16 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">AI-Powered Study Planner</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5 uppercase drop-shadow-2xl">
            Curriculum <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Engine.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg font-light tracking-wide max-w-2xl mx-auto">
            Input raw syllabus text or upload documents. The AI will deconstruct it into an optimized, bite-sized daily execution protocol.
          </p>
        </div>

        {/* Input Terminal */}
        <div className="relative group max-w-4xl mx-auto mb-16 w-full">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/[0.05] relative shadow-2xl">

            {/* Fake Terminal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-mono text-cyan-400/70 tracking-widest hidden sm:inline-block">curriculum_engine.py</span>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-cyan-500/5 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Days:</span>
                    <input 
                      type="number" 
                      value={days} 
                      onChange={(e) => setDays(e.target.value)} 
                      className="w-12 bg-transparent border-none outline-none text-white font-bold text-center text-sm focus:outline-none" 
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                  </div>

                  <AdvancedImportButton onFileChange={handleFileChange} />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-3 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
                {error}
              </div>
            )}

            {attachedFiles.length > 0 && (
              <div className="flex gap-3 mb-4 px-1 overflow-x-auto custom-scrollbar pb-2">
                {attachedFiles.map((file, i) => {
                  const isImage = file.type.startsWith('image/');
                  const fileUrl = URL.createObjectURL(file);
                  return (
                    <div key={i} className="relative group shrink-0 flex items-center justify-center bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer h-16 w-16" onClick={() => window.open(fileUrl, '_blank')} title="Click to view file">
                      {isImage ? (
                        <img src={fileUrl} alt={file.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white/5 p-2">
                          <FileText className="w-6 h-6 text-cyan-400 mb-1" />
                          <span className="text-[9px] font-mono text-gray-400 truncate w-full text-center">{file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-1 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[8px] text-white truncate text-center font-mono">{file.name}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }} 
                        className="absolute bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 top-1 right-1 transition-all shadow-lg hover:bg-red-500 backdrop-blur-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <textarea 
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full h-[200px] bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none resize-none overflow-y-auto custom-scrollbar text-xl leading-relaxed" 
              placeholder="Paste your raw syllabus here... Physics, Math, DSA... The engine handles everything..."
            ></textarea>

            {/* Generate Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end border-t border-white/5 pt-6 gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`group relative px-10 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden ${isGenerating ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/30' : 'bg-white text-black hover:scale-[1.03] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]'}`}
              >
                {!isGenerating && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />}
                
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    </div>
                    <span className="font-mono tracking-wider text-sm">{typingText || 'Initializing...'}</span>
                    <span className="animate-pulse">|</span>
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Initialize Engine
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Protocol Display */}
        {protocol.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

            {/* Progress Bar */}
            <div className="mb-8 p-6 rounded-2xl bg-[#07070a]/80 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                    PROTOCOL DEPLOYED
                  </span>
                  <span className="text-white/40 text-sm">—</span>
                  <span className="text-white/60 text-sm font-medium">{completedDays.size} of {protocol.length} days completed</span>
                </div>
                <span className="text-cyan-400 font-bold text-lg">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Share, Copy & Rating */}
            <div className="mb-10 p-5 rounded-2xl bg-[#07070a]/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <CopyFullContent text={protocol.map(d => `DAY ${d.day}: ${d.title}\n${d.description}\n${d.timetable?.map(t => `${t.time} - ${t.slotTitle}: ${t.details}`).join('\n') || ''}`).join('\n\n')} />
                <ShareButton 
                  title={`Study Protocol: ${protocol.length} Day Curriculum Plan`}
                  text={protocol.map(d => `DAY ${d.day}: ${d.title}\n${d.description}\n${d.timetable?.map(t => `${t.time} - ${t.slotTitle}: ${t.details}`).join('\n') || ''}`).join('\n\n')}
                />
              </div>
              <RatingWidget />
            </div>

            {/* Day Cards Timeline */}
            <div className="relative border-l-2 border-cyan-900/50 ml-4 md:ml-8 space-y-8 pb-10">
              {protocol.map((dayItem, index) => {
                const isCompleted = completedDays.has(dayItem.day);
                const isExpanded = expandedDay === dayItem.day;
                
                return (
                  <div
                    key={dayItem.day}
                    className="relative pl-8 md:pl-12 animate-fade-in-right"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-[11px] top-5 w-5 h-5 bg-[#020203] border-2 rounded-full shadow-[0_0_15px_#06b6d4] transition-all duration-300 ${isCompleted ? 'border-green-400 shadow-[0_0_20px_#4ade80]' : 'border-cyan-400 hover:border-cyan-300 hover:shadow-[0_0_25px_#22d3ee]'}`}></div>

                    <div 
                      className={`group relative bg-[#07070a]/80 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${isCompleted ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(74,222,128,0.15)]' : 'border-white/5 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1'}`}
                      onClick={() => toggleExpand(dayItem.day)}
                    >
                      {/* Day number + title */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">DAY {dayItem.day}</span>
                          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">
                            {dayItem.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="text-xs font-mono text-green-400 border border-green-500/30 px-3 py-1 rounded-full bg-green-500/10 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              DONE
                            </span>
                          )}
                          <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                        {dayItem.description}
                      </p>

                      {/* Expanded Content */}
                      <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {/* Timetable slots */}
                        {dayItem.timetable && dayItem.timetable.length > 0 && (
                          <div className="space-y-3 mb-6 mt-6">
                            <p className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Daily Schedule
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {dayItem.timetable.map((slot, i) => (
                                <div key={i} className="flex gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300">
                                  <span className="text-xs font-mono text-cyan-500 whitespace-nowrap pt-1 bg-cyan-500/10 px-2 py-1 rounded-lg h-fit">{slot.time}</span>
                                  <div>
                                    <p className="text-sm font-bold text-white">{slot.slotTitle}</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{slot.details}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete button */}
                        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleComplete(dayItem.day); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isCompleted ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={isCompleted ? "M5 13l4 4L19 7" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                            </svg>
                            {isCompleted ? 'Completed' : 'Mark as Done'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
    </ErrorBoundary>
  );
}
