import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust path if needed

export async function GET(req: Request) {
  try {
    // Extract the token from the URL parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // If there is no token, redirect to login with an error
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", req.url));
    }

    // Find the user who owns this specific token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=TokenExpired", req.url));
    }

    // Mark the user as verified and delete the token so it can't be used again
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, 
      },
    });

    // Successfully verified! Send them to the login page
    return NextResponse.redirect(new URL("/login?verified=true", req.url));
    
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.redirect(new URL("/login?error=ServerError", req.url));
  }
}