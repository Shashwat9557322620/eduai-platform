"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, MessageSquare, BookOpen, ArrowLeft, Send, Hash, StickyNote, UserPlus, UserMinus, Sparkles, Lock } from 'lucide-react';
import StudyGroupsNetworkBackground from '../components/backgrounds/StudyGroupsNetworkBackground';

interface Group {
  id: string;
  name: string;
  subject: string;
  description: string;
  emoji: string;
  createdBy: string;
  members: string[];
  maxMembers: number;
  createdAt: string;
  pinned: boolean;
  memberCount?: number;
  messageCount?: number;
}

interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface SharedNote {
  id: string;
  title: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
}

const SUBJECT_EMOJIS: Record<string, string> = {
  'Computer Science': '💻', 'Physics': '⚛️', 'Mathematics': '📐',
  'Chemistry': '🧪', 'Biology': '🧬', 'History': '🌍',
  'Economics': '📊', 'English': '📝', 'General': '📚',
};

const MEMBER_COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b', '#34d399', '#6366f1', '#ef4444', '#8b5cf6'];

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
      <div className="relative bg-[#0a0a0f] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl">{group.emoji}</div>
          {group.pinned && (
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">PINNED</span>
          )}
        </div>
        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{group.name}</h3>
        <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{group.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {group.members.slice(0, 4).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] font-bold"
                  style={{ backgroundColor: `${MEMBER_COLORS[i % MEMBER_COLORS.length]}20`, color: MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-mono text-gray-500">{group.memberCount || group.members.length}/{group.maxMembers}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px] font-mono">{group.messageCount || 0}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5">
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">{group.subject}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (g: Group) => void }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('General');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name, subject, description, emoji }),
      });
      const data = await res.json();
      if (data.group) onCreated(data.group);
    } catch { /* noop */ }
    setCreating(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#0a0a0f] border border-white/[0.08] rounded-3xl w-full max-w-md p-6"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <h2 className="text-lg font-bold text-white mb-1">Create Study Group</h2>
        <p className="text-xs text-gray-500 mb-5">Invite classmates and study together</p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 block">Group Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., CS50 Study Squad"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 block">Subject</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SUBJECT_EMOJIS).map(([s, e]) => (
                <button key={s} onClick={() => { setSubject(s); setEmoji(e); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    subject === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:border-white/[0.12]'
                  }`}>
                  {e} {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you studying?" rows={2}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={!name.trim() || creating}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-40">
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GroupChat({ group, onBack }: { group: Group; onBack: () => void }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [group.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups?action=detail&id=${group.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setNotes(data.notes || []);
    } catch { /* noop */ }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    try {
      const res = await fetch('/api/groups/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group.id, content: msg, userName: user?.firstName || 'You' }),
      });
      const data = await res.json();
      if (data.message) setMessages(prev => [...prev, data.message]);
    } catch { /* noop */ }
  };

  const addNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-note', groupId: group.id, title: newNoteTitle, content: newNoteContent }),
      });
      const data = await res.json();
      if (data.note) setNotes(prev => [...prev, data.note]);
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNewNote(false);
    } catch { /* noop */ }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Group Header */}
      <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-2xl">{group.emoji}</div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white">{group.name}</h2>
          <p className="text-[10px] font-mono text-gray-500">{group.memberCount || group.members.length} members · {group.subject}</p>
        </div>
        <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-0.5">
          <button onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
              activeTab === 'chat' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <MessageSquare className="w-3 h-3 inline mr-1" />Chat
          </button>
          <button onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
              activeTab === 'notes' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <StickyNote className="w-3 h-3 inline mr-1" />Notes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'chat' ? (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.userId === 'user_demo';
              return (
                <motion.div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: `${MEMBER_COLORS[msg.userName.charCodeAt(0) % MEMBER_COLORS.length]}15`, color: MEMBER_COLORS[msg.userName.charCodeAt(0) % MEMBER_COLORS.length] }}>
                    {msg.userName[0]}
                  </div>
                  <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                    {!isMe && <p className="text-[10px] font-mono text-gray-500 mb-0.5">{msg.userName}</p>}
                    <div className={`inline-block rounded-xl px-3 py-2 text-sm ${
                      isMe ? 'bg-cyan-500/15 border border-cyan-500/20 text-white' : 'bg-white/[0.03] border border-white/[0.06] text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[8px] font-mono text-gray-600 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <motion.div key={note.id} className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{note.title}</h4>
                  <span className="text-[9px] font-mono text-gray-600">by {note.updatedBy}</span>
                </div>
                <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </motion.div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <StickyNote className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No shared notes yet</p>
                <p className="text-gray-600 text-xs mt-1">Create the first note for your group</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      {activeTab === 'chat' ? (
        <div className="px-6 py-3 border-t border-white/[0.04]">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#0a0a0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all" />
            <button onClick={sendMessage} disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-30">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-3 border-t border-white/[0.04]">
          {showNewNote ? (
            <div className="bg-[#0a0a0f] border border-white/[0.08] rounded-xl p-3 space-y-2">
              <input value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Note title"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/30 transition-all" />
              <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Write your note..." rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/30 transition-all resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowNewNote(false)} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">Cancel</button>
                <button onClick={addNote} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-purple-500 to-pink-600 transition-all">Save Note</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewNote(true)}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2">
              <Plus className="w-3 h-3" /> Add Shared Note
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function GroupsPage() {
  const { isSignedIn } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups?action=list');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch { /* noop */ }
    setLoading(false);
  };

  const handleGroupCreated = (group: Group) => {
    setGroups(prev => [{ ...group, memberCount: 1, messageCount: 0 }, ...prev]);
    setShowCreate(false);
    setSelectedGroup(group);
  };

  const filteredGroups = filter === 'all' ? groups : groups.filter(g => g.subject === filter);
  const subjects = [...new Set(groups.map(g => g.subject))];

  if (selectedGroup) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[#020203] text-white font-sans">
          <Navbar />
          <div className="pt-20 max-w-4xl mx-auto">
            <GroupChat group={selectedGroup} onBack={() => setSelectedGroup(null)} />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden">
        <StudyGroupsNetworkBackground />
        <Navbar />
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Groups</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Collaborate, share notes, and study together</p>
              </div>
              <button onClick={() => setShowCreate(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Group
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                  filter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:border-white/[0.12]'
                }`}>All</button>
              {subjects.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                    filter === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:border-white/[0.12]'
                  }`}>
                  {SUBJECT_EMOJIS[s] || '📚'} {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Groups Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <motion.div className="text-center py-20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">No groups yet</h3>
              <p className="text-gray-500 text-sm mb-6">Create the first study group and invite your classmates</p>
              <button onClick={() => setShowCreate(true)}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                Create First Group
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group, i) => (
                <motion.div key={group.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GroupCard group={group} onClick={() => setSelectedGroup(group)} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Features Banner */}
          <motion.div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {[
              { icon: <MessageSquare className="w-5 h-5" />, title: 'Group Chat', desc: 'Real-time discussion with study partners', color: 'cyan' },
              { icon: <StickyNote className="w-5 h-5" />, title: 'Shared Notes', desc: 'Collaborative note-taking and summaries', color: 'purple' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'AI Study Tips', desc: 'Get personalized study suggestions', color: 'pink' },
            ].map((f, i) => (
              <div key={i} className="bg-[#0a0a0f]/60 border border-white/[0.04] rounded-2xl p-5 text-center">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-${f.color}-500/10 border border-${f.color}-500/20`}
                  style={{ color: f.color === 'cyan' ? '#06b6d4' : f.color === 'purple' ? '#a855f7' : '#ec4899' }}>
                  {f.icon}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
                <p className="text-[11px] text-gray-500">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleGroupCreated} />}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}