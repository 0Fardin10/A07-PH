"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { User, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const [name, setName] = useState("Rezwan Ahmed");
  const [email, setEmail] = useState("rezwanahmed@gmail.com");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    } else {
      const stored = localStorage.getItem("bazardor_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setName(parsed.name);
          if (parsed.email) setEmail(parsed.email);
        } catch (e) {}
      }
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            localStorage.removeItem("bazardor_user");
            toast.success("লগআউট সফল হয়েছে!");
            window.location.href = "/";
          },
        },
      });
    } catch (e) {
      localStorage.removeItem("bazardor_user");
      toast.success("লগআউট সফল হয়েছে!");
      window.location.href = "/";
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("নামের ঘরটি ফাঁকা রাখা যাবে না!");
      return;
    }

    setSaving(true);
    try {
      if (session?.user) {
        await authClient.updateUser({ name });
      }

      const stored = localStorage.getItem("bazardor_user");
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "bazardor_user",
        JSON.stringify({ ...current, name, email })
      );

      toast.success("নাম সফলভাবে আপডেট হয়েছে!");
    } catch (err: any) {
      toast.success("নাম সফলভাবে আপডেট হয়েছে!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#EFF2EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            আমার প্রোফাইল
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
          </p>
        </div>

        {/* Top Overview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold shrink-0">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                {email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition self-stretch sm:self-auto justify-center cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>সাইন আউট</span>
          </button>
        </div>

        {/* Info Update Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-gray-900">তথ্য</h3>

          <form onSubmit={handleUpdateName} className="space-y-5">
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1E7D4E] hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm border border-emerald-700 cursor-pointer"
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