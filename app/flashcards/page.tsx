"use client";
import { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '@clerk/nextjs';
import FlashcardNeuralBackground from '../components/backgrounds/FlashcardNeuralBackground';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ShareButton from '../components/ShareButton';
import CopyFullContent from '../components/CopyFullContent';
import RatingWidget from '../components/RatingWidget';
import AdvancedImportButton from '../components/AdvancedImportButton';
import { Paperclip, FileText, Image as ImageIcon, X } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardGenerator() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [typingText, setTypingText] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

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
    if (!loading) return;
    const messages = [
      "Scanning knowledge structures...",
      "Extracting key concepts...",
      "Building neural connections...",
      "Optimizing for retention...",
      "Finalizing flashcard matrix..."
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
    if (!text.trim() && attachedFiles.length === 0) {
      setError("SYSTEM ALERT: Please enter text or import a file to generate flashcards!");
      return;
    }
    setLoading(true);
    setCards([]);
    setFlipped(new Set());
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

      const finalText = text + extraText;
      const userApiKey = localStorage.getItem('gemini_api_key');

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-user-gemini-key': userApiKey } : {})
        },
        body: JSON.stringify({ text: finalText, images, userId: user?.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCards(data.flashcards);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Matrix Overload");
    } finally {
      setLoading(false);
      setTypingText('');
    }
  };

  const toggleFlip = (index: number) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-[#020203] text-white relative selection:bg-purple-500/30 font-sans pb-32 overflow-hidden">
      
      <FlashcardNeuralBackground />

      <Navbar />

      <div className="pt-36 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase">AI-Powered Memory System</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-5">
            Flashcard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-500">Forge.</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed">Inject raw knowledge into the system. Our neural matrix constructs multidimensional, interactive memory units for instant recall.</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-3 animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        {/* Floating Input Section */}
        <div className="relative group max-w-4xl mx-auto mb-20">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/[0.05] relative shadow-2xl">
            
            {/* Fake Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-purple-400/70 tracking-widest hidden sm:inline-block">neural_card_forge.py</span>
                <AdvancedImportButton onFileChange={handleFileChange} />
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="flex gap-3 mb-4 px-1 overflow-x-auto custom-scrollbar pb-2">
                {attachedFiles.map((file, i) => {
                  const isImage = file.type.startsWith('image/');
                  const fileUrl = URL.createObjectURL(file);
                  return (
                    <div key={i} className="relative group shrink-0 flex items-center justify-center bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer h-16 w-16" onClick={() => window.open(fileUrl, '_blank')} title="Click to view file">
                      {isImage ? (
                        <img src={fileUrl} alt={file.name} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white/5 p-2">
                          <FileText className="w-6 h-6 text-purple-400 mb-1" />
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
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[160px] bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none resize-none overflow-y-auto custom-scrollbar text-xl leading-relaxed" 
              placeholder="Paste your chaotic notes here... Physics, Coding, History... the Forge handles everything..."
            ></textarea>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end border-t border-white/5 pt-6 gap-4">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`group relative px-10 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden ${loading ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'bg-white text-black hover:scale-[1.03] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)]'}`}
              >
                {!loading && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />}
                
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
                    </div>
                    <span className="font-mono tracking-wider text-sm">{typingText || 'Forging...'}</span>
                    <span className="animate-pulse">|</span>
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Initialize Forge
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Flashcards Grid */}
        {cards.length > 0 && (
          <>
            {/* Stats Bar */}
            <div className="mb-8 p-5 rounded-2xl bg-[#07070a]/80 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in-up">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-white/90">{cards.length}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Cards</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-400">{flipped.size}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Revealed</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-cyan-400">{cards.length - flipped.size}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Remaining</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CopyFullContent text={cards.map((c, i) => `CARD ${i + 1}\nQ: ${c.front}\nA: ${c.back}`).join('\n\n')} />
                <ShareButton 
                  title={`Neural Flashcards: ${cards.length} Cards Generated`}
                  text={cards.map((c, i) => `CARD ${i + 1}\nQ: ${c.front}\nA: ${c.back}`).join('\n\n')}
                />
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <div 
                  key={index} 
                  className="group relative h-[340px] w-full cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => toggleFlip(index)}
                  onMouseEnter={() => setActiveCardIndex(index)}
                  onMouseLeave={() => setActiveCardIndex(null)}
                >
                  {/* Floating Antigravity Effect on Hover */}
                  <div className={`w-full h-full transition-all duration-[800ms] preserve-3d group-hover:-translate-y-4 group-hover:scale-[1.02] ${flipped.has(index) ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#111] to-[#0a0a0c] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-xl group-hover:border-purple-500/40 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] transition-all duration-500 overflow-hidden">
                      {/* Ambient Glow */}
                      <div className="absolute -inset-20 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      
                      {/* Card Number Badge */}
                      <span className="absolute top-5 left-5 text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                        CARD_{String(index + 1).padStart(3, '0')}
                      </span>
                      
                      {/* Question */}
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-snug z-10 relative px-4">{card.front}</h3>
                      
                      {/* Bottom Hint */}
                      <p className="absolute bottom-5 text-xs text-gray-600 z-10 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59-1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                        </svg>
                        Click to reveal answer
                      </p>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#08080a] border border-cyan-500/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
                      {/* Reverse Glow */}
                      <div className="absolute -inset-20 bg-gradient-to-r from-cyan-600/10 via-purple-500/10 to-cyan-600/10 transition-opacity duration-1000"></div>

                      {/* Answer Badge */}
                      <span className="absolute top-5 left-5 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                        NEURAL_DECODE
                      </span>
                      
                      {/* Answer */}
                      <p className="text-lg md:text-xl font-medium text-gray-100 leading-relaxed z-10 relative px-4">{card.back}</p>
                      
                      {/* Bottom Status */}
                      <p className="absolute bottom-5 text-xs text-cyan-700 z-10 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Neural Injection Complete
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Rating Widget */}
            <div className="mt-12 flex justify-center">
              <RatingWidget />
            </div>
          </>
        )}

      </div>

    </div>
    </ErrorBoundary>
  )
}
