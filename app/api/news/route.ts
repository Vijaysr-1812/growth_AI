import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

// We give TypeScript the exact shape of a news article so we don't have to use 'any'
// We give TypeScript the exact shape of a news article
interface YahooNewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date | string; // <-- Changed to accept Date objects
  [key: string]: unknown; 
}       

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let targetTickers: string[] = body.tickers;
    let isPersonalized = false;

    if (targetTickers && targetTickers.length > 0) {
      isPersonalized = true;
    } else {
      // Default to general market ETFs if no tickers provided
      targetTickers = ["SPY", "QQQ"];
    }

    // 2. Fetch news for ALL of their interested tickers in parallel
    const newsPromises = targetTickers.map(async (ticker) => {
      try {
        const result = (await yahooFinance.search(ticker, { 
          newsCount: 5, 
          quotesCount: 0 
        })) as { news: YahooNewsItem[] };

        // Attach the ticker to each news article
        return (result.news || []).map((article) => ({
          ...article,
          relatedTicker: ticker,
        }));
      } catch (error) {
        // We log the error to keep ESLint happy, but return an empty array to not break the app
        console.error(`Failed to fetch news for ${ticker}:`, error);
        return [];
      }
    });

    const nestedNews = await Promise.all(newsPromises);
    
    // 3. Flatten the array and sort by most recent publish time
    const combinedNews = nestedNews.flat().sort((a, b) => {
      const dateA = new Date(a.providerPublishTime).getTime();
      const dateB = new Date(b.providerPublishTime).getTime();
      return dateB - dateA; // Newest first
    });

    // 4. Remove exact duplicates
    const uniqueNews = combinedNews.filter((article, index, self) =>
      index === self.findIndex((t) => (
        t.uuid === article.uuid || t.title === article.title
      ))
    );

    return NextResponse.json({ 
      articles: uniqueNews.slice(0, 20),
      isPersonalized 
    });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: "Failed to fetch personalized news" }, { status: 500 });
  }
}