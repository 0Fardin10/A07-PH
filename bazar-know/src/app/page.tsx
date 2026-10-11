import React from "react";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero / Main Banner Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-10 text-white shadow-md mb-8">
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-2">
          সঠিক সময়ে সঠিক পণ্য ও বাজার দর
        </h2>
        <p className="text-emerald-100 text-sm sm:text-base max-w-2xl">
          প্রতিদিনের আপডেটকৃত নিত্যপ্রয়োজনীয় পণ্যের সঠিক দাম জানুন এক ক্লিকেই।
        </p>
      </section>

      {/* Product Grid Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">আজকের নিত্যপণ্য</h3>
      </div>

      {/* Product List Content will be added here next */}
    </main>
  );
}