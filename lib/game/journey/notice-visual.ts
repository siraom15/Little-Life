import type { LifeNotice } from "../types.ts";
export function noticeVisual(notice: LifeNotice | null | undefined) {
  return notice?.visual || null;
}
export function portfolioChart(points: { age: number; profit: number }[]) {
  const values = points.map((p) => p.profit),
    low = Math.min(0, ...values),
    high = Math.max(0, ...values),
    span = Math.max(1, high - low);
  const y = (value: number) => 150 - ((value - low) / span) * 100;
  const coords = points.map((p, i) => ({
    x: 45 + (i / Math.max(1, points.length - 1)) * 310,
    y: y(p.profit),
  }));
  return {
    path: coords
      .map((p, i) => (i ? "H" + p.x + "V" + p.y : "M" + p.x + " " + p.y))
      .join(" "),
    zero: y(0),
    profit: points.at(-1)?.profit || 0,
  };
}
