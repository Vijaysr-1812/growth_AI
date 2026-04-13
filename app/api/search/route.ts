import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2"; 

const yahooFinance = new YahooFinance(); 

interface YahooQuote {
  isYahooFinance?: boolean;
  quoteType?: string;
  symbol: string;
  shortname?: string;
  longname?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Increased quotesCount slightly to cast a wider net for good matches
    const result = (await yahooFinance.search(query, { 
      quotesCount: 8, 
      newsCount: 0 
    })) as { quotes: YahooQuote[] };
    
    // Filter out obscure data, keep only actual stocks and ETFs
    const equities = result.quotes.filter(
      (quote) => quote.isYahooFinance === true && (quote.quoteType === "EQUITY" || quote.quoteType === "ETF")
    );

    // Format the results for our dropdown
    const formattedResults = equities.map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname || "Unknown",
    }));

    // THE FIX: Filter the array to ensure every symbol is 100% unique
    const uniqueResults = formattedResults.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.symbol === value.symbol
      ))
    );

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}