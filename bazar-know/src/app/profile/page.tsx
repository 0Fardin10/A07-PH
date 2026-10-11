"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, Loader2, User } from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // User Data Load
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    } else {
      const localUserStr = localStorage.getItem("bazardor_user");
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          setName(localUser.name || "");
          setEmail(localUser.email || "");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [session]);

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      if (authClient?.signOut) {
        await authClient.signOut();
      }
      localStorage.removeItem("bazardor_user");
      window.dispatchEvent(new Event("storage"));
      toast.success("সফলভাবে সাইন আউট করা হয়েছে!");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      localStorage.removeItem("bazardor_user");
      window.dispatchEvent(new Event("storage"));
      toast.success("সফলভাবে সাইন আউট করা হয়েছে!");
      router.push("/login");
    }
  };

  // Name Update Handler (BetterAuth updateUser)
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("নাম খালি রাখা যাবে না!");
      return;
    }

    try {
      setLoading(true);

      // Official BetterAuth Update User
      if (authClient?.updateUser) {
        await authClient.updateUser({
          name: name.trim(),
        });
      }

      // Sync Local Storage
      const localUserStr = localStorage.getItem("bazardor_user");
      const existingData = localUserStr ? JSON.parse(localUserStr) : {};
      const updatedUser = { ...existingData, name: name.trim() };
      localStorage.setItem("bazardor_user", JSON.stringify(updatedUser));

      window.dispatchEvent(new Event("storage"));

      toast.success("তথ্য সফলভাবে আপডেট করা হয়েছে!");
      router.refresh();
    } catch (err: any) {
      console.error("Update error:", err);
      
      const localUserStr = localStorage.getItem("bazardor_user");
      const existingData = localUserStr ? JSON.parse(localUserStr) : {};
      localStorage.setItem(
        "bazardor_user",
        JSON.stringify({ ...existingData, name: name.trim() })
      );
      window.dispatchEvent(new Event("storage"));
      toast.success("তথ্য সফলভাবে আপডেট করা হয়েছে!");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF2EF] py-10 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Page Title & Subtitle */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            আমার প্রোফাইল
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* Top User Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-100">
              {name ? name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {name || "ব্যবহারকারী"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {email || "user@example.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            type="button"
            className="inline-flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>সাইন আউট</span>
          </button>
        </div>

        {/* Information / Name Edit Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100/90 shadow-2xs space-y-5">
          <h3 className="text-base font-bold text-gray-900">
            তথ্য
          </h3>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                নাম
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E7D4E] hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>তথ্য আপডেট করুন</span>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center font-bold text-gray-600">লোড হচ্ছে...</div>}>
      <ProfileContent />
    </Suspense>
  );
}