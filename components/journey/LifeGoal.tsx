import { careerMission } from "@/lib/game/journey/career-paths";
import type { Life } from "@/lib/game";
import { baht } from "@/lib/format";
export default function LifeGoal({ life }: { life: Life }) {
  const j = life.journey!;
  const mission = careerMission(life);
  const target = life.flags.includes("retired")
    ? {
        name: "ใช้ชีวิตหลังเกษียณกับครอบครัว",
        value: life.stats.happy,
        total: 100,
        hint:
          "พักผ่อน ดูแลสุขภาพ และใช้เวลากับคนที่รัก · ความสุข " + life.stats.happy + "%",
      }
    : mission
      ? {
          name: mission.title,
          value: Math.min(mission.value, 70) + (mission.rank >= 1 ? 30 : 0),
          total: 100,
          hint: life.journey!.completedMissions.includes(mission.id)
            ? "สำเร็จแล้ว! ความสุข +10 · ตราความสำเร็จถาวร"
            : "ทักษะเฉพาะ 70 และเลื่อนขั้นอย่างน้อย 1 ครั้ง",
        }
      : life.age < 18
        ? {
            name: "เติบโตสู่โลกของงาน",
            value: life.age,
            total: 18,
            hint: "โรงเรียนและทักษะวันนี้ เปิดโอกาสวันหน้า",
          }
        : !j.career
          ? {
              name: "ค้นหาสายงานของคุณ",
              value: 0,
              total: 1,
              hint: "รอข้อเสนองาน แล้วเลือกเส้นทางใหม่",
            }
          : !j.car
            ? {
                name: "รถคันแรก",
                value: life.money,
                total: 45000,
                hint: "เริ่มต้นมอเตอร์ไซค์ ฿45,000 · ดูในแท็บการเงิน",
              }
            : !j.house
              ? {
                  name: "บ้านหลังแรก",
                  value: life.money,
                  total: 350000,
                  hint: "ห้องชุด ฿350,000 หรือเลือกผ่อนในแท็บการเงิน",
                }
              : {
                  name: "ชีวิตที่คุณสร้างเอง",
                  value: 1,
                  total: 1,
                  hint: "บ้าน รถ และทุกคนรอบตัว คือรางวัลระหว่างทาง",
                };
  return (
    <div className="life-goal">
      <span>★ ภารกิจชีวิต</span>
      <strong>{target.name}</strong>
      <div className="goal-track">
        <i
          style={{
            width: Math.max(0, Math.min(100, (target.value / target.total) * 100)) + "%",
          }}
        />
      </div>
      <small>{target.hint}</small>
    </div>
  );
}
