This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# 🛒 বাজার দর (BazarDor) — Daily Commodity Market Tracker

**BazarDor** (বাজার দর) is a full-stack, responsive web application built with **Next.js 16 (Turbopack)**, **Tailwind CSS v4**, and **BetterAuth**. It tracks daily commodity prices across Bangladeshi markets, offering real-time updates, price change analytics, and category-wise price comparisons with precision UI matching Penpot designs.

---

## 🛠️ Technologies Used

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
- **Authentication**: [BetterAuth](https://better-auth.com/) (Email/Password + Session Management)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toast Notifications**: [react-hot-toast](https://react-hot-toast.com/)
- **Language**: TypeScript & React 19

---

## ✨ 5 Key Features

1. **📊 Real-time Price Analytics & Direction**: Displays current market prices with price trend badges (`▲` Price Rose, `▼` Price Dropped, `—` Unchanged) along with exact percentage changes.
2. **🔐 Protected Product Detail Routes**: Secure access to market-wise price breakdown tables and min/max/average price statistics with interactive toast notifications for unauthorized visitors.
3. **🔤 Smart Bengali Numerals Sorting**: Sorting dropdown ("সাজান") with Chevron icon supporting price sort (Low to High / High to Low) by parsing Bengali numerals accurately.
4. **📱 Fully Responsive Penpot UI/UX**: Mobile-first responsive layout including horizontal scrolling category pills, interactive ticker bar, and custom 404 page.
5. **👤 Profile Information Update**: Dynamic user profile management integrated with BetterAuth `updateUser` API for instant global state updates.

---

## 🚀 Getting Started Locally

```bash
# Clone repository
git clone [https://github.com/your-username/bazar-know.git](https://github.com/your-username/bazar-know.git)

# Install dependencies
npm install

# Run development server
npm run dev