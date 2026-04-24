"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, Target, Cpu, Code, 
  LineChart, BrainCircuit, ListPlus, ShieldCheck 
} from "lucide-react";

export default function AboutUs() {
  const [showFeatures, setShowFeatures] = useState(false);

  const founders = [
    {
      id: "f2",
      name: "Yet to find them",
      role: "Investor | Growth AI",
      quote: "Everything that is really great and inspiring is created by individuals who can labor in freedom.",
      author: "Albert Einstein",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
      icon: <Cpu className="w-5 h-5 text-fuchsia-400" />,
      glow: "from-fuchsia-700 via-[#111] to-[#111]"
    },
    {
      id: "f1",
      name: "VIJAY S R",
      role: "Founder | Growth AI",
      quote: "God helps those who help themselves. Energy and persistence conquer all things. Well done is better than well said.",
      author: "Benjamin Franklin",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", 
      icon: <Target className="w-5 h-5 text-blue-400" />,
      glow: "from-blue-700 via-[#111] to-[#111]"
      
    },
    {
      id: "f3",
      name: "Yet to find them",
      role: "Partner | Technology",
      quote: "Our prime purpose in this life is to help others. And if you can't help them, at least don't hurt them.",
      author: "Dalai Lama",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
      icon: <Code className="w-5 h-5 text-indigo-400" />,
      glow: "from-indigo-700 via-[#111] to-[#111]"
    }
  ];

  const platformFeatures = [
    {
      title: "Custom Watchlists",
      description: "Build tailored lists of your favorite Stocks, ETFs, and Mutual Funds. Instantly access real-time data with a single click.",
      icon: <ListPlus className="w-8 h-8 text-blue-400" />,
      color: "from-blue-600/30 to-transparent"
    },
    {
      title: "Brutally Honest AI",
      description: "No fluff. Feed your strategy into our Gemini-powered engine for a cutthroat, data-driven verdict on your investments.",
      icon: <BrainCircuit className="w-8 h-8 text-fuchsia-400" />,
      color: "from-fuchsia-600/30 to-transparent"
    },
    {
      title: "Live Market Data",
      description: "Professional-grade charting powered by TradingView. Toggle seamlessly between intraday candles and daily NAV area charts.",
      icon: <LineChart className="w-8 h-8 text-green-400" />,
      color: "from-green-600/30 to-transparent"
    },
    {
      title: "Dynamic SIP Strategy",
      description: "Test lump sum vs. monthly SIP strategies to see exactly how your capital performs over different time horizons.",
      icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />,
      color: "from-indigo-600/30 to-transparent"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden relative flex flex-col">
      
      {/* ========================================
        CONTINUOUS FLOWING BACKGROUND
        (Using explicit height [700px] & gradient to guarantee rendering)
        ========================================
      */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[30%] -left-[20%] w-[140%] h-[700px] bg-gradient-to-r from-blue-900/40 via-indigo-600/30 to-purple-900/40 blur-[120px] rounded-[100%]"
          style={{ transformOrigin: "center center" }}
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[500px] bg-gradient-to-r from-blue-400/20 via-white/5 to-transparent blur-[90px] rounded-[100%]"
          style={{ transformOrigin: "center center" }}
        />
      </div>

      {/* Header */}
      <header className="px-6 py-6 absolute top-0 left-0 w-full z-50">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-12 px-6 max-w-6xl mx-auto w-full relative z-10">
        
        {/* STATE 1: MISSION & FOUNDERS */}
        <AnimatePresence mode="wait">
          {!showFeatures && (
            <motion.div 
              key="founders-section"
              exit={{ opacity: 0, y: 100, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex flex-col items-center"
            >
              <div className="max-w-3xl text-center mb-16">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500"
                >
                  Driven by Innovation.<br />Guided by Empathy.
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-400 leading-relaxed"
                >
                  Nexus.AI is redefining human-computer interaction. We build tools that empower individuals to work smarter, collaborate better, and unlock their full financial potential.
                </motion.p>
              </div>

              {/* Founders Grid */}
              <div className="w-full mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center text-white/90">Meet the founders</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {founders.map((founder, index) => (
                    <motion.div 
                      key={founder.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="group flex flex-col rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/5 bg-black/40 backdrop-blur-sm"
                    >
                      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#111]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={founder.image} 
                          alt={founder.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      
                      <div className="bg-white text-black p-6 pb-4 flex flex-col items-start z-10">
                        <h3 className="text-2xl font-bold mb-1">{founder.name}</h3>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{founder.role}</p>
                      </div>

                      <div className={`p-6 pt-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-t ${founder.glow}`}>
                        <p className="text-white/90 text-sm font-medium leading-relaxed relative z-10 max-w-[250px]">
                          &quot;{founder.quote}&quot;
                        </p>
                        <p className="text-xs text-white/50 font-medium mt-4 relative z-10">
                          {founder.author}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setShowFeatures(true)}
                className="group relative px-8 py-4 bg-black/50 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:border-white/30 active:scale-95 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  Know More About Us
                  <motion.span 
                    animate={{ y: [0, 5, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="ml-2 text-gray-400 group-hover:text-white transition-colors"
                  >
                    ↓
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATE 2: PLATFORM FEATURES */}
        <AnimatePresence mode="wait">
          {showFeatures && (
            <motion.div
              key="features-section"
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full flex flex-col items-center py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
                  What We Built For You
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Nexus.AI isn&apos;t just a dashboard. It&apos;s a complete, intelligent ecosystem designed to give you a cutting-edge advantage in the market.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {platformFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.15) }}
                    className="relative group bg-black/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl overflow-hidden hover:border-white/20 transition-all shadow-xl"
                  >
                    <div className={`absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10`} />
                    
                    <div className="bg-[#111] border border-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 flex flex-col sm:flex-row gap-4"
              >
                <button 
                  onClick={() => setShowFeatures(false)}
                  className="px-6 py-3 rounded-full font-medium text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 backdrop-blur-md transition-all"
                >
                  Meet the Founders Again
                </button>
                <Link 
                  href="/dashboard"
                  className="px-6 py-3 rounded-full font-bold text-black bg-white hover:bg-gray-200 transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Go to Dashboard <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}