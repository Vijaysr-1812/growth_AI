import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "Stock";

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId: user.id, name: type }
    });

    return NextResponse.json({ tickers: watchlist?.tickers || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticker, type = "Stock" } = await req.json();

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let watchlist = await prisma.watchlist.findFirst({
      where: { userId: user.id, name: type }
    });

    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: { name: type, tickers: [ticker], userId: user.id }
      });
    } else {
      if (!watchlist.tickers.includes(ticker)) {
        watchlist = await prisma.watchlist.update({
          where: { id: watchlist.id },
          data: { tickers: { push: ticker } }
        });
      }
    }

    return NextResponse.json({ tickers: watchlist.tickers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticker, type = "Stock" } = await req.json();

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId: user.id, name: type }
    });

    if (!watchlist) return NextResponse.json({ error: "Watchlist not found" }, { status: 404 });

    // Filter out the ticker they want to remove
    const updatedTickers = watchlist.tickers.filter(t => t !== ticker);

    const updatedWatchlist = await prisma.watchlist.update({
      where: { id: watchlist.id },
      data: { tickers: updatedTickers }
    });

    return NextResponse.json({ tickers: updatedWatchlist.tickers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}