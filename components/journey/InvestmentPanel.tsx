"use client";
import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import { financeLocked } from "@/lib/game/journey/finance";
import {
  investmentAmounts,
  investmentKeys,
  investmentValue,
} from "@/lib/game/journey/investments";
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
      {investmentKeys.map((key, i) => (
        <div className="investment-row" key={key}>
          <strong>
            {["กองทุน", "หุ้น", "คริปโต"][i]} · ฿
            {investmentValue(life, key).toLocaleString("th-TH")}
          </strong>
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
    </section>
  );
}
