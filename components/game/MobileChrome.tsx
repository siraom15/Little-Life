import {
  BookOpen,
  Gamepad2,
  Heart,
  Menu,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { Life, Stat } from "@/lib/game";
import { labels } from "@/lib/game";
import { baht } from "@/lib/format";

export type MobileView = "play" | "player" | "history" | "menu";
const stats: { key: Stat; Icon: typeof Heart }[] = [
  { key: "health", Icon: Heart },
  { key: "happy", Icon: Sparkles },
  { key: "skill", Icon: BookOpen },
  { key: "social", Icon: Users },
];
const tabs = [
  { id: "play", label: "เล่น", Icon: Gamepad2 },
  { id: "player", label: "ตัวฉัน", Icon: UserRound },
  { id: "history", label: "ประวัติ", Icon: BookOpen },
  { id: "menu", label: "เมนู", Icon: Menu },
] as const;

export function MobileStatusBar({ life, onOpen }: { life: Life; onOpen: () => void }) {
  return (
    <button className="mobile-status" onClick={onOpen} aria-label="ดูสถานะตัวละครทั้งหมด">
      <div className="mobile-identity">
        <strong>
          {life.name} <span>{life.age} ปี</span>
        </strong>
        <b>฿{baht(life.money)}</b>
      </div>
      <div className="mobile-meters">
        {stats.map(({ key, Icon }) => (
          <div className={`mobile-meter stat-${key}`} key={key}>
            <div>
              <Icon size={12} />
              <span>{key === "social" ? "สัมพันธ์" : labels[key]}</span>
              <b>{life.stats[key]}</b>
            </div>
            <div
              className="bar"
              role="meter"
              aria-label={key === "social" ? "สัมพันธ์" : labels[key]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={life.stats[key]}
            >
              <i style={{ width: `${life.stats[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
export function MobileNavigation({
  view,
  onChange,
}: {
  view: MobileView;
  onChange: (view: MobileView) => void;
}) {
  return (
    <nav className="mobile-navigation" aria-label="เมนูเกมมือถือ">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          aria-current={view === id ? "page" : undefined}
          className={view === id ? "active" : ""}
          onClick={() => onChange(id)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
