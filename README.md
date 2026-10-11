<div align="center">

# 🧺 BazarDor (বাজার দর)

**দৈনিক নিত্যপ্রয়োজনীয় পণ্যের বাজার দর এক নজরে**

Track, compare, and browse daily commodity prices across markets in Bangladesh.

[![Live Site](https://img.shields.io/badge/Live-a07--ph.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://a07-ph.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

</div>

---

## 📌 Overview

BazarDor shows market prices for everyday essentials like rice, lentils, oil, vegetables, fish, meat, eggs, and spices. You can check the minimum, maximum, and average price across markets (Karwan Bazar, Mirpur, Chittagong, Rajshahi, Khulna, Sylhet and more), see how prices moved today, and manage your own profile.

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 📊 | **Live price ticker** | Infinite marquee in the header with ▲ / ▼ percentage changes |
| 🗂️ | **Category browsing** | Filters driven by API data, with a highlighted active state |
| 🔢 | **Bengali-aware sorting** | Parses Bengali numerals (০-৯) so Low → High and High → Low actually work |
| 🔒 | **Protected product pages** | `/product/[slug]` shows market tables, division-wise spans, and Min / Max / Avg |
| 🔑 | **Authentication** | BetterAuth with Email/Password, Google, and GitHub login |
| 👤 | **Profile management** | `/profile` and `/profile/edit` using BetterAuth's `updateUser`, with instant UI updates |

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript / JavaScript |
| Styling | Tailwind CSS v4 |
| Auth | BetterAuth (Email/Password + OAuth) |
| Icons | Lucide React, inline SVGs |
| Notifications | React Hot Toast |
| Deployment | Vercel |

## 🚀 Getting Started

**1. Clone the repo**

```bash
git clone https://github.com/your-username/bazardor.git
cd bazardor
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:

```env
BETTER_AUTH_SECRET=your_generated_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Social auth (optional for local testing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**4. Run the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're set.

## 📂 Folder Structure

```plaintext
src/
├── app/
│   ├── category/[slug]/page.tsx   # Category view with sorting and skeletons
│   ├── login/page.tsx             # Sign in with social auth
│   ├── register/page.tsx          # Sign up
│   ├── product/[slug]/page.tsx    # Protected product details and price table
│   ├── profile/
│   │   ├── edit/page.tsx          # Update profile info
│   │   └── page.tsx               # Profile overview
│   ├── layout.tsx                 # Root layout
│   ├── not-found.tsx              # Global 404
│   └── page.tsx                   # Home (hero, risers/fallers, all products)
├── components/
│   ├── Navbar.tsx                 # Top bar, category strip, ticker marquee
│   └── Footer.tsx                 # Footer matching the Penpot/Figma design
└── lib/
    └── auth-client.ts             # BetterAuth client setup and helpers
```

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

<div align="center">

Made with ❤️ in Bangladesh

</div>
