"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronDown, PackageX, TrendingUp, TrendingDown } from "lucide-react";

interface Product {
  id: number | string;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn?: string;
  unit: string;
  today: number;
  yesterday?: number;
  emoji?: string;
  image?: string;
  change?: {
    dir: "up" | "down" | "flat" | string;
    pct: number;
  };
}

interface Category {
  id: string | number;
  nameBn: string;
  slug: string;
  icon?: string;
}

// Convert numbers to Bengali digits
const toBnNum = (num: number | string) => {
  if (num === undefined || num === null || isNaN(Number(num))) return "০";
  if (typeof num === "number" && !Number.isInteger(num)) {
    return num.toLocaleString("bn-BD", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return Number(num).toLocaleString("bn-BD");
};

// Exact 8 API Categories Mapping
const API_CATEGORIES: Category[] = [
  { id: "chal", slug: "chal", nameBn: "চাল", icon: "🍚" },
  { id: "dal", slug: "dal", nameBn: "ডাল", icon: "🫘" },
  { id: "tel", slug: "tel", nameBn: "তেল", icon: "🛢️" },
  { id: "sobji", slug: "sobji", nameBn: "সবজি", icon: "🥬" },
  { id: "mach", slug: "mach", nameBn: "মাছ", icon: "🐟" },
  { id: "mangsho", slug: "mangsho", nameBn: "মাংস", icon: "🍗" },
  { id: "dim-dui", slug: "dim-dui", nameBn: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", slug: "mosla", nameBn: "মসলা", icon: "🌶️" },
];

// Unit label helper
const formatUnitLabel = (unitRaw?: string, categoryRaw?: string, nameBn?: string) => {
  const u = (unitRaw || "").toLowerCase();
  const c = (categoryRaw || "").toLowerCase();
  const n = (nameBn || "").toLowerCase();

  if (c === "tel" || u === "liter" || u === "litre" || n.includes("তেল")) return "প্রতি লিটার";
  if (c === "dim-dui" || c === "dim" || u === "dozen" || n.includes("ডিম")) return "প্রতি ডজন";
  if (u === "piece" || u === "pc" || n.includes("পিস")) return "প্রতি পিস";
  return "প্রতি কেজি";
};

// Emoji resolver helper
const getEmoji = (p: Product) => {
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
  if (text.includes("তেল") || text.includes("oil")) return "🫙";
  if (text.includes("মাছ") || text.includes("fish")) return "🐟";
  if (text.includes("মাংস") || text.includes("chicken") || text.includes("beef")) return "🍗";
  if (text.includes("ডাল") || text.includes("lentil")) return "🫘";
  if (text.includes("চাল") || text.includes("rice")) return "🍚";

  return "🥬";
};

function CategoryContent() {
  const params = useParams();
  const slug = params?.slug as string;

  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"default" | "lowToHigh" | "highToLow">("default");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch Categories
        let currentCat: Category | undefined;
        try {
          const catRes = await fetch("https://openapi.programming-hero.com/api/bazardor/categories");
          const catData = await catRes.json();
          const rawCategories: Category[] = Array.isArray(catData) ? catData : catData.data || [];
          currentCat = rawCategories.find(
            (c) => c.slug === slug || String(c.id) === slug || c.nameBn === slug
          );
        } catch (e) {}

        // Fallback to exact 8 API categories mapping
        if (!currentCat) {
          currentCat = API_CATEGORIES.find(
            (c) =>
              c.slug === slug ||
              (slug === "mangso" && c.slug === "mangsho") ||
              (slug === "dim-dudh" && c.slug === "dim-dui")
          );
        }

        if (currentCat) {
          setCategoryInfo(currentCat);
        }

        // Fetch Products
        const prodRes = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const prodData = await prodRes.json();
        const rawProducts: Product[] = Array.isArray(prodData) ? prodData : prodData.data || prodData.products || [];

        // Filter products matching category slug flexible
        const matched = rawProducts.filter((p) => {
          const catSlug = (p.category || "").toLowerCase();
          const targetSlug = slug.toLowerCase();

          return (
            catSlug === targetSlug ||
            (targetSlug === "sobji" && (catSlug === "vegetable" || catSlug === "সবজি")) ||
            (targetSlug === "chal" && (catSlug === "rice" || catSlug === "চাল")) ||
            (targetSlug === "tel" && (catSlug === "oil" || catSlug === "তেল")) ||
            (targetSlug === "dal" && (catSlug === "lentil" || catSlug === "ডাল")) ||
            ((targetSlug === "mangsho" || targetSlug === "mangso") && (catSlug === "meat" || catSlug === "mangsho" || catSlug === "mangso")) ||
            ((targetSlug === "dim-dui" || targetSlug === "dim-dudh") && (catSlug === "egg-milk" || catSlug === "dim-dui" || catSlug === "dim-dudh"))
          );
        });

        setProducts(matched);
        setFilteredProducts(matched);
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Handle Sort Change
  useEffect(() => {
    let list = [...products];
    if (sortBy === "lowToHigh") {
      list.sort((a, b) => a.today - b.today);
    } else if (sortBy === "highToLow") {
      list.sort((a, b) => b.today - a.today);
    }
    setFilteredProducts(list);
  }, [sortBy, products]);

  // Empty State / Invalid Category Slug
  if (!loading && (!categoryInfo || filteredProducts.length === 0)) {
    return (
      <div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PackageX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            কোনো পণ্য পাওয়া যায়নি
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            দুঃখিত! এই ক্যাটাগরিতে এই মুহূর্তে কোনো তথ্য যুক্ত করা নেই অথবা লিঙ্কটি সঠিক নয়।
          </p>
          <div className="pt-2">
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

  return (
    <div className="min-h-screen bg-[#EFF2EF] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner & Sort Controls */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Title + Icon */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl border border-emerald-100/60">
              {categoryInfo?.icon || "🛒"}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>{categoryInfo?.nameBn || "ক্যাটাগরি"}</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {toBnNum(filteredProducts.length)} টি পণ্য
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                আজকের সর্বশেষ বাজার দর
              </p>
            </div>
          </div>

          {/* Sort Control Dropdown */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
              সাজান:
            </span>
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer transition"
              >
                <option value="default">ডিফল্ট</option>
                <option value="lowToHigh">দাম: কম থেকে বেশি</option>
                <option value="highToLow">দাম: বেশি থেকে কম</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Product Cards List Grid / Skeleton Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-44 animate-pulse space-y-3">
                <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-6 w-1/2 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((item) => {
              const isUp = item.change?.dir === "up";
              const isDown = item.change?.dir === "down";

              return (
                <Link
                  key={item.id}
                  href={`/product/${item.slug || item.id}`}
                  className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-sm hover:shadow-md hover:border-emerald-200 transition group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Emoji Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-[#EFF5F1] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {getEmoji(item)}
                    </div>

                    {/* Product Name & Unit */}
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 group-hover:text-emerald-700 transition">
                        {item.nameBn}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        {formatUnitLabel(item.unit, item.category, item.nameBn)}
                      </p>
                    </div>
                  </div>

                  {/* Price & Change Badge */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-gray-900">
                        ৳ {toBnNum(item.today)}
                      </span>
                    </div>

                    {isUp && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{toBnNum(item.change?.pct || 0)}%</span>
                      </span>
                    )}
                    {isDown && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <TrendingDown className="w-3 h-3" />
                        <span>-{toBnNum(Math.abs(item.change?.pct || 0))}%</span>
                      </span>
                    )}
                    {(!item.change || item.change.dir === "flat") && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">
                        — 0%
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EFF2EF] py-12 px-4 flex justify-center items-center">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl text-center space-y-3 shadow-sm border border-gray-100">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-gray-700">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}