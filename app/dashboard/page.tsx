"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Search, Bell, User, Sparkles, Clock, 
  Activity, LogOut, Home, Newspaper
} from "lucide-react";
import dynamic from "next/dynamic";

const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  { ssr: false }
);

// 1. Create a clean type for the callback data
interface JoyrideData {
  status: "finished" | "skipped" | string;
  [key: string]: unknown;
}

// 2. Create our own strict type for the component props
interface CustomJoyrideProps {
  steps: Array<{ target: string; content: string; disableBeacon?: boolean }>;
  run: boolean;
  continuous: boolean;
  showSkipButton: boolean;
  showProgress: boolean;
  styles: unknown;
  callback: (data: JoyrideData) => void;
}

export default function Dashboard() {
  const { data: session } = useSession();
  
  // UI State
  const [horizon, setHorizon] = useState<"Short-term" | "Long-term">("Long-term");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Guided Tour States
  const [runTour, setRunTour] = useState(false);
  // THE FIX: We hold the dynamically imported component safely in state
  const [JoyrideComponent, setJoyrideComponent] = useState<React.ComponentType<CustomJoyrideProps> | null>(null);

  // LIVE SEARCH STATE
  const [searchResults, setSearchResults] = useState<{symbol: string, name: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Database State (Watchlist)
  const [tickers, setTickers] = useState<string[]>([]);
  const [activeTicker, setActiveTicker] = useState<string>(""); 

  // AI State (Gemini)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  // 1. Fetch saved tickers
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
          setActiveTicker(data.tickers[0]);
        }
      } catch (error) {
        console.error("Failed to load watchlist", error);
      }
    };
    fetchWatchlist();
  }, []);

  // 2. Trigger Guided Tour if first time AND Manually load the component
  useEffect(() => {
    // Manually import the library bypassing Next.js dynamic routing bugs
    import("react-joyride").then((mod) => {
      // Safely extract the component regardless of how Turbopack bundled it
      const m = mod as Record<string, unknown>;
      const Component = (m.default || m.Joyride || m) as React.ComponentType<CustomJoyrideProps>;
      
      // Save it to state (wrapped in a callback so React doesn't auto-execute the function)
      setJoyrideComponent(() => Component);
    }).catch(err => console.error("Failed to load Joyride:", err));

    const hasSeenTutorial = localStorage.getItem("nexus_tutorial_completed");
    if (!hasSeenTutorial) {
      setTimeout(() => setRunTour(true), 1000); 
    }
  }, []);

  // 3. LIVE SEARCH EFFECT (Triggers as you type)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 4. Save selected ticker to DB
 // 3. Save selected ticker to DB
  const handleSelectTicker = async (symbol: string) => {
    // Smart converter: Yahoo Finance format -> TradingView format
    let formattedSymbol = symbol;
    if (symbol.endsWith('.NS')) {
      formattedSymbol = `NSE:${symbol.replace('.NS', '')}`;
    } else if (symbol.endsWith('.BO')) {
      formattedSymbol = `BSE:${symbol.replace('.BO', '')}`;
    }

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: formattedSymbol }),
      });
      const data = await res.json();
      
      if (data.tickers) {
        setTickers(data.tickers);
        setActiveTicker(formattedSymbol);
        
        setSearchQuery("");
        setSearchResults([]);
        setAiAnalysis(""); 
      }
    } catch (error) {
      console.error("Failed to add ticker", error);
    }
  };
  // 5. Trigger AI
  const handleGenerateAnalysis = async () => {
    if (!activeTicker) return;
    
    setIsAnalyzing(true);
    setAiAnalysis(""); 

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: activeTicker, horizon }),
      });
      
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis("Analysis failed to generate. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setAiAnalysis("An error occurred connecting to the AI engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative">
      
      {/* Conditionally render the Tour ONLY when the component is fully loaded */}
      {JoyrideComponent && (
        <JoyrideComponent
          steps={[
            {
              target: '.tour-search',
              content: 'Welcome to Nexus.AI! Start by searching for your favorite companies or tickers here.',
              disableBeacon: true,
            },
            {
              target: '.tour-horizon',
              content: 'Are you day-trading or long-term investing? Set your time horizon to change how the AI analyzes data.',
            },
            {
              target: '.tour-analyze-btn',
              content: 'Click this button to feed global news and market data directly into Gemini for instant insights.',
            }
          ]}
          run={runTour}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          styles={{
            options: {
              primaryColor: '#3b82f6',
              backgroundColor: '#0a0a0a',
              textColor: '#ffffff',
              arrowColor: '#0a0a0a',
            }
          }}
          callback={(data: JoyrideData) => {
            const { status } = data;
            if (status === "finished" || status === "skipped") {
              localStorage.setItem("nexus_tutorial_completed", "true");
              setRunTour(false);
            }
          }}
        />
      )}

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
              <Link href="/news" className="text-gray-400 hover:text-white transition-colors flex items-center">
                <Newspaper className="w-4 h-4 mr-2" /> Market News
              </Link>
              <span className="text-white flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" /> Dashboard
              </span>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            
            <div className="relative group hidden sm:block z-50 tour-search">
              <div className="relative">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-blue-400 animate-pulse' : 'text-gray-400 group-focus-within:text-blue-400'}`} />
                <input 
                  type="text" 
                  placeholder="Search company or ticker..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all w-72"
                />
              </div>

              <AnimatePresence>
                {searchQuery.length > 1 && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {searchResults.map((result) => (
                      <button 
                        key={result.symbol}
                        onClick={() => handleSelectTicker(result.symbol)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex flex-col"
                      >
                        <span className="text-sm font-bold text-blue-400">{result.symbol}</span>
                        <span className="text-xs text-gray-400 truncate">{result.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

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
                        {session?.user?.name || session?.user?.email || "Loading..."}
                      </p>
                    </div>
                    <Link 
                      href="/profile"
                      className="w-full flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" /> My Profile
                    </Link>
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

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between"
          >
            <div>
              <h1 className="text-3xl font-light mb-1">{activeTicker || "Welcome"}</h1>
              <div className="text-gray-400 flex flex-wrap items-center gap-2 mt-2">
                {tickers.map((t) => (
                  <button 
                    key={t}
                    onClick={() => {
                      setActiveTicker(t);
                      setAiAnalysis(""); 
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                      activeTicker === t 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                {tickers.length === 0 && (
                  <span className="text-sm text-gray-500 italic">No tickers saved yet. Use the search bar!</span>
                )}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-medium">Live Market Data</div>
              <div className="text-green-400 flex items-center justify-end text-sm mt-1 font-medium">
                 Provided by TradingView
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 h-150 flex flex-col relative overflow-hidden shadow-lg z-0"
          >
            {activeTicker ? (
              <div className="w-full h-full rounded-xl overflow-hidden pointer-events-auto">
                <AdvancedRealTimeChart 
                  symbol={activeTicker} // <--- CHANGE THIS LINE
                  theme="dark"
                  autosize
                  hide_top_toolbar={false}
                  hide_legend={false}
                  save_image={false}
                  backgroundColor="#0a0a0a"
                  allow_symbol_change={false}
                />
              </div>
            ) : (
              <div className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/1">
                <p className="text-gray-500 flex flex-col items-center">
                  <Activity className="w-10 h-10 mb-3 opacity-30" />
                  Select a ticker to view live market data
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 relative z-0"
        >
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Investment Horizon
            </h3>
            
            <div className="bg-black border border-white/10 p-1 rounded-lg flex relative tour-horizon">
              <motion.div 
                className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-md shadow-sm"
                animate={{ left: horizon === "Short-term" ? "4px" : "calc(50%)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button 
                onClick={() => setHorizon("Short-term")}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${horizon === "Short-term" ? "text-white" : "text-gray-500"}`}
              >
                Short-term
              </button>
              <button 
                onClick={() => setHorizon("Long-term")}
                className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${horizon === "Long-term" ? "text-white" : "text-gray-500"}`}
              >
                Long-term
              </button>
            </div>
            
            <button 
              onClick={handleGenerateAnalysis}
              disabled={isAnalyzing || !activeTicker}
              className="w-full mt-6 bg-white text-black py-3 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed tour-analyze-btn"
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 animate-spin text-blue-600" /> Analyzing...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform text-blue-600" />
                  Analyze {activeTicker || "Ticker"} with AI
                </>
              )}
            </button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-black border border-white/10 rounded-2xl p-6 h-100 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <h3 className="text-lg font-medium flex items-center text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                  Gemini Insights
                </h3>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/10">
                  {horizon}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 text-sm text-gray-300 leading-relaxed space-y-4 custom-scrollbar">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full text-blue-400/80">
                    <Activity className="w-8 h-8 animate-spin mb-4" />
                    <p className="animate-pulse">Gemini is analyzing market data...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4 whitespace-pre-wrap">{aiAnalysis}</div>
                ) : (
                  <p className="text-blue-400/80 italic mt-4 animate-pulse">
                    Waiting for user to trigger full analysis for {activeTicker || "a ticker"}...
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}