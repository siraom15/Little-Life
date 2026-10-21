"use client";
import { useState } from "react";
import type { Life } from "@/lib/game";
import { applyAction } from "@/lib/game/simulation";
import { emptyEconomy, ventureLockedReason } from "@/lib/game/economy";
import { ventures, policyTerms } from "@/lib/game/ventures";
import { baht } from "@/lib/format";
import ChoiceButton from "./ChoiceButton";
export default function EconomyPanel({
  life,
  setLife,
  pauseTime,
}: {
  life: Life;
  pauseTime: () => void;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
}) {
  const [tab, setTab] = useState("ลงทุน");
  const economy = life.simulation?.economy || emptyEconomy();
  if (life.age < 18)
    return <p className="unlock-hint">▣ อาชีพ · ลงทุน · ประกัน ปลดล็อกเมื่ออายุ 18 ปี</p>;
  return (
    <details
      className="economy-panel"
      onToggle={(event) => {
        if (event.currentTarget.open) pauseTime();
      }}
    >
      <summary>
        ▣ จัดการชีวิต · เงิน · อาชีพ{" "}
        <span>พอร์ต ฿{baht(economy.fund + economy.crypto)}</span>
      </summary>
      <div className="economy-stats">
        <span>กองทุน ฿{baht(economy.fund)}</span>
        <span>คริปโต ฿{baht(economy.crypto)}</span>
        <span>ชื่อเสียง {economy.reputation}/100</span>
        <span>เสี่ยงคดี {economy.heat}/100</span>
      </div>
      <p>
        ประกัน:{" "}
        {economy.policy === "none"
          ? "ยังไม่มีความคุ้มครอง"
          : economy.policy === "basic"
            ? "พื้นฐาน"
            : "ครอบครัว"}{" "}
        · เบี้ย ฿{baht(policyTerms[economy.policy].premium)}/ปี
      </p>
      {economy.prisonUntil > life.age && (
        <p className="risk-note">
          รับโทษถึงอายุ {economy.prisonUntil} ปี · หลังพ้นโทษสมัครอาชีพใหม่ได้
        </p>
      )}
      <div className="venture-tabs" role="group" aria-label="หมวดจัดการชีวิต">
        {["ลงทุน", "ประกัน", "อาชีพ", "เส้นทางชีวิต"].map((item) => (
          <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      <p className="venture-note">
        {tab === "ลงทุน"
          ? "ผลตอบแทนเป็นกติกาจำลอง ไม่รับประกันกำไร · หวยได้ปีละใบ"
          : tab === "ประกัน"
            ? "จ่ายเบี้ยทันทีและต่อทุกปี หากเงินไม่พอกรมธรรม์สิ้นสุด เงินเสียชีวิตแยกให้ผู้รับผลประโยชน์"
            : tab === "อาชีพ"
              ? "เปลี่ยนอาชีพได้ปีละครั้ง รายได้ใหม่แทนรายได้เดิม"
              : "เส้นทางสมมติในเกม · ความเสี่ยงสูงยิ่งมีโอกาสถูกจับ ตรวจคดีทุกปี"}
      </p>
      <div className="choices">
        {ventures
          .filter((item) => item.group === tab)
          .map((item) => (
            <ChoiceButton
              key={item.id}
              choice={item}
              locked={ventureLockedReason(life, item.id)}
              onClick={() =>
                setLife((current) =>
                  current
                    ? applyAction(current, { type: "venture", id: item.id })
                    : current,
                )
              }
            />
          ))}
      </div>
    </details>
  );
}
