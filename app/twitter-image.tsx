import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Secret Santa Generator – free online gift exchange organizer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F0F1E 0%, #1B1B33 100%)",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 10 }}>🎅</div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
          <span style={{ color: "#EF4444" }}>Secret</span>
          <span style={{ color: "#22C55E", marginLeft: 24 }}>Santa</span>
          <span style={{ color: "#EAB308", marginLeft: 24 }}>Generator</span>
        </div>
        <div style={{ fontSize: 36, color: "#CBD5E1", marginTop: 18 }}>
          Free online gift exchange organizer with wishlists
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            gap: 18,
            fontSize: 26,
            color: "#E2E8F0",
          }}
        >
          <span style={{ padding: "10px 22px", border: "2px solid #22C55E", borderRadius: 999 }}>No sign-up</span>
          <span style={{ padding: "10px 22px", border: "2px solid #EAB308", borderRadius: 999 }}>Free for 10 people</span>
          <span style={{ padding: "10px 22px", border: "2px solid #EF4444", borderRadius: 999 }}>Ready in 2 minutes</span>
        </div>
        <div style={{ fontSize: 26, color: "#94A3B8", marginTop: 50 }}>secretsanta.wagnerway.co.za</div>
      </div>
    ),
    { ...size }
  );
}
