import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import { financeLocked } from "@/lib/game/journey/finance";
import { lotteryChance } from "@/lib/game/journey/lottery";
import { gameConfig } from "@/lib/game/journey/config";
export default function LotteryPanel({
  life,
  setLife,
  shared,
}: {
  life: Life;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
  shared: boolean;
}) {
  const active = life.simulation!.economy!.lottery?.active,
    id = active ? "cancel-lottery" : "lottery",
    reason = financeLocked(life, id);
  return (
    <div className="investment-row lottery-panel">
      <h3>🎟 หวยรายปี</h3>
      <strong>
        รางวัล ฿{gameConfig.lottery.prize.toLocaleString("th-TH")} · งวดถัดไป{" "}
        {Math.round(lotteryChance(life) * 100)}%
      </strong>
      <p>
        ซื้อปีละ ฿{gameConfig.lottery.annualCost} · โอกาสเพิ่มปีละ 1
        จุดเปอร์เซ็นต์เมื่อซื้อต่อเนื่อง (สูงสุด 100%) · ยกเลิกแล้วกลับไป 2%
      </p>
      <p>
        {active
          ? "เปิดซื้ออัตโนมัติ · รวมในรายจ่ายประจำปี"
          : "ยังไม่ได้ซื้อ · เริ่มงวดแรกปีถัดไป"}
      </p>
      <button
        className="finance-action"
        disabled={shared || !!reason}
        onClick={() =>
          setLife((l) => (l ? journeyAction(l, { type: "venture", id }) : l))
        }
      >
        {active ? "ยกเลิกซื้อรายปี" : "ซื้อหวยทุกปี"}
        {reason && <small>{reason}</small>}
      </button>
    </div>
  );
}
