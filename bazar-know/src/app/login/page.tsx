"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড প্রদান করুন!");
      return;
    }

    try {
      setLoading(true);

      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: () => {
            const userData = { name: email.split("@")[0], email };
            localStorage.setItem("bazardor_user", JSON.stringify(userData));
            window.dispatchEvent(new Event("storage"));
            toast.success("সফলভাবে সাইন ইন করা হয়েছে!");
            router.push("/");
            router.refresh();
          },
          onError: (context) => {
            console.error("Login error:", context.error);
            toast.error("ইমেইল বা পাসওয়ার্ড সঠিক নয়, আবার চেষ্টা করুন!");
          },
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      toast.error("সাইন ইন করা যায়নি। আবার চেষ্টা করুন!");
    } finally {
      setLoading(false);
    }
  };

  // Google Provider Login
  const handleGoogleLogin = async () => {
    try {
      if (authClient?.signIn?.social) {
        await authClient.signIn.social(
          { provider: "google", callbackURL: "/" },
          {
            onError: ({ error }) => {
              toast.error(error.message || "গুগল দিয়ে লগইন করা যায়নি!");
            },
          }
        );
      } else {
        toast.error("গুগল সাইন ইন কনফিগার করা নেই!");
      }
    } catch (err) {
      console.error(err);
      toast.error("গুগল দিয়ে লগইন করা যায়নি!");
    }
  };

  // GitHub Provider Login
  const handleGithubLogin = async () => {
    try {
      if (authClient?.signIn?.social) {
        await authClient.signIn.social(
          { provider: "github", callbackURL: "/" },
          {
            onError: ({ error }) => {
              toast.error(error.message || "গিটহাব দিয়ে লগইন করা যায়নি!");
            },
          }
        );
      } else {
        toast.error("গিটহাব সাইন ইন কনফিগার করা নেই!");
      }
    } catch (err) {
      console.error(err);
      toast.error("গিটহাব দিয়ে লগইন করা যায়নি!");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#EFF2EF] flex flex-col items-center justify-center py-10 px-4 font-sans text-gray-800">
      <div className="max-w-md w-full space-y-6">
        
        {/* Title & Subtitle */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            সাইন ইন
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে ঢুকুন।
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-2xs space-y-5">
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                ইমেইল
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200/90 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200/90 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E7D4E] hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>সাইন ইন</span>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-gray-400 absolute">
              অথবা
            </span>
          </div>

          {/* Social Sign In Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google দিয়ে চালিয়ে যান</span>
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current text-gray-800" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub দিয়ে চালিয়ে যান</span>
            </button>
          </div>

          {/* Account Register Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 font-medium">
              অ্যাকাউন্ট নেই?{" "}
              <Link href="/register" className="text-emerald-700 font-bold hover:underline">
                সাইন আপ করুন
              </Link>
            </p>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>হোম পেজে ফিরে যান</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center font-bold text-gray-600">লোড হচ্ছে...</div>}>
      <LoginContent />
    </Suspense>
  );
}