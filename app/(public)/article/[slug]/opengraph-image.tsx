import { ImageResponse } from "next/og";
import { db } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const alt = "ThePathak.tech Article Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: any = null;

  try {
    post = await db.post.findUnique({
      where: { slug },
      select: {
        title: true,
        subtitle: true,
        section: true,
        contentType: true,
        author: {
          select: {
            name: true,
            profile: { select: { displayName: true } },
          },
        },
      },
    });
  } catch (e) {
    // fallback
  }

  const title = post?.title || "Editorial Publication";
  const section = (post?.section || "technology").toUpperCase();
  const author = post?.author?.profile?.displayName || post?.author?.name || "The Pathak";
  const isQuote = post?.contentType === "QUOTE";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #18181b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px 70px",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
          border: "12px solid #18181b",
        }}
      >
        {/* Top Bar: Brand Logo & Section Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              P
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
                ThePathak<span style={{ color: "#3b82f6" }}>.tech</span>
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            {section}
          </div>
        </div>

        {/* Middle: Article Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "1050px",
            margin: "20px 0",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "44px" : "54px",
              fontWeight: 800,
              lineHeight: 1.18,
              color: "#ffffff",
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            {isQuote ? `“${title}”` : title}
          </h1>

          {post?.subtitle && (
            <p
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                margin: 0,
                fontStyle: "italic",
              }}
            >
              — {post.subtitle}
            </p>
          )}
        </div>

        {/* Bottom Bar: Author & Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 600, color: "#e4e4e7" }}>
              {author}
            </span>
            <span style={{ fontSize: "16px", color: "#71717a" }}>•</span>
            <span style={{ fontSize: "16px", color: "#3b82f6", fontWeight: 500 }}>
              Independent Publication
            </span>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#71717a",
              fontStyle: "italic",
            }}
          >
            Interpretation over repetition
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
