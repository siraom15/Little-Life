import type { Life } from "../../types.ts";
import { gameConfig } from "../config.ts";
import { randomAt } from "../../random.ts";
import { event, option } from "./builders.ts";
export function redEnvelopeEvent(life: Life) {
  const cfg = gameConfig.family.redEnvelope,
    amount =
      Math.floor(
        (cfg.min + randomAt(life.seed, life.age, 250) * (cfg.max - cfg.min)) / 100,
      ) * 100;
  return event(
    life,
    "red-envelope-" + life.age,
    "ได้อั่งเปาจากญาติผู้ใหญ่!",
    "วันพบญาติ มีซองอั่งเปา ฿" +
      amount.toLocaleString("th-TH") +
      " ให้คุณ เงินเข้ากระเป๋าส่วนตัวทันที เลือกได้ครั้งเดียว",
    [
      option(
        "รับแล้วกล่าวขอบคุณ",
        "รับเงินเต็มซอง · สัมพันธ์ +3",
        { money: amount, stats: { social: 3 } },
        { icon: "coin" },
      ),
      option(
        "อวยพรผู้ใหญ่ก่อนรับ",
        "รับเงินเต็มซอง · สื่อสาร +2",
        { money: amount, skills: { communication: 2 } },
        { icon: "users" },
      ),
      option(
        "ช่วยจัดงานครอบครัว",
        "รับเงินเต็มซอง · สุข +3",
        { money: amount, stats: { happy: 3 } },
        { icon: "heart" },
      ),
      option(
        "แบ่งครึ่งให้น้อง",
        "เก็บครึ่งซอง ฿" + Math.floor(amount / 2) + " · สัมพันธ์ +6",
        { money: Math.floor(amount / 2), stats: { social: 6 } },
        { icon: "gift" },
      ),
      option(
        "ขอรับแค่คำอวยพร",
        "ไม่รับเงิน · สุข +5",
        { stats: { happy: 5 } },
        { icon: "heart" },
      ),
    ],
    "ครอบครัว",
    "gift",
  );
}
