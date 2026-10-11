"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Search, Lock, LogIn, UserPlus, X, Scale, ChevronDown } from "lucide-react";

type SortOption = "default" | "lowToHigh" | "highToLow";

interface Product {
  id: string | number;
  slug: string;
  nameBn: string;
  category: string;
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

const toBnNum = (num: number | string) => {
  if (num === undefined || num === null || isNaN(Number(num))) return "০";
  if (typeof num === "number" && !Number.isInteger(num)) {
    return num.toLocaleString("bn-BD", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }
  return Number(num).toLocaleString("bn-BD");
};

// Convert Bengali numerals to standard numbers for safe numeric sorting
const parseNumericValue = (val: unknown): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  const converted = String(val).replace(/[০-৯]/g, (match) => bnToEnMap[match] || match);
  return parseFloat(converted) || 0;
};

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
  if (text.includes("তেল") || text.includes("oil")) return "🛢️";
  if (text.includes("মাছ") || text.includes("fish")) return "🐟";
  if (text.includes("মাংস") || text.includes("chicken") || text.includes("beef")) return "🍗";
  if (text.includes("ডাল") || text.includes("lentil")) return "🫘";
  if (text.includes("চাল") || text.includes("rice")) return "🍚";

  return "🥬";
};

function HomeContent() {
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setProducts(list);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const checkIsLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const localUser = localStorage.getItem("bazardor_user");
    return Boolean(session?.user) || Boolean(localUser);
  };

  const handleProductClick = (slug: string) => {
    if (checkIsLoggedIn()) {
      router.push(`/product/${slug}`);
    } else {
      setShowAuthModal(true);
    }
  };

  let filteredProducts = products.filter((p) =>
    p.nameBn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting Logic (Numeric Sort for Prices)
  if (sortBy === "lowToHigh") {
    filteredProducts = [...filteredProducts].sort((a, b) => parseNumericValue(a.today) - parseNumericValue(b.today));
  } else if (sortBy === "highToLow") {
    filteredProducts = [...filteredProducts].sort((a, b) => parseNumericValue(b.today) - parseNumericValue(a.today));
  }

  const priceUpProducts = filteredProducts.filter((p) => p.change?.dir === "up");
  const priceDownProducts = filteredProducts.filter((p) => p.change?.dir === "down");
  const priceFlatProducts = filteredProducts.filter((p) => p.change?.dir !== "up" && p.change?.dir !== "down");

  return (
    <div className="min-h-screen bg-[#EFF2EF] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-gray-100/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              আজকের বাজারের দাম এক নজরে
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং দামের পরিবর্তন এক জায়গায়।
            </p>
            
            {/* Search, Sort Dropdown & Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <button
                type="button"
                onClick={() => setShowAllProducts((showAll) => !showAll)}
                aria-pressed={showAllProducts}
                className={`inline-flex items-center justify-center gap-1.5 border px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  showAllProducts
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                <span>{showAllProducts ? "দামের পরিবর্তন" : "সব পণ্য"}</span>
              </button>
              
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>বাজার তুলনা</span>
              </button>

              {/* Sort Dropdown with Chevron Icon */}
              <div className="relative inline-flex items-center">
                <span className="text-xs font-bold text-gray-500 mr-2">সাজান:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer shadow-xs"
                  >
                    <option value="default">ডিফল্ট</option>
                    <option value="lowToHigh">দাম: কম থেকে বেশি</option>
                    <option value="highToLow">দাম: বেশি থেকে কম</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="relative w-full sm:w-52">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="w-40 sm:w-56 shrink-0 flex justify-center">
            <Image
              src="/bazar-hero.png"
              alt="বাজার দর"
              width={220}
              height={220}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-36 border border-gray-100"></div>
            ))}
          </div>
        )}

        {!loading && showAllProducts && (
          <section className="space-y-4" aria-label="সব পণ্য">
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              সব পণ্য ({toBnNum(filteredProducts.length)})
            </h2>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProductClick(p.slug)}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition cursor-pointer text-left flex flex-col justify-between group space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getEmoji(p)}</span>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition">
                          {p.nameBn}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {p.unit || "প্রতি কেজি"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 font-medium block mb-1">আজকের দাম</span>
                      <div className="flex items-baseline justify-between">
                        <div className="text-base font-black text-gray-900">
                          {toBnNum(p.today)} <span className="text-xs font-bold">টাকা</span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          {p.change?.dir === "up" ? "▲" : p.change?.dir === "down" ? "▼" : "—"}{" "}
                          {toBnNum(Math.abs(p.change?.pct || 0))}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-white p-6 text-sm font-medium text-gray-500 border border-gray-100">
                কোনো পণ্য পাওয়া যায়নি।
              </p>
            )}
          </section>
        )}

        {/* Price Up Section */}
        {!loading && !showAllProducts && priceUpProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="text-rose-600 text-sm">▲</span> আজ দাম বেড়েছে
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {priceUpProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.slug)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getEmoji(p)}</span>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition">
                        {p.nameBn}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {p.unit || "প্রতি কেজি"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">আজকের দাম</span>
                    <div className="flex items-baseline justify-between">
                      <div className="text-base font-black text-gray-900">
                        {toBnNum(p.today)} <span className="text-xs font-bold">টাকা</span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        ▲ {toBnNum(p.change?.pct || 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Down Section */}
        {!loading && !showAllProducts && priceDownProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="text-emerald-600 text-sm">▼</span> আজ দাম কমেছে
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {priceDownProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.slug)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getEmoji(p)}</span>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition">
                        {p.nameBn}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {p.unit || "প্রতি কেজি"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">আজকের দাম</span>
                    <div className="flex items-baseline justify-between">
                      <div className="text-base font-black text-gray-900">
                        {toBnNum(p.today)} <span className="text-xs font-bold">টাকা</span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        ▼ {toBnNum(Math.abs(p.change?.pct || 0))}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flat Section */}
        {!loading && !showAllProducts && priceFlatProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              অন্যান্য পণ্য
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {priceFlatProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.slug)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getEmoji(p)}</span>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition">
                        {p.nameBn}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {p.unit || "প্রতি কেজি"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">আজকের দাম</span>
                    <div className="flex items-baseline justify-between">
                      <div className="text-base font-black text-gray-900">
                        {toBnNum(p.today)} <span className="text-xs font-bold">টাকা</span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        — ০.০%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">লগইন প্রয়োজন</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                পণ্যের বাজারভিত্তিক বিস্তারিত তথ্য, গড় দাম ও ওঠানামা দেখতে অনুগ্রহ করে একাউন্ট দিয়ে সাইন ইন বা সাইন আপ করুন।
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/login"
                className="flex-1 bg-[#1E7D4E] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>সাইন ইন</span>
              </Link>
              <Link
                href="/register"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-gray-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>সাইন আপ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFF2EF] flex items-center justify-center font-bold text-gray-600">লোড হচ্ছে...</div>}>
      <HomeContent />
    </Suspense>
  );
}