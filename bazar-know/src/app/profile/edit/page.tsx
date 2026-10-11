"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function EditProfileContent() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    } else {
      const localUserStr = localStorage.getItem("bazardor_user");
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          setName(localUser.name || "");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [session]);

  // BetterAuth updateUser according to concept documentation
  const handleUpdateInformation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("নাম খালি রাখা যাবে না!");
      return;
    }

    try {
      setLoading(true);

      // Official BetterAuth Update User Method
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

      toast.success("তথ্য সফলভাবে আপডেট করা হয়েছে!");
      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      console.error("Update User Error:", err);
      toast.error("আপডেট করতে সমস্যা হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF2EF] py-12 px-4 font-sans">
      <div className="max-w-md w-full mx-auto bg-white rounded-[28px] p-8 shadow-sm border border-gray-100 space-y-6">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ফিরে যান</span>
          </Link>
          <h1 className="text-lg font-black text-gray-900">তথ্য আপডেট</h1>
        </div>

        <form onSubmit={handleUpdateInformation} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">আপনার নাম (Name)</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="নতুন নাম লিখুন"
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E7D4E] hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Information</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <EditProfileContent />
    </Suspense>
  );
}