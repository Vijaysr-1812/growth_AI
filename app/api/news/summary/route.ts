import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "../../auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newsHeadlines } = await req.json();
    
    if (!newsHeadlines) {
      return NextResponse.json({ summary: "No data available to summarize." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are an expert Chief Investment Officer and Lead Market Strategist at a premier financial institution. 
      Your task is to provide a highly professional, objective, and institutional-grade analysis of the following recent news headlines related to the user's investment portfolio:
      
      ${newsHeadlines}
      
      Please analyze these developments in the context of broader global macroeconomic trends. Provide a clear, nuanced verdict on whether holding these assets currently represents a sound investment choice, outlining the primary tailwinds and headwinds.

      Format your response using ONLY the following three bolded headings (do not use markdown headers like # or ##, just standard bolding):

      **Market Context & Sentiment:** (Provide an executive summary of the current market mood surrounding these assets, contextualized with global economic trends.)
      **Key Catalysts & Risks:** (Identify the most significant upcoming drivers for these assets—both positive and negative.)
      **Strategic Verdict:** (Deliver a definitive, professional assessment of whether these assets represent a strong, moderate, or weak investment choice under current conditions, and what the prudent action would be.)
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