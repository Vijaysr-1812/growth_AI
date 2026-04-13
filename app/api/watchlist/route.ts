import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";

// GET: Fetch the user's saved tickers
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { watchlists: true },
    });

    if (!user || user.watchlists.length === 0) {
      return NextResponse.json({ tickers: [] });
    }

    // We'll use the user's first watchlist for now
    return NextResponse.json({ tickers: user.watchlists[0].tickers });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new ticker to the watchlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    const upperTicker = ticker.toUpperCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { watchlists: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let watchlist = user.watchlists[0];

    // If the user doesn't have a watchlist yet, create one
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          name: "My Portfolio",
          tickers: [upperTicker],
          userId: user.id,
        },
      });
    } else {
      // If it exists, check if the ticker is already in there to prevent duplicates
      if (!watchlist.tickers.includes(upperTicker)) {
        watchlist = await prisma.watchlist.update({
          where: { id: watchlist.id },
          data: {
            tickers: {
              push: upperTicker,
            },
          },
        });
      }
    }

    return NextResponse.json({ tickers: watchlist.tickers });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}