"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Activity, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState(""); // NEW: State for Name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // NEW: Strict Password Validation logic
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
          body: JSON.stringify({ name, email, password }), // Sending Name to DB
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to register account.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
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
      setError(isSignUp ? "Account created, but failed to log in." : "Invalid email or password.");
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard"; 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto p-8">
        <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif mb-2">
              Welcome to <span className="text-blue-500 font-sans font-bold tracking-tighter">Nexus.AI</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? "Create an account to start your analysis." : "Log in to view your watchlists."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-4 mb-6">
            
            {/* NEW: Name Field (Only shows during Sign Up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {isSignUp && (
                <p className="text-[10px] text-gray-500 ml-1 mt-1">
                  Must be 8+ chars, with an uppercase, number, & special char.
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-2.5 rounded-lg text-sm hover:bg-gray-200 transition-colors mt-2 flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? <Activity className="w-4 h-4 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}