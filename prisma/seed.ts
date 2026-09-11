import { PrismaClient, Role, PostStatus, ContentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("@paThakMahi77", 10);

  // 1. Find existing Admin user or user with username "pathak"
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "prasoon7pathak@gmail.com" },
        { profile: { username: "pathak" } },
      ],
    },
  });

  let adminUser;
  if (existingUser) {
    adminUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: "prasoon7pathak@gmail.com",
        name: "The Pathak",
        passwordHash: hashedPassword,
        role: Role.ADMIN,
      },
      include: { profile: true },
    });
  } else {
    adminUser = await prisma.user.create({
      data: {
        email: "prasoon7pathak@gmail.com",
        name: "The Pathak",
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        profile: {
          create: {
            username: "pathak",
            displayName: "The Pathak",
            bio: "Lead Software Architect, Writer & Thinker exploring Technology, Science, Code, Ideas, and Words.",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            website: "https://thepathak.tech",
          },
        },
      },
      include: { profile: true },
    });
  }

  console.log(`Admin user set to: ${adminUser.email}`);

  // 2. Create Categories
  const categoriesData = [
    { name: "Technology", slug: "technology", description: "AI, Web Architecture, Dev Tools & Emerging Tech" },
    { name: "Science & Space", slug: "science", description: "Astronomy, Physics & Breakthrough Discoveries" },
    { name: "Coding", slug: "coding", description: "Tutorials, Walkthroughs, Problem Solving & Systems" },
    { name: "Ideas", slug: "ideas", description: "Essays, Focus, Discipline & Student/Developer Life" },
    { name: "Creative", slug: "creative", description: "Poems, Shayari, Microfiction & Literary Expressions" },
    { name: "Notes", slug: "notes", description: "Short-form Observations & Quick Technical Musings" },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created;
  }
  console.log("Categories seeded.");

  // 3. Create Tags
  const tagsData = [
    { name: "AI", slug: "ai" },
    { name: "Web Development", slug: "web-development" },
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Space Missions", slug: "space-missions" },
    { name: "Physics", slug: "physics" },
    { name: "LeetCode", slug: "leetcode" },
    { name: "Poetry", slug: "poetry" },
    { name: "Hindi", slug: "hindi" },
    { name: "Developer Life", slug: "developer-life" },
    { name: "Focus", slug: "focus" },
  ];

  const tags: Record<string, any> = {};
  for (const tag of tagsData) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tags[tag.slug] = created;
  }
  console.log("Tags seeded.");

  // 4. Sample Posts
  const posts = [
    {
      title: "What AI Agents Actually Change for Autonomous Software Systems",
      slug: "what-ai-agents-actually-change",
      subtitle: "Why tool usage and agentic reasoning alter the developer landscape far beyond autocomplete.",
      excerpt: "Instead of asking LLMs to output entire files in one shot, agentic loops allow deterministic self-correction, tool execution, and state verification.",
      content: `
# Beyond Text Completion: The Agentic Shift

For the past two years, developer tools focused on inline autocomplete. You type a function signature, and the model guesses the next three lines. That was **generative assistance**.

What we are witnessing now with autonomous coding agents is a structural shift from **assistance to delegation**.

## Why Tool Calling Changes Everything

Traditional LLM workflows were open-loop:
1. User provides prompt.
2. Model generates string response.
3. User runs code manually and inspects errors.

Agentic systems close the loop:

\`\`\`typescript
interface AgentLoop {
  observe(): EnvironmentState;
  plan(): Action[];
  execute(action: Action): ActionResult;
  verify(result: ActionResult): boolean;
}
\`\`\`

When an agent is equipped with file inspection, terminal execution, and AST evaluation, it stops guessing and starts verifying empirical reality.

> "Interpretation over repetition. An agent that cannot verify its work is just a faster generator of technical debt."

## Practical Implications

- **Architecture First**: Developers will spend less time writing boilerplate and more time establishing rigid domain boundaries and API contracts.
- **Automated Verification**: Test suites and static analyzers are no longer just CI checkpoints—they are the environment feedback mechanisms for AI agents.
`,
      section: "technology",
      categoryId: categories["technology"].id,
      contentType: ContentType.ARTICLE,
      status: PostStatus.PUBLISHED,
      readingTime: 6,
      featured: true,
      publishedAt: new Date(),
      seoTitle: "What AI Agents Actually Change for Developers | ThePathak.tech",
      seoDescription: "An in-depth analysis of agentic AI loops, tool execution, and structural shifts in software engineering.",
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      tags: ["ai", "web-development"],
    },
    {
      title: "Why JWST's Latest Exoplanet Atmospheric Observations Matter",
      slug: "why-jwst-exoplanet-atmosphere-matters",
      subtitle: "Parsing chemical biosignatures from light curves thousands of light-years away.",
      excerpt: "Transmission spectroscopy from the James Webb Space Telescope reveals atmospheric compositions with unprecedented precision.",
      content: `
# Decoding Distant Skies

When news broke that astronomical teams detected chemical anomalies in distant exoplanet atmospheres, headlines rushed to proclaim extraterrestrial discovery. But the true scientific triumph lies in how we measure these signals.

## Transmission Spectroscopy Explained

As an exoplanet transits across its host star's disc, starlight filters through the planet's atmospheric fringe.

Different molecules absorb specific wavelengths of light:
- **Water Vapor ($H_2O$)**: Broad infrared absorption bands
- **Carbon Dioxide ($CO_2$)**: Distinct peak around 4.3 microns
- **Methane ($CH_4$)**: Key organic indicator when combined with low $CO$

\`\`\`text
Starlight ────► [ Exoplanet Atmosphere ] ────► JWST NIRSpec ────► Absorption Spectrum
\`\`\`

## Why Context Matters

A single molecule in isolation proves very little. Planetary atmospheres exist in dynamic equilibrium driven by stellar radiation, volcanic outgassing, and atmospheric escape.

Understanding these atmospheres requires analyzing the **ratio of species**, not just individual presence.
`,
      section: "science",
      categoryId: categories["science"].id,
      contentType: ContentType.ARTICLE,
      status: PostStatus.PUBLISHED,
      readingTime: 5,
      featured: true,
      publishedAt: new Date(Date.now() - 86400000 * 2),
      seoTitle: "Why JWST's Exoplanet Atmospheric Observations Matter | ThePathak.tech",
      seoDescription: "An editorial breakdown of JWST transmission spectroscopy and exoplanet atmospheric physics.",
      coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      tags: ["space-missions", "physics"],
    },
    {
      title: "React 19 Server Components vs Client State Management",
      slug: "react-19-server-components-guide",
      subtitle: "A practical mental model for when to use Server Components, Server Actions, and client hooks.",
      excerpt: "Stop treating Next.js App Router like a traditional SPA. Here is how state boundaries actually work under the hood.",
      content: `
# The Shift in Mental Model

In React 18 and 19 App Router architecture, the default boundary moves to the server.

## Component Rule Matrix

| Requirement | Component Type | Implementation |
| :--- | :--- | :--- |
| Database access / Secret keys | Server Component | \`async function Page()\` |
| Interactive state (\`useState\`) | Client Component | \`"use client"\` |
| Event handlers (\`onClick\`) | Client Component | \`"use client"\` |
| Server Mutations | Server Action | \`"use server"\` |

\`\`\`tsx
// Server Action Example
export async function likeArticle(postId: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  return await db.like.create({
    data: { postId, userId: session.user.id }
  });
}
\`\`\`

## Performance Takeaways

1. **Zero Bundle Impact**: Dependencies imported exclusively in Server Components add 0 bytes to the client JavaScript bundle.
2. **Streaming Suspense**: Wrap heavy async database queries in \`<Suspense>\` to send instant shell HTML to the browser.
`,
      section: "coding",
      categoryId: categories["coding"].id,
      contentType: ContentType.TUTORIAL,
      status: PostStatus.PUBLISHED,
      readingTime: 8,
      featured: true,
      publishedAt: new Date(Date.now() - 86400000 * 4),
      seoTitle: "React 19 Server Components vs Client State Management | ThePathak.tech",
      seoDescription: "Comprehensive walkthrough of React 19 App Router mental models, Server Actions, and client state.",
      coverImageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
      tags: ["react", "nextjs", "web-development"],
    },
    {
      title: "Kuch Raaste (कुछ रास्ते)",
      slug: "kuch-raaste",
      subtitle: "A poem on ambition, solitude, and the quiet path of creation.",
      excerpt: "कुछ रास्ते तन्हा भी होते हैं,\nहर मोड़ पर मंज़िल का निशान नहीं होता...",
      content: `
कुछ रास्ते तन्हा भी होते हैं,
हर मोड़ पर मंज़िल का निशान नहीं होता।
जो चलते हैं रातों के सन्नाटों में अक्सर,
उनका कोई शोरगुल भरा आशियाना नहीं होता।

किताबों के पन्नों में जो खो गए हैं लम्हे,
वो वापस बुलाने से वापस नहीं आते।
मगर जो सपने देखे थे खुली आँखों से कभी,
वो हवा के झोंकों से मिट नहीं जाते।

कामयाबी का कोई आसान नक़्शा नहीं,
हर रोज़ खुद को तराशना पड़ता है।
भीड़ से अलग जब चुनो अपनी राह,
तो तूफानों से भी मुस्कुराकर मिलना पड़ता है।
`,
      section: "creative",
      categoryId: categories["creative"].id,
      contentType: ContentType.POEM,
      status: PostStatus.PUBLISHED,
      readingTime: 2,
      featured: true,
      publishedAt: new Date(Date.now() - 86400000 * 5),
      seoTitle: "Kuch Raaste (कुछ रास्ते) — Hindi Poem | ThePathak.tech",
      seoDescription: "An original Hindi poem on dedication, ambition, and inner discipline by The Pathak.",
      coverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      tags: ["poetry", "hindi"],
    },
    {
      title: "On Deep Work and Avoiding Technical Fragmented Attention",
      slug: "on-deep-work-technical-focus",
      subtitle: "Why context switching costs software engineers 10x more than estimated.",
      excerpt: "High-value problem solving requires holding multidimensional state graphs in working memory.",
      content: `
# The Cost of Attention Fragmentation

When an engineer is debugging a complex concurrency bug or designing a resilient database schema, they are constructing a fragile, high-dimensional model inside working memory.

Every notification, quick message, or context switch collapses that mental model.

## Rebuilding the Graph

Research indicates it takes 20-25 minutes to rebuild a complex mental graph after a minor interruption.

If you are interrupted 4 times a day:
- **Direct loss**: 40 minutes
- **Recovery cost**: 80-100 minutes
- **Total context tax**: Over 2 hours of cognitive output lost daily.

## Rules for Deep Work

1. Block continuous 3-hour focus blocks.
2. Keep an active scratchpad file to unload transient state before taking a break.
3. Optimize for asynchronous communication over instant response expectations.
`,
      section: "ideas",
      categoryId: categories["ideas"].id,
      contentType: ContentType.ESSAY,
      status: PostStatus.PUBLISHED,
      readingTime: 4,
      featured: false,
      publishedAt: new Date(Date.now() - 86400000 * 6),
      seoTitle: "On Deep Work and Technical Focus | ThePathak.tech",
      seoDescription: "An essay on cognitive context-switching costs for engineers and strategies for deep focus.",
      coverImageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      tags: ["focus", "developer-life"],
    },
    {
      title: "Note: Useful Micro-libraries for TypeScript Runtime Validation",
      slug: "note-typescript-runtime-validation-tools",
      subtitle: "Quick comparison of Zod, Valibot, and TypeBox for API boundary safety.",
      excerpt: "When parsing unvalidated JSON at HTTP boundaries, type assertions are not enough.",
      content: `
Short observations on runtime schema validation libraries in 2026:

- **Zod**: Still the gold standard for ergonomics and developer experience. Highly recommended for Next.js Server Actions.
- **Valibot**: Modular, tree-shakeable alternative reducing bundle overhead by up to 90%. Excellent for client-side forms.
- **TypeBox**: JSON Schema native validation. Outstanding choice when interfacing with OpenAPI schemas or fastify servers.

\`\`\`typescript
import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(120),
  section: z.enum(["technology", "science", "coding", "ideas", "creative", "notes"]),
});
\`\`\`
`,
      section: "notes",
      categoryId: categories["notes"].id,
      contentType: ContentType.NOTE,
      status: PostStatus.PUBLISHED,
      readingTime: 2,
      featured: false,
      publishedAt: new Date(Date.now() - 86400000 * 7),
      seoTitle: "TypeScript Runtime Validation Tools Note | ThePathak.tech",
      seoDescription: "Short note on Zod, Valibot, and TypeBox for runtime boundary validation.",
      coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      tags: ["web-development"],
    }
  ];

  for (const postData of posts) {
    const { tags: postTagSlugs, ...postFields } = postData;

    const post = await prisma.post.upsert({
      where: { slug: postFields.slug },
      update: {
        authorId: adminUser.id,
      },
      create: {
        ...postFields,
        authorId: adminUser.id,
      },
    });

    // Connect tags
    for (const tagSlug of postTagSlugs) {
      if (tags[tagSlug]) {
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tags[tagSlug].id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tags[tagSlug].id,
          },
        });
      }
    }
  }

  console.log("Posts seeded successfully!");
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
