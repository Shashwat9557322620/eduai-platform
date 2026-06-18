"use client";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import AuthFlowBackground from '../components/backgrounds/AuthFlowBackground';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#020203] flex items-center justify-center px-4 relative overflow-hidden">
      <AuthFlowBackground />
      
      {/* Animated glow ring behind the card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 blur-[100px] animate-glow-orbit" />
      </div>

      <div className="relative z-10 ">
        {/* Premium card wrapper with animated border */}
        <div className="relative p-[1px] rounded-2xl overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 animate-border-rotate opacity-60" />
          
          <SignUp
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "mx-auto",
                card: "bg-[#07070a]/95 backdrop-blur-xl border-0 shadow-[0_0_60px_rgba(0,0,0,0.5)] rounded-2xl",
                headerTitle: "text-white text-2xl font-bold tracking-tight",
                headerSubtitle: "text-gray-400",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all",
                socialButtonsBlockButtonText: "text-gray-300",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-300 text-sm font-medium",
                formFieldInput: "bg-[#020203] border-white/10 text-white rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all",
                footerActionText: "text-gray-400",
                footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold",
                formButtonPrimary: "bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl",
              },
            }}
          />
        </div>
      </div>


    </div>
  );
}
