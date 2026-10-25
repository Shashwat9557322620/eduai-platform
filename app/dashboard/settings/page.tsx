"use client";
import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-[calc(100vh-80px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-400" />
          </div>
          <h1 className="text-3xl font-black text-white">Settings</h1>
        </div>
        <p className="text-gray-400">Manage your account preferences and security.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0f] border border-white/[0.08] p-6 rounded-3xl"
          >
            <UserProfile 
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none max-w-full m-0 p-0",
                  navbar: "hidden", 
                  navbarMobileMenuRow: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  profileSectionTitleText: "text-white text-xl font-bold border-b border-white/10 pb-2 mb-4",
                  profileSectionPrimaryButton: "text-cyan-400 hover:text-cyan-300 font-bold",
                  avatarImageActionsUpload: "text-cyan-400 hover:text-cyan-300",
                  formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-bold",
                  formFieldLabel: "text-gray-400",
                  formFieldInput: "bg-[#0a0a0f] border border-white/10 text-white rounded-xl focus:border-cyan-500",
                  dividerLine: "bg-white/10",
                  dividerText: "text-gray-500",
                  badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
                }
              }}
            />
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0a0f] border border-white/[0.08] p-6 rounded-3xl"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" /> Billing & Plan
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Manage your active subscription, buy more credits, or view billing history.
            </p>
            <Link 
              href="/billing"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all group"
            >
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Manage Billing</span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
