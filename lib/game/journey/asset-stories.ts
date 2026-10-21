import type { Life } from "../types.ts";
import type { StoryChoice } from "./types.ts";
import { gameConfig } from "./config.ts";
import { randomAt } from "../random.ts";
import { allCars, assetCatalog, assetLocked, quoteAsset } from "./assets.ts";
import { event, option } from "./events/builders.ts";
export function storyChoiceLocked(life: Life, choice: StoryChoice): string | null {
  if (choice.assetAction) {
    const copy = structuredClone(life);
    copy.journey!.pending = null;
    return assetLocked(copy, choice.assetAction);
  }
  return (choice.cost || 0) > Math.max(0, life.money) ? "เงินส่วนตัวไม่พอ" : null;
}
export function applyAssetBenefits(life: Life) {
  for (const kind of ["house", "car"] as const) {
    if (!life.journey![kind] || life.simulation!.economy!.prisonUntil > life.age)
      continue;
    const bonus = gameConfig.assets[kind];
    life.stats.health = Math.min(100, life.stats.health + bonus.health);
    life.stats.happy = Math.min(100, life.stats.happy + bonus.happy);
  }
}
export function assetDamage(life: Life, kind: "house" | "car") {
  const owned = life.journey![kind]!;
  const repair = Math.ceil(owned.price * gameConfig.assets[kind].repairRate);
  const name = kind === "house" ? "บ้านไฟไหม้บางส่วน" : "รถเสียระหว่างทาง";
  return event(
    life,
    "damage-" + kind + "-" + life.age,
    name,
    "ต้องซ่อมเพื่อใช้งานต่อ หากทิ้งทรัพย์สิน ยอดผ่อนที่เหลือจะกลายเป็นหนี้ทั่วไป",
    [
      option(
        "ซ่อมเต็มระบบ",
        "จ่ายค่าซ่อมและกลับมาใช้งานได้",
        { stats: { happy: 2 } },
        { cost: repair, icon: "tool" },
      ),
      option(
        "ซ่อมเอง",
        "ประหยัดครึ่งหนึ่ง แต่ถ้าพลาดต้องซ่อมเต็มราคาเพิ่ม",
        {},
        {
          cost: Math.ceil(repair / 2),
          icon: "tool",
          chance: { base: 35, skill: "tech" },
          failure: { money: -repair },
          failureText: "ซ่อมไม่สำเร็จ จ่ายค่าช่างเต็มราคาเพิ่ม เงินไม่พอเป็นหนี้",
        },
      ),
      option(
        "ขอคนรู้จักช่วย",
        "สำเร็จไม่เสียเงิน พลาดต้องจ่ายค่าซ่อม",
        { stats: { social: 2 } },
        {
          icon: "users",
          chance: { base: 25, stat: "social" },
          failure: { money: -repair },
          failureText: "ไม่มีใครช่วยได้ ต้องจ่ายค่าซ่อม เงินไม่พอเป็นหนี้",
        },
      ),
      option(
        "ซ่อมก่อน จ่ายทีหลัง",
        "จ่ายค่าซ่อมพร้อมค่าบริการ 10% เงินไม่พอเป็นหนี้",
        { money: -Math.ceil(repair * 1.1) },
        { icon: "coin" },
      ),
      option(
        "ยอมเสียทรัพย์สิน",
        "บ้านหรือรถหายไป โบนัสสิ้นสุด และยังต้องรับผิดชอบยอดผ่อน",
        { loseAsset: kind, stats: { happy: -10 } },
        { icon: "danger" },
      ),
    ],
    "ทรัพย์สิน",
  );
}
export function assetOffer(life: Life, kind: "house" | "car") {
  const model =
      assetCatalog[kind][Math.min(4, Math.floor(randomAt(life.seed, life.age, 182) * 5))],
    q = quoteAsset(kind, model),
    bonus = gameConfig.assets[kind];
  return event(
    life,
    "offer-" + kind + "-" + life.age,
    "โอกาสเป็นเจ้าของ" + model.name,
    "ราคา ฿" +
      model.price.toLocaleString("th-TH") +
      " · ทุกปี สุขภาพ +" +
      bonus.health +
      " ความสุข +" +
      bonus.happy +
      " · มีค่าดูแลและความเสี่ยงเสียหาย",
    [
      option(
        "ซื้อเงินสด",
        "จ่ายเต็มจำนวน ไม่มีค่างวด",
        {},
        { cost: model.price, assetAction: kind + ":" + model.id + ":cash", icon: "coin" },
      ),
      option(
        "ดาวน์และผ่อน",
        "ดาวน์ ฿" +
          q.down.toLocaleString("th-TH") +
          " · ผ่อน ฿" +
          q.annual.toLocaleString("th-TH") +
          "/ปี × " +
          q.years +
          " ปี · ดอกเบี้ย " +
          Math.round(q.rate * 100) +
          "% · รวมไม่เกิน ฿" +
          q.total.toLocaleString("th-TH"),
        {},
        { cost: q.down, assetAction: kind + ":" + model.id + ":finance", icon: "coin" },
      ),
      option(
        "ศึกษาค่าใช้จ่ายก่อน",
        "ยังไม่ซื้อ ได้ทักษะธุรกิจ +1",
        { skills: { business: 1 } },
        { icon: "book" },
      ),
      option(
        "เก็บเงินไว้ก่อน",
        "ยังไม่ซื้อ เพิ่มความสุข +1",
        { stats: { happy: 1 } },
        { icon: "heart" },
      ),
      option(
        "ขอผ่านข้อเสนอนี้",
        "ซื้อรุ่นอื่นภายหลังได้ที่หน้าการเงิน",
        {},
        { icon: "flag" },
      ),
    ],
    "ทรัพย์สิน",
  );
}
export function assetStory(life: Life) {
  for (const [index, kind] of (["house", "car"] as const).entries()) {
    if (
      life.journey![kind] &&
      randomAt(life.seed, life.age, 180 + index) < gameConfig.assets.damageChance
    )
      return assetDamage(life, kind);
  }
  const missing = (["house", "car"] as const).filter((kind) =>
    kind === "car" ? allCars(life).length < 3 : !life.journey![kind],
  );
  const kind = missing[Math.floor(randomAt(life.seed, life.age, 184) * missing.length)];
  if (kind && randomAt(life.seed, life.age, 183) < gameConfig.assets.offerChance)
    return assetOffer(life, kind);
  return null;
}
