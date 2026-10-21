import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
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
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
