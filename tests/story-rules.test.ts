import { redEnvelopeEvent } from "../lib/game/journey/events/red-envelope.ts";
import { annualExpenses } from "../lib/game/journey/finance.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import { yearlyFinance } from "../lib/game/journey/finance.ts";
import { randomStory } from "../lib/game/journey/events/random.ts";
import {
  extraStoryDefinitions,
  extraStories,
} from "../lib/game/journey/events/extra-stories.ts";
import { careerOffer } from "../lib/game/journey/events/career.ts";
import { milestoneEvent } from "../lib/game/journey/events/milestones.ts";
import { successChance } from "../lib/game/journey/chance.ts";
import { healthEventChance, deathCause } from "../lib/game/journey/health.ts";
import { ageFamily } from "../lib/game/journey/family.ts";
import { portfolioChart } from "../lib/game/journey/notice-visual.ts";
import { randomAt } from "../lib/game/random.ts";
import { storyChoiceLocked } from "../lib/game/journey/asset-stories.ts";
test("personal starting money varies by family and never increases automatically", () => {
  const amounts = new Set<number>();
  for (let seed = 0; seed < 40; seed++) {
    const l = createGameLife(seed);
    amounts.add(l.money);
    assert.ok([20000, 80000, 200000].includes(l.money));
    const initial = l.money;
    l.simulation!.notice = null;
    for (let age = 1; age <= 21; age++) {
      l.age = age;
      yearlyFinance(l);
      assert.equal(l.money, initial);
    }
  }
  assert.equal(amounts.size, 3);
});
test("tuition spends only player money and cannot access rich parents", () => {
  let l = createGameLife(0);
  l.simulation!.notice = null;
  l.age = 18;
  l.journey!.pending = milestoneEvent(l);
  const c = l.journey!.pending!.choices[0];
  l.money = 0;
  assert.ok(storyChoiceLocked(l, c));
  l.money = c.cost! + 1000;
  const parents = structuredClone(l.journey!.parents);
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.money, 1000);
  assert.deepEqual(l.journey!.parents, parents);
});
test("red envelope immediately credits personal wallet once with no parent withdrawal", () => {
  let l = createGameLife(0);
  l.age = 8;
  l.simulation!.notice = null;
  l.journey!.pending = redEnvelopeEvent(l);
  const amount = l.journey!.pending.choices[0].success.money!,
    before = l.money,
    parents = structuredClone(l.journey!.parents);
  l = journeyAction(l, { type: "choice", index: 0 });
  assert.equal(l.money, before + amount);
  assert.deepEqual(l.journey!.parents, parents);
  assert.equal(journeyAction(l, { type: "choice", index: 0 }), l);
});
test("living and child costs begin after first job", () => {
  const l = createGameLife(0);
  l.age = 25;
  l.journey!.children.push({ name: "ลูก", bornAt: 24 });
  assert.equal(annualExpenses(l), 0);
  l.journey!.hasWorked = true;
  assert.equal(annualExpenses(l), 156000);
});
test("children only receive age-appropriate stories and 24 new stories have five choices", () => {
  assert.equal(extraStoryDefinitions.length, 24);
  for (const age of [6, 9, 13, 17])
    for (let seed = 0; seed < 30; seed++) {
      const l = createGameLife(seed);
      l.age = age;
      const e = randomStory(l);
      assert.ok(!/friend-|career-|scam-|ethics-|travel-/.test(e.id));
      assert.ok(extraStories(l).some((s) => s.id === e.id));
      assert.equal(e.choices.length, 5);
    }
  const l = createGameLife(1);
  l.age = 30;
  assert.ok(extraStories(l, true).length >= 8);
});
test("medical education changes actual displayed hiring odds without changing stats", () => {
  const l = createGameLife(0);
  l.age = 22;
  l.journey!.luck = 50;
  const c = careerOffer(l).choices.find((c) => c.success.career === "doctor")!;
  const baseline = successChance(l, c);
  l.journey!.school = "มหาวิทยาลัยรัฐ · แพทยศาสตร์";
  assert.equal(successChance(l, c), baseline + 25);
  const nursing = careerOffer(l).choices.find((c) => c.success.career === "nurse")!;
  const related = successChance(l, nursing);
  l.journey!.school = "ยังไม่เข้าเรียน";
  assert.equal(related - successChance(l, nursing), 10);
});
test("health event chances rise at 20 and 41", () => {
  assert.equal(healthEventChance(10), 0);
  assert.ok(healthEventChance(20) > healthEventChance(19) * 2);
  assert.ok(healthEventChance(41) > healthEventChance(40));
});
test("sudden layoff stops salary and queues an explicit layoff scene", () => {
  const l = createGameLife(0);
  l.age = 30;
  l.money = 1000000;
  l.income = 300000;
  l.journey!.career = { id: "developer", rank: 0, since: 22 };
  l.journey!.hasWorked = true;
  l.simulation!.notice = null;
  let seed = 0;
  while (randomAt(seed, 31, 247) >= 0.045 || randomAt(seed, 31, 142) < 0.001) seed++;
  l.seed = seed;
  const next = journeyAction(l, { type: "year" });
  assert.equal(next.journey!.career, null);
  assert.equal(next.income, 0);
  assert.ok(next.journey!.pending?.id.startsWith("career-loss"));
  assert.ok(
    next.simulation!.notice?.visual === "layoff" ||
      next.journey!.queue.some((n) => n.visual === "layoff"),
  );
});
test("bereavement gets graves; graph direction follows actual positive/negative data", () => {
  const l = createGameLife(0);
  l.age = l.journey!.parents.father.deathAt;
  ageFamily(l);
  assert.ok(l.journey!.queue.some((n) => n.visual === "grave"));
  const down = portfolioChart([
      { age: 20, profit: 0 },
      { age: 22, profit: -5000 },
    ]),
    up = portfolioChart([
      { age: 20, profit: 0 },
      { age: 22, profit: 5000 },
    ]);
  assert.equal(down.profit, -5000);
  assert.equal(up.profit, 5000);
  assert.ok(down.path.endsWith("V150"));
  assert.ok(up.path.endsWith("V50"));
});
test("death descriptions identify disease, prison and terminal health rather than generic endings", () => {
  const l = createGameLife(0);
  l.age = 30;
  l.journey!.health.disease = "โรคตับ";
  l.stats.health = 10;
  assert.ok(deathCause(l).includes("โรคตับ"));
  l.journey!.health.disease = null;
  l.stats.health = 80;
  l.simulation!.economy!.prisonUntil = 40;
  assert.match(deathCause(l), /เรือนจำ|รับโทษ/);
  l.simulation!.economy!.prisonUntil = 0;
  l.stats.health = 0;
  assert.ok(deathCause(l).includes("ล้มเหลว"));
});
