"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import SkillAnalyzerBackground from '../components/backgrounds/SkillAnalyzerBackground';
import ShareButton from '../components/ShareButton';
import CopyFullContent from '../components/CopyFullContent';
import RatingWidget from '../components/RatingWidget';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AdvancedImportButton from '../components/AdvancedImportButton';
import { Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';

export default function SkillGapAnalyzer() {
  const { user } = useUser();
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Typing animation for loading state
  useEffect(() => {
    if (!loading) return;
    const messages = [
      "Connecting to neural diagnostics...",
      "Cross-referencing skill matrices...",
      "Analyzing market demand data...",
      "Generating skill gap report...",
      "Finalizing analysis..."
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

  const handleAnalyze = async () => {
    setError(null);
    if (!role.trim() || (!skills.trim() && attachedFiles.length === 0)) {
      setError("SYSTEM ALERT: Please enter Target Job Role and provide Skills (Text or File)!");
      return;
    }

    setLoading(true);
    setAnalysis("");
    setActiveTab('results');

    try {
      const images: {mimeType: string, data: string}[] = [];
      let extraText = "";

      for (const file of attachedFiles) {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const b64 = await fileToBase64(file);
          images.push({ mimeType: file.type, data: b64 });
        } else if (file.type === 'text/plain') {
          const text = await file.text();
          extraText += "\n\n" + text;
        }
      }

      const finalSkillsText = skills + extraText;
      const userApiKey = localStorage.getItem('gemini_api_key');

      const response = await fetch('/api/analyzer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-user-gemini-key': userApiKey } : {})
        },
        body: JSON.stringify({ role, skills: finalSkillsText, images, userId: user?.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Matrix Overload");
    } finally {
      setLoading(false);
      setTypingText('');
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#020203] text-white relative selection:bg-fuchsia-500/30 overflow-hidden font-sans pb-32 z-0 ">
      
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <SkillAnalyzerBackground />

      <Navbar />

      <div className="pt-36 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
            </span>
            <span className="text-xs font-semibold text-fuchsia-300 tracking-wider uppercase">AI-Powered Career Analysis</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase drop-shadow-2xl">
            Skill Gap
            <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-500">
              Analyzer.
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg font-medium">Deconstruct your target career path. Identify missing core capabilities, tech stacks, and generate a hyper-targeted roadmap.</p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-3 animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        {/* Input Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          
          {/* Main Terminal Box */}
          <div className="lg:col-span-2 relative group h-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-indigo-500/30 rounded-[2rem] opacity-40 group-hover:opacity-70 transition duration-700 animate-gradient-x"></div>
            
            <div className="h-full bg-[#07070a] rounded-[2rem] p-8 border border-white/10 relative shadow-2xl flex flex-col space-y-8">
              
              {/* Fake Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs font-mono text-fuchsia-400/70 tracking-widest">skill_analyzer.py</span>
              </div>

              <div className="flex-1 space-y-8">
                <div className="relative">
                  <label className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3 uppercase tracking-widest font-bold">
                    <span className="text-indigo-400">01 //</span> Target Job Role
                  </label>
                  <input 
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. AI Engineer, Full Stack Developer..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-white text-lg font-medium focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all placeholder:text-gray-600"
                  />
                </div>

                <div className="relative flex-1 flex flex-col bg-white/[0.03] border border-white/10 rounded-xl p-5 transition-all focus-within:border-fuchsia-500 focus-within:bg-fuchsia-500/5 focus-within:shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">
                      <span className="text-fuchsia-400">02 //</span> Current Skills / Resume
                    </label>
                    <AdvancedImportButton onFileChange={handleFileChange} />
                  </div>
                  
                  {attachedFiles.length > 0 && (
                    <div className="flex gap-3 mb-3 px-1 overflow-x-auto custom-scrollbar pb-2 pt-1">
                      {attachedFiles.map((file, i) => {
                        const isImage = file.type.startsWith('image/');
                        const fileUrl = URL.createObjectURL(file);
                        return (
                          <div key={i} className="relative group shrink-0 flex items-center justify-center bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden hover:border-fuchsia-500/50 transition-all cursor-pointer h-16 w-16" onClick={() => window.open(fileUrl, '_blank')} title="Click to view file">
                            {isImage ? (
                              <img src={fileUrl} alt={file.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <div className="h-full w-full flex flex-col items-center justify-center bg-white/5 p-2">
                                <FileText className="w-6 h-6 text-fuchsia-400 mb-1" />
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
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full flex-1 min-h-[160px] bg-transparent text-gray-200 placeholder:text-gray-600 focus:outline-none resize-none overflow-y-auto custom-scrollbar text-base leading-relaxed font-medium" 
                    placeholder="Paste your current tech stack, soft skills, or entire resume text here..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Box */}
          <div className="bg-[#07070a] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Corner Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 animate-pulse-soft rounded-full"></div>
            <div className="absolute top-4 right-4 text-white/5">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_#d946ef]"></span> Diagnostic Engine
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                The neural engine will cross-examine your provided data against live global technical hiring metrics and highlight exactly what you are missing.
              </p>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className={`group w-full h-20 rounded-2xl font-black text-xl transition-all duration-300 relative overflow-hidden
                  ${loading ? 'bg-[#111] text-indigo-400 border border-indigo-500/30' : 'bg-white text-black hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(217,70,239,0.4)]'}`}
              >
                {!loading && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />}
                {loading && <div className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-80 animate-scan"></div>}
                
                {loading ? (
                  <span className="flex items-center justify-center gap-3 relative z-10 font-mono tracking-wider text-sm">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                    <span>{typingText || 'Analyzing...'}</span>
                    <span className="animate-pulse">|</span>
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Execute Audit
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        {analysis && (
          <div className="relative mt-16 group animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/40 via-fuchsia-500/40 to-indigo-600/40 rounded-3xl opacity-60 group-hover:opacity-90 transition duration-700 animate-gradient-x"></div>
            
            <div className="bg-[#050508] border border-fuchsia-500/30 rounded-3xl p-8 md:p-14 shadow-2xl relative">
              
              {/* HUD Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/10 relative">
                <div className="flex items-center gap-5">
                  <div className="relative p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <svg className="w-8 h-8 text-indigo-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                    <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl animate-ping opacity-20"></div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Skill Matrix Breakdown</h2>
                    <p className="text-fuchsia-400 font-mono text-sm mt-1">Status: Decoded & Verified</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CopyFullContent text={analysis} />
                  <ShareButton 
                    title={`Skill Gap Analysis for ${role}`}
                    text={analysis}
                  />
                </div>
              </div>
              
              {/* Custom Styled Markdown */}
              <div className="text-gray-300 font-medium">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-black text-white mb-8 mt-12 uppercase drop-shadow-md" {...props} />,
                    h2: ({node, ...props}) => <div className="mt-12 mb-6"><h2 className="inline-block text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 border-b-2 border-fuchsia-500/30 pb-2" {...props} /></div>,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mb-4 mt-8 flex items-center gap-2 before:content-['>'] before:text-fuchsia-500" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 text-gray-300 leading-relaxed text-lg" {...props} />,
                    ul: ({node, ...props}) => <ul className="mb-8 space-y-4" {...props} />,
                    li: ({node, ...props}) => (
                      <li className="flex items-start text-gray-300 bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors" {...props}>
                         <span className="text-indigo-400 mr-4 mt-0.5 font-bold text-xl leading-none">▹</span>
                         <span>{props.children}</span>
                      </li>
                    ),
                    strong: ({node, ...props}) => <strong className="text-white font-bold bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(217,70,239,0.1)]" {...props} />,
                  }}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
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
