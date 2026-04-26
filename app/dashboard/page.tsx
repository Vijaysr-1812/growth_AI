"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Search, Bell, User, Sparkles, Activity, LogOut, Home, Newspaper, Briefcase, ChevronRight, X, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const AdvancedRealTimeChart = dynamic(() => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart), { ssr: false });

export default function Dashboard() {
  const { data: session } = useSession();
  const [assetType, setAssetType] = useState<"Stock" | "SIP">("Stock");
  const [horizon, setHorizon] = useState<"Short-term" | "Long-term">("Long-term");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [investmentType, setInvestmentType] = useState<"Monthly SIP" | "One-Time">("Monthly SIP");
  const [amount, setAmount] = useState("");
  const [showAiResults, setShowAiResults] = useState(false);
  const [tourStep, setTourStep] = useState<number>(0); 
  const [searchResults, setSearchResults] = useState<{symbol: string, name: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tickers, setTickers] = useState<string[]>([]);
  const [activeTicker, setActiveTicker] = useState<string>(""); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("nexus_first_login_tour");
    if (!hasSeenTutorial) setTimeout(() => setTourStep(1), 1500); 
  }, []);

  const handleNextTourStep = () => {
    if (tourStep === 3) { localStorage.setItem("nexus_first_login_tour", "completed"); setTourStep(0); } else setTourStep(prev => prev + 1);
  };
  const handleSkipTour = () => { localStorage.setItem("nexus_first_login_tour", "completed"); setTourStep(0); };

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`/api/watchlist?type=${assetType}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
          setActiveTicker(data.tickers[0]);
        } else {
          setTickers([]);
          setActiveTicker("");
        }
        setAiAnalysis("");
        setSearchQuery("");
        setSearchResults([]);
        setAmount("");
        setShowAiResults(false);
      } catch (error) {
        console.error("Failed to load watchlist", error);
      }
    };
    fetchWatchlist();
  }, [assetType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${assetType}`);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (error) { console.error("Search error", error); } finally { setIsSearching(false); }
      } else setSearchResults([]);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, assetType]);

  const handleSelectTicker = async (symbol: string) => {
    let formattedSymbol = symbol;
    if (symbol.endsWith('.NS')) formattedSymbol = `NSE:${symbol.replace('.NS', '')}`;
    else if (symbol.endsWith('.BO')) formattedSymbol = `BSE:${symbol.replace('.BO', '')}`;

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: formattedSymbol, type: assetType }),
      });
      const data = await res.json();
      if (data.tickers) {
        setTickers(data.tickers);
        setActiveTicker(formattedSymbol);
        setSearchQuery("");
        setSearchResults([]);
        setAiAnalysis(""); 
        setShowAiResults(false); 
      }
    } catch (error) { console.error("Failed to add ticker", error); }
  };

  const handleRemoveTicker = async (tickerToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: tickerToRemove, type: assetType }),
      });
      const data = await res.json();
      if (data.tickers) {
        setTickers(data.tickers);
        if (activeTicker === tickerToRemove) {
          setActiveTicker(data.tickers.length > 0 ? data.tickers[0] : "");
          setAiAnalysis(""); 
          setShowAiResults(false);
        }
      }
    } catch (error) { console.error("Failed to remove ticker", error); }
  };

  const handleGenerateAnalysis = async () => {
    if (!activeTicker) return;
    setShowAiResults(true);
    setIsAnalyzing(true);
    setAiAnalysis(""); 
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: activeTicker, horizon, amount, assetType, investmentType }), 
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || "Analysis failed to generate. Please try again.");
    } catch (error) { setAiAnalysis("An error occurred connecting to the AI engine."); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-x-hidden">
      
      <AnimatePresence>
        {tourStep > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pointer-events-auto flex items-end justify-center pb-24">
            <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="bg-[#0a0a0a] border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)] p-6 rounded-2xl max-w-md w-full relative z-50">
              <button onClick={handleSkipTour} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  {tourStep === 1 && <Search className="w-5 h-5" />}
                  {tourStep === 2 && <Briefcase className="w-5 h-5" />}
                  {tourStep === 3 && <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tourStep === 1 && "Smart Search"}{tourStep === 2 && "Tailor Your Strategy"}{tourStep === 3 && "Unleash the AI"}</h3>
                  <div className="flex space-x-1 mt-1">{[1, 2, 3].map(step => <div key={step} className={`h-1.5 w-6 rounded-full ${step === tourStep ? 'bg-blue-500' : 'bg-white/10'}`} />)}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {tourStep === 1 && "Welcome to Growth.AI! 🚀 Search for your favorite Stocks, ETFs, or Mutual Funds up here to pull real-time charts and data."}
                {tourStep === 2 && "Are you SIPing or trading? 💼 Set your investment frequency, amount, and time horizon so the AI knows exactly how to advise you."}
                {tourStep === 3 && "The magic button. 🧠 Click here to feed global news and market data directly into Gemini for an instant, brutally honest verdict."}
              </p>
              <div className="flex justify-between items-center">
                <button onClick={handleSkipTour} className="text-sm text-gray-500 hover:text-white transition-colors font-medium">Skip Tour</button>
                <button onClick={handleNextTourStep} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center transition-colors">{tourStep === 3 ? "Get Started" : "Next"} <ChevronRight className="w-4 h-4 ml-1" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">Growth<span className="text-blue-500">.AI</span></Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center"><Home className="w-4 h-4 mr-2" /> Home</Link>
              <Link href="/news" className="text-gray-400 hover:text-white transition-colors flex items-center"><Newspaper className="w-4 h-4 mr-2" /> Market News</Link>
              <span className="text-white flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Dashboard</span>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`relative hidden sm:block transition-all duration-500 ${tourStep === 1 ? 'z-50 ring-4 ring-blue-500 rounded-full bg-black/80 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'z-30'}`}>
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-blue-400 animate-pulse' : 'text-gray-400 group-focus-within:text-blue-400'}`} />
                <input type="text" placeholder={`Search ${assetType === "Stock" ? "Stocks & ETFs" : "Mutual Funds"}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-80" />
              </div>
              <AnimatePresence>
                {searchQuery.length > 1 && searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-full bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {searchResults.map((result) => (
                      <button key={result.symbol} onClick={() => handleSelectTicker(result.symbol)} className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex flex-col">
                        <span className="text-sm font-bold text-blue-400">{result.symbol}</span>
                        <span className="text-xs text-gray-400 truncate">{result.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="text-gray-400 hover:text-white transition-colors relative z-30"><Bell className="w-5 h-5" /><span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span></button>

            <div className="relative z-30">
              <div onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-blue-500/50 transition-all overflow-hidden">
                {session?.user?.image ? ( /* eslint-disable-next-line @next/next/no-img-element */ <img src={session.user.image} alt="User" className="w-full h-full object-cover" /> ) : ( <User className="w-4 h-4 text-white" /> )}
              </div>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/2">
                      <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{session?.user?.name || session?.user?.email || "Loading..."}</p>
                    </div>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><LogOut className="w-4 h-4 mr-2" /> Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col z-10">
        <div className="flex space-x-8 mb-8 border-b border-white/10">
          <button onClick={() => setAssetType("Stock")} className={`pb-4 text-lg font-medium border-b-2 transition-all ${assetType === "Stock" ? "border-blue-500 text-blue-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>Stocks & ETFs</button>
          <button onClick={() => setAssetType("SIP")} className={`pb-4 text-lg font-medium border-b-2 transition-all ${assetType === "SIP" ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>Mutual Funds</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-light mb-1">{activeTicker || (assetType === "Stock" ? "Explore Stocks" : "Explore Funds")}</h1>
                <div className="text-gray-400 flex flex-wrap items-center gap-2 mt-2">
                  {tickers.map((t) => (
                    <div key={t} className={`flex items-center px-1 rounded-md text-xs font-medium border transition-colors ${activeTicker === t ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>
                      <button onClick={() => { setActiveTicker(t); setAiAnalysis(""); setShowAiResults(false); }} className="px-2 py-1.5 focus:outline-none">{t}</button>
                      <button onClick={(e) => handleRemoveTicker(t, e)} className="p-1 ml-1 rounded-full text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {tickers.length === 0 && <span className="text-sm text-gray-500 italic">Watchlist is empty. Search above!</span>}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 h-[550px] flex flex-col relative overflow-hidden shadow-lg z-0">
              {activeTicker ? (
                <div className="w-full h-full rounded-xl overflow-hidden pointer-events-auto">
                  <AdvancedRealTimeChart symbol={activeTicker} theme="dark" autosize style={assetType === "SIP" ? "3" : "1"} interval={assetType === "SIP" ? "D" : "D"} hide_top_toolbar={false} hide_legend={false} save_image={false} backgroundColor="#0a0a0a" allow_symbol_change={false} />
                  {assetType === "SIP" && <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur text-xs text-gray-400 px-3 py-1 rounded-full border border-white/10">Note: Indian Mutual Fund NAV charts may have limited intra-day data on TradingView.</div>}
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/5">
                  <p className="text-gray-500 flex flex-col items-center text-sm"><Activity className="w-8 h-8 mb-3 opacity-30" />Search for a {assetType === "Stock" ? "stock or ETF" : "mutual fund"} to view live data</p>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative h-full">
            <AnimatePresence mode="wait">
              {!showAiResults ? (
                <motion.div key="strategy-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className={`bg-[#0a0a0a] border rounded-2xl p-6 shadow-lg ${tourStep === 2 ? 'z-50 relative ring-4 ring-blue-500 border-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'z-0 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-lg font-medium flex items-center"><Briefcase className={`w-5 h-5 mr-2 ${assetType === 'Stock' ? 'text-blue-400' : 'text-purple-400'}`} />Investment Strategy</h3>
                  </div>
                  <AnimatePresence>
                    {assetType === "SIP" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                        <h3 className="text-sm font-medium mb-3 text-gray-400">Investment Frequency</h3>
                        <div className="bg-black border border-white/10 p-1 rounded-lg flex relative">
                          <motion.div className="absolute inset-y-1 w-[calc(50%-4px)] bg-purple-500/20 border border-purple-500/50 rounded-md shadow-sm" animate={{ left: investmentType === "Monthly SIP" ? "4px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                          <button onClick={() => setInvestmentType("Monthly SIP")} className={`flex-1 py-2 text-xs font-medium z-10 transition-colors ${investmentType === "Monthly SIP" ? "text-purple-400" : "text-gray-500"}`}>Monthly SIP</button>
                          <button onClick={() => setInvestmentType("One-Time")} className={`flex-1 py-2 text-xs font-medium z-10 transition-colors ${investmentType === "One-Time" ? "text-purple-400" : "text-gray-500"}`}>One-Time (Lump Sum)</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <h3 className="text-sm font-medium mb-3 text-gray-400">{assetType === "Stock" ? "Planned Investment Amount" : investmentType === "Monthly SIP" ? "Monthly SIP Amount" : "Lump Sum Amount"}</h3>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input type="number" placeholder="e.g. 10000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg py-2.5 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium mb-3 text-gray-400">Investment Horizon</h3>
                  <div className="bg-black border border-white/10 p-1 rounded-lg flex relative">
                    <motion.div className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-md shadow-sm" animate={{ left: horizon === "Short-term" ? "4px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    <button onClick={() => setHorizon("Short-term")} className={`flex-1 py-2 text-xs font-medium z-10 transition-colors ${horizon === "Short-term" ? "text-white" : "text-gray-500"}`}>Short-term (&lt; 1 yr)</button>
                    <button onClick={() => setHorizon("Long-term")} className={`flex-1 py-2 text-xs font-medium z-10 transition-colors ${horizon === "Long-term" ? "text-white" : "text-gray-500"}`}>Long-term (3+ yrs)</button>
                  </div>
                  <button onClick={handleGenerateAnalysis} disabled={!activeTicker} className={`w-full mt-8 text-black py-3 rounded-lg text-sm font-bold transition-all duration-500 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed ${tourStep === 3 ? 'z-50 relative ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] bg-white' : ''} ${assetType === 'Stock' && tourStep !== 3 ? 'bg-white hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]' : ''} ${assetType === 'SIP' && tourStep !== 3 ? 'bg-purple-400 hover:bg-purple-300 shadow-[0_0_20px_rgba(192,132,252,0.1)] hover:shadow-[0_0_25px_rgba(192,132,252,0.2)]' : ''}`}>
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform text-black/70" />Analyze {assetType === "Stock" ? "Stock" : "Fund"} with AI
                  </button>
                </motion.div>
              ) : (
                <motion.div key="ai-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="relative group h-full flex flex-col">
                  <div className={`absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${assetType === 'Stock' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}></div>
                  <div className="relative bg-black border border-white/10 rounded-2xl p-6 flex-1 flex flex-col min-h-[500px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                      <h3 className={`text-lg font-medium flex items-center text-transparent bg-clip-text ${assetType === 'Stock' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}><Sparkles className={`w-5 h-5 mr-2 ${assetType === 'Stock' ? 'text-blue-400' : 'text-purple-400'}`} />Growth.AI Advisor</h3>
                      <span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/10">{horizon}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 pb-4 text-sm text-gray-300 leading-relaxed space-y-4 custom-scrollbar">
                      {isAnalyzing ? (
                        <div className={`flex flex-col items-center justify-center h-full ${assetType === 'Stock' ? 'text-blue-400/80' : 'text-purple-400/80'}`}><Activity className="w-8 h-8 animate-spin mb-4" /><p className="animate-pulse">Crunching market data & news...</p></div>
                      ) : aiAnalysis ? (
                        <div className="space-y-4 whitespace-pre-wrap">{aiAnalysis}</div>
                      ) : null}
                    </div>
                    <div className="pt-4 border-t border-white/10 mt-auto">
                      <button onClick={() => setShowAiResults(false)} className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors group"><ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />Edit Strategy</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}