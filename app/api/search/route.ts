import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

interface YahooQuote {
  symbol?: string; 
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

    // Fetch raw search results from Yahoo Finance (Global default)
    const result = (await yahooFinance.search(q, { newsCount: 0 })) as unknown as { quotes: YahooQuote[] };
    let quotes = result.quotes || [];

    // Filter based on the Global Tab selected by the user
    if (type === "SIP") {
      quotes = quotes.filter((quote: YahooQuote) => quote.quoteType === "MUTUALFUND");
    } else {
      quotes = quotes.filter((quote: YahooQuote) => 
        quote.quoteType === "EQUITY" || 
        quote.quoteType === "ETF" ||
        quote.quoteType === "INDEX"
      );
    }

    // Map to a clean array for our frontend dropdown
    const mappedResults = quotes
      .filter((quote) => quote.symbol) 
      .slice(0, 6)
      .map((quote: YahooQuote) => ({
        symbol: quote.symbol as string,
        name: quote.shortname || quote.longname || quote.symbol,
      }));

    return NextResponse.json({ results: mappedResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}