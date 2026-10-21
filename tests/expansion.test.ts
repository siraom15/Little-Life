import { storyChoiceLocked } from "../lib/game/journey/asset-stories.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGameLife,
  journeyAction,
  validateLife,
  encodeLife,
  decodeLife,
} from "../lib/game.ts";
import { jobs, riskyJobs } from "../lib/game/journey/catalog.ts";
import {
  houses,
  cars,
  quoteAsset,
  assetLocked,
  settleAssets,
} from "../lib/game/journey/assets.ts";
import { policeRaid, isImprisoned } from "../lib/game/journey/police.ts";
import { buildFuneral } from "../lib/game/journey/funeral.ts";
import { milestoneEvent } from "../lib/game/journey/events.ts";
import { successChance } from "../lib/game/journey/chance.ts";
import { randomAt } from "../lib/game/random.ts";
function fixture() {
  const life = createGameLife(0);
  life.age = 30;
  life.money = 1000000;
  life.income = 1000000;
  life.journey!.hasWorked = true;
  life.simulation!.notice = null;
  return life;
}
test("20 career paths include mafia, underground work and politics; family opportunities recur", () => {
  assert.equal(jobs.length, 20);
  assert.ok(riskyJobs.has("mafia"));
  assert.ok(jobs.some((j) => j.id === "politician"));
  const life = fixture();
  life.journey!.partner = { name: "คู่ชีวิต", status: "married", bond: 80, since: 24 };
  for (const age of [30, 34, 38, 42, 46, 50, 54]) {
    life.age = age;
    assert.ok(milestoneEvent(life)!.id.startsWith("child-"));
  }
  life.journey!.career = { id: "developer", rank: 0, since: 22 };
  for (const age of [26, 29, 33, 37, 41, 45]) {
    life.age = age;
    assert.ok(/career|promotion/.test(milestoneEvent(life)!.id));
  }
});
test("funds can be purchased and sold repeatedly in one year without creating profit", () => {
  let life = fixture(),
    money = life.money;
  life = journeyAction(life, { type: "venture", id: "fund" });
  life = journeyAction(life, { type: "venture", id: "fund" });
  assert.equal(life.simulation!.economy!.fund, 20000);
  assert.equal(life.money, money - 20000);
  life = journeyAction(life, { type: "venture", id: "sell-fund" });
  life = journeyAction(life, { type: "venture", id: "fund" });
  assert.equal(life.money, money - 10000);
  assert.equal(life.simulation!.economy!.fund, 10000);
});
test("five houses and five vehicles support cash and amortized purchases", () => {
  assert.equal(houses.length, 5);
  assert.equal(cars.length, 5);
  let life = fixture();
  const quote = quoteAsset("house", houses[0]);
  life = journeyAction(life, { type: "venture", id: "house:condo:finance" });
  assert.equal(life.money, 1000000 - quote.down);
  assert.equal(life.journey!.house!.balance, quote.principal);
  life = journeyAction(life, { type: "venture", id: "car:scooter:cash" });
  assert.equal(life.journey!.car!.balance, 0);
  assert.ok(assetLocked(life, "house:townhouse:cash"));
  for (let year = 0; year < quote.years; year++) {
    life.money = 1000000;
    settleAssets(life);
  }
  assert.equal(life.journey!.house!.balance, 0);
  assert.equal(life.journey!.house!.annualPayment, 0);
});
test("unaffordable finance and resale are blocked; three missed installments repossess property", () => {
  let life = fixture();
  life.income = 0;
  assert.ok(assetLocked(life, "house:condo:finance"));
  life.income = 1000000;
  life = journeyAction(life, { type: "venture", id: "house:condo:finance" });
  life.money = 0;
  assert.ok(assetLocked(life, "house:sell"));
  for (let year = 0; year < 3; year++) settleAssets(life);
  assert.equal(life.journey!.house, null);
  assert.ok(life.journey!.debt > 0);
  assert.ok(life.journey!.queue.some((n) => n.id.startsWith("repossession")));
});
test("prison blocks gameplay but allows seizure notices and releases on schedule", () => {
  let life = fixture();
  life.journey!.pending = policeRaid(life);
  life = journeyAction(life, { type: "choice", index: 0 });
  assert.ok(isImprisoned(life));
  assert.equal(life.simulation!.economy!.prisonUntil, 32);
  for (const action of [
    { type: "choice", index: 1 },
    { type: "venture", id: "fund" },
    { type: "venture", id: "car:scooter:cash" },
    { type: "ack" },
    { type: "activity", activity: "rest" },
  ] as const)
    assert.equal(journeyAction(life, action), life);
  life = journeyAction(life, { type: "year" });
  assert.equal(life.age, 31);
  if (life.simulation!.notice) {
    assert.equal(life.simulation!.notice.scene, "prison");
    life = journeyAction(life, { type: "ack" });
  }
  assert.ok(isImprisoned(life));
  life = journeyAction(life, { type: "year" });
  assert.equal(life.age, 32);
  assert.equal(isImprisoned(life), false);
  assert.ok(life.simulation!.notice);
  assert.ok(life.journey!.pending!.id.startsWith("career"));
});
test("bribery uses exactly the displayed probability with success and longer-sentence failure", () => {
  let successes = 0,
    failures = 0;
  for (let seed = 0; seed < 50; seed++) {
    const life = fixture();
    life.seed = seed;
    life.simulation!.economy!.heat = 70;
    life.journey!.pending = policeRaid(life);
    const chance = successChance(life, life.journey!.pending.choices[2]);
    const won =
      randomAt(seed, life.age, 150 + life.simulation!.actions.length) < chance / 100;
    const next = journeyAction(life, { type: "choice", index: 2 });
    assert.equal(isImprisoned(next), !won);
    if (won) {
      successes++;
      assert.equal(next.simulation!.economy!.heat, 30);
    } else {
      failures++;
      assert.equal(next.simulation!.economy!.prisonUntil, 35);
    }
  }
  assert.ok(successes > 0 && failures > 0);
});
test("funeral guest generation is deterministic and reflects public-service careers", () => {
  const life = fixture();
  life.journey!.careerHistory = ["politician", "doctor"];
  life.stats.social = 80;
  const funeral = buildFuneral(life);
  assert.deepEqual(buildFuneral(life), funeral);
  assert.ok(funeral.guests.some((g) => g.role === "ผู้ที่เคยได้รับความช่วยเหลือ"));
  assert.ok(funeral.guests.some((g) => g.role === "ผู้ระลึกถึงความเมตตา"));
});
test("v8 investment and property transactions roundtrip through validated shares", () => {
  for (let seed = 0; seed < 100; seed++) {
    let life = createGameLife(seed);
    while (!life.done && life.age < 28) {
      if (life.simulation!.notice) life = journeyAction(life, { type: "ack" });
      else if (life.journey!.pending) {
        const index = life.journey!.pending.choices.findIndex(
          (c) => !storyChoiceLocked(life, c),
        );
        life = journeyAction(life, { type: "choice", index });
      } else life = journeyAction(life, { type: "year" });
    }
    if (
      life.done ||
      life.simulation!.notice ||
      life.journey!.pending ||
      life.money < 120000 ||
      isImprisoned(life)
    )
      continue;
    life = journeyAction(life, { type: "venture", id: "fund" });
    life = journeyAction(life, { type: "venture", id: "fund" });
    life = journeyAction(life, { type: "venture", id: "car:scooter:cash" });
    assert.equal(life.version, 8);
    assert.equal(life.journey!.car!.id, "scooter");
    assert.ok(validateLife(life));
    assert.deepEqual(decodeLife(encodeLife(life)), life);
    return;
  }
  assert.fail("No eligible adult fixture");
});

test("all financed models finish within the quoted term despite currency rounding", () => {
  for (const kind of ["house", "car"] as const)
    for (const model of kind === "house" ? houses : cars) {
      let life = fixture();
      life.money = 10000000;
      life.income = 10000000;
      const terms = quoteAsset(kind, model);
      life = journeyAction(life, {
        type: "venture",
        id: kind + ":" + model.id + ":finance",
      });
      for (let year = 0; year < terms.years; year++) {
        life.money = 10000000;
        settleAssets(life);
      }
      assert.equal(life.journey![kind]!.balance, 0, model.id);
    }
});
