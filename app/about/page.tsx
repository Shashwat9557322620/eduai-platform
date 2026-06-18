"use client";
import AboutGlobeBackground from '../components/backgrounds/AboutGlobeBackground';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020203] text-white relative overflow-hidden">
      <AboutGlobeBackground />
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-36 pb-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold tracking-widest mb-6 animate-shimmer-overlay">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></span>
            </span>
            <span className="text-gray-300 uppercase">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-500">EduAI</span>
          </h1>
          <p className="text-gray-500 max-w-3xl mx-auto text-lg">
            We are building the future of AI-powered education. Our mission is to make personalized, adaptive learning accessible to every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="bg-[#07070a]/80 border border-white/[0.06] rounded-2xl p-8 md:p-10 hover:border-indigo-500/20 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To democratize access to AI-powered study tools that help students learn more efficiently, identify skill gaps, and achieve their academic and career goals. We believe technology should empower, not replace, the learning process.
            </p>
          </div>
          <div className="bg-[#07070a]/80 border border-white/[0.06] rounded-2xl p-8 md:p-10 hover:border-purple-500/20 transition-all duration-500">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              A world where every student has access to a personal AI study assistant that adapts to their unique learning style, pace, and goals. We envision a future where curriculum optimization is instant and personalized.
            </p>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12 text-center uppercase">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Tools</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#07070a]/60 border border-white/[0.06] rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Curriculum Optimizer</h3>
              <p className="text-sm text-gray-500">Break down complex syllabi into daily study protocols.</p>
            </div>
            <div className="bg-[#07070a]/60 border border-white/[0.06] rounded-xl p-6 text-center hover:border-purple-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Flashcard Forge</h3>
              <p className="text-sm text-gray-500">Extract knowledge into high-retention memory modules.</p>
            </div>
            <div className="bg-[#07070a]/60 border border-white/[0.06] rounded-xl p-6 text-center hover:border-pink-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Skill Gap Analyzer</h3>
              <p className="text-sm text-gray-500">Cross-reference your skills against global requirements.</p>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-fuchsia-500/5 border border-white/[0.06] rounded-3xl p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-500">Transform</span> Your Learning?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Join thousands of students who are already using EduAI to optimize their study routine and accelerate their learning.
          </p>
          <a
            href="/billing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
