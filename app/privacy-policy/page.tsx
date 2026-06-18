"use client";
import Navbar from '../components/Navbar';
import BlogArticleBackground from '../components/backgrounds/BlogArticleBackground';
import { Shield, Lock, Eye, Database, Mail, Server, FileText, Globe, ArrowUpRight } from 'lucide-react';

const SECTIONS = [
  {
    icon: Database,
    title: '1. Information We Collect',
    color: 'cyan',
    content: 'When you interact with EduAI, we collect specific data points to deliver and improve our services:',
    items: [
      'Account Information: Email address, name, and profile details when you register via Clerk authentication',
      'Usage Data: Syllabus text, skill information, flashcard content, and study plans you submit to our AI tools',
      'Payment Data: Transaction IDs and payment status (processed securely through Razorpay — we NEVER store card details)',
      'Technical Data: IP address, browser type, device information, and session metadata for analytics and security',
      'Communication Data: Support tickets, feedback submissions, and email correspondence',
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    color: 'purple',
    content: 'Your data enables us to deliver a personalized, secure, and continuously improving experience:',
    items: [
      'To power our AI tools — Curriculum Optimizer, Flashcard Generator, and Skill Gap Analyzer',
      'To process payments, manage credits, and maintain your account',
      'To analyze usage patterns and optimize platform performance',
      'To communicate updates, billing information, and support responses',
      'To detect and prevent fraudulent or unauthorized access to our systems',
    ],
  },
  {
    icon: Lock,
    title: '3. Data Security Architecture',
    color: 'emerald',
    content: 'Security is not an afterthought — it is engineered into every layer of our platform:',
    items: [
      'Encryption in Transit: All data transmitted between your browser and our servers uses TLS 1.3',
      'Encryption at Rest: Your data is encrypted using AES-256 standards in our Supabase infrastructure',
      'Authentication: Managed by Clerk, a SOC 2 compliant authentication provider with enterprise-grade security',
      'Payment Security: All payments are processed by Razorpay\'s PCI-DSS compliant gateway',
      'Access Control: Strict role-based access controls and regular security audits',
    ],
  },
  {
    icon: Server,
    title: '4. Third-Party Services',
    color: 'blue',
    content: 'EduAI integrates with carefully selected, industry-leading third-party services:',
    items: [
      'Clerk: Authentication and user management (SOC 2 compliant)',
      'Supabase: Database, storage, and real-time infrastructure',
      'Google Gemini API: AI content generation and analysis',
      'Razorpay: Payment processing (PCI-DSS Level 1 compliant)',
      'Vercel: Hosting and edge network infrastructure',
    ],
  },
  {
    icon: FileText,
    title: '5. Data Retention & Deletion',
    color: 'amber',
    content: 'We retain your data only as long as necessary to provide our services:',
    items: [
      'Account data is retained while your account is active',
      'AI input history is anonymized after 90 days',
      'You can request complete data deletion by contacting our support team',
      'Deleted data is permanently purged from our systems within 30 days',
      'Aggregated, anonymized analytics may be retained indefinitely',
    ],
  },
  {
    icon: Globe,
    title: '6. Your Rights & Choices',
    color: 'rose',
    content: 'You have control over your personal data. You have the right to:',
    items: [
      'Access: Request a copy of all data we hold about you',
      'Rectification: Correct any inaccurate or incomplete data',
      'Erasure: Request deletion of your personal data ("Right to be Forgotten")',
      'Portability: Export your data in a machine-readable format',
      'Objection: Opt out of non-essential data processing',
    ],
  },
  {
    icon: Mail,
    title: '7. Contact & Data Protection',
    color: 'indigo',
    content: 'For any privacy-related inquiries, data requests, or concerns:',
    items: [
      'Email: privacy@eduai.com',
      'Response Time: We aim to respond within 48 hours',
      'Data Protection Officer: Shashwat Mishra',
      'Jurisdiction: Mathura, Uttar Pradesh, India',
      'Complaints: You have the right to lodge a complaint with your local data protection authority',
    ],
  },
];

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-400 to-blue-500',
  purple: 'from-purple-400 to-pink-500',
  emerald: 'from-emerald-400 to-green-500',
  blue: 'from-blue-400 to-indigo-500',
  amber: 'from-amber-400 to-orange-500',
  rose: 'from-rose-400 to-red-500',
  indigo: 'from-indigo-400 to-purple-500',
};

const colorBorderMap: Record<string, string> = {
  cyan: 'hover:border-cyan-500/30',
  purple: 'hover:border-purple-500/30',
  emerald: 'hover:border-emerald-500/30',
  blue: 'hover:border-blue-500/30',
  amber: 'hover:border-amber-500/30',
  rose: 'hover:border-rose-500/30',
  indigo: 'hover:border-indigo-500/30',
};

const colorAccent: Record<string, string> = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  indigo: 'text-indigo-400',
};

const colorIconBg: Record<string, string> = {
  cyan: 'bg-cyan-500/10 border-cyan-500/30',
  purple: 'bg-purple-500/10 border-purple-500/30',
  emerald: 'bg-emerald-500/10 border-emerald-500/30',
  blue: 'bg-blue-500/10 border-blue-500/30',
  amber: 'bg-amber-500/10 border-amber-500/30',
  rose: 'bg-rose-500/10 border-rose-500/30',
  indigo: 'bg-indigo-500/10 border-indigo-500/30',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans relative overflow-hidden">
      <BlogArticleBackground />

      <Navbar />

      <div className="relative z-10 pt-36 pb-20 px-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-300 uppercase">Your Privacy Matters</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Privacy</span> Policy
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Last updated: January 2025 &nbsp;·&nbsp; Read time: 5 minutes
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="relative group mb-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl opacity-60 animate-pulse-soft"></div>
          <div className="relative bg-[#07070a] border border-white/[0.06] rounded-3xl p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">TL;DR — Our Commitment</h2>
                <p className="text-gray-400 leading-relaxed">
                  We collect only what is necessary to provide our AI study tools. We never sell your data. Your study plans, flashcards, and analysis are yours — we are just the engine. All sensitive operations are handled by trusted third-party providers (Clerk, Razorpay) who meet the highest security standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className={`group bg-[#07070a]/80 border border-white/[0.06] rounded-2xl p-8 md:p-10 transition-all duration-500 ${colorBorderMap[section.color]}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 ${colorIconBg[section.color]}`}>
                  
                    <Icon className={`w-6 h-6 ${colorAccent[section.color]}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">{section.content}</p>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-400">
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colorAccent[section.color]}`}
                        style={{ backgroundColor: 'currentColor' }}
                      />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-[#07070a] border border-white/[0.06] rounded-3xl p-10 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-3">Questions about your data?</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Our data protection team is ready to help with any privacy concerns or data requests.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a
              href="mailto:privacy@eduai.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
            >
              <Mail className="w-4 h-4" />
              Contact DPO
            </a>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              View FAQ
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
