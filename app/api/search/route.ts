import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Define exactly what a Yahoo quote looks like to satisfy TypeScript
interface YahooQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  [key: string]: unknown;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type"); // "Stock" or "SIP"

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    // 1. Fetch raw search results from Yahoo Finance (casting to our custom interface)
    const result = (await yahooFinance.search(q, { newsCount: 0 })) as unknown as { quotes: YahooQuote[] };
    let quotes = result.quotes || [];

    // 2. Filter based on the Global Tab selected by the user
    if (type === "SIP") {
      // Only return Mutual Funds
      quotes = quotes.filter((quote: YahooQuote) => quote.quoteType === "MUTUALFUND");
    } else {
      // Only return Stocks, ETFs, and Indices
      quotes = quotes.filter((quote: YahooQuote) => 
        quote.quoteType === "EQUITY" || 
        quote.quoteType === "ETF" || 
        quote.quoteType === "INDEX"
      );
    }

    // 3. Map to a clean array for our frontend dropdown
    const mappedResults = quotes.slice(0, 6).map((quote: YahooQuote) => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname || quote.symbol,
    }));

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}