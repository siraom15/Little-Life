import type { Life } from "../../types.ts";
import type { StoryEvent, Skill } from "../types.ts";
import { event, option } from "./builders.ts";
export function debtCrisis(life: Life) {
  return event(
    life,
    "debt-" + life.age,
    "หนี้เริ่มจ่ายไม่ไหว",
    "ค้างชำระ 2 ปีแล้ว หากค้างครบ 3 ปีจะถูกพิทักษ์ทรัพย์และล้มละลาย เลือกทางรับมือ",
    [
      option(
        "เจรจาปรับโครงสร้างหนี้",
        "สำเร็จลดยอดหนี้ 20% และเริ่มนับค้างใหม่",
        { debtFactor: 0.8 },
        {
          icon: "users",
          chance: { base: 25, skill: "communication", stat: "social" },
          failure: { stats: { happy: -5 } },
        },
      ),
      option(
        "จ่ายก้อน 10,000",
        "ลดหนี้ 10,000 และเริ่มนับค้างใหม่",
        { money: 0, debtFactor: 1 },
        {
          icon: "coin",
          cost: 10000,
          successText: "จ่ายชำระ 10,000 บาทและเริ่มนับค้างใหม่",
        },
      ),
      option(
        "ขายของและเร่งหารายได้",
        "สำเร็จรับ 20,000 · สุขภาพ −8",
        { money: 20000, stats: { health: -8 } },
        {
          icon: "shop",
          chance: { base: 40, skill: "business", stat: "health" },
          failure: { stats: { health: -5 } },
        },
      ),
      option(
        "ยอมเข้าสู่ล้มละลาย",
        "ยึดบ้าน รถ พอร์ต และเงินสด 70% · ล้างหนี้ · ห้ามกู้ 8 ปี",
        { bankrupt: true },
        { icon: "flag" },
      ),
      option(
        "ยังไม่แก้ไข",
        "หนี้ยังคิดดอกเบี้ย 18% ปีหน้า · สุข −6",
        { stats: { happy: -6 } },
        { icon: "moon" },
      ),
    ],
    "การเงิน",
  );
}
