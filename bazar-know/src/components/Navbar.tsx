"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { User, ChevronDown, LogOut } from "lucide-react";

interface Category {
  id: string | number;
  nameBn: string;
  slug: string;
  icon?: string;
}

interface Product {
  id: number;
  nameBn: string;
  unit: string;
  today: number;
  change: {
    dir: "up" | "down" | "flat" | string;
    pct: number;
  };
}

const toBnNum = (num: number | string) => {
  if (num === undefined || num === null) return "০";
  return Number(num).toLocaleString("bn-BD");
};

export default function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tickerProducts, setTickerProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localUser, setLocalUser] = useState<{ name: string; email: string; image?: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set Bengali Date & Local User Backup
  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formatted);

    const stored = localStorage.getItem("bazardor_user");
    if (stored) {
      try {
        setLocalUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Fetch Categories & Products
  useEffect(() => {
    async function fetchNavData() {
      try {
        const catRes = await fetch("https://openapi.programming-hero.com/api/bazardor/categories");
        const catData = await catRes.json();
        const rawCategories = Array.isArray(catData) ? catData : catData.data || [];
        setCategories(rawCategories);

        const prodRes = await fetch("https://openapi.programming-hero.com/api/bazardor/products");
        const prodData = await prodRes.json();
        const rawProducts = Array.isArray(prodData) ? prodData : prodData.data || prodData.products || [];
        setTickerProducts(rawProducts);
      } catch (error) {
        console.error("Failed to fetch nav data:", error);
      }
    }

    fetchNavData();
  }, []);

  // 100% Reliable Logout Handler
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            localStorage.removeItem("bazardor_user");
            toast.success("লগআউট সফল হয়েছে!");
            window.location.href = "/";
          },
        },
      });
    } catch (e) {
      localStorage.removeItem("bazardor_user");
      toast.success("লগআউট সফল হয়েছে!");
      window.location.href = "/";
    }
  };

  const activeUser = session?.user || localUser;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm font-sans">
      
      {/* 1. Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Date */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo-icon.png"
              alt="বাজার দর"
              className="w-10 h-10 object-contain rounded-xl group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-black text-gray-900 tracking-tight block leading-tight">
                বাজার দর
              </span>
              <span className="text-[10px] text-gray-400 font-medium block">
                {currentDate || "রবিবার, ১১ অক্টোবর, ২০২৬"}
              </span>
            </div>
          </Link>
        </div>

        {/* Auth Area with Profile Dropdown */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {isPending && !activeUser ? (
            <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse"></div>
          ) : activeUser ? (
            /* Logged-in Profile Button */
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer py-1 px-2 rounded-lg text-left"
              >
                {activeUser.image ? (
                  <img
                    src={activeUser.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-bold text-gray-800">
                  {activeUser.name || activeUser.email?.split("@")[0] || "Rezwan"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Popover Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAFDFB] rounded-[22px] shadow-xl border border-gray-100/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Dropdown Header */}
                  <div className="p-4 border-b border-gray-100/80 bg-white">
                    <h4 className="text-sm font-extrabold text-gray-900 leading-snug">
                      {activeUser.name || "Rezwan Ahmed"}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                      {activeUser.email || "rezwanahmed@gmail.com"}
                    </p>
                  </div>

                  {/* Dropdown Items */}
                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-100/70 text-xs font-bold text-gray-800 transition group"
                    >
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>আমার প্রোফাইল</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-xs font-bold text-rose-600 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>সাইন আউট</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-bold text-gray-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition"
              >
                সাইন ইন
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
              >
                সাইন আপ
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* 2. Category Nav Pills */}
      <div className="bg-[#FAFDFB] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200/80"
                    }`}
                  >
                    <span>{cat.icon || "🛒"}</span>
                    <span>{cat.nameBn}</span>
                  </button>
                );
              })
            ) : (
              [
                { name: "চাল", icon: "🍚" },
                { name: "ডাল", icon: "🫘" },
                { name: "তেল", icon: "🫙" },
                { name: "সবজি", icon: "🥦" },
                { name: "মাছ", icon: "🐟" },
                { name: "মাংস", icon: "🍗" },
                { name: "ডিম-দুধ", icon: "🥚" },
                { name: "মসলা", icon: "🌶️" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-2 bg-white border border-gray-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition shrink-0"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Ticker Bar */}
      <div className="bg-[#0B1712] text-white text-xs py-2 overflow-hidden relative">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {tickerProducts.map((p, index) => {
            const isUp = p.change?.dir === "up";
            const isDown = p.change?.dir === "down";
            return (
              <div key={`${p.id}-${index}`} className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-gray-200">{p.nameBn}</span>
                <span className="text-gray-400">{toBnNum(p.today)} টা/{p.unit || "কেজি"}</span>
                {isUp ? (
                  <span className="text-[#4ADE80] font-bold flex items-center gap-0.5">
                    ▲ +{toBnNum(p.change?.pct || 0)}%
                  </span>
                ) : isDown ? (
                  <span className="text-[#F87171] font-bold flex items-center gap-0.5">
                    ▼ -{toBnNum(p.change?.pct || 0)}%
                  </span>
                ) : (
                  <span className="text-gray-400 font-bold">— 0%</span>
                )}
                <span className="text-gray-700 ml-4">|</span>
              </div>
            );
          })}
        </div>
      </div>

    </header>
  );
}