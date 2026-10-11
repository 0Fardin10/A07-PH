"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Scale, Search, Lock, LogIn, UserPlus, X } from "lucide-react";

// Product interface matching API schema
interface Product {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon?: string;
  unit: string;
  image?: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: {
    dir: "up" | "down" | "flat" | string;
    pct: number;
  };
}

// Convert numbers to Bengali digits with comma formatting
const toBnNum = (num: number | string) => {
  if (num === undefined || num === null) return "০";
  return Number(num).toLocaleString("bn-BD");
};

// Format unit to proper Bangla unit string
const getUnitText = (unit: string) => {
  if (!unit) return "প্রতি ইউনিট";
  const u = unit.toLowerCase().trim();
  if (u === "kg" || u === "কেজি") return "প্রতি কেজি";
  if (u === "l" || u === "লিটার") return "প্রতি লিটার";
  if (u === "dozen" || u === "ডজন") return "প্রতি ডজন";
  if (u === "pcs" || u === "piece" || u === "পিস") return "প্রতি পিস";
  return `প্রতি ${unit}`;
};

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dynamic Date Formatting
  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  // Fetch Products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const data = await res.json();
        const rawProducts: Product[] = Array.isArray(data) ? data : data.data || data.products || [];
        setProducts(rawProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Handle Product Card Click with Auth Check
  const handleProductClick = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    if (!session) {
      setShowAuthModal(true);
    } else {
      router.push(`/product/${productId}`);
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) =>
    p.nameBn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Section A: Top 6 Risers
  const topRisers = [...filteredProducts]
    .filter((p) => p.change?.dir === "up")
    .sort((a, b) => (b.change?.pct || 0) - (a.change?.pct || 0))
    .slice(0, 6);

  // Section B: Top 6 Fallers
  const topFallers = [...filteredProducts]
    .filter((p) => p.change?.dir === "down")
    .sort((a, b) => (b.change?.pct || 0) - (a.change?.pct || 0))
    .slice(0, 6);

  // Reusable Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const isUp = product.change?.dir === "up";
    const isDown = product.change?.dir === "down";
    const pct = product.change?.pct ?? 0;

    return (
      <div
        onClick={(e) => handleProductClick(e, product.id)}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between group select-none"
      >
        <div className="flex items-start gap-3.5">
          {/* Emoji / Illustration */}
          <div className="w-12 h-12 rounded-xl bg-[#F2F7F4] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            {product.image || product.categoryIcon || "🛒"}
          </div>

          {/* Product Name & Unit Line */}
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
              {product.nameBn}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {getUnitText(product.unit)}
            </p>
          </div>
        </div>

        {/* Price Row */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-gray-400 block font-medium">আজকের দাম</span>
            <span className="text-base sm:text-lg font-extrabold text-gray-900">
              {toBnNum(product.today)} টাকা
            </span>
          </div>

          {/* Change Badge */}
          {isUp ? (
            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-lg">
              ▲ {toBnNum(pct)}%
            </span>
          ) : isDown ? (
            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">
              ▼ {toBnNum(pct)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-lg">
              — {toBnNum(pct)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#EFF2EF] min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* 1. Hero Card with /bazar-hero.png on the right */}
        <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-gray-100/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5">
              {/* Date Badge */}
              <div className="inline-block bg-[#E8F3ED] text-[#2D7A53] text-xs font-semibold px-4 py-1.5 rounded-full">
                {currentDate || "তারিখ লোড হচ্ছে..."}
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                আজকের বাজারের দাম এক নজরে
              </h1>

              {/* Description Subtitle */}
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl">
                চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং দামের পরিবর্তন এক জায়গায়।
              </p>

              {/* Action Buttons & Search */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#সব-পণ্য"
                  className="border border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  সব পণ্য
                </a>

                <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition">
                  <Scale className="w-4 h-4 text-gray-600" />
                  <span>বাজার তুলনা</span>
                </button>

                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <input
                    type="text"
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-4 flex items-center justify-center p-2">
              <img
                src="/bazar-hero.png"
                alt="বাজার দর হিরো"
                className="max-h-56 w-auto object-contain"
              />
            </div>

          </div>
        </div>

        {/* SECTION A — “আজ দাম বেড়েছে ▲” (Top 6 Risers) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold text-base">▲</span>
            <h2 className="text-lg font-bold text-gray-900">আজ দাম বেড়েছে</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 h-32 animate-pulse"></div>
              ))}
            </div>
          ) : topRisers.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white p-4 rounded-2xl border border-gray-100">
              আজ কোনো পণ্যের দাম বাড়েনি।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRisers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION B — “আজ দাম কমেছে ▼” (Top 6 Fallers) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-rose-600 font-bold text-base">▼</span>
            <h2 className="text-lg font-bold text-gray-900">আজ দাম কমেছে</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 h-32 animate-pulse"></div>
              ))}
            </div>
          ) : topFallers.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white p-4 rounded-2xl border border-gray-100">
              আজ কোনো পণ্যের দাম কমেনি।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topFallers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION C — “সব পণ্য” (Responsive Grid for ALL products) */}
        <section id="সব-পণ্য" className="space-y-4 pt-4 scroll-mt-24">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">সব পণ্য</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              বাজারের সকল নিত্যপ্রয়োজনীয় পণ্যের তালিকা ও লাইভ দরদাম
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 h-36 animate-pulse"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 text-center">
              কোনো পণ্য পাওয়া যায়নি।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Auth Guard Alert Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative space-y-5 text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lock Icon */}
            <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
              <Lock className="w-8 h-8" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-gray-900">লগইন প্রয়োজন</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                পণ্যের বাজারভিত্তিক বিস্তারিত তথ্য, গড় দাম ও ওঠানামা দেখতে অনুগ্রহ করে একাউন্ট দিয়ে সাইন ইন বা সাইন আপ করুন।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>সাইন ইন</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold py-3 px-4 rounded-xl text-sm transition"
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