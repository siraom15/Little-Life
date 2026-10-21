import type { Life } from "@/lib/game";
import { lifeStage, characterAppearance } from "@/lib/game/appearance";
import { assetCatalog, allCars } from "@/lib/game/journey/assets";
import { skillLabels, riskyJobs } from "@/lib/game/journey/catalog";
import type { Skill } from "@/lib/game/journey/types";
import { baht } from "@/lib/format";
import PixelCharacter from "../scene/PixelCharacter";
export default function SelfScreen({
  life,
  auto,
  shared,
  onSettings,
  onRestart,
  onImport,
  onExport,
}: {
  life: Life;
  auto: boolean;
  shared: boolean;
  onSettings: () => void;
  onRestart: () => void;
  onImport: () => void;
  onExport: () => void;
}) {
  const j = life.journey!,
    appearance = characterAppearance(life),
    best = Object.entries(j.skills).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="self-screen">
      <div className="identity-card">
        <svg viewBox="0 0 100 110" aria-label="ตัวละครของคุณ">
          <PixelCharacter x={50} y={100} scale={1.8} shirt="#52b8cf" {...appearance} />
        </svg>
        <div>
          <span className="event-kicker">PLAYER PROFILE</span>
          <h2>{life.name}</h2>
          <p>
            {life.age} ปี · {lifeStage(life.age)} · {appearance.female ? "หญิง" : "ชาย"}
          </p>
          <p>เกิดที่{life.province}</p>
        </div>
      </div>
      <section className="simple-card">
        <h3>ตอนนี้คุณเป็นใคร?</h3>
        <p>
          {life.age < 18
            ? "เด็กที่กำลังค้นหาทางของตัวเองใน " + j.school
            : life.job + " ที่ใช้ชีวิตอยู่ใน" + life.location}{" "}
          {riskyJobs.has(j.career?.id || "")
            ? "รายได้สูงมาพร้อมความเสี่ยงที่ตำรวจจะตามถึงตัว"
            : "กำลังสร้างเรื่องราวในแบบของตัวเอง"}
        </p>
        <p>
          ถนัดด้าน{skillLabels[best[0] as Skill]} ({best[1]}/100) ·{" "}
          {j.partner?.status === "married"
            ? "แต่งงานกับ " + j.partner.name
            : j.partner?.status === "dating"
              ? "คบกับ " + j.partner.name
              : "ยังไม่มีคู่ชีวิต"}{" "}
          · ลูก {j.children.length} คน
        </p>
        <p>
          รายได้ ฿{baht(life.income)}/ปี · ความร้อน {life.simulation!.economy!.heat}/100
        </p>
      </section>
      <section className="simple-card">
        <h3>สิ่งที่สร้างมา</h3>
        <p>
          บ้าน:{" "}
          {assetCatalog.house.find((m) => m.id === j.house?.id)?.name ||
            "ยังไม่มีบ้านของตัวเอง"}
        </p>
        <p>
          รถ {allCars(life).length}/3 คัน:{" "}
          {allCars(life)
            .map((car) => assetCatalog.car.find((m) => m.id === car.id)?.name)
            .join(" · ") || "ยังไม่มีรถ"}
        </p>
        <p>
          ผ่านงาน {j.careerHistory.length} สาย · ตัดสินใจ{" "}
          {life.simulation!.actions.filter((a) => a.type === "choice").length} ครั้ง
        </p>
      </section>
      <section className="simple-card">
        <h3>สุขภาพและวิถีชีวิต</h3>
        <p>
          {j.health.disease || "ยังไม่มีโรคที่ตรวจพบ"} · ออกกำลัง {j.health.exercise}/5
        </p>
        <p>
          พึ่งพาสาร {j.health.addiction}/100 · บุหรี่ {j.health.smoking}/100 · แอลกอฮอล์{" "}
          {j.health.alcohol}/100
        </p>
        <p>
          ภารกิจสำเร็จ {j.completedMissions.length} ·{" "}
          {j.homeless ? "อาศัยข้างถนน" : "มีที่พัก"}
        </p>
        <h3>ตั้งค่าและบันทึก</h3>
        <p>
          {shared
            ? "กำลังอ่านชีวิตของเพื่อน"
            : auto
              ? "บันทึกอัตโนมัติเปิดอยู่"
              : "บันทึกอัตโนมัติปิดอยู่"}
        </p>
        <button className="finance-action" onClick={onSettings}>
          ตั้งค่าการบันทึก
        </button>
        <button className="finance-action" onClick={onExport}>
          ส่งออกไฟล์ชีวิต
        </button>
        <button className="finance-action" onClick={onImport}>
          นำเข้าไฟล์ชีวิต
        </button>
        <button className="primary-action" onClick={onRestart}>
          เริ่มอีกชีวิต
        </button>
      </section>
    </div>
  );
}
