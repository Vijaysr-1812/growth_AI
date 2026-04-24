import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newsHeadlines } = await req.json();
    
    if (!newsHeadlines) {
      return NextResponse.json({ summary: "No data available to summarize." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an elite financial analyst for Growth.AI.
      Here are the latest news headlines regarding the user's specific stock portfolio:
      ${newsHeadlines}
      
      Provide a highly intelligent, brutally honest, and concise summary of what is happening with their portfolio right now based ONLY on these headlines. 
      
      Format strictly using these three bolded headings (do not use markdown headers like #, just standard bolding):
      **Portfolio Sentiment:** (Overall mood of their watchlist based on the news)
      **Key Movers:** (Which companies have the most critical news right now and why)
      **The Bottom Line:** (One clear, actionable takeaway)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("News Summary API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI summary" }, { status: 500 });
  }
}