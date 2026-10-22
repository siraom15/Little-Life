import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import { financeLocked } from "@/lib/game/journey/finance";
import { lotteryChance, lotteryPercent } from "@/lib/game/journey/lottery";
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
        {lotteryPercent(lotteryChance(life))}%
      </strong>
      <p>
        ซื้อปีละ ฿{gameConfig.lottery.annualCost} · เริ่ม{" "}
        {lotteryPercent(gameConfig.lottery.chance)}% · โอกาสเพิ่มปีละ{" "}
        {lotteryPercent(gameConfig.lottery.annualIncrease)}{" "}
        จุดเปอร์เซ็นต์เมื่อซื้อต่อเนื่อง (สูงสุด{" "}
        {lotteryPercent(gameConfig.lottery.maxChance)}%) · ยกเลิกแล้วกลับไป{" "}
        {lotteryPercent(gameConfig.lottery.chance)}%
        {gameConfig.lottery.resetOnWin && (
          <> · ถูกรางวัลแล้วกลับไป {lotteryPercent(gameConfig.lottery.chance)}%</>
        )}
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
