"use client";
import { isImprisoned } from "@/lib/game/journey/police";
import { useState } from "react";
import type { Life } from "@/lib/game";
import { lifeStage } from "@/lib/game/appearance";
import SceneIllustration from "./scene/SceneIllustration";
export default function LifeScene({ life }: { life: Life }) {
  const [wave, setWave] = useState(false),
    death = life.simulation?.death,
    notice = life.simulation?.notice;
  const imprisoned = isImprisoned(life);
  const place = imprisoned
    ? "เรือนจำ · พ้นโทษอายุ " + life.simulation!.economy!.prisonUntil + " ปี"
    : death
      ? "สวนแห่งความทรงจำ"
      : life.journey?.homeless
        ? "ชีวิตข้างถนน · รอตั้งหลักใหม่"
        : death
          ? "สวนแห่งความทรงจำ"
          : notice
            ? notice.title
            : life.age < 2
              ? "ห้องของเจ้าตัวน้อย"
              : life.age < 6
                ? "โลกใบเล็กของวัยหัดเดิน"
                : life.age < 13
                  ? "หลังเลิกเรียน"
                  : life.age < 20
                    ? "วัยรุ่นออกสำรวจ"
                    : life.age >= 60
                      ? "วันพักผ่อนของเรา"
                      : life.location === "ญี่ปุ่น"
                        ? "ชีวิตใหม่ที่ญี่ปุ่น"
                        : !!life.journey?.house
                          ? "บ้านของเรา"
                          : "เมืองแห่งโอกาส";
  const mood =
    life.age < 2
      ? "อ้อแอ้… z Z"
      : life.age < 6
        ? "อยากออกไปเล่นแล้ว!"
        : life.stats.health < 35
          ? "วันนี้ขอพักก่อนนะ"
          : life.stats.happy >= 80
            ? "วันนี้มีความสุขจัง!"
            : "ปีนี้จะเจออะไรนะ?";
  return (
    <section
      className={`life-scene ${death ? "scene-death" : ""}`}
      aria-label={`ฉากชีวิตปัจจุบัน ${lifeStage(life.age)} อายุ ${life.age} ปี`}
    >
      <div className="scene-top">
        <span>
          <i />
          {death ? "IN MEMORY" : "LITTLE LIFE"}
        </span>
        <b>{life.location === "ญี่ปุ่น" ? "JP · ญี่ปุ่น" : `TH · ${life.province}`}</b>
        <span>
          อายุ <strong>{life.age}</strong> ปี
        </span>
      </div>
      <div className="pixel-world">
        <SceneIllustration
          life={life}
          kind={
            imprisoned
              ? "prison"
              : death
                ? "death"
                : notice?.scene || life.journey?.pending?.scene
          }
        />
        <div className="scene-location">{place}</div>
        {!death && !notice && !imprisoned && (
          <button
            className="speech-bubble"
            onClick={() => setWave(!wave)}
            aria-label="ทักทายตัวละคร"
          >
            {wave ? (life.age < 2 ? "อ้อแอ้! ♥" : "พร้อมผจญภัยแล้ว!") : mood}
          </button>
        )}
        <span className="scene-level">
          {lifeStage(life.age)} · {life.simulation?.sex === "female" ? "หญิง" : "ชาย"}
        </span>
      </div>
      <div className="scene-bottom">
        <span>
          <b>{life.name}</b> · {life.age < 18 ? lifeStage(life.age) : life.job}
        </span>
        <span>
          {life.flags.includes("child")
            ? "♥ ครอบครัว"
            : life.flags.includes("partner")
              ? "♥ คู่ชีวิต"
              : "★ การเดินทางของฉัน"}
        </span>
      </div>
      <div className="last-action" aria-live="polite" key={life.history.length}>
        ▸{" "}
        {death
          ? death.cause
          : life.history.at(-1)?.choice ||
            life.simulation?.birthTrait ||
            "การผจญภัยเริ่มแล้ว!"}
      </div>
    </section>
  );
}
