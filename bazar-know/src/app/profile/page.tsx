"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { User, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync profile inputs with session data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("লগআউট সফল হয়েছে!");
            router.push("/");
            router.refresh();
          },
          onError: () => {
            toast.error("লগআউট হতে সমস্যা হয়েছে!");
          },
        },
      });
    } catch (error) {
      toast.error("লগআউট হতে সমস্যা হয়েছে!");
    }
  };

  // Handle Name Update
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("নামের ঘরটি ফাঁকা রাখা যাবে না!");
      return;
    }

    setSaving(true);
    try {
      // Update only name using BetterAuth API
      const res = await authClient.updateUser({
        name,
      });

      if (res?.error) {
        toast.error(res.error.message || "নাম আপডেট হতে সমস্যা হয়েছে!");
      } else {
        toast.success("নাম সফলভাবে আপডেট হয়েছে!");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error("নাম আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="bg-[#EFF2EF] min-h-screen py-12 px-4 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="bg-white p-8 rounded-2xl h-36 animate-pulse"></div>
          <div className="bg-white p-8 rounded-2xl h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-[#EFF2EF] min-h-screen py-16 px-4 text-center font-sans">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <p className="text-gray-700 font-bold text-lg">
            প্রোফাইল দেখতে আপনাকে সাইন ইন করতে হবে।
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition"
          >
            সাইন ইন করুন
          </button>
        </div>
      </div>
    );
  }

  const userImage = session.user?.image;

  return (
    <div className="bg-[#EFF2EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            আমার প্রোফাইল
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন এবং নাম পরিবর্তন করুন।
          </p>
        </div>

        {/* 1. Top Overview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {userImage ? (
              <img
                src={userImage}
                alt={name || "User"}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold shrink-0">
                <User className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {name || "ইউজার"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                {email}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition self-stretch sm:self-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span>সাইন আউট</span>
          </button>

        </div>

        {/* 2. Info Card (Only Name Editable) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-gray-900">তথ্য</h3>

          <form onSubmit={handleUpdateName} className="space-y-5">
            {/* Editable Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 block">
                নাম
              </label>
              <div className="p-[1px] bg-emerald-600 rounded-xl">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-0 rounded-[11px] px-4 py-3 text-sm font-medium text-gray-800 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Read-Only Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 block">
                ইমেইল
              </label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1E7D4E] hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm border border-emerald-700"
              >
                {saving ? (
                  <span>সংরক্ষণ করা হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>নাম পরিবর্তন করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}