"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardGenerator() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("Bhai, notes daale bina dimaag mein knowledge kaise ghusega? Kuch toh daal!");
      return;
    }
    setLoading(true);
    setCards([]);
    setFlipped([]);
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCards(data.flashcards);
    } catch (err: any) {
      alert("Engine Overheated: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index: number) => {
    if (flipped.includes(index)) {
      setFlipped(flipped.filter(i => i !== index));
    } else {
      setFlipped([...flipped, index]);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white relative selection:bg-cyan-500/30 font-sans pb-32 overflow-hidden">
      
      {/* Premium Antigravity & Liquid Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-purple-900/10 via-transparent to-cyan-900/10 blur-[160px] animate-liquid-bg"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-950/20 blur-[120px]" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      <div className="pt-36 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#0a0a0c] border border-white/[0.06] text-sm font-medium mb-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <span className="text-gray-200 tracking-wider uppercase font-semibold">Memory Neural Engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-5">
            Flashcard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-500">Forge.</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-xl leading-relaxed">Inject raw knowledge into the system. Our neural matrix constructs multidimensional, interactive memory units for instant recall.</p>
        </div>

        {/* Floating Input Section (Glassmorphism) */}
        <div className="relative group max-w-4xl mx-auto mb-20 animate-float">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/[0.05] relative shadow-2xl">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[160px] bg-transparent text-gray-100 placeholder:text-gray-600 focus:outline-none resize-none text-xl leading-relaxed" 
              placeholder="Paste your chaotic notes here... Physics, Coding, History... the Forge handles everything..."
            ></textarea>
            
            {/* BUTTONS CONTAINER (Import on left, Generate on right) */}
            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
              
              {/* Techy Import Button */}
              <button className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-cyan-400" 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="relative z-10">Import Data</span>
              </button>

              {/* Main Generate Button */}
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`px-10 py-4 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all duration-300 relative overflow-hidden group
                ${loading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.03] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)]'}`}
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Forging Neural Cards...
                    </span>
                ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Initialize Matrix ✨
                    </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* 3D Liquid Flashcards Grid */}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className="group relative h-[320px] w-full cursor-pointer perspective-2000 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => toggleFlip(index)}
              >
                {/* Floating Antigravity Effect on Hover */}
                <div className={`w-full h-full transition-transform duration-[800ms] transform-style-3d group-hover:-translate-y-4 ${flipped.includes(index) ? 'rotate-y-180' : ''}`}>
                  
                  {/* Front of Card (Frosted Glass + Liquid Glow) */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#111] to-[#0a0a0c] border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-xl group-hover:border-purple-500/40 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500 overflow-hidden">
                    {/* Liquid Glow Overlay */}
                    <div className="absolute -inset-20 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 animate-liquid-card transition-opacity duration-1000"></div>
                    
                    <span className="absolute top-5 left-5 text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">DATAUNIT_{index + 1}</span>
                    <h3 className="text-2xl font-bold text-white leading-snug z-10 relative">{card.front}</h3>
                    <p className="absolute bottom-5 text-xs text-gray-600 z-10 font-medium">Click Matrix to Reveal</p>
                  </div>

                  {/* Back of Card (Reverse Liquid + Neon Border) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#08080a] border border-cyan-500/30 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
                     {/* Reverse Liquid Glow */}
                    <div className="absolute -inset-20 bg-gradient-to-r from-cyan-600/10 via-purple-500/10 to-cyan-600/10 animate-liquid-card transition-opacity duration-1000"></div>

                    <span className="absolute top-5 left-5 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">NEURAL_DECODE</span>
                    <p className="text-xl font-medium text-gray-100 leading-relaxed z-10 relative">{card.back}</p>
                    <p className="absolute bottom-5 text-xs text-cyan-700 z-10">Neural Injection Complete</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Style overrides for Premium Animations & 3D */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }

        /* Liquid Background Animation */
        @keyframes liquid-bg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.1); }
        }
        .animate-liquid-bg { animation: liquid-bg 20s ease-in-out infinite; }

        /* General Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }

        /* Liquid Glow inside Card Animation */
        @keyframes liquid-card {
          0% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
        }
        .animate-liquid-card { animation: liquid-card 8s linear infinite; }

        /* Staggered Fade in Up Animation */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}} />
    </div>
  )
}