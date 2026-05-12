"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Mail, LogOut, ArrowLeft, Shield, User, Building2, 
  Briefcase, Target, Share2, Activity, Save, CheckCircle, AlertCircle 
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    purpose: "",
    investmentExperience: "",
    referralSource: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.user.name || "",
          company: data.user.company || "",
          role: data.user.role || "",
          purpose: data.user.purpose || "",
          investmentExperience: data.user.investmentExperience || "",
          referralSource: data.user.referralSource || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ text: "Profile updated successfully.", type: "success" });
        // Optionally update the session if the name changed
        await update({ name: formData.name });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to update profile.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An unexpected error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <Activity className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto p-8 relative z-10 pt-20">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b border-white/5 pb-12">
            <div className="w-32 h-32 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 p-1 shrink-0 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={session?.user?.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-light text-white">{session?.user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1 mt-2">
              <h1 className="text-4xl font-serif mb-2">{session?.user?.name || "Anonymous User"}</h1>
              <div className="flex items-center justify-center md:justify-start text-gray-400 mb-6 space-x-2">
                <Mail className="w-4 h-4" />
                <span>{session?.user?.email}</span>
                <span className="mx-2 text-gray-700">•</span>
                <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium flex items-center text-green-400">
                  <Shield className="w-3 h-3 mr-1.5" /> Verified
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-lg">
                Manage your personal information, professional details, and tailor your Growth.AI experience.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Basic Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-white/5 pb-2 mb-4">Personal Details</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleInputChange} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 opacity-60 cursor-not-allowed" title="Email cannot be changed directly for security reasons">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1 flex justify-between">
                    Email Address <span className="text-[10px] bg-white/10 px-1.5 rounded-sm">Read Only</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="email" value={session?.user?.email || ""} readOnly disabled
                      className="w-full bg-transparent border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-400 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b border-white/5 pb-2 mb-4">Professional Profile</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Company / Organization</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" name="company" value={formData.company} onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all" 
                      placeholder="Acme Corp" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Job Title / Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" name="role" value={formData.role} onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all" 
                      placeholder="Financial Analyst" 
                    />
                  </div>
                </div>
              </div>

              {/* Platform Experience */}
              <div className="space-y-6 md:col-span-2 mt-4">
                <h3 className="text-lg font-medium border-b border-white/5 pb-2 mb-4">Platform Experience</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Primary Purpose</label>
                    <div className="relative">
                      <Target className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <select 
                        name="purpose" value={formData.purpose} onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all appearance-none"
                      >
                        <option value="" className="bg-[#111]">Select a purpose...</option>
                        <option value="Personal Investing" className="bg-[#111]">Personal Investing</option>
                        <option value="Corporate Analysis" className="bg-[#111]">Corporate Analysis</option>
                        <option value="Academic Research" className="bg-[#111]">Academic Research</option>
                        <option value="Just Exploring" className="bg-[#111]">Just Exploring</option>
                        <option value="Other" className="bg-[#111]">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Investment Experience</label>
                    <div className="relative">
                      <Activity className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <select 
                        name="investmentExperience" value={formData.investmentExperience} onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all appearance-none"
                      >
                        <option value="" className="bg-[#111]">Select level...</option>
                        <option value="Beginner" className="bg-[#111]">Beginner (0-2 years)</option>
                        <option value="Intermediate" className="bg-[#111]">Intermediate (3-5 years)</option>
                        <option value="Advanced" className="bg-[#111]">Advanced (5+ years)</option>
                        <option value="Professional" className="bg-[#111]">Professional / Institutional</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium ml-1">Referral Source</label>
                    <div className="relative">
                      <Share2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <select 
                        name="referralSource" value={formData.referralSource} onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all appearance-none"
                      >
                        <option value="" className="bg-[#111]">How did you hear about us?</option>
                        <option value="Search Engine" className="bg-[#111]">Search Engine (Google, etc.)</option>
                        <option value="Social Media" className="bg-[#111]">Social Media</option>
                        <option value="Friend/Colleague" className="bg-[#111]">Friend or Colleague</option>
                        <option value="Blog/Article" className="bg-[#111]">Blog or Article</option>
                        <option value="Other" className="bg-[#111]">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Notifications */}
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              
              <button 
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>

              <div className="flex items-center gap-4 w-full md:w-auto flex-row-reverse md:flex-row">
                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center text-sm px-4 py-2 rounded-lg border ${
                      message.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                    {message.text}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full md:w-auto bg-white text-black font-bold px-8 py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isSaving ? (
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
}