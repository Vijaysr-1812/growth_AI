"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isSuccess ? 'bg-green-600/20' : 'bg-blue-600/20'} blur-[100px] rounded-full pointer-events-none` } />
      
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-md w-full relative z-10 shadow-2xl">
        {isSuccess ? (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif mb-3">Email Verified!</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Your account is now fully active. You can now log in to access your dashboard.
            </p>
          </>
        ) : (
          <>
            <Mail className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
            <h1 className="text-3xl font-serif mb-3">Check Your Email</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We have sent a verification link to your inbox. Please click the link to activate your account.
            </p>
          </>
        )}

        <Link 
          href="/login" 
          className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors group"
        >
          {isSuccess ? "Continue to Login" : "Back to Login"}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}