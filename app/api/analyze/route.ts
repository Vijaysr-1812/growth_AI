import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YahooFinance from "yahoo-finance2";

// Initialize the Yahoo Finance instance
const yahooFinance = new YahooFinance(); 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Extract ALL fields sent from the updated dashboard
    const { ticker, horizon, amount, assetType, investmentType } = await req.json();
    
    if (!ticker || !horizon) {
      return NextResponse.json({ error: "Ticker and horizon are required" }, { status: 400 });
    }

    // 2. Fetch live global news for the ticker using Yahoo Finance
    let newsContext = "No recent news found.";
    try {
      const searchResults = (await yahooFinance.search(ticker, {
        newsCount: 5,
      })) as { news?: Array<{ title: string }> };

      if (searchResults.news && searchResults.news.length > 0) {
        newsContext = searchResults.news.map((article) => `- ${article.title}`).join("\n");
      }
    } catch (newsError) {
      console.error("Failed to fetch news:", newsError);
    }

    // 3. Initialize Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Craft the Context-Aware, Brutally Honest Prompt
    let prompt = "";

    if (assetType === "SIP") {
      const isMonthly = investmentType === "Monthly SIP";
      const investAction = isMonthly ? `start a monthly SIP of ₹${amount}` : `make a one-time lump sum investment of ₹${amount}`;
      
      prompt = `
        You are a brutally honest, elite financial advisor for Nexus.AI. 
        The user wants to invest in the Mutual Fund/Asset: ${ticker}.
        They plan to ${amount ? investAction : "invest an unspecified amount"}.
        Their investment horizon is: ${horizon}.
        
        CRITICAL REAL-TIME CONTEXT (News/Macro):
        ${newsContext}
        
        Write in simple, plain English that a beginner can understand. No jargon. Be BRUTALLY HONEST. If this fund is a bad idea, overlapping with too many things, or the amount doesn't make sense for the strategy, say it.
        
        Format your response strictly using these three bolded headings (do not use markdown headers like #, just use bolding):
        **The Brutal Reality Check:** (Is this a good fund? Are the expense ratios or risks too high based on current news?)
        **The ₹${amount || "Investment"} ${isMonthly ? 'Monthly' : 'Lump Sum'} Power:** (Explain exactly what happens if they invest ₹${amount || "this amount"} ${isMonthly ? 'every single month ' : 'just once '}over the ${horizon}. Is it enough to build wealth?)
        **Final Verdict:** (A strict "DO IT", "AVOID IT", or "CHANGE YOUR STRATEGY" recommendation).
      `;
    } else {
      prompt = `
        You are a brutally honest, elite financial advisor for Nexus.AI. 
        Provide a simple, cutthroat market analysis for the stock: ${ticker}.
        The user plans to invest an amount of: ₹${amount || "an unspecified amount"}.
        Their strategy is: ${horizon}.
        
        CRITICAL REAL-TIME CONTEXT:
        ${newsContext}
        
        Write in simple, plain English. No Wall Street jargon. Be BRUTALLY HONEST. If the stock is overvalued, a value trap, or facing terrible news, tear it apart. If it's a golden opportunity, say why.
        
        Format your response strictly using these three bolded headings (do not use markdown headers like #, just use bolding):
        **The No-Nonsense Sentiment:** (What is actually happening with this stock right now based on the news? Cut the fluff.)
        **The ₹${amount || "Investment"} Reality:** (If I put ₹${amount || "this amount"} into this stock for the ${horizon}, what is my actual risk/reward? Is this a smart play for that amount?)
        **Strategic Verdict:** (Actionable, brutal advice: Buy, Sell, Hold, or Run Away).
      `;
    }

    // 5. Generate AI Response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 });
  }
}