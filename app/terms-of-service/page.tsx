"use client";
import Navbar from '../components/Navbar';
import BlogArticleBackground from '../components/backgrounds/BlogArticleBackground';
import { FileText, Shield, CreditCard, AlertTriangle, Info, ArrowUpRight } from 'lucide-react';

const SECTIONS = [
  {
    icon: Info,
    title: '1. Acceptance of Terms',
    content: 'By accessing and using EduAI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.',
    color: 'cyan',
  },
  {
    icon: FileText,
    title: '2. Description of Service',
    content: 'EduAI provides AI-powered study tools including but not limited to: Curriculum Optimizer for generating study plans, Flashcard Generator for creating study cards from text, and Skill Gap Analyzer for career development insights.',
    color: 'purple',
  },
  {
    icon: Shield,
    title: '3. User Accounts',
    content: 'You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account. You are responsible for all activities that occur under your account.',
    color: 'emerald',
  },
  {
    icon: CreditCard,
    title: '4. Credits and Payments',
    content: 'EduAI operates on a credit-based system. Credits are consumed when using AI-powered features. Credits can be purchased through our billing page. All payments are processed securely through Razorpay. Refunds are handled according to our refund policy.',
    color: 'amber',
  },
  {
    icon: AlertTriangle,
    title: '5. Acceptable Use',
    content: '',
    items: [
      'Use the service for any illegal purposes',
      'Attempt to gain unauthorized access to our systems',
      'Submit content that infringes on intellectual property rights',
      'Use automated tools to abuse or overload our API',
      'Reverse engineer or attempt to extract the source code of our platform',
    ],
    color: 'rose',
  },
  {
    icon: Shield,
    title: '6. Limitation of Liability',
    content: 'EduAI is provided "as is" without any warranty. We are not liable for any damages arising from the use of our service, including but not limited to direct, indirect, incidental, or consequential damages.',
    color: 'indigo',
  },
];

const colorBorderMap: Record<string, string> = {
  cyan: 'hover:border-cyan-500/30',
  purple: 'hover:border-purple-500/30',
  emerald: 'hover:border-emerald-500/30',
  amber: 'hover:border-amber-500/30',
  rose: 'hover:border-rose-500/30',
  indigo: 'hover:border-indigo-500/30',
};

const colorAccent: Record<string, string> = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  indigo: 'text-indigo-400',
};

const colorIconBg: Record<string, string> = {
  cyan: 'bg-cyan-500/10 border-cyan-500/30',
  purple: 'bg-purple-500/10 border-purple-500/30',
  emerald: 'bg-emerald-500/10 border-emerald-500/30',
  amber: 'bg-amber-500/10 border-amber-500/30',
  rose: 'bg-rose-500/10 border-rose-500/30',
  indigo: 'bg-indigo-500/10 border-indigo-500/30',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden">
      <BlogArticleBackground />

      <Navbar />

      <div className="relative z-10 pt-36 pb-20 px-6 max-w-4xl mx-auto">
        
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(167,139,250,0.1)]">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-300 uppercase">Legal Agreement</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Terms</span> of Service
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Last updated: January 2025 &nbsp;·&nbsp; Please read these terms carefully before using EduAI.
          </p>
        </div>

        {/* Summary Card */}
        <div className="relative group mb-12">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-3xl opacity-60 animate-pulse-soft"></div>
          <div className="relative bg-[#07070a] border border-white/[0.06] rounded-3xl p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">TL;DR — Summary</h2>
                <p className="text-gray-400 leading-relaxed">
                  These terms govern your use of EduAI. By using our platform, you agree to follow these rules. 
                  We provide AI study tools on a credit-based system. Your data is handled according to our 
                  <a href="/privacy-policy" className="text-cyan-400 hover:underline mx-1">Privacy Policy</a>. 
                  If you have questions, contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className={`group bg-[#07070a]/80 border border-white/[0.06] rounded-2xl p-8 md:p-10 transition-all duration-500 ${colorBorderMap[section.color]}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 ${colorIconBg[section.color]}`}>
                    <Icon className={`w-6 h-6 ${colorAccent[section.color]}`} />
                  </div>
                  <div className="pt-1">
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                {section.content && (
                  <p className="text-gray-400 leading-relaxed">{section.content}</p>
                )}
                {section.items && (
                  <ul className="space-y-3 mt-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-400">
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colorAccent[section.color]}`}
                          style={{ backgroundColor: 'currentColor' }}
                        />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-[#07070a] border border-white/[0.06] rounded-3xl p-10 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-3">Questions about these terms?</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            If you have any questions about these Terms of Service, please contact our support team.
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
          >
            Contact Support
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
