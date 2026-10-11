"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { ShoppingCart, ChevronDown, LogOut, User } from "lucide-react";

// Category Data Interface
interface Category {
  id?: string | number;
  category_id?: string | number;
  name?: string;
  category_name?: string;
  icon?: string;
  image?: string;
}

// Price Ticker Mock Data
const tickerItems = [
  { name: "নাজিরশাইল চাল", price: "৭৫ টি/কেজি", change: "+২.৫%", isUp: true, icon: "🍚" },
  { name: "মসুর ডাল", price: "১৩০ টি/কেজি", change: "-১.২%", isUp: false, icon: "🫘" },
  { name: "সয়াবিন তেল", price: "১৬৫ টি/লিটার", change: "+০.৫%", isUp: true, icon: "🛢️" },
  { name: "দেশি পেঁয়াজ", price: "৮৫ টি/কেজি", change: "-৩.০%", isUp: false, icon: "🧅" },
  { name: "রুই মাছ", price: "৩৫০ টি/কেজি", change: "+১.৮%", isUp: true, icon: "🐟" },
  { name: "ব্রয়লার মুরগি", price: "১৭০ টি/কেজি", change: "-২.১%", isUp: false, icon: "🍗" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | number>("");
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>("");

  // Dynamic Date Formatting (Bangla)
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

  // Fetch Categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("https://openapi.programming-hero.com/api/bazardor/categories");
        const data = await res.json();
        const categoryList: Category[] = data.data || data.categories || data || [];
        
        setCategories(categoryList);
        
        if (categoryList.length > 0) {
          const firstId = categoryList[0].id || categoryList[0].category_id || "";
          setActiveCategory(firstId);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* 1. Top Bar: Logo & Auth Section */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo + Dynamic Bangla Date */}
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

        {/* Right: Auth Buttons or Profile Dropdown */}
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

      {/* 2. Middle Row: Category Navigation */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1 sm:gap-2 py-2">
            {loading ? (
              <div className="flex gap-3 py-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              categories.map((cat, idx) => {
                const catId = cat.id || cat.category_id || idx;
                const catName = cat.name || cat.category_name || "Category";
                const isActive = activeCategory === catId;

                return (
                  <button
                    key={catId}
                    onClick={() => setActiveCategory(catId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      isActive
                        ? "bg-white text-emerald-700 shadow-sm border border-emerald-100 font-semibold"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.image && <img src={cat.image} alt={catName} className="w-4 h-4 object-contain" />}
                    <span>{catName}</span>
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </div>

      {/* 3. Bottom Row: Price Ticker (Marquee) */}
      <div className="bg-gray-900 text-white py-2 overflow-hidden border-t border-gray-800">
        <div className="animate-marquee flex gap-8 items-center text-xs">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <span>{item.icon}</span>
              <span className="font-medium text-gray-200">{item.name}</span>
              <span className="text-gray-400 font-mono">{item.price}</span>
              <span className={`font-semibold ${item.isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {item.isUp ? "▲" : "▼"} {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}