import { ImageResponse } from "next/og";

// Mirrors the favicon (app/icon.svg): original spherical flame with a cyan orbit, on the page background.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#070B14",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 104,
          height: 104,
          borderRadius: 999,
          background:
            "radial-gradient(circle at 40% 36%, #FFF6E5 0%, #FFB347 25%, #FF6B2C 60%, #B8360C 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          width: 150,
          height: 50,
          borderRadius: 999,
          border: "3px solid #5CE1E6",
          transform: "rotate(-20deg)",
        }}
      />
    </div>,
    { ...size },
  );
}
