import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameLife, journeyAction } from "../lib/game/journey/engine.ts";
import {
  diseases,
  diseaseEvent,
  applyDiseaseCare,
  seriousDiseaseRisk,
  yearlyDisease,
} from "../lib/game/journey/diseases.ts";
import { endingAchievements, lifeHighlights } from "../lib/game/journey/achievements.ts";
import { endingCardSvg } from "../lib/game/journey/ending-card.ts";
import { financeLocked } from "../lib/game/journey/finance.ts";
import { yearlyInvestments } from "../lib/game/journey/investments.ts";
import { workRewardEvent } from "../lib/game/journey/asset-stories.ts";
import { randomAt } from "../lib/game/random.ts";
function fixture() {
  const l = createGameLife(0);
  l.age = 35;
  l.money = 1000000;
  l.journey!.hasWorked = true;
  l.simulation!.notice = null;
  return l;
}
test("six trophy categories have three earned tiers and no automatic bronze", () => {
  const l = fixture();
  l.money = 0;
  l.history = [];
  assert.equal(endingAchievements(l).length, 6);
  assert.ok(endingAchievements(l).every((a) => a.tier === null));
  l.money = 10000000;
  l.journey!.milestonesScore = { healthyYears: 50, marriedYears: 25, peakRank: 3 };
  l.journey!.skills.tech = 95;
  l.journey!.funeral = { estate: 5000000, title: "", guests: [] };
  assert.ok(endingAchievements(l).every((a) => a.tier === "plat"));
  l.money = 100000;
  assert.equal(endingAchievements(l)[0].tier, "bronze");
  l.money = 1000000;
  assert.equal(endingAchievements(l)[0].tier, "gold");
});
test("card escapes user text; film retains chronological birth and ending", () => {
  const l = fixture();
  l.name = '<script>&"';
  l.done = true;
  l.history.push({
    id: "death",
    age: 35,
    title: "อำลา",
    choice: "จบชีวิต",
    detail: "เหตุการณ์สุดท้าย",
    category: "บทสรุป",
    money: 0,
  });
  const card = endingCardSvg(l);
  assert.ok(!card.includes("<script>"));
  assert.ok(card.includes("&lt;script&gt;"));
  assert.equal((card.match(/ยังไม่ปลดล็อก/g) || []).length, 5);
  const frames = lifeHighlights(l);
  assert.equal(frames[0].age, 0);
  assert.equal(frames.at(-1)!.id, "death");
  assert.ok(frames.length <= 8);
});
test("five serious diseases worsen mortality and retain free treatment choices", () => {
  const l = fixture();
  assert.equal(Object.keys(diseases).length, 5);
  for (const id of Object.keys(diseases) as (keyof typeof diseases)[]) {
    l.journey!.health.severe = {
      id,
      stage: 1,
      diagnosedAt: 35,
      reviewedAt: -1,
      treatedUntil: -1,
    };
    const early = seriousDiseaseRisk(l);
    l.journey!.health.severe.stage = 4;
    assert.ok(seriousDiseaseRisk(l) > early);
    const event = diseaseEvent(l)!;
    assert.equal(event.choices.length, 5);
    assert.equal(event.choices[2].cost, 0);
    applyDiseaseCare(l, "standard", true);
    if (diseases[id].canRecover) assert.equal(l.journey!.health.severe, undefined);
    else assert.equal(l.journey!.health.severe?.stage, 3);
  }
});
test("care follows the displayed decision, does not cure chronic disease, and is reviewed every two years", () => {
  const l = fixture();
  l.journey!.health.severe = {
    id: "cancer",
    stage: 4,
    diagnosedAt: 30,
    reviewedAt: -1,
    treatedUntil: -1,
  };
  const untreated = seriousDiseaseRisk(l);
  applyDiseaseCare(l, "public", false);
  assert.ok(seriousDiseaseRisk(l) < untreated);
  assert.equal(diseaseEvent(l), null);
  l.age += 2;
  assert.ok(diseaseEvent(l));
  l.journey!.pending = diseaseEvent(l);
  l.money = 0;
  const next = journeyAction(l, { type: "choice", index: 4 });
  assert.equal(next.money, 0);
  assert.ok(next.journey!.health.severe!.treatedUntil < next.age);
});
test("diagnosis and progression are deterministic, and Alzheimer's is age gated", () => {
  const l = fixture();
  l.age = 5;
  let found = false;
  for (let seed = 0; seed < 1000; seed++) {
    l.seed = seed;
    const copy = structuredClone(l);
    yearlyDisease(copy);
    if (copy.journey!.health.severe) {
      found = true;
      assert.notEqual(copy.journey!.health.severe.id, "alzheimer");
      const same = structuredClone(l);
      yearlyDisease(same);
      assert.deepEqual(copy, same);
      break;
    }
  }
  assert.ok(found);
});
test("risk selection costs nothing, locks for one year, and high-risk crashes can wipe out holdings", () => {
  let l = fixture();
  l.simulation!.economy!.fund = 100000;
  l = journeyAction(l, { type: "venture", id: "risk:fund:high" });
  assert.equal(l.money, 1000000);
  assert.equal(l.journey!.investment.risks!.fund, "high");
  assert.ok(financeLocked(l, "risk:fund:low"));
  l.age++;
  assert.equal(financeLocked(l, "risk:fund:low"), null);
  while (randomAt(l.seed, l.age, 280) >= 0.09) l.seed++;
  yearlyInvestments(l);
  assert.equal(l.simulation!.economy!.fund, 0);
  assert.ok(l.journey!.queue.some((n) => n.id.startsWith("market-crash-fund")));
  assert.ok(financeLocked(l, "risk:fund:made-up"));
});
test("work rewards cover insurance, houses and cars; insurance is charged once", () => {
  const seen = new Set<string>();
  for (let seed = 0; seed < 80; seed++) {
    let l = fixture();
    l.seed = seed;
    l.journey!.career = { id: "teacher", rank: 0, since: 22 };
    const event = workRewardEvent(l)!;
    seen.add(event.id.split("-")[1]);
    if (event.id.startsWith("offer-insurance")) {
      l.journey!.pending = event;
      l = journeyAction(l, { type: "choice", index: 0 });
      assert.equal(l.money, 997000);
      assert.equal(l.simulation!.economy!.policy, "basic");
    }
  }
  assert.deepEqual([...seen].sort(), ["car", "house", "insurance"]);
});

test("disease follow-up does not swallow a fixed school milestone",()=>{
 const l=createGameLife(42);l.age=5;l.simulation!.notice=null;l.journey!.health.severe={id:"cancer",stage:1,diagnosedAt:5,reviewedAt:-1,treatedUntil:8};
 const next=journeyAction(l,{type:"year"});assert.equal(next.journey!.pending?.id,"school");
});
