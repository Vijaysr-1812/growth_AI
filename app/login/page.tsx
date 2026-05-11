"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Activity, User as UserIcon, CheckCircle } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const searchParams = useSearchParams();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FIXED: Wrapped in a micro-timeout to prevent synchronous cascading renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchParams.get("verified") === "true") {
        setSuccess("Email verified successfully! You can now log in.");
        setIsSignUp(false);
      } else if (searchParams.get("error") === "verification_failed") {
        setError("Verification link invalid or expired. However, if you already clicked it, you might be able to log in.");
        setIsSignUp(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const validatePassword = (pass: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (isSignUp) {
      if (!validatePassword(password)) {
        setError("Password must be at least 8 characters, include an uppercase letter, a number, and a special character.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to register account.");
          setIsLoading(false);
          return;
        } else {
          setSuccess("Verification pending. Please check your email to verify your account.");
          setIsLoading(false);
          setPassword(""); 
          return; 
        }
      } catch {
        // FIXED: Removed the unused 'err' variable declaration here
        setError("An error occurred during registration.");
        setIsLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      redirect: false, 
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password. Or account not verified.");
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard"; 
    }
  };

  return (
    <div className="relative z-10 max-w-md w-full mx-auto p-8">
      <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif mb-2">Welcome to <span className="text-blue-500 font-sans font-bold tracking-tighter">Nexus.AI</span></h1>
          <p className="text-gray-400 text-sm">{isSignUp ? "Create an account to start your analysis." : "Log in to view your watchlists."}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-lg text-center flex flex-col items-center">
            <CheckCircle className="w-5 h-5 mb-1" />
            {success}
          </div>
        )}

        <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full bg-[#111] border border-white/10 hover:bg-white/5 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-xs text-gray-500 uppercase tracking-wider">Or continue with email</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4 mb-6">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400 ml-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
            </div>
            {isSignUp && (
              <p className="text-[10px] text-gray-500 ml-1 mt-1">Must be 8+ chars, with an uppercase, number, & special char.</p>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-white text-black font-bold py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center disabled:opacity-70">
            {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center relative overflow-hidden">
      {/* FIXED: Changed w-[600px] h-[600px] to the canonical w-150 h-150 classes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="relative z-10 mx-auto p-8 flex justify-center"><Activity className="w-8 h-8 animate-spin text-blue-500" /></div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}