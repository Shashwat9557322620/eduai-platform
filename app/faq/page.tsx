"use client";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import NotesStudyBackground from '../components/backgrounds/NotesStudyBackground';
import { HelpCircle, ChevronDown, Mail, MessageCircle, BookOpen, Shield, CreditCard, User, FileText, Zap } from 'lucide-react';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'general', label: 'General', icon: Zap },
  { id: 'account', label: 'Account & Billing', icon: User },
  { id: 'tools', label: 'AI Tools', icon: BookOpen },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
];

const FAQS = [
  {
    category: 'general',
    question: 'What is EduAI and how does it work?',
    answer: 'EduAI is an advanced AI-powered study platform engineered to optimize your learning workflow. Our neural suite includes a Curriculum Optimizer that deconstructs syllabi into daily protocols, a Flashcard Generator that transforms raw text into high-retention memory units, and a Skill Gap Analyzer that cross-references your capabilities against global industry benchmarks. Simply input your study material, and our AI does the rest.',
  },
  {
    category: 'general',
    question: 'Is EduAI free to use?',
    answer: 'We operate on a freemium model. The free tier provides 30 credits to explore our arsenal — enough to generate multiple study plans or flashcards. For unlimited access, priority AI processing, and advanced analytics, our PRO plan unlocks the full spectrum of capabilities. Check our Billing page for detailed pricing and credit packs.',
  },
  {
    category: 'tools',
    question: 'How does the Curriculum Optimizer work?',
    answer: 'The Optimizer is our flagship neural engine. Paste your syllabus or course outline, set your target completion days, and our AI strategically decomposes the material into an executable daily protocol. Each day includes time-allocated slots, topic focus areas, estimated commitment, and completion tracking — essentially a personalized study blueprint engineered for maximum retention.',
  },
  {
    category: 'tools',
    question: 'Can I upload files for analysis?',
    answer: 'Absolutely. Our system supports PDF, image (PNG, JPG), and plain text uploads. The extraction engine parses the content, normalizes it, and feeds it through our AI pipelines. Whether it is a scanned textbook chapter, lecture slides, or handwritten notes — our system processes it into structured study materials.',
  },
  {
    category: 'tools',
    question: 'How accurate is the Skill Gap Analysis?',
    answer: 'Our analysis engine is trained on millions of job postings, industry frameworks, and career progression datasets. It compares your current skill inventory against target role requirements, producing a match percentage, categorized gap analysis, and a 30-60-90 day learning roadmap. The recommendations are dynamic and updated against current market trends.',
  },
  {
    category: 'account',
    question: 'How do credits work?',
    answer: 'Credits are the fuel for our AI engine. Each AI generation — whether a study plan, flashcard set, or skill analysis — consumes credits based on complexity. Free users receive 30 credits upon signup. PRO subscribers enjoy significantly higher limits and priority queue access. Credits never expire as long as your account remains active.',
  },
  {
    category: 'account',
    question: 'What payment methods do you accept?',
    answer: 'We process all payments through Razorpay, India\'s leading payment gateway. We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and major wallets. All transactions are encrypted and securely processed — we never store your financial information on our servers.',
  },
  {
    category: 'account',
    question: 'Can I get a refund?',
    answer: 'Yes, we offer refunds within 7 days of purchase provided you have used less than 10% of the purchased credits. Submit a refund request through our Refund Policy page, and our team will review it within 2-3 business days. Approved refunds are processed back to the original payment method within 5-7 business days.',
  },
  {
    category: 'security',
    question: 'How is my data protected?',
    answer: 'Security is architecturally fundamental to EduAI. We implement AES-256 encryption at rest, TLS 1.3 in transit, authentication via Clerk (SOC 2 compliant), and regular security audits. Your study plans and analysis are stored in isolated database partitions. We never share, sell, or monetize your personal data. See our Privacy Policy for complete details.',
  },
  {
    category: 'security',
    question: 'Do you store my AI inputs?',
    answer: 'Your AI inputs are temporarily processed for generation and stored securely for usage history purposes. You can view and manage your history from your Dashboard. We do not use your personal study data to train our models. Raw inputs are anonymized after 90 days per our data retention policy.',
  },
  {
    category: 'account',
    question: 'How do I create an account?',
    answer: 'Authentication is handled seamlessly through Clerk. Click the "Sign Up" button and you can authenticate using your Google account, GitHub account, or email with a magic link. The process takes under 30 seconds and requires no complex password setup. Your account syncs across all devices automatically.',
  },
  {
    category: 'general',
    question: 'Can I use EduAI on mobile?',
    answer: 'EduAI is built as a responsive web application, optimized for all screen sizes from mobile to desktop. While we do not currently have a native mobile app, the web interface delivers a full-featured experience on any modern browser, including Chrome, Safari, Firefox, and Edge on both iOS and Android devices.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#020203] text-white relative overflow-hidden">
      <NotesStudyBackground />

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-24">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
            </span>
            <span className="text-gray-300 uppercase">Knowledge Base</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500">Questions</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Everything you need to know about EduAI. Can&apos;t find what you&apos;re looking for? <a href="/support" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4">Contact our team</a>.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-2xl opacity-60 animate-pulse-soft"></div>
          <div className="relative flex items-center bg-[#07070a] border border-white/[0.06] rounded-2xl overflow-hidden focus-within:border-purple-500/30 transition-all duration-300">
            <HelpCircle className="w-5 h-5 text-gray-500 ml-5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full bg-transparent px-4 py-4 text-white placeholder:text-gray-600 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mr-4 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                    : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16 bg-[#07070a] border border-white/[0.06] rounded-2xl">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-mono text-sm">No matching questions found</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="text-cyan-400 text-xs mt-2 hover:text-cyan-300 transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            filteredFAQs.map((faq, i) => (
              <div
                key={i}
                className="group bg-[#07070a]/80 border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/20 hover:bg-[#07070a]"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      openIndex === i 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'bg-white/[0.03] border border-white/[0.06] group-hover:bg-white/[0.06]'
                    }`}>
                      <span className="text-sm">{faq.category === 'general' ? '💡' : faq.category === 'account' ? '👤' : faq.category === 'tools' ? '🔧' : '🔒'}</span>
                    </div>
                    <span className="text-base md:text-lg font-bold text-white/90 pr-4 leading-relaxed">{faq.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/[0.06] pt-4 ml-12">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-16 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-fuchsia-500/20 to-pink-600/20 rounded-3xl opacity-60 group-hover:opacity-90 transition duration-700"></div>
          <div className="relative bg-[#07070a] border border-white/[0.06] rounded-3xl p-10 md:p-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Still have questions?</h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Our support team typically responds within 24 hours. You can also check your ticket status with your tracking ID.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
              >
                <Mail className="w-4 h-4" />
                Submit a Ticket
              </a>
              <a
                href="/support"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300"
              >
                Track Existing Request
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
