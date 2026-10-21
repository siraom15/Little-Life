import { isImprisoned } from "@/lib/game/journey/police";
import type { GameClock } from "@/hooks/useGameClock";
import type { Life } from "@/lib/game";
import { Pause, Play } from "lucide-react";
export default function TimeBar({
  clock,
  life,
  shared,
}: {
  clock: GameClock;
  life: Life;
  shared: boolean;
}) {
  return (
    <div className="time-bar">
      <button
        aria-label={clock.running ? "หยุดเวลา" : "เดินเวลาต่อ"}
        onClick={() => clock.setRunning(!clock.running)}
        disabled={shared || life.done || isImprisoned(life)}
      >
        {clock.running ? <Pause size={17} /> : <Play size={17} />}
      </button>
      <span role="status">
        {life.done
          ? "จบการเดินทาง"
          : shared
            ? "เรื่องราวของเพื่อน"
            : isImprisoned(life)
              ? "รับโทษ · เหลือ " +
                (life.simulation!.economy!.prisonUntil - life.age) +
                " ปี"
              : clock.awaiting
                ? "เวลาหยุด · รอคุณเลือก"
                : clock.blocked
                  ? "หยุดระหว่างดูรายละเอียด"
                  : clock.running
                    ? "เวลากำลังเดิน"
                    : "หยุดพัก"}
      </span>
      <select
        aria-label="ความเร็วเวลา"
        value={clock.speed}
        onChange={(e) => clock.changeSpeed(Number(e.target.value))}
        disabled={shared || life.done}
      >
        <option value={6}>ช้า · 6 วิ/ปี</option>
        <option value={3}>ปกติ · 3 วิ/ปี</option>
        <option value={1}>เร็ว · 1 วิ/ปี</option>
      </select>
    </div>
  );
}
