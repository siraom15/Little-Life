import { careers } from "./careers.ts";
import type { Economy, Life } from "./types.ts";
import { randomAt } from "./random.ts";
import { ventures, policyTerms } from "./ventures.ts";
export const emptyEconomy = (): Economy => ({
  fund: 0,
  crypto: 0,
  policy: "none",
  insuredAt: -1,
  beneficiaryPayout: 0,
  heat: 0,
  reputation: 0,
  prisonUntil: 0,
  lastAction: {},
});
const bound = (n: number) => Math.max(0, Math.min(100, n));
function log(life: Life, title: string, detail: string) {
  life.history.push({
    id: "economy-" + life.age + "-" + life.history.length,
    age: life.age,
    title,
    choice: title,
    detail,
    category: "การเงินและสังคม",
    money: life.money,
  });
}
export function ventureLockedReason(life: Life, id: string): string | null {
  const item = ventures.find((v) => v.id === id),
    e = life.simulation?.economy || emptyEconomy();
  if (!item || !life.simulation || life.done || life.simulation.notice)
    return "ยังทำรายการไม่ได้";
  if (life.age < (item.minAge || 18)) return "ปลดล็อกอายุ " + (item.minAge || 18) + " ปี";
  if (e.prisonUntil > life.age) return "พ้นโทษเมื่ออายุ " + e.prisonUntil + " ปี";
  if (e.lastAction[id] === life.age) return "ทำรายการนี้แล้วในปีนี้";
  if (item.cost > 0 && life.money < item.cost) return "เงินไม่พอ";
  if ((id === "sell-fund" && e.fund <= 0) || (id === "sell-crypto" && e.crypto <= 0))
    return "ยังไม่มีสินทรัพย์นี้";
  if (id === "cancel-policy" && e.policy === "none") return "ยังไม่มีกรมธรรม์";
  if ((id === "basic" || id === "family") && e.policy !== "none")
    return "ยกเลิกกรมธรรม์เดิมก่อนเปลี่ยนแผน";
  if ((id === "basic" || id === "family") && life.age > 65)
    return "รับสมัครถึงอายุ 65 ปี";
  const career = careers.find((job) => "job-" + job.id === id);
  if (career && life.stats.skill < career.skill) return "ต้องมีทักษะ " + career.skill;
  if (career && e.lastAction.career === life.age) return "เปลี่ยนอาชีพได้ปีละครั้ง";
  if (id === "campaign" && (e.reputation < 30 || life.flags.includes("politician")))
    return "ต้องมีชื่อเสียง 30 และยังไม่ได้รับเลือก";
  if (id === "corrupt" && !life.flags.includes("politician"))
    return "ต้องได้รับเลือกตั้งก่อน";
  return null;
}
export function applyVenture(life: Life, id: string): boolean {
  if (ventureLockedReason(life, id)) return false;
  const item = ventures.find((v) => v.id === id)!;
  const e = (life.simulation!.economy ??= emptyEconomy());
  e.lastAction[id] = life.age;
  life.money -= item.cost;
  let result = item.detail;
  const career = careers.find((job) => "job-" + job.id === id);
  if (career) {
    life.job = career.label;
    life.income = career.income;
    e.lastAction.career = life.age;
    life.flags = life.flags.filter((f) => f !== "politician");
  }
  switch (id) {
    case "fund":
      e.fund += 10000;
      break;
    case "crypto":
      e.crypto += 5000;
      break;
    case "sell-fund":
      result = "ขายคืน " + e.fund.toLocaleString("th-TH") + " บาท";
      life.money += e.fund;
      e.fund = 0;
      break;
    case "sell-crypto":
      result = "ขายคืน " + e.crypto.toLocaleString("th-TH") + " บาท";
      life.money += e.crypto;
      e.crypto = 0;
      break;
    case "basic":
    case "family":
      e.policy = id;
      e.insuredAt = life.age;
      break;
    case "cancel-policy":
      e.policy = "none";
      break;
    case "lottery": {
      const won = randomAt(life.seed, life.age, 31) < 0.02;
      life.money += won ? 4000 : 0;
      result = won ? "ถูกรางวัล รับ 4,000 บาท" : "ไม่ถูกรางวัล เสียค่าหวย 80 บาท";
      break;
    }
    case "volunteer":
      e.reputation = bound(e.reputation + 12);
      life.stats.social = bound(life.stats.social + 5);
      break;
    case "campaign": {
      const won = randomAt(life.seed, life.age, 32) < 0.55;
      if (won) {
        life.flags.push("politician");
        life.job = "นักการเมืองท้องถิ่น";
        life.income = 360000;
      }
      result = won
        ? "ชนะเลือกตั้ง! เริ่มทำงานท้องถิ่น"
        : "แพ้เลือกตั้ง ค่าใช้จ่ายหาเสียงไม่คืน ลองใหม่ปีหน้า";
      break;
    }
    case "corrupt":
      life.money += 80000;
      e.heat = bound(e.heat + 30);
      e.reputation = bound(e.reputation - 15);
      break;
    case "tribute":
      life.money += 35000;
      e.heat = bound(e.heat + 20);
      e.reputation = bound(e.reputation - 8);
      break;
    case "bribe": {
      const success = randomAt(life.seed, life.age, 33) < 0.5;
      e.heat = bound(e.heat + (success ? -15 : 30));
      result = success
        ? "ความเสี่ยงลดลง 15 แต่คดียังไม่หาย"
        : "การติดสินบนถูกบันทึก ความเสี่ยงเพิ่ม 30";
      break;
    }
    case "cooperate":
      e.heat = bound(e.heat - 25);
      e.reputation = bound(e.reputation + 5);
      break;
  }
  log(life, item.label, result);
  life.simulation!.notice = {
    id: "venture-" + id + "-" + life.age,
    title: item.label,
    text: result,
    scene: "gift",
    effects: "บันทึกรายการลงไทม์ไลน์แล้ว",
  };
  return true;
}
// Called once per game year. Seeded channels keep replay/save/share deterministic.
export function settleEconomyYear(life: Life) {
  const e = life.simulation?.economy;
  if (!e) return;
  const before = e.fund + e.crypto;
  e.fund = Math.max(
    0,
    Math.round(e.fund * (0.88 + randomAt(life.seed, life.age, 34) * 0.3)),
  );
  e.crypto = Math.max(
    0,
    Math.round(e.crypto * (0.4 + randomAt(life.seed, life.age, 35) * 1.4)),
  );
  if (before)
    log(
      life,
      "สรุปพอร์ตประจำปี",
      "มูลค่าเปลี่ยน " + (e.fund + e.crypto - before).toLocaleString("th-TH") + " บาท",
    );
  if (e.policy !== "none" && e.insuredAt < life.age) {
    const premium = policyTerms[e.policy].premium;
    if (life.money >= premium) {
      life.money -= premium;
      log(life, "ต่อประกันชีวิต", "จ่ายเบี้ย " + premium + " บาท");
    } else {
      e.policy = "none";
      log(
        life,
        "ประกันสิ้นสุด",
        "เงินไม่พอต่อเบี้ย ความคุ้มครองสิ้นสุดก่อนเหตุการณ์ปีนี้",
      );
    }
  }
  if (
    e.heat > 0 &&
    e.prisonUntil <= life.age &&
    randomAt(life.seed, life.age, 36) < e.heat / 150
  ) {
    life.money -= 50000;
    e.prisonUntil = life.age + 2;
    e.heat = 0;
    e.reputation = 0;
    life.flags = life.flags.filter((f) => f !== "politician");
    life.job = "พ้นตำแหน่ง / อยู่ระหว่างรับโทษ";
    life.income = 0;
    log(life, "ถูกดำเนินคดี", "ปรับ 50,000 บาท รับโทษ 2 ปี สูญเสียงานและตำแหน่ง");
    life.simulation!.notice = {
      id: "arrest-" + life.age,
      title: "ทางลัดมีราคา",
      text: "ถูกดำเนินคดี ปรับ 50,000 บาทและรับโทษ 2 ปี ต้องสร้างอาชีพใหม่เมื่อพ้นโทษ",
      scene: "home",
      effects: "ชื่อเสียงเป็น 0 · รายได้ประจำเป็น 0",
    };
  }
}
export function settleDeathBenefit(life: Life) {
  const e = life.simulation?.economy;
  if (!e || e.policy === "none") return;
  e.beneficiaryPayout = policyTerms[e.policy].payout;
  e.policy = "none";
  log(
    life,
    "เงินประกันถึงผู้รับผลประโยชน์",
    e.beneficiaryPayout.toLocaleString("th-TH") + " บาท (แยกจากเงินสะสมของผู้เล่น)",
  );
}
