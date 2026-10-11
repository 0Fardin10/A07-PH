import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-4 px-4 sm:px-6 lg:px-8 font-sans mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs sm:text-sm font-medium text-gray-800">
        
        {/* Left: বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে। */}
        <div>
          বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
        </div>

        {/* Right: সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়। */}
        <div className="text-gray-600">
          সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
        </div>

      </div>
    </footer>
  );
} 