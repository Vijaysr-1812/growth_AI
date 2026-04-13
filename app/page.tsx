"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Search, TrendingUp, BrainCircuit, Clock, 
  User, Newspaper, LogOut, Activity 
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  
  // NEW: State to control the dropdown menu
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans overflow-hidden">
      
      {/* ========================================
        THE CURTAIN REVEAL EFFECT
        ========================================
      */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        className="fixed inset-0 bg-black z-100 pointer-events-none"
      />

      {/* ========================================
        HERO SECTION
        ========================================
      */}
      <div className="relative min-h-screen flex flex-col">
        
        {/* Continuous Flowing Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[30%] -left-[20%] w-[140%] h-175 bg-linear-to-r from-blue-900/40 via-indigo-600/30 to-purple-900/40 blur-[120px] rounded-[100%]"
            style={{ transformOrigin: "center center" }}
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[120%] h-125 bg-linear-to-r from-blue-400/20 via-white/5 to-transparent blur-[90px] rounded-[100%]"
            style={{ transformOrigin: "center center" }}
          />
        </div>

        {/* Navigation - Fades in as curtain rises */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative z-10 flex justify-between items-center px-8 py-6 md:px-16"
        >
          <div className="text-2xl font-bold tracking-tighter">
            Nexus<span className="text-blue-500">.AI</span>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <Link href="/news" className="hover:text-white transition-colors">Market News</Link>
          </div>

          {/* DYNAMIC AUTH BUTTON */}
          <div className="flex items-center">
            {status === "loading" ? (
              <div className="w-24 h-10 bg-white/5 animate-pulse rounded-sm border border-white/10"></div>
            ) : session ? (
              <div className="relative">
                {/* CHANGED: Made this a button that toggles the dropdown instead of a Link */}
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 border border-white/20 pl-2 pr-4 py-1.5 hover:bg-white/10 transition-all duration-300 rounded-full bg-black/50 backdrop-blur-md"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-200 truncate max-w-30">
                    {session.user?.name || session.user?.email?.split('@')[0] || "User"}
                  </span>
                </button>

                {/* THE DROPDOWN MENU */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                    >
                      <Link 
                        href="/dashboard"
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Activity className="w-4 h-4 mr-2 text-blue-400" /> 
                        Dashboard
                      </Link>
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> 
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                href="/login"
                className="text-sm font-medium border border-gray-600 px-6 py-2 hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </motion.nav>

        {/* Hero Content - Cascades in after curtain */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-6xl">
          <motion.h1 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] mb-6"
          >
            Invest with AI.<br />
            Grow with insight.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="text-gray-400 text-lg md:text-xl max-w-xl mb-10"
          >
            Real-time sentiment analysis and personalized financial advice powered by Gemini. Smart investing made personal.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <Link href="/dashboard" className="bg-white inline-flex text-black px-8 py-4 items-center space-x-3 text-sm font-bold hover:bg-gray-200 transition-colors rounded-sm group">
              <span>{session ? "GO TO DASHBOARD" : "START ANALYSIS"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Floating Glassmorphism Stat */}
        <motion.div 
          initial={{ opacity: 0, x: 50, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, x: 0, backdropFilter: "blur(12px)" }}
          transition={{ duration: 1, delay: 1.8 }}
          className="absolute bottom-24 right-8 md:right-24 bg-white/5 border border-white/10 p-6 rounded-lg w-64 z-10 hidden md:block"
        >
          <div className="text-gray-400 text-sm mb-2">AI Confidence Score</div>
          <div className="text-4xl font-light flex items-end justify-between">
            94% <TrendingUp className="w-6 h-6 text-blue-400 mb-1" />
          </div>
        </motion.div>
      </div>

      {/* ========================================
        PROJECT FEATURES SECTION
        ========================================
      */}
      <div id="features" className="bg-[#0a0a0a] py-32 px-8 md:px-16 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Your Personal Financial Advisor</h2>
            <p className="text-gray-400 max-w-2xl text-lg">
              We process real-time market data, global news, and macroeconomic trends so you dont have to.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-black border border-white/10 p-8 rounded-xl hover:border-blue-500/50 transition-colors group"
            >
              <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium mb-3">Custom Watchlists</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Search and bundle the specific stocks you are interested in. We instantly aggregate the latest news and price actions for your selection.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-black border border-white/10 p-8 rounded-xl hover:border-purple-500/50 transition-colors group"
            >
              <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium mb-3">Time Horizon Context</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tell us if you are day-trading or planning for retirement. Our analysis shifts completely based on your short-term or long-term goals.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-black border border-white/10 p-8 rounded-xl hover:border-green-500/50 transition-colors group"
            >
              <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium mb-3">Gemini AI Synthesis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We feed wars, recessions, and real-time earnings reports into our AI agent to provide you with clear, plain-English investment suggestions.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}