import type { CSSProperties } from "react";
import typography from "@/config/typography.json";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  title: "ชีวิตจิ๋ว — ทุกชีวิตมีเรื่องราว",
  description:
    "เกมจำลองชีวิตคนไทย เลือกเส้นทางของคุณ เก็บทุกความทรงจำ และแชร์ชีวิตให้เพื่อน",
};
// Configuration is applied on the server, avoiding a flash of differently sized text.
if (
  !Number.isFinite(typography.fontScale) ||
  typography.fontScale <= 0 ||
  !Number.isFinite(typography.lineHeightScale) ||
  typography.lineHeightScale <= 0
) {
  throw new Error(
    "config/typography.json: fontScale and lineHeightScale must be positive numbers",
  );
}
const typographyStyle = {
  "--font-family": typography.fontFamily,
  "--font-monospace": typography.monospaceFontFamily,
  "--font-display": typography.displayFontFamily,
  "--font-scale": typography.fontScale,
  "--line-height-scale": typography.lineHeightScale,
} as CSSProperties;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" style={typographyStyle}>
      <head>
        {typography.fontStylesheetUrl && (
          <link rel="stylesheet" href={typography.fontStylesheetUrl} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
