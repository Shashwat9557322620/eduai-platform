"use client";
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) setApiKey(savedKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Key className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Platform Settings</h2>
            <p className="text-xs text-gray-400 font-mono">Bring Your Own Key (BYOK)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-200 mb-2">Google Gemini API Key</label>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Paste your own free Gemini API key to unlock <strong className="text-cyan-400">UNLIMITED</strong> requests, bypass platform limits, and generate massive plans without spending credits. Your key is stored securely in your browser's local storage.
            </p>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#020203] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Client-side storage only</p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
