"use client";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/nextjs';
import PodcastWaveBackground from '../components/backgrounds/PodcastWaveBackground';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ShareButton from '../components/ShareButton';
import CopyFullContent from '../components/CopyFullContent';
import RatingWidget from '../components/RatingWidget';

export default function PodcastGenerator() {
  const { user } = useUser();
  const [syllabus, setSyllabus] = useState("");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Count words and characters
  useEffect(() => {
    if (script) {
      const words = script.trim().split(/\s+/).length;
      const chars = script.length;
      setWordCount(words);
      setCharCount(chars);
    }
  }, [script]);

  // Typing animation for loading state
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Analyzing study material...",
      "Structuring podcast episodes...",
      "Creating engaging narrative...",
      "Adding conversational elements...",
      "Finalizing script..."
    ];
    let msgIndex = 0;
    let charIndex = 0;
    let currentText = '';
    
    const typeInterval = setInterval(() => {
      if (msgIndex >= messages.length) msgIndex = 0;
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
  }, [loading]);

  const handleGenerate = async () => {
    setError(null);
    if (!syllabus.trim()) {
      setError("Please enter your syllabus or study topic!");
      return;
    }
    setLoading(true);
    setScript(null);
    try {
      const response = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus, days, userId: user?.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setScript(data.script);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate podcast script");
    } finally {
      setLoading(false);
      setTypingText('');
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#020203] text-white relative selection:bg-orange-500/30 font-sans pb-32 overflow-hidden">
      
      <PodcastWaveBackground />

      <Navbar />

      <div className="pt-36 px-6 max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-semibold text-orange-300 tracking-wider uppercase">AI-Powered Audio Learning</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-5">
            Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-pink-500">Podcast.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Transform your study material into an engaging podcast script. Listen while you commute, exercise, or relax.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        {/* Input Section */}
        <div className="relative group max-w-4xl mx-auto mb-16">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-600/30 to-pink-500/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/[0.05] relative shadow-2xl">
            
            {/* Fake Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs font-mono text-orange-400/70 tracking-widest">podcast_studio.py</span>
            </div>

            <textarea 
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="w-full h-[140px] bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none resize-none text-lg leading-relaxed" 
              placeholder="Paste your syllabus, study notes, or topic you want to learn..."
            ></textarea>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 gap-4">
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-500 font-mono">Duration:</label>
                  <select 
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                  >
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden ${
                  loading ? 'bg-orange-900/30 text-orange-300 border border-orange-500/30' : 'bg-white text-black hover:scale-[1.03] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(249,115,22,0.3)]'
                }`}
              >
                {!loading && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />}
                
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-400 rounded-full animate-spin"></div>
                    </div>
                    <span className="font-mono tracking-wider text-sm">{typingText || 'Generating...'}</span>
                    <span className="animate-pulse">|</span>
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Generate Script
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Script Output */}
        {script && (
          <div className="mb-10 animate-fade-in-up">
            {/* Stats Bar */}
            <div className="mb-6 p-5 rounded-2xl bg-[#07070a]/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-400">{wordCount.toLocaleString()}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Words</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-pink-400">{charCount.toLocaleString()}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Characters</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{days}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Episodes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CopyFullContent text={script} />
                <ShareButton title="Study Podcast Script" text={script} />
              </div>
            </div>

            {/* Script Content */}
            <div className="p-8 rounded-2xl bg-[#07070a]/80 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-orange-400">Your Podcast Script</h2>
              </div>

              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-base font-medium">{script}</div>
            </div>

            {/* Rating Widget */}
            <div className="mt-8 flex justify-center">
              <RatingWidget />
            </div>
          </div>
        )}

      </div>
    </div>
    </ErrorBoundary>
  );
}
