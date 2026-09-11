# ThePathak.tech

> **Technology • Science • Code • Ideas • Words**  
> *Editorial Philosophy: Interpretation over repetition.*

**ThePathak.tech** is an independent, database-backed editorial publishing platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, **Neon PostgreSQL**, and **Auth.js (NextAuth.js v5)**.

It provides a polished public reading experience, native Hindi/Devanagari creative writing support, instant site-wide search (`Cmd+K`), a user library for bookmarks and reading history, and a private Writer Studio CMS (`/studio`) for authoring, editing, previewing, scheduling, moderating, and analyzing publications.

---

## 🛠 Tech Stack & Architecture

```text
                       THEPATHAK.TECH
                              │
                           Next.js
                              │
               ┌──────────────┴──────────────┐
               │                             │
            Auth.js                       Prisma
               │                             │
        Authentication                PostgreSQL
               │                             │
               │                           Neon
               │                             │
               └──────────────┬──────────────┘
                              │
                         Application
```

- **Framework**: Next.js 15 (App Router, Server Components default)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons, `next-themes` (Light/Dark/System)
- **Database**: Neon PostgreSQL (Serverless PostgreSQL)
- **ORM**: Prisma ORM v6 (`@prisma/client` & `@auth/prisma-adapter`)
- **Authentication**: Auth.js (NextAuth.js v5) with Credentials & JWT session management
- **Rich Text & MDX Engine**: Tiptap Editor for CMS, `@next/mdx` / `next-mdx-remote` for article rendering, `shiki` syntax highlighting

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.17.0 or higher (v20+ or v24+ recommended)
- **npm**: v9+ (or `pnpm` / `yarn`)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/thepathak-tech.git
cd thepathak-tech
```

---

### 2. Environment Variables Setup

Create a `.env.local` and `.env` file in the root directory:

```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Auth.js / NextAuth.js Configuration
AUTH_SECRET="a8f3b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
AUTH_URL="http://localhost:3000"
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Database Setup & Seeding

Sync the Prisma schema with your Neon PostgreSQL database and generate the Prisma Client:

```bash
# Push schema tables to Neon PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial categories, tags, sample articles, and Admin Author account
npx tsx prisma/seed.ts
```

---

### 5. Run Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Default Admin Credentials

To access the private Writer Studio CMS (`/studio`):

- **Email**: `prasoon7pathak@gmail.com`
- **Password**: `@paThakMahi77`
- **Role**: `ADMIN`

---

## 📚 Features & Routes

### Public Reading Experience
- `/` — Editorial Homepage (Hero manifesto, Featured spotlight, Technology, Science, Coding, Creative, Notes)
- `/technology` — Tech analysis, AI, Web Dev, Dev Tools, Cybersecurity
- `/science` — Science & Space missions, Physics, Astronomy, Discoveries
- `/coding` — Tutorials, Walkthroughs, LeetCode, React 19, Next.js, Roadmaps
- `/ideas` — Personal essays, Focus, Developer Life, Productivity
- `/creative` — Poems, Shayari, Microfiction, Prose (Devanagari Hindi typography support)
- `/notes` — Short-form observations & quick technical thoughts
- `/article/[slug]` — Reading experience with floating action bar (Like, Bookmark, Share), code highlighting, and discussion comments
- `/search` — Multi-field search modal (`Cmd+K` / `Ctrl+K`)
- `/library` — User dashboard for saved Bookmarks, Liked articles, and Reading History
- `/about` — Platform mission and editorial manifesto

### Writer Studio CMS (`/studio`)
- `/studio` — Dashboard metrics (Drafts, Published, Views, Likes, Bookmarks, Comments)
- `/studio/posts` — Article management table with status filtering
- `/studio/posts/new` — Tiptap rich-text editor with live split-screen preview and autosave
- `/studio/posts/[id]/edit` — Edit existing articles
- `/studio/comments` — Comment moderation queue (Approve, Reject, Spam, Delete)
- `/studio/analytics` — Reader pageviews, engagement, and top-performing articles

---

## 📦 Production Build Verification

To test the production build locally:

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

---

## 📄 License

© 2026 **ThePathak.tech**. All rights reserved. Made by [The Pathak](https://thepathak.tech).
