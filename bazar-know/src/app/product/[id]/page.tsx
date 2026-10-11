"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";

interface MarketInfo {
  market: string;
  division: string;
  min: number;
  max: number;
}

interface Product {
  id: number | string;
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
  markets?: MarketInfo[];
}

// English to Bengali digit converter
const toBnNum = (num: number | string) => {
  if (num === undefined || num === null || isNaN(Number(num))) return "০";
  return Number(num).toLocaleString("bn-BD");
};

// Unit string formatter
const getUnitText = (unit: string) => {
  if (!unit) return "কেজি";
  const u = unit.toLowerCase().trim();
  if (u === "kg" || u === "কেজি") return "কেজি";
  if (u === "l" || u === "লিটার") return "লিটার";
  if (u === "dozen" || u === "ডজন") return "ডজন";
  if (u === "pcs" || u === "piece" || u === "পিস") return "পিস";
  return unit;
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const data = await res.json();
        const rawProducts: Product[] = Array.isArray(data) ? data : data.data || data.products || [];

        const found = rawProducts.find(
          (p) => String(p.id) === String(productId) || p.slug === productId
        );

        if (found) {
          setProduct(found);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetail();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-[#EFF2EF] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="bg-white p-8 rounded-2xl h-48 animate-pulse"></div>
          <div className="bg-white p-8 rounded-2xl h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#EFF2EF] min-h-screen py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 font-semibold text-lg">পণ্যটি পাওয়া যায়নি!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 transition"
          >
            হোমপেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const unitBn = getUnitText(product.unit);
  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";
  const diffYesterday = Math.abs((product.today || 0) - (product.yesterday || 0));

  // Market calculations
  const marketsList = product.markets || [];
  const lowestPrice = marketsList.length > 0 ? Math.min(...marketsList.map((m) => m.min)) : Math.max(0, product.today - 7);
  const highestPrice = marketsList.length > 0 ? Math.max(...marketsList.map((m) => m.max)) : product.today + 7;
  const avgPrice = product.today;

  return (
    <div className="bg-[#EFF2EF] min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Breadcrumb Header matching Screenshot */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
          <Link href="/" className="hover:text-emerald-700 transition">হোম</Link>
          <span>&gt;</span>
          <span className="hover:text-emerald-700 cursor-pointer">{product.categoryNameBn || "চাল"}</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">{product.nameBn}</span>
        </nav>

        {/* 1. Top Main Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Side */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EEF4F0] flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {product.image || product.categoryIcon || "🍚"}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {product.nameBn}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                প্রতি {unitBn} · {product.categoryNameBn || "চাল"}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-normal pt-1">
                গতকালকের তুলনায় আজ দাম{" "}
                <span className="font-bold text-gray-900">
                  {isUp ? "বেড়েছে" : isDown ? "কমেছে" : "একই আছে"}
                </span>
                {diffYesterday > 0 && ` · ${toBnNum(diffYesterday)} টাকা`}
              </p>
            </div>
          </div>

          {/* Right Price Box */}
          <div className="bg-[#F2F6F3] border border-gray-100/80 rounded-2xl px-6 py-4 text-center min-w-[150px] self-stretch md:self-auto flex flex-col justify-center items-center">
            <span className="text-xs text-gray-500 font-medium">আজকের দাম</span>
            <span className="text-3xl sm:text-4xl font-black text-gray-900 my-0.5">
              {toBnNum(product.today)}
            </span>
            <span className="text-xs text-gray-500 font-medium mb-1">
              টাকা / {unitBn}
            </span>
            <span className={`text-xs font-bold ${isUp ? "text-rose-600" : isDown ? "text-emerald-600" : "text-gray-500"}`}>
              {isUp ? "▲" : isDown ? "▼" : "—"} {toBnNum(product.change?.pct ?? 0)}%
            </span>
          </div>

        </div>

        {/* 2. Middle Container: Summary & Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100/80 shadow-sm space-y-8">
          
          {/* Summary Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">দামের সারসংক্ষেপ</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lowest */}
              <div className="bg-[#F8FAFC] border border-gray-200/60 p-5 rounded-2xl space-y-1">
                <p className="text-xs text-gray-500 font-medium">সর্বনিম্ন দাম</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {toBnNum(lowestPrice)} টাকা
                </p>
                <p className="text-xs text-gray-400 font-medium pt-0.5">সবচেয়ে কম দামের বাজার</p>
              </div>

              {/* Highest */}
              <div className="bg-[#F8FAFC] border border-gray-200/60 p-5 rounded-2xl space-y-1">
                <p className="text-xs text-gray-500 font-medium">সর্বাধিক দাম</p>
                <p className="text-2xl font-bold text-rose-500">
                  {toBnNum(highestPrice)} টাকা
                </p>
                <p className="text-xs text-gray-400 font-medium pt-0.5">সবচেয়ে বেশি দামের বাজার</p>
              </div>

              {/* Average */}
              <div className="bg-[#F8FAFC] border border-gray-200/60 p-5 rounded-2xl space-y-1">
                <p className="text-xs text-gray-500 font-medium">গড় দাম</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {toBnNum(avgPrice)} টাকা
                </p>
                <p className="text-xs text-gray-400 font-medium pt-0.5">প্রতি {unitBn}-এর হিসাবে</p>
              </div>
            </div>
          </div>

          {/* Table: বাজারভিত্তিক আজকের দাম */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-gray-900">বাজারভিত্তিক আজকের দাম</h2>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F2F6F3] border-b border-gray-200 text-gray-800 font-bold">
                    <th className="p-3.5 border-r border-gray-200">বাজার</th>
                    <th className="p-3.5 border-r border-gray-200">বিভাগ</th>
                    <th className="p-3.5 border-r border-gray-200 text-right">সর্বনিম্ন</th>
                    <th className="p-3.5 border-r border-gray-200 text-right">সর্বাধিক</th>
                    <th className="p-3.5 text-right">গড়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 font-normal">
                  {marketsList.length > 0 ? (
                    marketsList.map((m, idx) => {
                      const marketAvg = Math.round((m.min + m.max) / 2);
                      return (
                        <tr key={idx} className="hover:bg-gray-50/80 transition">
                          <td className="p-3.5 border-r border-gray-200 font-semibold">{m.market}</td>
                          <td className="p-3.5 border-r border-gray-200">{m.division}</td>
                          <td className="p-3.5 border-r border-gray-200 text-right">{toBnNum(m.min)} টাকা</td>
                          <td className="p-3.5 border-r border-gray-200 text-right">{toBnNum(m.max)} টাকা</td>
                          <td className="p-3.5 text-right font-bold">{toBnNum(marketAvg)} টাকা</td>
                        </tr>
                      );
                    })
                  ) : (
                    [
                      { market: "মাঠ বাজার", div: "ময়মনসিংহ", min: lowestPrice, max: highestPrice - 8, avg: Math.round((lowestPrice + highestPrice - 8) / 2) },
                      { market: "সদর বাজার", div: "রাজশাহী", min: lowestPrice + 1, max: highestPrice - 7, avg: Math.round((lowestPrice + 1 + highestPrice - 7) / 2) },
                      { market: "বাজারহাট", div: "খুলনা", min: lowestPrice + 1, max: highestPrice - 6, avg: Math.round((lowestPrice + 1 + highestPrice - 6) / 2) },
                      { market: "বাসারহাট বাজার", div: "রাজশাহী", min: lowestPrice + 1, max: highestPrice - 5, avg: Math.round((lowestPrice + 1 + highestPrice - 5) / 2) },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition">
                        <td className="p-3.5 border-r border-gray-200 font-semibold">{item.market}</td>
                        <td className="p-3.5 border-r border-gray-200">{item.div}</td>
                        <td className="p-3.5 border-r border-gray-200 text-right">{toBnNum(item.min)} টাকা</td>
                        <td className="p-3.5 border-r border-gray-200 text-right">{toBnNum(item.max)} টাকা</td>
                        <td className="p-3.5 text-right font-bold">{toBnNum(item.avg)} টাকা</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}