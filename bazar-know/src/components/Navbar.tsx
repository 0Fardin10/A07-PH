"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { ShoppingCart, ChevronDown, LogOut, User } from "lucide-react";

// Category interface strictly matching the API schema
interface Category {
  id?: string;
  slug?: string;
  nameBn?: string;
  name?: string;
  icon?: string;
}

// Product interface strictly matching the API schema
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
    dir: "up" | "down" | string;
    pct: number;
  };
}

// Fallback categories matching the exact API payload
const fallbackCategories: Category[] = [
  { id: "chal", slug: "chal", nameBn: "চাল", icon: "🍚" },
  { id: "dal", slug: "dal", nameBn: "ডাল", icon: "🫘" },
  { id: "tel", slug: "tel", nameBn: "তেল", icon: "🛢️" },
  { id: "sobji", slug: "sobji", nameBn: "সবজি", icon: "🥬" },
  { id: "mach", slug: "mach", nameBn: "মাছ", icon: "🐟" },
  { id: "mangsho", slug: "mangsho", nameBn: "মাংস", icon: "🍗" },
  { id: "dim-dui", slug: "dim-dui", nameBn: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", slug: "mosla", nameBn: "মসলা", icon: "🌶️" },
];

// Fallback products matching the API payload
const fallbackTicker: Product[] = [
  { id: 1, slug: "chal", nameBn: "স্বর্ণমাছি চাল", category: "chal", categoryNameBn: "চাল", unit: "kg", image: "🍚", today: 148, yesterday: 145, lastWeek: 142, lastMonth: 138, change: { dir: "up", pct: 2.1 } },
  { id: 2, slug: "dal", nameBn: "মসুর ডাল", category: "dal", categoryNameBn: "ডাল", unit: "kg", image: "🫘", today: 130, yesterday: 132, lastWeek: 135, lastMonth: 130, change: { dir: "down", pct: 1.2 } },
  { id: 3, slug: "tel", nameBn: "সয়াবিন তেল", category: "tel", categoryNameBn: "তেল", unit: "L", image: "🛢️", today: 165, yesterday: 164, lastWeek: 160, lastMonth: 155, change: { dir: "up", pct: 0.5 } },
  { id: 4, slug: "peyaj", nameBn: "দেশি পেঁয়াজ", category: "vegetables", categoryNameBn: "সবজি", unit: "kg", image: "🧅", today: 85, yesterday: 88, lastWeek: 90, lastMonth: 95, change: { dir: "down", pct: 3.0 } },
  { id: 5, slug: "mach", nameBn: "রুই মাছ", category: "fish", categoryNameBn: "মাছ", unit: "kg", image: "🐟", today: 350, yesterday: 344, lastWeek: 340, lastMonth: 330, change: { dir: "up", pct: 1.8 } },
  { id: 6, slug: "murgi", nameBn: "ব্রয়লার মুরগি", category: "meat", categoryNameBn: "মাংস", unit: "kg", image: "🍗", today: 170, yesterday: 174, lastWeek: 180, lastMonth: 175, change: { dir: "down", pct: 2.1 } },
  { id: 7, slug: "alu", nameBn: "আলু", category: "vegetables", categoryNameBn: "সবজি", unit: "kg", image: "🥔", today: 55, yesterday: 55, lastWeek: 52, lastMonth: 50, change: { dir: "up", pct: 0.0 } },
  { id: 8, slug: "rosun", nameBn: "রসুন", category: "spices", categoryNameBn: "মসলা", unit: "kg", image: "🧄", today: 210, yesterday: 207, lastWeek: 200, lastMonth: 190, change: { dir: "up", pct: 1.5 } },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickerProducts, setTickerProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("chal");
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>("");

  // Dynamic Bangla Date
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

  // Fetch Category Data from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/categories");
        const data = await res.json();
        const categoryList: Category[] = Array.isArray(data) ? data : data.data || data.categories || [];

        if (categoryList.length > 0) {
          setCategories(categoryList);
          setActiveCategory(categoryList[0].id || categoryList[0].slug || "chal");
        } else {
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories(fallbackCategories);
      } finally {
        setLoadingCategory(false);
      }
    }

    fetchCategories();
  }, []);

  // Fetch First 8 Products from API for Ticker Marquee
  useEffect(() => {
    async function fetchTickerProducts() {
      try {
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const data = await res.json();
        
        const rawProducts: Product[] = Array.isArray(data) ? data : data.data || data.products || [];
        const first8Products = rawProducts.slice(0, 8);

        if (first8Products.length > 0) {
          setTickerProducts(first8Products);
        } else {
          setTickerProducts(fallbackTicker);
        }
      } catch (error) {
        console.error("Failed to load ticker products:", error);
        setTickerProducts(fallbackTicker);
      }
    }

    fetchTickerProducts();
  }, []);

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;
  const displayTicker = (tickerProducts.length > 0 ? tickerProducts : fallbackTicker).slice(0, 8);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <style>{`
        @keyframes marqueeAnim {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: marqueeAnim 22s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md group-hover:bg-emerald-700 transition">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">বাজার দর</h1>
            <p className="text-xs text-gray-500 font-medium capitalize">
              {currentDate || "তারিখ লোড হচ্ছে..."}
            </p>
          </div>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer">
                <img
                  src={session.user.image || "https://avatar.iran.liara.run/public"}
                  alt={session.user.name || "User Profile"}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <span className="text-sm font-semibold text-gray-700 hidden sm:inline-block">
                  {session.user.name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100 mt-2 z-[1]">
                <li className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{session.user.email}</p>
                </li>
                <li>
                  <Link href="/profile" className="flex items-center gap-2 py-2 text-gray-700">
                    <User className="w-4 h-4" /> প্রোফাইল
                  </Link>
                </li>
                <li>
                  <button onClick={() => signOut()} className="flex items-center gap-2 py-2 text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> লগ আউট
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm text-gray-700 hover:bg-gray-100 font-medium">
                সাইন ইন
              </Link>
              <Link href="/register" className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-none shadow-sm">
                সাইন আপ
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Row: Dynamic Categories using `nameBn` and `icon` */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1 sm:gap-2 py-2">
            {loadingCategory ? (
              <div className="flex gap-3 py-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              displayCategories.map((cat, idx) => {
                const catId = cat.id || cat.slug || idx;
                const catName = cat.nameBn || cat.name || "";
                const isActive = activeCategory === catId;

                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? "bg-white text-emerald-700 shadow-sm border border-emerald-200 font-semibold"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{catName}</span>
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </div>

      {/* 3. Bottom Row: Infinite Marquee Ticker displaying the first 8 Products */}
      <div className="bg-[#111827] text-white py-2.5 overflow-hidden border-t border-gray-800 w-full">
        <div className="ticker-track flex gap-10 items-center text-xs tracking-wide">
          {[...displayTicker, ...displayTicker, ...displayTicker].map((item, idx) => {
            const isUp = item.change?.dir === "up";
            const sign = isUp ? "+" : "-";
            const icon = item.image || item.categoryIcon || "🛒";

            return (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <span>{icon}</span>
                <span className="font-semibold text-gray-200">{item.nameBn}</span>
                <span className="text-gray-400 font-mono">{item.today} টি/{item.unit}</span>
                <span className={`font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isUp ? "▲" : "▼"} {sign}{item.change?.pct ?? 0}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}