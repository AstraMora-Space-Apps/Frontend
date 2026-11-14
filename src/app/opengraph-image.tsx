import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/metadata";

// Satori renders to PNG and cannot read CSS variables: colours mirror the tokens in globals.css.
const BG = "#070B14";
const TEXT = "#F4F6FB";
const MUTED = "#9FB0CC";
const EMBER = "#FF6B2C";
const EMBER_GLOW = "#FFB347";
const CYAN = "#5CE1E6";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}. v0.1 preliminary.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Open Graph card: original spherical-flame art (no agency marks), title, subtitle, status. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 88px",
        background: BG,
        color: TEXT,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
          Flame<span style={{ color: EMBER }}>Sight</span>
        </div>
        <div
          style={{ display: "flex", marginTop: 20, fontSize: 40, lineHeight: 1.25, color: MUTED }}
        >
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: 999,
            border: `2px solid ${EMBER_GLOW}`,
            color: EMBER_GLOW,
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          v0.1 preliminary
        </div>
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: 360,
          height: 360,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(255,107,44,0.4) 0%, rgba(255,107,44,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 240,
            height: 240,
            borderRadius: 999,
            background: `radial-gradient(circle at 38% 34%, #FFF6E5 0%, ${EMBER_GLOW} 22%, ${EMBER} 55%, #B8360C 80%, #3A1206 100%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 380,
            height: 120,
            borderRadius: 999,
            border: `3px solid ${CYAN}`,
            opacity: 0.7,
            transform: "rotate(-18deg)",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
