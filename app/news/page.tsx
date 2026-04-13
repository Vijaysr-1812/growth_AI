"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Bell, User, Activity, LogOut, Home, Newspaper, ExternalLink, Clock, Sparkles
} from "lucide-react";

interface NewsArticle {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string;
  relatedTicker: string;
  thumbnail?: { resolutions: { url: string }[] };
}

export default function MarketNews() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
          setIsPersonalized(data.isPersonalized);
        }
      } catch (error) {
        console.error("Failed to load news", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Helper to format timestamps nicely (e.g., "2 hours ago")
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* ========================================
        TOP NAVIGATION
        ======================================== */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
              Nexus<span className="text-blue-500">.AI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <Home className="w-4 h-4 mr-2" /> Home
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Dashboard
              </Link>
              <span className="text-white flex items-center">
                <Newspaper className="w-4 h-4 mr-2 text-blue-500" /> Market News
              </span>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>

            {/* USER MENU */}
            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-500/50 transition-all overflow-hidden"
              >
                {session?.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/2">
                      <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.email || "Loading..."}
                      </p>
                    </div>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================
        NEWS FEED CONTENT
        ======================================== */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-light mb-2 flex items-center">
            Your Curated Feed
            {isPersonalized && (
              <span className="ml-3 text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Personalized
              </span>
            )}
          </h1>
          <p className="text-gray-400">
            {isPersonalized 
              ? "The latest headlines tailored specifically to the assets in your watchlist."
              : "General market updates. Add tickers to your dashboard to personalize this feed!"}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-400/80">
            <Activity className="w-8 h-8 animate-spin mb-4" />
            <p className="animate-pulse">Curating your news feed...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <motion.a 
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                key={article.uuid || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                    {article.publisher}
                  </span>
                  
                  {/* The Netflix-style Recommendation Tag */}
                  <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded">
                    Because you follow <span className="text-blue-400">{article.relatedTicker}</span>
                  </span>
                </div>
                
                <h3 className="text-lg font-medium leading-snug mb-3 group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(article.providerPublishTime)}
                  </div>
                  <div className="flex items-center group-hover:text-white transition-colors">
                    Read Article <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}