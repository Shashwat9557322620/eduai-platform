"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';

function ShareContent() {
  const searchParams = useSearchParams();
  const [sharedContent, setSharedContent] = useState<{
    title?: string;
    text?: string;
    url?: string;
    file?: File | null;
  }>({});
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const url = searchParams.get('url');
    
    if (title || text || url) {
      setSharedContent({ title: title || undefined, text: text || undefined, url: url || undefined });
    }
  }, [searchParams]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      if (sharedContent.text) {
        const text = sharedContent.text.toLowerCase();
        if (text.includes('syllabus') || text.includes('chapter') || text.includes('unit')) {
          window.location.href = `/optimizer?prefill=${encodeURIComponent(sharedContent.text)}`;
        } else if (text.includes('flashcard') || text.includes('question') || text.includes('answer')) {
          window.location.href = `/flashcards?prefill=${encodeURIComponent(sharedContent.text)}`;
        } else if (text.includes('skill') || text.includes('job') || text.includes('career')) {
          window.location.href = `/analyzer?prefill=${encodeURIComponent(sharedContent.text)}`;
        } else {
          window.location.href = `/flashcards?prefill=${encodeURIComponent(sharedContent.text)}`;
        }
      } else if (sharedContent.url) {
        window.location.href = `/optimizer?prefill=${encodeURIComponent(sharedContent.url)}`;
      }
    } catch (err) {
      setResult('Error processing shared content');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="pt-36 px-6 max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">Content Received</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Shared <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Content</span>
          </h1>
          <p className="text-gray-400 text-lg">We received content from another app. Choose how to process it.</p>
        </div>

        <div className="bg-[#07070a]/80 border border-white/5 rounded-2xl p-8 mb-8">
          {sharedContent.title && (
            <div className="mb-4">
              <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Title</label>
              <p className="text-white text-lg font-medium mt-1">{sharedContent.title}</p>
            </div>
          )}
          {sharedContent.text && (
            <div className="mb-4">
              <label className="text-xs font-mono text-purple-400 uppercase tracking-widest">Content</label>
              <p className="text-gray-300 mt-1 leading-relaxed">{sharedContent.text}</p>
            </div>
          )}
          {sharedContent.url && (
            <div>
              <label className="text-xs font-mono text-pink-400 uppercase tracking-widest">URL</label>
              <p className="text-cyan-400 mt-1 break-all">{sharedContent.url}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleProcess}
            disabled={processing || (!sharedContent.text && !sharedContent.url)}
            className="flex-1 px-8 py-4 rounded-2xl font-bold text-black bg-white hover:bg-gray-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Process with AI'}
          </button>
          <a
            href="/"
            className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-300 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300 text-center"
          >
            Go to Dashboard
          </a>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#020203] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading shared content...</p>
          </div>
        </div>
      }>
        <ShareContent />
      </Suspense>
    </ErrorBoundary>
  );
}