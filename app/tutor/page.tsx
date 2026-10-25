"use client";
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Send, Bot, User, Sparkles, BookOpen, Lightbulb, RotateCcw, Copy, Check, Loader2, ChevronDown, Paperclip, X, FileText, Image as ImageIcon, Download, Share2, Printer, ChevronRight } from 'lucide-react';
import AITutorBrainBackground from '../components/backgrounds/AITutorBrainBackground';

// Markdown & Math Rendering
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import AICore3D from '../components/ui/AICore3D';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: { name: string; type: string; base64Data: string; mimeType: string }[];
}

const SUGGESTIONS = [
  { icon: '📐', label: 'Explain Calculus derivatives', subject: 'Mathematics' },
  { icon: '⚛️', label: 'Quantum mechanics basics', subject: 'Physics' },
  { icon: '🧬', label: 'DNA replication process', subject: 'Biology' },
  { icon: '💻', label: 'How does recursion work?', subject: 'Computer Science' },
  { icon: '📊', label: 'Explain supply and demand', subject: 'Economics' },
  { icon: '🌍', label: 'World War II timeline', subject: 'History' },
];

const getSubjectTheme = (subject: string) => {
  switch (subject) {
    case 'Mathematics':
      return {
        glowTop: 'bg-cyan-500/15', glowBottom: 'bg-blue-500/10',
        bgClass: 'bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px]',
        accent: 'text-cyan-400', border: 'border-cyan-500/50', hex: '#22d3ee'
      };
    case 'Physics':
      return {
        glowTop: 'bg-purple-500/20', glowBottom: 'bg-pink-500/15',
        bgClass: 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_100%)] bg-[size:100%_100%]',
        accent: 'text-purple-400', border: 'border-purple-500/50', hex: '#c084fc'
      };
    case 'Biology':
      return {
        glowTop: 'bg-green-500/15', glowBottom: 'bg-lime-500/10',
        bgClass: 'bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.05)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(132,204,22,0.05)_0%,transparent_50%)]',
        accent: 'text-green-400', border: 'border-green-500/50', hex: '#4ade80'
      };
    case 'Computer Science':
      return {
        glowTop: 'bg-emerald-500/20', glowBottom: 'bg-green-900/20',
        bgClass: 'bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:20px_20px]',
        accent: 'text-emerald-400', border: 'border-emerald-500/50', hex: '#34d399'
      };
    case 'Chemistry':
      return {
        glowTop: 'bg-teal-500/20', glowBottom: 'bg-cyan-500/10',
        bgClass: 'bg-[url("data:image/svg+xml,%3Csvg width=\\\'60\\\' height=\\\'60\\\' viewBox=\\\'0 0 60 60\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\'%3E%3Cpath d=\\\'M30 0l25.98 15v30L30 60 4.02 45V15z\\\' fill-opacity=\\\'0.03\\\' fill=\\\'%2314b8a6\\\' fill-rule=\\\'evenodd\\\'/%3E%3C/svg%3E")]',
        accent: 'text-teal-400', border: 'border-teal-500/50', hex: '#2dd4bf'
      };
    default:
      return {
        glowTop: 'bg-cyan-500/10', glowBottom: 'bg-purple-500/10',
        bgClass: '',
        accent: 'text-cyan-400', border: 'border-cyan-500/50', hex: '#22d3ee'
      };
  }
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-cyan-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-2 font-mono">thinking...</span>
    </div>
  );
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // split off the data:image/png;base64, part for the API
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

function MessageBubble({ message, onCopy, onSelect, isSelected, isNew, isStreaming }: { message: Message; onCopy: (text: string) => void; onSelect: (id: string) => void; isSelected: boolean; isNew?: boolean; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isUser = message.role === 'user';

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : isUser
    ? { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }
    : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
            : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
        }`}
        animate={isNew && !isUser && !shouldReduceMotion && !isStreaming ? { scale: [1, 1.18, 0.95, 1] } : {}}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {isUser ? <User className="w-4 h-4 text-purple-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
      </motion.div>
      <div className={`max-w-[85%] group ${isUser ? 'text-right' : ''}`}>
        {isUser ? (
          <div className="inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 text-white">
            {/* Render files if attached by user */}
            {message.files && message.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 justify-end">
                {message.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300">
                    {f.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-cyan-400" /> : <FileText className="w-3 h-3 text-purple-400" />}
                    <span className="truncate max-w-[120px]">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="prose prose-invert prose-sm max-w-none break-words">
              {message.content}
            </div>
          </div>
        ) : (
          <div 
            onClick={() => onSelect(message.id)}
            className={`cursor-pointer inline-flex flex-col rounded-2xl p-1 text-sm leading-relaxed border transition-all duration-300 ${isSelected ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'bg-[#0a0a0f] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.02]'}`}
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold text-[11px] tracking-widest uppercase">Output Generated</span>
              </div>
              <p className="text-gray-400 text-xs">Response ready in Live Workspace.</p>
            </div>
            <div className={`border-t flex items-center justify-between px-4 py-2 mt-1 transition-colors duration-300 ${isSelected ? 'border-cyan-500/20 text-cyan-300' : 'border-white/[0.04] text-gray-500 group-hover:text-gray-300'}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider">{isSelected ? 'Viewing Document' : 'View Document'}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'translate-x-1' : ''}`} />
            </div>
          </div>
        )}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-[9px] font-mono text-gray-600">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function TutorPage() {
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaceCopied, setWorkspaceCopied] = useState(false);
  const [subject, setSubject] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if ((!msg && attachedFiles.length === 0) || loading) return;

    // Process files
    const processedFiles = [];
    for (const file of attachedFiles) {
      try {
        const base64 = await fileToBase64(file);
        processedFiles.push({
          name: file.name,
          type: file.type,
          base64Data: base64,
          mimeType: file.type
        });
      } catch (e) {
        console.error("Failed to read file", e);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: Date.now(),
      files: processedFiles.length > 0 ? processedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    
    setSelectedMessageId(assistantMsgId);
    
    // Add empty assistant message that we will stream into
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    }]);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          subject,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          files: processedFiles
        }),
      });

      if (!res.ok) {
        let errStr = `Failed with status ${res.status}`;
        try {
          const errData = await res.json();
          errStr = errData.error || errStr;
        } catch (e) {
          errStr = await res.text() || errStr;
        }
        throw new Error(errStr);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          
          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              return { ...m, content: m.content + chunkText };
            }
            return m;
          }));
        }
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return { ...m, content: `⚠️ ${message}` };
        }
        return m;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setAttachedFiles([]);
  };

  const latestAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant');
  const activeMessage = messages.find(m => m.id === selectedMessageId) || latestAssistantMessage;
  const isSplitScreen = messages.length > 0;
  const theme = getSubjectTheme(subject);

  const handleExportTxt = () => {
    if (!activeMessage) return;
    const blob = new Blob([activeMessage.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduAI_Workspace_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!activeMessage) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EduAI Live Workspace',
          text: activeMessage.content.slice(0, 150) + '...',
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(activeMessage.content);
      alert('Copied to clipboard!');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#020203] text-white font-sans relative flex flex-col overflow-hidden">
        <AITutorBrainBackground />
        <Navbar />

        <div className="flex-1 flex flex-col md:flex-row pt-20 pb-0 max-w-[1600px] w-full mx-auto relative z-10 overflow-hidden h-[100vh]">
          
          {/* Left Pane: Chat Interface */}
          <motion.div 
            className={`flex flex-col h-full transition-all duration-700 ease-[0.16,1,0.3,1] ${isSplitScreen ? 'md:w-[45%] md:border-r border-white/[0.04]' : 'w-full max-w-4xl mx-auto'}`}
            layout
          >
            {/* Header */}
            <motion.div
              className="px-6 py-4 flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AI Tutor</h1>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSubjectPicker(!showSubjectPicker)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12] transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3 h-3" />
                  {subject || 'All Subjects'}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12] transition-all"
                    title="New Chat"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Subject Picker */}
            <AnimatePresence>
              {showSubjectPicker && (
                <motion.div
                  className="mx-6 mb-2 bg-[#0a0a0f] border border-white/[0.08] rounded-xl p-2 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Economics', 'English', 'General'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setSubject(s === 'General' ? '' : s); setShowSubjectPicker(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        subject === s || (s === 'General' && !subject)
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:border-white/[0.12]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0 custom-scrollbar">
              {messages.length === 0 && !loading ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6">
                    <Lightbulb className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 text-center">What do you want to learn?</h2>
                  <p className="text-gray-500 text-sm mb-8 text-center max-w-md">Ask me anything — I break down complex topics into simple explanations and can solve math problems from images or PDFs.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          setSubject(s.subject);
                          sendMessage(s.label);
                        }}
                        className="text-left p-4 rounded-xl bg-[#0a0a0f] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300 group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{s.label}</p>
                            <p className="text-[9px] font-mono text-gray-600 mt-0.5">{s.subject}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onCopy={(text) => navigator.clipboard.writeText(text)}
                      onSelect={setSelectedMessageId}
                      isSelected={msg.id === selectedMessageId}
                      isNew={i === messages.length - 1}
                      isStreaming={loading && i === messages.length - 1 && msg.role === 'assistant'}
                    />
                  ))}
                  {/* Fake typing indicator briefly before stream starts */}
                  {loading && messages.length > 0 && messages[messages.length - 1].content === '' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-2xl">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-white/[0.04] bg-[#020203]">
              {attachedFiles.length > 0 && (
                <div className="flex gap-3 mb-3 px-1 overflow-x-auto custom-scrollbar pb-2 pt-1">
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
                        {/* Overlay for filename on hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-1 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-[8px] text-white truncate text-center font-mono">{file.name}</p>
                        </div>
                        {/* Remove button */}
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
              <div className="relative flex items-end gap-2 bg-[#0a0a0f] border border-white/[0.08] rounded-2xl transition-all duration-300 p-2"
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.1), 0 0 20px rgba(34,211,238,0.05)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*,application/pdf,text/plain"
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-cyan-400 hover:bg-white/5 transition-all shrink-0 mb-0.5"
                  title="Attach Image or PDF"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question or upload a math problem..."
                  rows={1}
                  className="w-full bg-transparent text-white text-sm py-3 px-2 resize-none focus:outline-none placeholder-gray-600 max-h-32 min-h-[44px] custom-scrollbar"
                />
                
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && attachedFiles.length === 0) || loading}
                  className="w-10 h-10 rounded-xl shrink-0 bg-gradient-to-r from-cyan-600 to-indigo-600 flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
                  style={!input.trim() && attachedFiles.length === 0 && !loading ? { animation: 'send-pulse 2s ease-in-out infinite' } : {}}
                  whileTap={{ scale: 0.9 }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-center text-[9px] text-gray-600 mt-3 font-mono tracking-widest">
                AI CAN MAKE MISTAKES. VERIFY IMPORTANT CALCULATIONS.
              </p>
            </div>
          </motion.div>

          {/* Right Pane: Live Workspace (Split Screen) */}
          <AnimatePresence>
            {isSplitScreen && (
              <motion.div 
                className="hidden md:flex flex-col w-[55%] h-full p-6"
                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
              >
                <div className={`h-full w-full rounded-3xl bg-[#050508]/90 backdrop-blur-2xl border ${loading ? theme.border : 'border-white/[0.08]'} transition-colors duration-700 flex flex-col overflow-hidden relative shadow-2xl ${theme.bgClass}`}>
                  {/* Subtle Background Glow inside workspace */}
                  <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme.glowTop} rounded-full blur-[120px] pointer-events-none transition-colors duration-1000`} />
                  <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${theme.glowBottom} rounded-full blur-[100px] pointer-events-none transition-colors duration-1000`} />
                  
                  {/* Scanning Laser Animation when loading */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div 
                        initial={{ top: '-10%', opacity: 0 }}
                        animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                        className={`absolute left-0 w-full h-[2px] ${theme.glowTop.replace('10', '50').replace('15', '50').replace('20', '50')} z-20 shadow-[0_0_15px_currentColor]`}
                      />
                    )}
                  </AnimatePresence>

                  {/* Header */}
                  <div className="h-14 border-b border-white/[0.06] flex items-center px-6 shrink-0 z-40 bg-black/40 backdrop-blur-md relative justify-between">
                    <div className="flex items-center gap-2 w-32">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    
                    <div className={`flex items-center justify-center gap-2 text-xs font-mono tracking-widest transition-colors duration-300 ${loading ? theme.accent + ' animate-pulse' : 'text-gray-400'}`}>
                      {loading ? <Sparkles className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                      {loading ? '⚡ SYNTHESIZING SOLUTION...' : 'LIVE WORKSPACE'}
                    </div>

                    <div className="flex items-center justify-end w-32 gap-1 z-50">
                      {activeMessage && (
                        <>
                          <button onClick={() => {
                            navigator.clipboard.writeText(activeMessage.content); 
                            setWorkspaceCopied(true); 
                            setTimeout(() => setWorkspaceCopied(false), 2000);
                          }} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Copy Text">
                            {workspaceCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button onClick={handleExportTxt} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Export .TXT">
                            <Download className="w-4 h-4" />
                          </button>
                          <button onClick={handleExportPdf} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Print / Save PDF">
                            <Printer className="w-4 h-4" />
                          </button>
                          <div className="w-[1px] h-3 bg-white/10 mx-1" />
                          <button onClick={handleShare} className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors" title="Share">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* The 3D AI Core floating in the background */}
                    <AICore3D isProcessing={loading} color={theme.hex} />
                  </div>

                  {/* Content Area - Renders the selected AI response */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar z-10 relative flex flex-col">

                    <div className="p-8 pt-2">
                      {activeMessage ? (
                        <div className="prose prose-invert max-w-none 
                          prose-headings:font-bold prose-headings:tracking-tight 
                          prose-h1:text-3xl prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:bg-gradient-to-r prose-h1:from-cyan-400 prose-h1:to-purple-400
                          prose-h2:text-2xl prose-h2:text-cyan-100
                          prose-h3:text-xl prose-h3:text-purple-200
                          prose-p:text-gray-300 prose-p:leading-relaxed
                          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-white prose-strong:font-bold
                          prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                          prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-white/10
                          prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-cyan-50
                          math-display
                        ">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {activeMessage.content}
                          </ReactMarkdown>
                          {loading && activeMessage.id === latestAssistantMessage?.id && <span className={`inline-block w-2.5 h-[1.1em] ml-1 ${theme.accent} animate-pulse`} style={{ backgroundColor: 'currentColor', verticalAlign: 'text-bottom' }} />}
                        </div>
                      ) : (
                        <div className="h-[50vh] flex flex-col items-center justify-center opacity-50">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                          </div>
                          <p className="text-sm font-mono text-gray-400">Waiting for AI synthesis...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .math-display .katex-display { margin: 2rem 0; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 1rem; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto; }
        .math-display .katex { font-size: 1.1em; color: #e2e8f0; }
        
        @media print {
          body { background: white !important; color: black !important; }
          nav, .md\\:w-\\[45\\%\\], .sticky, button { display: none !important; }
          .md\\:flex.flex-col.w-\\[55\\%\\] { width: 100% !important; display: block !important; padding: 0 !important; }
          .h-full.w-full.rounded-3xl { border: none !important; background: none !important; box-shadow: none !important; }
          .prose-invert { filter: invert(1) hue-rotate(180deg); }
        }
      `}} />
    </ErrorBoundary>
  );
}