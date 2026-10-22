"use client";
import LotteryPanel from "./LotteryPanel";
import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import { financeLocked } from "@/lib/game/journey/finance";
import {
  investmentAmounts,
  investmentKeys,
  investmentValue,
} from "@/lib/game/journey/investments";
import { gameConfig } from "@/lib/game/journey/config";
import { investmentRiskLevels } from "@/lib/game/journey/investments";
import MoneyChange from "./MoneyChange";
export default function InvestmentPanel({
  life,
  setLife,
  shared,
}: {
  life: Life;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
  shared: boolean;
}) {
  return (
    <section className="simple-card">
      <h3>ตลาดลงทุน</h3>
      <p>
        มูลค่าพอร์ตรวม ฿
        {investmentKeys
          .reduce((sum, key) => sum + investmentValue(life, key), 0)
          .toLocaleString("th-TH")}
      </p>
      {investmentKeys.map((key, i) => (
        <div className="investment-row" key={key}>
          <strong>
            {["กองทุน", "หุ้น", "คริปโต"][i]} · ฿
            {investmentValue(life, key).toLocaleString("th-TH")}
          </strong>
          <div className="risk-options" role="group" aria-label={"ความเสี่ยง " + key}>
            {investmentRiskLevels.map((level) => {
              const cfg = gameConfig.investment.risks[level],
                model = gameConfig.investment[key],
                id = "risk:" + key + ":" + level;
              return (
                <button
                  key={level}
                  aria-pressed={
                    (life.journey!.investment.risks?.[key] || "normal") === level
                  }
                  disabled={shared || !!financeLocked(life, id)}
                  onClick={() =>
                    setLife((current) =>
                      current ? journeyAction(current, { type: "venture", id }) : current,
                    )
                  }
                >
                  {cfg.label}
                  <small>
                    ปกติ {Math.round((model.min - 1) * cfg.spread * 100)}% ถึง +
                    {Math.round((model.min + model.range - 1) * cfg.spread * 100)}%
                  </small>
                  <small>
                    ตลาดร่วง {cfg.crashChance * 100}%/ปี · เสีย {cfg.crashLoss * 100}%
                  </small>
                </button>
              );
            })}
          </div>
          <small>
            มีผลกับยอดทั้งหมด · เปลี่ยนได้ปีละครั้ง · ความผันผวนสูงเพิ่มทั้งกำไรและขาดทุน
          </small>
          <div className="investment-buttons">
            {investmentAmounts.map((amount) => {
              const id = "invest:" + key + ":" + amount;
              return (
                <button
                  key={amount}
                  disabled={shared || !!financeLocked(life, id)}
                  onClick={() =>
                    setLife((current) =>
                      current ? journeyAction(current, { type: "venture", id }) : current,
                    )
                  }
                >
                  <MoneyChange amount={-amount} />
                </button>
              );
            })}
            <button
              disabled={shared || !!financeLocked(life, "sell:" + key)}
              onClick={() =>
                setLife((current) =>
                  current
                    ? journeyAction(current, { type: "venture", id: "sell:" + key })
                    : current,
                )
              }
            >
              ขายทั้งหมด
            </button>
          </div>
        </div>
      ))}
      <p>
        {life.journey!.investment.lastReport ||
          "รายงานกำไร/ขาดทุนจะสุ่มเว้นช่วง 2, 3 หรือ 5 ปี หลังเริ่มลงทุน"}
      </p>
      {life.journey!.investment.nextReport >= 0 && (
        <small>รายงานถัดไปอายุ {life.journey!.investment.nextReport} ปี</small>
      )}
      <LotteryPanel life={life} setLife={setLife} shared={shared} />
    </section>
  );
}
