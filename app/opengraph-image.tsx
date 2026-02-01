import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, #000000 0%, #0a0a14 50%, #000814 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#fca311",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.name}
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#ffffff",
              opacity: 0.9,
              marginBottom: "16px",
            }}
          >
            {siteConfig.tagline}
          </p>
          <p
            style={{
              fontSize: "20px",
              color: "#ffffff",
              opacity: 0.7,
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            {siteConfig.description}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
