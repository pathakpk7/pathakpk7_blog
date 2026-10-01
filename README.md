# 🌐 ThePathak.tech

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-thepathak.tech-blue?style=for-the-badge&logo=vercel&logoColor=white)](https://thepathak.tech)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript%205-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon%20Postgres-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

<br />

**Technology • Science • Code • Ideas • Words**  
*Editorial Philosophy: Interpretation over repetition.*

A modern, high-performance, database-backed digital publication and editorial CMS built for deep thinkers, engineers, and creators.

[Explore Platform](https://thepathak.tech) • [Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

**ThePathak.tech** is an independent, production-grade publishing platform engineered with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM**, **Neon PostgreSQL**, and **Tailwind CSS v4**. It pairs an editorial magazine reading experience with a powerful, desktop-class **Writer Studio CMS** featuring draggable split panels, live previews, rich-text/MDX editing, engagement telemetry, and an activity notification system.

---

## ✨ Key Features

### 📰 Reader Experience & Editorial Design
- **Multi-Disciplinary Taxonomy**: Curated discovery channels spanning *Technology*, *Science & Space*, *Coding Tutorials*, *Essays & Ideas*, and *Creative Writing / Microfiction*.
- **Modern Typography Scale**: Fluid, accessible serif & sans-serif editorial layout built for high readability across all screen sizes.
- **Dynamic Theming**: Seamless Light, Dark, and System mode switching powered by `next-themes` with zero flicker.
- **Reading Utility**: Real-time reading duration estimation, table of contents, bookmarking, and interactive reader reactions.
- **Instant Search Engine**: Client-side fuzzy search across articles, tags, authors, and categories with instant highlight rendering.

### ✍️ Writer Studio CMS (Admin Panel)
- **LeetCode-Style Draggable Workspace**: Resizable split-pane layout with smooth horizontal click-and-drag controls, double-click reset, snap-to-collapse thresholds, and `localStorage` layout persistence.
- **Rich Text & MDX Power**: Integrated **Tiptap** WYSIWYG editor paired with **Shiki** code block syntax highlighting for developer articles.
- **Editorial Workflow Management**: Comprehensive post lifecycle tracking (`DRAFT`, `REVIEW`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED`).
- **Media & Metadata Management**: Slug generation, cover image management, custom excerpt configuration, and tag taxonomy associations.

### 🔔 Activity & Notifications System
- **Real-Time Timestamps**: Relative elapsed interaction timestamps (*"a moment ago"*, *"5 mins ago"*, *"2 hours ago"*, *"3 days ago"*) combined with precise date-time tooltips.
- **Aggregated Engagement Feed**: Batch interaction modals for article claps, reader comments, mentions, and administrative alerts.

### 🛡️ Authentication & Enterprise Architecture
- **Auth.js (NextAuth.js v5)**: Secure credentials and token-based authentication with bcrypt password hashing and session management via `@auth/prisma-adapter`.
- **Role-Based Access Control (RBAC)**: Strict separation of privileges between reader accounts and administrative content managers.
- **Serverless PostgreSQL**: Scalable connection pooling and direct migration channels powered by **Neon Serverless Postgres**.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) | App Router, Server Actions, Server Components & Streaming |
| **UI Library** | [React 19](https://react.dev/) | Concurrent rendering, modern hooks, and action hooks |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type checking and end-to-end interface contracts |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS-first configuration, utilities, and animations |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Smooth UI transitions and interaction micro-animations |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless cloud PostgreSQL with connection pooling |
| **ORM** | [Prisma v6](https://www.prisma.io/) | Type-safe database queries, schema migrations, and seeding |
| **Authentication** | [Auth.js v5](https://authjs.dev/) | Session handling, OAuth providers & JWT encryption |
| **Editor** | [Tiptap](https://tiptap.dev/) | Headless, extensible rich-text & markdown editor engine |
| **Syntax Highlighting** | [Shiki](https://shiki.style/) / Lowlight | Accurate, beautiful code syntax highlighting |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, clean modern iconography |
| **Deployment** | [Vercel](https://vercel.com/) | Edge network, serverless functions, and CI/CD pipelines |

---

## 📂 Project Structure

```text
├── app/
│   ├── (auth)/             # Authentication views (Login, Sign-up, Recovery)
│   ├── (public)/           # Public-facing reader pages (Home, Sections, Articles)
│   ├── actions/            # Next.js Server Actions (Posts, Comments, Reactions)
│   ├── api/                # API route handlers (Auth, Search, Webhooks)
│   ├── studio/             # Private Writer Studio CMS workspace
│   ├── layout.tsx          # Root HTML layout with providers & metadata
│   └── globals.css         # Global Tailwind CSS v4 variables & base styles
├── components/
│   ├── editor/             # Tiptap CMS rich-text editor components
│   ├── layout/             # Header, Footer, Navigation & theme switches
│   ├── notifications/      # Real-time activity bell, dropdowns & modal views
│   ├── studio/             # Draggable sidebar, CMS dashboards & resizer
│   └── ui/                 # Reusable primitive UI components
├── lib/
│   ├── auth.ts             # Auth.js / NextAuth configuration & options
│   ├── prisma.ts           # Prisma client singleton instance
│   ├── utils.ts            # Formatting utilities (time, dates, class merging)
│   └── validations.ts      # Zod request validation schemas
├── prisma/
│   ├── schema.prisma       # Database schema models (Users, Posts, Comments, etc.)
│   └── seed.ts             # Database seeder for sample data & initial admin
├── public/                 # Static assets, branding, and images
├── .env.example            # Environment variables configuration template
└── package.json            # Project manifest, dependencies, and scripts
```

---

## 🚀 Quick Start

Follow these steps to set up the project locally for development:

### 1. Prerequisites

- **Node.js**: `v18.18.0` or higher
- **npm** / **pnpm** / **yarn**
- A **PostgreSQL database** (Local Postgres or free cloud instance on [Neon](https://neon.tech))

### 2. Clone the Repository

```bash
git clone https://github.com/pathakpk7/pathakpk7_blog.git
cd pathakpk7_blog
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create your local `.env.local` file by copying the provided template:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your database and authentication secrets:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>/<DATABASE>?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://<USER>:<PASSWORD>@<HOST>/<DATABASE>?sslmode=require"

# Auth.js Security
AUTH_SECRET="generate-a-secure-32-char-secret-key"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

> 💡 **Tip:** You can generate a strong `AUTH_SECRET` in your terminal using:
> ```bash
> openssl rand -base64 32
> # or
> npx auth secret
> ```

### 5. Initialize the Database

Run Prisma migrations to create the database tables and seed initial categories and sample articles:

```bash
# Push schema to database
npm run db:push

# Generate Prisma Client
npx prisma generate

# Seed sample data & admin account
npm run db:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser to view the live site.

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Connection-pooled database URL for runtime queries | `postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require` |
| `DIRECT_URL` | **Yes** | Direct connection URL for migrations & schema pushes | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `AUTH_SECRET` | **Yes** | Encryption key used by Auth.js to sign session JWTs | `32+ character random string` |
| `AUTH_URL` | **Yes** | Base domain URL of the deployed application | `https://thepathak.tech` *(or `http://localhost:3000`)* |
| `AUTH_TRUST_HOST` | **Yes** | Set to `true` when running behind reverse proxies / Vercel | `true` |
| `AUTH_GOOGLE_ID` | *No* | Google OAuth Client ID for social sign-in | `client-id.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | *No* | Google OAuth Client Secret | `GOCSPX-secret` |
| `AUTH_GITHUB_ID` | *No* | GitHub OAuth App Client ID | `Iv1.xxxxxxxxxxxx` |
| `AUTH_GITHUB_SECRET`| *No* | GitHub OAuth App Client Secret | `github-client-secret` |

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Generates Prisma client and creates an optimized production build |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs Next.js ESLint validation across all source files |
| `npm run db:push` | Synchronizes the Prisma schema with the database directly |
| `npm run db:migrate` | Applies and records Prisma schema migrations |
| `npm run db:seed` | Seeds database categories, tags, sample posts, and admin account |

---

## 🚀 Deployment

The easiest way to deploy **ThePathak.tech** is with **[Vercel](https://vercel.com)**:

### Deploy via GitHub & Vercel Dashboard

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In the **Environment Variables** panel, add the variables listed in the [Environment Variables Reference](#️-environment-variables-reference).
4. Click **Deploy**. Vercel will automatically build and deploy the production bundle.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License & Credits

Distributed under the **MIT License**. See `LICENSE` for more information.

Designed & built by **[Prasoon Pathak](https://www.prasoonpathak7.me/)**.  
For inquiries, visit **[thepathak.tech](https://thepathak.tech)** or reach out via [GitHub](https://github.com/pathakpk7).
