import type { Life } from "../types.ts";
import { endingAchievements, trophyColors } from "./achievements.ts";

const escape = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!,
  );
const shorten = (value: string, limit: number) =>
  Array.from(value).length > limit
    ? Array.from(value)
        .slice(0, limit - 1)
        .join("") + "…"
    : value;
const money = (value: number) =>
  new Intl.NumberFormat("th-TH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const text = (x: number, y: number, value: unknown, size = 18, color = "#f4f0dc") =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="middle">${escape(value)}</text>`;

function portrait(life: Life) {
  if (life.age < 2)
    return `<path d="M208 188h64v38h-64z" fill="#aa8161"/><path d="M211 185h58v30h-58z" fill="#e2d6b8"/><path d="M215 189h17v16h-17z" fill="#eac09d"/><path d="M234 191h30v16h-30z" fill="#81a7c5"/>`;
  const hair = life.age >= 60 ? "#bdc2d2" : "#493849";
  const longHair =
    life.simulation?.sex === "female" ? "M220 162h5v28h-5zM256 162h5v28h-5z" : "";
  const scale = life.age < 13 ? 0.8 : 1;
  return `<g transform="translate(${240 * (1 - scale)} ${234 * (1 - scale)}) scale(${scale})">
    <path d="M224 158h32v30h-32z" fill="#eac09d"/>
    <path d="M222 152h36v10h-36z${longHair}" fill="${hair}"/>
    <path d="M218 188h44v31h-44z" fill="#649faf"/>
    <path d="M225 219h11v15h-11zm19 0h11v15h-11z" fill="#1b2338"/>
    <path d="M230 170h4v4h-4zm16 0h4v4h-4z" fill="#17202e"/>
  </g>`;
}

export function endingCardSvg(life: Life) {
  const j = life.journey!,
    awards = endingAchievements(life);
  const trophies = awards
    .map((award, index) => {
      const x = 24 + (index % 3) * 146,
        y = 408 + Math.floor(index / 3) * 108;
      const color = award.tier ? trophyColors[award.tier] : "#4c6275";
      return `<g transform="translate(${x} ${y})">
      <rect width="140" height="100" fill="#12263b" stroke="${color}" stroke-width="2"/>
      <path d="M53 12h34v23H53zM45 15h8v15h-8zm42 0h8v15h-8zM61 35h18v7H61zM67 42h6v9h-6zM57 51h26v5H57z" fill="${color}"/>
      ${text(70, 76, award.title, 17)}
      ${text(70, 93, award.tier?.toUpperCase() || "ยังไม่ปลดล็อก", 12, color)}
    </g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="720" viewBox="0 0 480 720">
    <style>text{font-family:Tahoma,Arial,sans-serif}</style>
    <rect width="480" height="720" fill="#070f1c"/>
    <path d="M12 12h456v696H12z" fill="none" stroke="#5686a1" stroke-width="3"/>
    <path d="M24 24h432v4H24zM24 688h432v4H24z" fill="#e4bb62"/>
    ${text(240, 54, "ชีวิตจิ๋ว • LIFE COMPLETE", 16, "#ecc772")}
    ${text(240, 94, shorten(life.name, 24), 30)}
    ${text(240, 122, shorten(life.job, 38), 16, "#93c9e3")}
    <g shape-rendering="crispEdges">
      <path d="M24 142h432v112H24z" fill="#15314b"/>
      <path d="M24 220h432v34H24z" fill="#2b514e"/>
      <path d="M60 174h48v46H60zm300-12h54v58h-54z" fill="#3d6674"/>
      ${portrait(life)}
      <path d="M164 164h4v4h-4zm138 20h4v4h-4zM328 152h4v4h-4z" fill="#ffce69"/>
    </g>
    ${text(240, 282, life.age + " ปี • หนึ่งชีวิตที่ไม่เหมือนใคร", 22)}
    ${text(240, 309, "มรดกสุทธิ ฿" + money(j.funeral?.estate || 0) + "   |   ลูก " + j.children.length + " คน", 17, "#9edabf")}
    ${text(240, 337, "คนมาส่ง " + (j.funeral?.guests.length || 0) + " คน • ถ้วย " + awards.filter((a) => a.tier).length + " / 6 หมวด", 16, "#a3bdce")}
    ${text(240, 374, "HALL OF MEMORIES", 14, "#ecc772")}
    ${trophies}
    ${text(240, 650, shorten(life.simulation?.death?.cause || "ทุกชีวิตมีเรื่องราว", 46), 15, "#b8c5d3")}
    ${text(240, 677, "ทุกการเลือก ทิ้งบางสิ่งไว้เสมอ • #ชีวิตจิ๋ว", 14, "#d6b978")}
  </svg>`;
}
