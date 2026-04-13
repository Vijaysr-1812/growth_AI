import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YahooFinance from "yahoo-finance2"; // 1. Capitalize the import

// 2. Initialize the v3 instance
const yahooFinance = new YahooFinance(); 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticker, horizon } = await req.json();
    if (!ticker || !horizon) {
      return NextResponse.json({ error: "Ticker and horizon are required" }, { status: 400 });
    }

    // Fetch live global news for the ticker using Yahoo Finance
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

    // Initialize Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Craft the Context-Aware Prompt
    const prompt = `
      You are an elite financial analyst for a platform called Nexus.AI. 
      Provide a concise, highly intelligent market analysis for the stock ticker: ${ticker}.
      The user's investment strategy is: ${horizon}.
      
      CRITICAL REAL-TIME CONTEXT:
      Here are the latest global news headlines regarding this asset:
      ${newsContext}
      
      Format your response strictly using these three headings (do not use markdown headers like #, just use bolding):
      **Market Sentiment:** (Current outlook, heavily factoring in the provided news)
      **Macro & News Impact:** (How the recent headlines and broader economic factors are affecting this stock)
      **Strategic Recommendation:** (Actionable advice based on the ${horizon} horizon and the latest news)
      
      Keep the tone professional, objective, and data-driven.
    `;

    // Generate AI Response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ analysis: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI analysis" }, { status: 500 });
  }
} 