# ThePathak.tech

> **Technology • Science • Code • Ideas • Words**  
> *Editorial Philosophy: Interpretation over repetition.*

**ThePathak.tech** is an independent, database-backed editorial publishing platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, **Neon PostgreSQL**, and **Auth.js (NextAuth.js v5)**.

---

## 🛠 Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, Server Components default)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide Icons, `next-themes` (Light/Dark/System)
- **Database**: Neon PostgreSQL (Serverless PostgreSQL)
- **ORM**: Prisma ORM v6 (`@prisma/client` & `@auth/prisma-adapter`)
- **Authentication**: Auth.js (NextAuth.js v5) with Credentials & JWT session management
- **Rich Text & MDX Engine**: Tiptap Editor for CMS, `@next/mdx` / `next-mdx-remote` for article rendering, `shiki` syntax highlighting

---

## 🔑 Environment Variables (.env / .env.local)

Make sure your environment variables are configured before running locally or deploying to production:

```env
# 1. Neon PostgreSQL Database Connection Strings
DATABASE_URL="postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. Auth.js / NextAuth.js Security & Domain Config
AUTH_SECRET="a8f3b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
AUTH_URL="https://thepathak.tech"
AUTH_TRUST_HOST="true"
```

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Sync database schema & generate Prisma client
npx prisma db push
npx prisma generate

# 3. Seed initial categories, tags, sample articles, and Admin user
npx tsx prisma/seed.ts

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Deploying to Vercel (Recommended)

### Option A: Via GitHub & Vercel Web Dashboard

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare production build for deployment"
   git push origin main
   ```

2. **Import repository in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `thepathak-tech` repository.
   - Framework Preset: **Next.js**.

3. **Add Environment Variables in Vercel Project Settings**:
   Add the following 5 variables under **Settings -> Environment Variables**:

   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
   | `DIRECT_URL` | `postgresql://neondb_owner:npg_4jEXpR6wSmyL@ep-steep-art-azco3ot1.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
   | `AUTH_SECRET` | `a8f3b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0` |
   | `AUTH_URL` | `https://thepathak.tech` *(or your Vercel URL)* |
   | `AUTH_TRUST_HOST` | `true` |

4. **Deploy**:
   Click **Deploy**. Vercel will run `npm run build` (`prisma generate && next build`), and your site will be live!

---

### Option B: Via Vercel CLI

Run the following command in your terminal:

```bash
npx vercel
```

Follow the prompts to link your Vercel project, then deploy to production:

```bash
npx vercel --prod
```

---

## 🔑 Default Admin Credentials

To access the private Writer Studio CMS (`/studio`):

- **Email**: `prasoon7pathak@gmail.com`
- **Password**: `@paThakMahi77`
- **Role**: `ADMIN`

---

## 📄 License

© 2026 **ThePathak.tech**. All rights reserved. Made by [The Pathak](https://www.prasoonpathak7.me/).
