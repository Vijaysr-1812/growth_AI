"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Bell, User, Activity, LogOut, Home, Newspaper, ExternalLink, Clock, Sparkles, BrainCircuit, ArrowUpRight, Bookmark, LayoutGrid
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
  
  // THE NEW TABS STATE: Switch between News Grid and AI Summary
  const [viewMode, setViewMode] = useState<"Feed" | "Summary">("Feed");

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // AI Summary States
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // 1. Fetch News (Using your exact existing GET route!)
  useEffect(() => {
    const fetchNewsData = async () => {
      setIsLoading(true);
      try {
        const resNews = await fetch("/api/news"); // Just a simple GET request
        if (!resNews.ok) throw new Error("Network response was not ok");
        
        const dataNews = await resNews.json();
        
        // Use dataNews.articles matching your backend output
        setArticles(dataNews.articles || []);
        setIsPersonalized(dataNews.isPersonalized || false);
        
      } catch (error) {
        console.error("Failed to load news data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNewsData();
  }, []);

  // 2. Generate AI Summary
  const handleGenerateSummary = async () => {
    if (articles.length === 0) return;
    
    setIsGeneratingSummary(true);
    setAiSummary("");
    
    // Pass the top headlines to Gemini
    const headlinesText = articles.slice(0, 15).map(n => `- [${n.relatedTicker}] ${n.title}`).join("\n");

    try {
      const res = await fetch("/api/news/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsHeadlines: headlinesText }),
      });
      
      const data = await res.json();
      setAiSummary(data.summary || "Failed to generate summary.");
    } catch (error) {
      console.error("Summary error", error);
      setAiSummary("An error occurred while generating the summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Helper to format timestamps nicely
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
              Growth<span className="text-blue-500">.AI</span>
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

            <div className="relative">
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-500/50 transition-all overflow-hidden"
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
                    <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/5">
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
        MAIN CONTENT
        ======================================== */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col z-10">
        
        {/* NEW TABS SYSTEM (News Feed vs. AI Summary) */}
        <div className="flex space-x-8 mb-8 border-b border-white/10">
          <button 
            onClick={() => setViewMode("Feed")}
            className={`pb-4 text-lg font-medium border-b-2 transition-all flex items-center ${
              viewMode === "Feed" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <LayoutGrid className="w-5 h-5 mr-2" />
            Latest Headlines
          </button>
          <button 
            onClick={() => setViewMode("Summary")}
            className={`pb-4 text-lg font-medium border-b-2 transition-all flex items-center ${
              viewMode === "Summary" 
              ? "border-purple-500 text-purple-400" 
              : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            AI Executive Summary
          </button>
        </div>

        {articles.length === 0 && !isLoading ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Bookmark className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium mb-2">Your News Feed is Empty</h2>
            <p className="text-gray-400 mb-6 max-w-md text-center">Add stocks or mutual funds to your watchlist on the dashboard to see your personalized news feed here.</p>
            <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* VIEW MODE 1: THE NEWS FEED */}
            {viewMode === "Feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-light mb-2 flex items-center">
                    Your Curated Feed
                    {isPersonalized && (
                      <span className="ml-3 text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" /> Personalized
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-400">
                    The latest headlines tailored specifically to the assets in your watchlist.
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-blue-400/80 bg-[#0a0a0a] rounded-3xl border border-white/5">
                    <Activity className="w-8 h-8 animate-spin mb-4" />
                    <p className="animate-pulse">Curating your feed...</p>
                  </div>
                ) : (
                  // Full width grid
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => (
                      <motion.a 
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={article.uuid || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group flex flex-col shadow-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                            {article.publisher}
                          </span>
                          
                          <span className="text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded">
                            <span className="text-blue-400">{article.relatedTicker}</span>
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium leading-snug mb-3 group-hover:text-blue-400 transition-colors line-clamp-3">
                          {article.title}
                        </h3>
                        
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(article.providerPublishTime)}
                          </div>
                          <div className="flex items-center group-hover:text-white transition-colors">
                            Read <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW MODE 2: AI SUMMARY */}
            {viewMode === "Summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <div className="w-full max-w-3xl relative group">
                  <div className="absolute -inset-0.5 rounded-3xl blur opacity-20 transition duration-1000 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <div className="relative bg-black border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl min-h-[500px] flex flex-col">
                    
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                      <div>
                        <h3 className="text-2xl font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                          <Sparkles className="w-6 h-6 mr-3 text-blue-400" />
                          AI Executive Summary
                        </h3>
                        <p className="text-gray-400 text-sm">
                          A brutally honest breakdown of todays news regarding your portfolio.
                        </p>
                      </div>
                    </div>

                    {!aiSummary && !isGeneratingSummary ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <BrainCircuit className="w-16 h-16 text-gray-600 mb-6" />
                        <p className="text-gray-400 text-lg mb-8 max-w-md">
                          Dont have time to read all the articles? Let Gemini read them for you and extract the most critical updates.
                        </p>
                        <button 
                          onClick={handleGenerateSummary}
                          disabled={isLoading || articles.length === 0}
                          className="px-8 py-4 bg-white text-black rounded-full text-base font-bold transition-all flex items-center justify-center group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-5 h-5 mr-2 text-blue-600 group-hover:rotate-12 transition-transform" />
                          Generate My Summary
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 text-base text-gray-300 leading-relaxed space-y-6">
                        {isGeneratingSummary ? (
                          <div className="flex flex-col items-center justify-center h-full text-purple-400/80 py-20">
                            <Activity className="w-10 h-10 animate-spin mb-6" />
                            <p className="animate-pulse text-lg">Synthesizing global news data...</p>
                          </div>
                        ) : (
                          <div className="space-y-6 whitespace-pre-wrap">{aiSummary}</div>
                        )}
                      </div>
                    )}

                    {/* Refresh Button */}
                    {aiSummary && !isGeneratingSummary && (
                      <div className="pt-8 border-t border-white/10 mt-8">
                        <button 
                          onClick={handleGenerateSummary}
                          className="flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Refresh with Latest Data
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>
    </div>
  );
}