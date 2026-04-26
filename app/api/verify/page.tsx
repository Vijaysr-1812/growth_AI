import React from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { prisma } from "../../../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// CRITICAL: This forces Next.js to run this logic fresh every time, preventing the Vercel caching bug!
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  // 1. If no token is in the URL
  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="bg-black/50 border border-white/10 p-8 rounded-2xl text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-gray-400 mb-6">This verification link is missing or broken.</p>
          <Link href="/login" className="bg-white text-black px-6 py-2 rounded-lg font-bold">Go to Login</Link>
        </div>
      </div>
    );
  }

  // 2. Find the user in Supabase
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  // 3. If token is invalid or already used
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="bg-black/50 border border-white/10 p-8 rounded-2xl text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-gray-400 mb-6">This verification link has expired or has already been used.</p>
          <Link href="/login" className="bg-white text-black px-6 py-2 rounded-lg font-bold">Go to Login</Link>
        </div>
      </div>
    );
  }

  // 4. Update the Database! (Sets emailVerified timestamp and clears token)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null, 
    },
  });

  // 5. Send the "Thank You" Email
  try {
    const userName = user.name || user.email?.split("@")[0] || "Investor";
    await resend.emails.send({
      from: "Nexus.AI <onboarding@resend.dev>", 
      to: user.email!,
      subject: "Account Verified! Welcome to Nexus.AI 🚀",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Thank you for verifying, ${userName}!</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            Your email has been successfully verified and your account is now fully active.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">
            You can now log in to your dashboard and start analyzing the markets.
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
  }

  // 6. Show the Success UI
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-md w-full relative z-10 shadow-2xl">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-serif mb-3">Email Verified!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Thank you for verification! Your account has been successfully created. We have sent a confirmation email to your inbox.
        </p>
        <Link 
          href="/login" 
          className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors group"
        >
          Continue to Login 
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}