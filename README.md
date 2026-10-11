🧺 BazarDor (বাজার দর)দৈনিক নিত্যপ্রয়োজনীয় পণ্যের বাজার দর এক নজরে — A modern, full-stack web application designed to track, compare, and display daily commodity prices across different markets in Bangladesh.🚀 Live Site: https://a07-ph.vercel.app/📌 OverviewBazarDor (বাজার দর) provides real-time market price updates for essential daily goods like rice, lentils, oil, vegetables, fish, meat, eggs, and spices. It enables users to view minimum, maximum, and average prices across various regional markets (Carwan Bazar, Mirpur, Chittagong, Rajshahi, Khulna, Sylhet, etc.), observe daily price fluctuations, and manage their personalized user profile.✨ Key Features📊 Real-Time Price Ticker & Dynamic Category Browsing:An infinite-scrolling marquee header bar displaying live price changes with directional badges (▲ / ▼ percentage shifts). Responsive category filtering powered directly by API data with highlighted active states.🔢 Bengali-Aware Numeric Sorting (C1):Custom sorting algorithm capable of parsing Bengali numerals (০-৯) to accurately sort commodities by price (Default, Low to High, High to Low) without string-sorting bugs.🔒 Protected Detailed Product Analytics & Market Tables:Authentication-protected detail view (/product/[slug]) featuring market price breakdowns, division-wise price spans, and automated statistical calculations (Min, Max, and Average prices).🔑 Comprehensive Authentication System:Powered by BetterAuth, supporting Email/Password along with Google and GitHub social logins. Features real-time state synchronization across components without requiring full page reloads.👤 Profile Management & Information Updates (C3):Integrated profile route (/profile) with a dedicated update interface (/profile/edit) following BetterAuth's updateUser pattern to seamlessly modify user credentials with instant UI reflection.🛠️ Technologies UsedCategoryTechnology / LibraryFrameworkNext.js 16 (App Router & Turbopack)LanguageTypeScript / JavaScriptStylingTailwind CSS v4AuthenticationBetterAuth (Email/Password + OAuth)Icons & UI ToolsLucide React, Inline SVGsNotificationsReact Hot ToastDeploymentVercel🚀 Getting StartedFollow these steps to run the project locally on your machine:1. Clone the RepositoryBashgit clone https://github.com/your-username/bazardor.git
cd bazardor
2. Install DependenciesBashnpm install
3. Setup Environment VariablesCreate a .env.local file in the root directory and add the following keys:Code snippetBETTER_AUTH_SECRET=your_generated_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Social Auth Credentials (Optional for local testing)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
4. Run the Development ServerBashnpm run dev
Open http://localhost:3000 in your browser to view the application.📂 Folder StructurePlaintextsrc/
├── app/
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx         # Dynamic category view with sorting & skeletons
│   ├── login/
│   │   └── page.tsx             # User Sign-In with Social Auth options
│   ├── register/
│   │   └── page.tsx             # User Sign-Up
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx         # Protected detailed view & market price table
│   ├── profile/
│   │   ├── edit/
│   │   │   └── page.tsx         # Information Update route (C3)
│   │   └── page.tsx             # Profile Overview
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx            # Global 404 Page
│   └── page.tsx                 # Home Page (Hero, Riser/Faller grids, All Products)
├── components/
│   ├── Navbar.tsx               # Top Bar, Category Strip, & Ticker Marquee
│   └── Footer.tsx               # Footer matching Penpot/Figma design
└── lib/
    └── auth-client.ts           # BetterAuth client setup & helper listeners
📄 LicenseDistributed under the MIT License. See LICENSE for more information.
