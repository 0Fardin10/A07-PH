"use client";

import React, { useEffect, useState, useRef, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  id: string | number;
  nameBn: string;
  unit?: string;
  today?: number | string;
  change?: {
    dir: "up" | "down" | "flat" | string;
    pct?: number | string;
  };
}

const toBnNum = (num: number | string | undefined) => {
  const value = Number(num);
  return Number.isFinite(value) ? value.toLocaleString("bn-BD") : "০";
};

function getApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const data = payload as { data?: unknown; products?: unknown };
  if (Array.isArray(data.data)) return data.data as T[];
  if (Array.isArray(data.products)) return data.products as T[];
  return [];
}

async function fetchApiList<T>(url: string, signal: AbortSignal): Promise<T[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return getApiList<T>(await response.json());
}

const subscribeToDate = () => () => {};
const getCurrentDate = () =>
  new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const getServerDate = () => "";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "chal", slug: "chal", nameBn: "চাল", icon: "🍚" },
  { id: "dal", slug: "dal", nameBn: "ডাল", icon: "🫘" },
  { id: "tel", slug: "tel", nameBn: "তেল", icon: "🛢️" },
  { id: "sobji", slug: "sobji", nameBn: "সবজি", icon: "🥬" },
  { id: "mach", slug: "mach", nameBn: "মাছ", icon: "🐟" },
  { id: "mangsho", slug: "mangsho", nameBn: "মাংস", icon: "🍗" },
  { id: "dim-dui", slug: "dim-dui", nameBn: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", slug: "mosla", nameBn: "মসলা", icon: "🌶️" },
];

function NavbarContent() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tickerProducts, setTickerProducts] = useState<Product[]>([]);
  const currentDate = useSyncExternalStore(subscribeToDate, getCurrentDate, getServerDate);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localUser, setLocalUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Set Bengali date and keep the local auth fallback in sync with app events.
  useEffect(() => {
    function syncLocalUser() {
      const stored = localStorage.getItem("bazardor_user");
      if (!stored) {
        setLocalUser(null);
        return;
      }

      try {
        const parsed: unknown = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          const user = parsed as { name?: unknown; email?: unknown; image?: unknown };
          setLocalUser({
            name: typeof user.name === "string" ? user.name : undefined,
            email: typeof user.email === "string" ? user.email : undefined,
            image: typeof user.image === "string" ? user.image : undefined,
          });
          return;
        }
      } catch {
        // Ignore malformed local fallback data.
      }
      setLocalUser(null);
    }

    syncLocalUser();
    window.addEventListener("storage", syncLocalUser);
    window.addEventListener("auth-change", syncLocalUser);
    return () => {
      window.removeEventListener("storage", syncLocalUser);
      window.removeEventListener("auth-change", syncLocalUser);
    };
  }, []);

  // Fetch categories and ticker data independently so one failure does not hide the other.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchNavData() {
      const results = await Promise.allSettled([
        fetchApiList<Category>("https://openapi.programming-hero.com/api/bazardor/categories", controller.signal),
        fetchApiList<Product>("https://openapi.programming-hero.com/api/bazardor/products", controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const [categoryResult, productResult] = results;
      if (categoryResult.status === "fulfilled" && categoryResult.value.length > 0) {
        setCategories(categoryResult.value);
      } else if (categoryResult.status === "rejected") {
        console.error("Failed to fetch categories:", categoryResult.reason);
      }

      if (productResult.status === "fulfilled") {
        setTickerProducts(productResult.value);
      } else {
        console.error("Failed to fetch ticker products:", productResult.reason);
      }
    }

    fetchNavData();
    return () => controller.abort();
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            localStorage.removeItem("bazardor_user");
            window.dispatchEvent(new Event("storage"));
            toast.success("লগআউট সফল হয়েছে!");
          },
          onError: (context) => {
            console.error("Sign-out failed:", context.error);
            toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন!");
          },
        },
      });
    } catch (error) {
      console.error("Sign-out failed:", error);
      toast.error("সাইন আউট করা যায়নি। আবার চেষ্টা করুন!");
    }
  };

  const activeUser = session?.user || localUser;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm font-sans">
      
      {/* Top Header */}
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

        {/* Profile / Auth Area */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {isPending && !activeUser ? (
            <div className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse"></div>
          ) : activeUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-controls="navbar-user-menu"
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
                  {activeUser.name || activeUser.email?.split("@")[0] || "প্রোফাইল"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div id="navbar-user-menu" className="absolute right-0 mt-2 w-64 bg-[#FAFDFB] rounded-[22px] shadow-xl border border-gray-100/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-gray-100/80 bg-white">
                    <h4 className="text-sm font-extrabold text-gray-900 leading-snug">
                      {activeUser.name || "প্রোফাইল"}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                      {activeUser.email || ""}
                    </p>
                  </div>

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

      {/* Category Nav Pills */}
      <div className="bg-[#FAFDFB] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
            {categories.map((cat) => {
              const isActive = pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-[#0E7A42] hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  <span>{cat.icon || "🛒"}</span>
                  <span>{cat.nameBn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticker Bar */}
      <div className="bg-[#0B1712] text-white text-xs py-2 overflow-hidden relative">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {tickerProducts.map((p, index) => {
            const isUp = p.change?.dir === "up";
            const isDown = p.change?.dir === "down";
            return (
              <div key={`${p.id}-${index}`} className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-gray-200">{p.nameBn || "পণ্য"}</span>
                <span className="text-gray-400">{toBnNum(p.today)} টা/{p.unit || "কেজি"}</span>
                {isUp ? (
                  <span className="text-[#4ADE80] font-bold flex items-center gap-0.5">
                    ▲ +{toBnNum(p.change?.pct || 0)}%
                  </span>
                ) : isDown ? (
                  <span className="text-[#F87171] font-bold flex items-center gap-0.5">
                    ▼ -{toBnNum(Math.abs(Number(p.change?.pct) || 0))}%
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

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100"></div>}>
      <NavbarContent />
    </Suspense>
  );
}