"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";

interface ApiMarket {
  market: string;
  division: string;
  min: number;
  max: number;
}

interface ProductDetail {
  id: number | string;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  unit: string;
  today: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  emoji?: string;
  image?: string;
  change?: {
    dir: "up" | "down" | "flat" | string;
    pct: number;
  };
  markets?: ApiMarket[];
}

const toBnNum = (num: number | string) => {
  if (num === undefined || num === null || isNaN(Number(num))) return "০";
  if (typeof num === "number" && !Number.isInteger(num)) {
    return num.toLocaleString("bn-BD", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return Number(num).toLocaleString("bn-BD");
};

const formatUnitLabel = (unitRaw?: string, categoryRaw?: string, nameBn?: string) => {
  const u = (unitRaw || "").toLowerCase();
  const c = (categoryRaw || "").toLowerCase();
  const n = (nameBn || "").toLowerCase();

  if (c === "tel" || u === "liter" || u === "litre" || n.includes("তেল")) return "প্রতি লিটার";
  if (c === "dim" || u === "dozen" || n.includes("ডিম")) return "প্রতি ডজন";
  if (u === "piece" || u === "pc" || n.includes("পিস")) return "প্রতি পিস";
  return "প্রতি কেজি";
};

const getEmoji = (p: ProductDetail) => {
  if (p.categoryIcon) return p.categoryIcon;
  if (p.emoji && p.emoji !== "🍚" && p.emoji !== "🛒") return p.emoji;
  if (p.image && !p.image.startsWith("http")) return p.image;

  const text = `${p.nameBn} ${p.category}`.toLowerCase();
  if (text.includes("পেঁয়াজ") || text.includes("onion")) return "🧅";
  if (text.includes("আদা") || text.includes("ginger")) return "🫚";
  if (text.includes("রসুন") || text.includes("garlic")) return "🧄";
  if (text.includes("আলু") || text.includes("potato")) return "🥔";
  if (text.includes("টমেটো") || text.includes("tomato")) return "🍅";
  if (text.includes("মরিচ") || text.includes("chili")) return "🌶️";
  if (text.includes("বেগুন") || text.includes("brinjal")) return "🍆";
  if (text.includes("ডিম") || text.includes("egg")) return "🥚";
  if (text.includes("দুধ") || text.includes("milk")) return "🥛";
  if (text.includes("তেল") || text.includes("oil")) return "🛢️";
  if (text.includes("মাছ") || text.includes("fish")) return "🐟";
  if (text.includes("মাংস") || text.includes("chicken") || text.includes("beef")) return "🍗";
  if (text.includes("ডাল") || text.includes("lentil")) return "🫘";
  if (text.includes("চাল") || text.includes("rice")) return "🥣";

  return "🥬";
};

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: session, isPending } = useSession();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Protection Check
  useEffect(() => {
    if (!isPending) {
      const localUser = localStorage.getItem("bazardor_user");
      if (!session?.user && !localUser) {
        toast.error("এই পণ্যের বিবরণ দেখতে অনুগ্রহ করে আগে লগইন করুন!");
        router.push("/login");
      }
    }
  }, [session, isPending, router]);

  // Fetch Product Data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);

        // Try single product API endpoint
        let res = await fetch(`https://openapi.programming-hero.com/api/bazardor/products/${slug}`);
        if (!res.ok) {
          res = await fetch(`https://openapi.programming-hero.com/api/bazardor/product/${slug}`);
        }
        
        const data = await res.json();
        const p = data.data || data;

        if (p && (p.nameBn || p.id)) {
          setProduct(p);
        } else {
          // Fallback fetch from list
          const allRes = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
          const allData = await allRes.json();
          const list = Array.isArray(allData) ? allData : allData.data || [];
          const matched = list.find((item: any) => item.slug === slug || String(item.id) === slug);
          setProduct(matched || null);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-[#EFF2EF] py-12 px-4 flex justify-center items-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl text-center space-y-3 shadow-2xs border border-gray-100">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-700">পণ্যের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xs border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">পণ্যটি পাওয়া যায়নি</h2>
          <p className="text-xs text-gray-500 font-medium">
            আপনার অনুরোধকৃত পণ্যের বিস্তারিত তথ্য পাওয়া যায়নি।
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#1E7D4E] text-white font-bold px-6 py-3 rounded-xl text-xs w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোম পেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";
  const categoryName = product.categoryNameBn || "চাল";

  const yesterdayPrice = product.yesterday || (isUp ? product.today - 3 : isDown ? product.today + 3 : product.today);
  const priceDiff = Math.abs(product.today - yesterdayPrice);

  // Summary calculation from the API's `markets` array
  const marketList = product.markets || [];

  let minPrice = product.today;
  let maxPrice = product.today;
  let avgPrice = product.today;

  if (marketList.length > 0) {
    const minValues = marketList.map((m) => m.min);
    const maxValues = marketList.map((m) => m.max);

    minPrice = Math.min(...minValues);
    maxPrice = Math.max(...maxValues);

    const sumAverages = marketList.reduce((acc, m) => acc + (m.min + m.max) / 2, 0);
    avgPrice = Math.round(sumAverages / marketList.length);
  }

  return (
    <div className="min-h-screen bg-[#EFF2EF] py-6 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link href="/" className="hover:text-emerald-700 transition">
            হোম
          </Link>
          <span>›</span>
          <span className="hover:text-emerald-700 transition cursor-pointer">
            {categoryName}
          </span>
          <span>›</span>
          <span className="text-gray-800 font-bold">{product.nameBn}</span>
        </nav>

        {/* Top Product Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EFF5F1] flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {getEmoji(product)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {product.nameBn}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                {formatUnitLabel(product.unit, product.category, product.nameBn)} · {categoryName}
              </p>
              <p className="text-xs text-gray-500 font-medium pt-0.5">
                গতকালকের তুলনায় আজ দাম {isUp ? "বেড়েছে" : isDown ? "কমেছে" : "একই আছে"} · {toBnNum(priceDiff)} টাকা
              </p>
            </div>
          </div>

          {/* Today's Price Widget */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5 text-center shrink-0 min-w-[140px] space-y-1 self-stretch sm:self-auto flex flex-col justify-center">
            <span className="text-[11px] font-bold text-gray-400 block">আজকের দাম</span>
            <div className="text-3xl font-black text-gray-900 my-0.5">
              {toBnNum(product.today)}
            </div>
            <span className="text-[11px] text-gray-500 font-bold block">
              টাকা / কেজি
            </span>
            <div className="pt-1">
              {isUp && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100/80">
                  ▲ {toBnNum(product.change?.pct || 0)}%
                </span>
              )}
              {isDown && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100/80">
                  ▼ {toBnNum(Math.abs(product.change?.pct || 0))}%
                </span>
              )}
              {!isUp && !isDown && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  — ০.০%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: দামের সারসংক্ষেপ */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-gray-900">
            দামের সারসংক্ষেপ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Min Price */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs space-y-2">
              <span className="text-xs text-gray-500 font-semibold block">সর্বনিম্ন দাম</span>
              <div className="text-2xl font-black text-emerald-600">
                {toBnNum(minPrice)} <span className="text-sm font-bold text-gray-700">টাকা</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">সবচেয়ে কম দামের বাজার</p>
            </div>

            {/* Max Price */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs space-y-2">
              <span className="text-xs text-gray-500 font-semibold block">সর্বোচ্চ দাম</span>
              <div className="text-2xl font-black text-rose-600">
                {toBnNum(maxPrice)} <span className="text-sm font-bold text-gray-700">টাকা</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">সবচেয়ে বেশি দামের বাজার</p>
            </div>

            {/* Avg Price */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-2xs space-y-2">
              <span className="text-xs text-gray-500 font-semibold block">গড় দাম</span>
              <div className="text-2xl font-black text-emerald-700">
                {toBnNum(avgPrice)} <span className="text-sm font-bold text-gray-700">টাকা</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">প্রতি কেজি-এর হিসাবে</p>
            </div>

          </div>
        </div>

        {/* Section 2: বাজারভিত্তিক আজকের দাম Table */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-gray-900">
            বাজারভিত্তিক আজকের দাম
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-700 font-bold">
                    <th className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60">বাজার</th>
                    <th className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60">বিভাগ</th>
                    <th className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60">সর্বনিম্ন</th>
                    <th className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60">সর্বোচ্চ</th>
                    <th className="py-3.5 px-4 sm:px-6">গড়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 text-gray-800 font-semibold">
                  {marketList.map((m, idx) => {
                    const avg = Math.round((m.min + m.max) / 2);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60 font-bold text-gray-900">
                          {m.market}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60 text-gray-600">
                          {m.division}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60 text-gray-900 font-bold">
                          {toBnNum(m.min)} টাকা
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 border-r border-gray-200/60 text-gray-900 font-bold">
                          {toBnNum(m.max)} টাকা
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 font-extrabold text-gray-900">
                          {toBnNum(avg)} টাকা
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center font-bold text-gray-600">লোড হচ্ছে...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}