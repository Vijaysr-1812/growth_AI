import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", req.url));
    }

    // 1. Find the user by their unique email token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=InvalidOrExpiredToken", req.url));
    }

    // 2. Update their timestamp and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, 
      },
    });

    // 3. Send the Confirmation "Thank You" Email
    try {
      const userName = user.name || user.email?.split("@")[0] || "Investor";
      // Fallback to localhost if NEXTAUTH_URL isn't perfectly set
      const baseUrl = process.env.NEXTAUTH_URL || 'https://growth-ai.vercel.app';
      
      await resend.emails.send({
        from: "Nexus.AI <onboarding@resend.dev>", 
        to: user.email!,
        subject: "Account Verified! Welcome to Nexus.AI 🚀",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">You are verified, ${userName}!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Thank you for verifying your email. Your Nexus.AI account is now fully active.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              You can now log in to your dashboard and start analyzing the markets.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/login" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Go to Login
              </a>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // 4. Redirect them back to the login page with a success flag
    return NextResponse.redirect(new URL("/login?verified=true", req.url));

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", req.url));
  }
}