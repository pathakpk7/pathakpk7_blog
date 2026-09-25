import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ThePathak.tech — Technology • Science • Code • Ideas • Words";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          padding: "60px 70px",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
          border: "12px solid #18181b",
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
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            P
          </div>
          <span style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
            ThePathak<span style={{ color: "#3b82f6" }}>.tech</span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "980px",
          }}
        >
          <h1
            style={{
              fontSize: "58px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#ffffff",
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            The world is changing. <br />
            <span style={{ color: "#60a5fa", fontStyle: "italic" }}>Let&apos;s understand it.</span>
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Technology • Science • Code • Ideas • Creative Words
          </p>
        </div>

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
          <span style={{ fontSize: "18px", color: "#60a5fa", fontWeight: 600 }}>
            thepathak.tech
          </span>
          <span style={{ fontSize: "18px", color: "#71717a", fontStyle: "italic" }}>
            Interpretation over repetition
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
