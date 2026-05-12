"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, TrendingUp, User, LogOut, Activity 
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  
  // State to control the dropdown menu
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
            Growth<span className="text-blue-500">.AI</span>
          </div>
          
          <div className="hidden md:flex space-x-8 text-sm text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {/* Changed this link to point to your new About Us page! */}
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/news" className="hover:text-white transition-colors">Market News</Link>
          </div>

          {/* DYNAMIC AUTH BUTTON */}
          <div className="flex items-center">
            {status === "loading" ? (
              <div className="w-24 h-10 bg-white/5 animate-pulse rounded-sm border border-white/10"></div>
            ) : session ? (
              <div className="relative">
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
                        href="/profile"
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5"
                      >
                        <User className="w-4 h-4 mr-2 text-purple-400" /> 
                        Profile
                      </Link>
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
            Grow with <span className="text-blue-400">insight.</span>
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
    </div>
  );
}