import React from "react";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#EFF2EF] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-sm border border-gray-100 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <PackageX className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900">৪০৪</h1>
        <h2 className="text-xl font-bold text-gray-800">
          পৃষ্ঠাটি পাওয়া যায়নি
        </h2>
        
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
          দুঃখিত! আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই, সরিয়ে নেওয়া হয়েছে অথবা লিঙ্কটি ভুল।
        </p>

        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#1E7D4E] hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow-sm w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}