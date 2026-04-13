"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, LogOut, ArrowLeft, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 p-1">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                {/* FIX: Added optional chaining to session checks */}
                {session?.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={session?.user?.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold">{session?.user?.name?.charAt(0) || "U"}</span>
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              {/* FIX: Added optional chaining here too */}
              <h1 className="text-3xl font-bold mb-2">{session?.user?.name || "Anonymous User"}</h1>
              <div className="flex items-center justify-center md:justify-start text-gray-400 mb-6 space-x-2">
                <Mail className="w-4 h-4" />
                <span>{session?.user?.email}</span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium flex items-center">
                  <Shield className="w-3 h-3 mr-2 text-green-400" /> Account Active
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full md:w-auto px-6 py-3 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out from Nexus.AI
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}