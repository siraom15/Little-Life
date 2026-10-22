import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { lotteryChance, yearlyLottery } from "../lib/game/journey/lottery.ts";
import { financeAction, annualExpenses, graduated } from "../lib/game/journey/finance.ts";
import { ageFamily } from "../lib/game/journey/family.ts";
import { resolveAccident } from "../lib/game/journey/accidents.ts";
import { policyTerms } from "../lib/game/ventures.ts";
import { randomAt } from "../lib/game/random.ts";
import { gameConfig } from "../lib/game/journey/config.ts";
import { offeredSalary, promotedSalary } from "../lib/game/journey/salary.ts";
import { careerOffer, promotionEvent } from "../lib/game/journey/events/career.ts";
import {
  diseaseEvent,
  applyDiseaseCare,
  diseases,
} from "../lib/game/journey/diseases.ts";
import { lifeHighlights } from "../lib/game/journey/achievements.ts";
function fixture() {
  const l = createGameLife(42);
  l.age = 30;
  l.money = 1000000;
  l.simulation!.notice = null;
  return l;
}
test("annual lottery charges once, increases one point, cancels and resets without redraw", () => {
  const l = fixture();
  assert.ok(financeAction(l, "lottery"));
  l.simulation!.notice = null;
  const before = l.money;
  yearlyLottery(l);
  assert.equal(l.money, before);
  assert.equal(lotteryChance(l), 0.02);
  l.age++;
  yearlyLottery(l);
  assert.equal(lotteryChance(l), 0.03);
  const cash = l.money;
  yearlyLottery(l);
  assert.equal(l.money, cash);
  assert.ok(financeAction(l, "cancel-lottery"));
  assert.equal(lotteryChance(l), 0.02);
  l.simulation!.notice = null;
  assert.ok(financeAction(l, "lottery"));
  yearlyLottery(l);
  assert.equal(l.money, cash);
  l.simulation!.economy!.prisonUntil = l.age + 4;
  l.age++;
  yearlyLottery(l);
  assert.equal(l.money, cash);
});
test("graduation starts expenses for unemployed graduates but students remain supported", () => {
  const l = fixture();
  l.journey!.school = "มหาวิทยาลัยรัฐ · วิศวกรรม";
  l.age = 21;
  assert.equal(graduated(l), false);
  assert.equal(annualExpenses(l), 0);
  l.age = 22;
  assert.equal(annualExpenses(l), 120000);
  l.journey!.children = [{ name: "ลูก", bornAt: 21 }];
  assert.equal(annualExpenses(l), 156000);
});
test("one parent death queues one combined notice and credits inheritance exactly once", () => {
  const l = fixture();
  l.journey!.parents.father.deathAt = 30;
  l.journey!.parents.mother.deathAt = 99;
  ageFamily(l);
  assert.equal(l.journey!.queue.length, 1);
  assert.match(l.journey!.queue[0].effects, /ความสุข −12.*เงินมรดก/);
  const money = l.money;
  ageFamily(l);
  assert.equal(l.money, money);
  assert.equal(l.journey!.queue.length, 1);
});
test("all policy plans reduce accident cost exactly by coverage and disclose totals", () => {
  const baseline = fixture();
  while (randomAt(baseline.seed, 30, 292) < gameConfig.accidents.fatalChance)
    baseline.seed++;
  const plain = structuredClone(baseline);
  resolveAccident(plain, "car");
  const full = baseline.money - plain.money;
  for (const policy of ["basic", "family", "premium"] as const) {
    const l = structuredClone(baseline);
    l.simulation!.economy!.policy = policy;
    const result = resolveAccident(l, "car");
    assert.equal(
      baseline.money - l.money,
      full - Math.floor(full * policyTerms[policy].accidentCover),
    );
    assert.match(result.notice.effects, /ประกันช่วย.*จ่ายเอง/);
  }
});
test("experienced job offer and promotion retain quoted salary rather than resetting to base", () => {
  let l = fixture();
  l.journey!.hasWorked = true;
  l.income = 1500000;
  const quoted = offeredSalary(l, "technician");
  l.journey!.pending = careerOffer(l);
  const index = l.journey!.pending.choices.findIndex(
    (c) => c.success.career === "technician",
  );
  l.journey!.pending.choices[index].chance = undefined;
  l = journeyAction(l, { type: "choice", index });
  assert.equal(l.income, quoted);
  const next = promotedSalary(l);
  assert.ok(next > quoted);
  l.journey!.pending = promotionEvent(l);
  l.journey!.pending.choices[0].chance = undefined;
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.income, next);
});
test("each serious disease can recover and insurance reduces the displayed treatment price", () => {
  for (const id of Object.keys(diseases) as (keyof typeof diseases)[]) {
    const l = fixture();
    l.journey!.health.severe = {
      id,
      stage: 2,
      diagnosedAt: 30,
      reviewedAt: -1,
      treatedUntil: -1,
    };
    const full = diseaseEvent(l)!.choices[0].cost!;
    l.simulation!.economy!.policy = "premium";
    assert.equal(diseaseEvent(l)!.choices[0].cost, Math.ceil(full * 0.2));
    applyDiseaseCare(l, "standard", true);
    assert.equal(l.journey!.health.severe, undefined);
  }
});
test("film includes major purchases and lottery, at most ten chronological frames", () => {
  const l = fixture();
  l.age = 80;
  l.history = Array.from({ length: 12 }, (_, i) => ({
    id: "asset-" + i,
    age: i + 20,
    title: "ได้เป็นเจ้าของรถ",
    choice: "ซื้อ",
    detail: "",
    category: "ทรัพย์สิน",
    money: 100,
  }));
  l.history.push({
    id: "lottery-70",
    age: 70,
    title: "ถูกรางวัลหวย 8 ล้านบาท!",
    choice: "ถูกรางวัล",
    detail: "",
    category: "การเงิน",
    money: 8000000,
  });
  const frames = lifeHighlights(l);
  assert.equal(frames.length, 10);
  assert.ok(frames.some((f) => f.id === "lottery-70"));
  assert.ok(frames.some((f) => f.id.startsWith("asset-")));
  assert.deepEqual(
    frames.map((f) => f.age),
    frames.map((f) => f.age).sort((a, b) => a - b),
  );
});
