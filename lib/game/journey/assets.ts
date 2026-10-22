import { gameConfig } from "./config.ts";
import { householdIncome } from "./family.ts";
import type { Life } from "../types.ts";
import type { OwnedAsset } from "./types.ts";
export type AssetKind = "house" | "car";
export type AssetModel = {
  id: string;
  name: string;
  price: number;
  color: string;
  detail: string;
};
export const houses: AssetModel[] = [
  {
    id: "condo",
    name: "ห้องชุดเริ่มต้น",
    price: gameConfig.assets.prices.condo,
    color: "#67b8e8",
    detail: "พื้นที่เล็กของเรา",
  },
  {
    id: "townhouse",
    name: "ทาวน์เฮาส์",
    price: gameConfig.assets.prices.townhouse,
    color: "#f0b16d",
    detail: "สองชั้นสำหรับครอบครัว",
  },
  {
    id: "detached",
    name: "บ้านเดี่ยว",
    price: gameConfig.assets.prices.detached,
    color: "#e58288",
    detail: "บ้านพร้อมสนามหญ้า",
  },
  {
    id: "garden",
    name: "บ้านสวน",
    price: gameConfig.assets.prices.garden,
    color: "#7acfa0",
    detail: "พื้นที่สีเขียวกว้างขวาง",
  },
  {
    id: "mansion",
    name: "คฤหาสน์",
    price: gameConfig.assets.prices.mansion,
    color: "#c0a0ec",
    detail: "รางวัลของชีวิตที่ไปไกล",
  },
];
export const cars: AssetModel[] = [
  {
    id: "scooter",
    name: "มอเตอร์ไซค์",
    price: gameConfig.assets.prices.scooter,
    color: "#efca67",
    detail: "คล่องตัว เริ่มต้นง่าย",
  },
  {
    id: "compact",
    name: "รถเล็ก",
    price: gameConfig.assets.prices.compact,
    color: "#71c8c6",
    detail: "เพื่อนคู่ใจในเมือง",
  },
  {
    id: "sedan",
    name: "รถซีดาน",
    price: gameConfig.assets.prices.sedan,
    color: "#76acf1",
    detail: "เดินทางสบายขึ้น",
  },
  {
    id: "suv",
    name: "รถครอบครัว SUV",
    price: gameConfig.assets.prices.suv,
    color: "#de9d69",
    detail: "พาคนสำคัญไปด้วยกัน",
  },
  {
    id: "sport",
    name: "รถสปอร์ต",
    price: gameConfig.assets.prices.sport,
    color: "#ed718c",
    detail: "ความฝันบนสี่ล้อ",
  },
];
export const assetCatalog = { house: houses, car: cars };
export const allCars = (life: Life) => [
  ...(life.journey!.car ? [life.journey!.car] : []),
  ...life.journey!.extraCars,
];
export function removeCar(life: Life, index = 0) {
  const cars = allCars(life);
  cars.splice(index, 1);
  life.journey!.car = cars[0] || null;
  life.journey!.extraCars = cars.slice(1);
}
export const assetActions = (Object.keys(assetCatalog) as AssetKind[]).flatMap((kind) => [
  ...assetCatalog[kind].flatMap((model) => [
    kind + ":" + model.id + ":cash",
    kind + ":" + model.id + ":finance",
  ]),
  kind + ":sell",
  ...(kind === "car" ? ["car:sell:0", "car:sell:1", "car:sell:2"] : []),
]);
export function quoteAsset(kind: AssetKind, model: AssetModel) {
  const rate = gameConfig.assets[kind].rate,
    years = gameConfig.assets[kind].years,
    down = Math.ceil(model.price * gameConfig.assets[kind].downRate),
    principal = model.price - down;
  // Cover per-year whole-baht rounding so no residual baht survives the final installment.
  const annual = Math.ceil((principal * rate) / (1 - Math.pow(1 + rate, -years))) + 1;
  return { rate, years, down, principal, annual, total: down + annual * years };
}
export function assetAnnual(life: Life) {
  return (
    (life.journey!.house?.annualPayment || 0) +
    allCars(life).reduce((sum, car) => sum + car.annualPayment, 0)
  );
}
export function assetMaintenance(life: Life) {
  return Math.round(
    (life.journey!.house?.price || 0) * gameConfig.assets.house.maintenanceRate +
      allCars(life).reduce((sum, car) => sum + car.price, 0) *
        gameConfig.assets.car.maintenanceRate,
  );
}
function record(life: Life, title: string, detail: string) {
  life.history.push({
    assetSnapshot: structuredClone({
      house: life.journey!.house,
      car: life.journey!.car,
      extraCars: life.journey!.extraCars,
    }),
    id: "asset-" + life.age + "-" + life.history.length,
    age: life.age,
    title,
    choice: title,
    detail,
    category: "ทรัพย์สิน",
    money: life.money,
  });
  life.journey!.lastResult = title + " · " + detail;
}
export function assetLocked(life: Life, id: string): string | null {
  if (!assetActions.includes(id)) return "ไม่พบรายการ";
  if (life.done || life.simulation!.notice || life.journey!.pending)
    return "รอเหตุการณ์จบก่อน";
  if (life.age < 18) return "ซื้อได้ตั้งแต่อายุ 18 ปี";
  if (life.simulation!.economy!.prisonUntil > life.age) return "รอพ้นโทษก่อน";
  const [kind, key, mode] = id.split(":") as [AssetKind, string, string],
    owned =
      kind === "car" && key === "sell"
        ? allCars(life)[Number(mode) || 0]
        : life.journey![kind];
  if (key === "sell") {
    if (!owned) return "ยังไม่มีทรัพย์สิน";
    return life.money + Math.floor(owned.price * 0.6) < owned.balance
      ? "เงินไม่พอปิดยอดผ่อนหลังขาย"
      : null;
  }
  if (kind === "house" && owned) return "ขายทรัพย์สินเดิมก่อนเปลี่ยน";
  if (kind === "car" && allCars(life).length >= 3) return "โรงรถเต็ม 3 คันแล้ว";
  const model = assetCatalog[kind].find((m) => m.id === key)!;
  const quote = quoteAsset(kind, model);
  if (life.money < (mode === "cash" ? model.price : quote.down))
    return mode === "cash" ? "เงินสดไม่พอ" : "เงินดาวน์ไม่พอ";
  if (mode === "finance") {
    if (life.journey!.creditUntil > life.age) return "อยู่ระหว่างพักสิทธิ์กู้";
    if (quote.annual + assetAnnual(life) > householdIncome(life) * 0.45)
      return "ค่างวดรวมเกิน 45% ของรายได้ครัวเรือน";
  }
  return null;
}
export function purchaseAsset(life: Life, id: string) {
  if (assetLocked(life, id)) return false;
  const [kind, key, mode] = id.split(":") as [AssetKind, string, string];
  const owned =
    kind === "car" && key === "sell"
      ? allCars(life)[Number(mode) || 0]
      : life.journey![kind];
  if (key === "sell") {
    const net = Math.floor(owned!.price * 0.6) - owned!.balance;
    life.money += net;
    if (kind === "car") removeCar(life, Number(mode) || 0);
    else life.journey!.house = null;
    record(
      life,
      "ขาย" + (kind === "house" ? "บ้าน" : "รถ"),
      "ราคาขาย 60% ของราคาซื้อ หักยอดผ่อนแล้วสุทธิ " +
        net.toLocaleString("th-TH") +
        " บาท",
    );
    return true;
  }
  const model = assetCatalog[kind].find((m) => m.id === key)!,
    quote = quoteAsset(kind, model),
    financed = mode === "finance";
  life.money -= financed ? quote.down : model.price;
  const bought: OwnedAsset = {
    id: key,
    price: model.price,
    balance: financed ? quote.principal : 0,
    annualPayment: financed ? quote.annual : 0,
    rate: financed ? quote.rate : 0,
    yearsLeft: financed ? quote.years : 0,
    missed: 0,
    boughtAt: life.age,
  };
  if (kind === "car" && life.journey!.car) life.journey!.extraCars.push(bought);
  else life.journey![kind] = bought;
  if (kind === "house") life.journey!.homeless = false;
  life.stats.happy = Math.min(100, life.stats.happy + 12);
  record(
    life,
    "ได้เป็นเจ้าของ" + model.name,
    financed
      ? "ดาวน์ " + quote.down + " · ผ่อน " + quote.annual + "/ปี"
      : "จ่ายสด " + model.price + " บาท",
  );
  return true;
}
export function settleAssets(life: Life) {
  const entries = [
    ...(life.journey!.house
      ? [{ kind: "house" as const, owned: life.journey!.house }]
      : []),
    ...allCars(life).map((owned) => ({ kind: "car" as const, owned })),
  ];
  for (const { kind, owned } of entries) {
    if (owned.balance <= 0) continue;
    owned.balance = Math.ceil(owned.balance * (1 + owned.rate));
    const due = Math.min(owned.balance, owned.annualPayment),
      paid = Math.min(life.money, due);
    life.money -= paid;
    owned.balance -= paid;
    owned.missed = paid < due ? owned.missed + 1 : 0;
    owned.yearsLeft = Math.max(0, owned.yearsLeft - 1);
    if (!owned.balance) {
      owned.annualPayment = 0;
      owned.yearsLeft = 0;
      record(life, "ผ่อนหมดแล้ว", owned.id);
    } else if (owned.missed >= 3) {
      const gap = Math.max(0, owned.balance - Math.floor(owned.price * 0.6));
      life.journey!.debt += gap;
      if (kind === "house") life.journey!.house = null;
      else removeCar(life, allCars(life).indexOf(owned));
      record(life, "ทรัพย์สินถูกยึด", owned.id + " · หนี้ส่วนต่าง " + gap);
      life.journey!.queue.push({
        id: "repossession-" + owned.id + "-" + life.age,
        title: "ทรัพย์สินถูกยึด",
        text: "ขาดส่ง 3 ปี · หนี้ส่วนต่าง " + gap,
        scene: "home",
        effects: "ทรัพย์สินชิ้นนี้ถูกนำออกจากฉากแล้ว",
      });
    }
  }
}
