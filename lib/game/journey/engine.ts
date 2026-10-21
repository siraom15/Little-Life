import { redEnvelopeEvent } from "./events/red-envelope.ts";
import { randomHealthEvent, healthEventChance, deathCause } from "./health.ts";
import { payChoice, receiveMoney, startingWallet } from "./wallet.ts";
import { applyHabit, yearlyHealth, mortalityRisk, lifestyleEvent } from "./health.ts";
import { positionTitle, settleMission } from "./career-paths.ts";
import { gameConfig } from "./config.ts";
import { assetStory, applyAssetBenefits, storyChoiceLocked } from "./asset-stories.ts";
import { purchaseAsset, removeCar } from "./assets.ts";
import { isImprisoned, imprison, policeRaid, prisonConfiscation } from "./police.ts";
import { buildFuneral } from "./funeral.ts";
import type { Life, SimulationAction, Stat } from "../types.ts";
import type { Outcome, Skill, StoryEvent } from "./types.ts";
import { createNewLife } from "../birth.ts";
import { emptyEconomy } from "../economy.ts";
import { randomAt } from "../random.ts";
import { jobs, careerIncome, ranks, clamp, stages, riskyJobs } from "./catalog.ts";
import { createParents, ageFamily, familyIncome } from "./family.ts";
import { milestoneEvent, randomStory, debtCrisis, careerOffer } from "./events.ts";
import {
  financeAction,
  yearlyFinance,
  bankrupt,
  settleDeathBenefit,
  financeIds,
} from "./finance.ts";
import { successChance } from "./chance.ts";
export function createGameLife(seed: number, name = "นที"): Life {
  const life = createNewLife(seed, name);
  life.version = 8;
  life.money = 0;
  life.income = 0;
  life.journey = {
    balanceRevision: gameConfig.revision,

    house: null,
    car: null,
    extraCars: [],
    homeless: false,
    hasWorked: false,
    retirement: "",
    completedMissions: [],
    health: {
      addiction: 0,
      alcohol: 0,
      smoking: 0,
      exercise: 0,
      disease: null,
      hospitalUntil: -1,
    },
    investment: {
      stock: 0,
      deposited: 0,
      withdrawn: 0,
      nextReport: -1,
      startedAt: -1,
      lastReport: "",
      points: [],
    },
    careerHistory: [],
    funeral: null,
    skills: {
      academic: 10,
      tech: 5,
      business: 5,
      creative: 10,
      communication: 10,
      care: 10,
    },
    luck: Math.floor(randomAt(seed, 0, 140) * 101),
    school: "ยังไม่เข้าเรียน",
    parents: createParents(seed),
    partner: null,
    children: [],
    career: null,
    debt: 0,
    arrears: 0,
    creditUntil: 0,
    lastBorrowAge: -1,
    pending: null,
    queue: [],
    lastEventAge: -5,
    summaries: [],
    milestones: [],
    lastResult: "เริ่มชีวิตใหม่",
  };
  const wallet = startingWallet(life);
  life.money = wallet.money;
  life.background = wallet.background;
  life.simulation!.economy = emptyEconomy();
  life.simulation!.notice!.text =
    life.name +
    " เกิดที่" +
    life.province +
    " พ่อชื่อ" +
    life.journey.parents.father.name +
    " แม่ชื่อ" +
    life.journey.parents.mother.name +
    " รายได้ครอบครัวรวม " +
    familyIncome(life).toLocaleString("th-TH") +
    " บาทต่อปี · " +
    life.background +
    " · เงินส่วนตัวเริ่มต้น ฿" +
    life.money.toLocaleString("th-TH");
  life.simulation!.notice!.effects =
    "เวลาเดินอัตโนมัติและหยุดเมื่อถึงเรื่องให้เลือก · ดวงเปลี่ยนทุกปี";
  return life;
}
function record(
  life: Life,
  title: string,
  choice: string,
  detail: string,
  category: string,
  id?: string,
) {
  life.history.push({
    id: id || "story-" + life.age + "-" + life.history.length,
    age: life.age,
    title,
    choice,
    detail,
    category,
    money: life.money,
  });
}
function refreshSkills(life: Life) {
  life.stats.skill = Math.round(
    Object.values(life.journey!.skills).reduce((a, b) => a + b, 0) / 6,
  );
}
function setCareer(life: Life, id: string) {
  const job = jobs.find((job) => job.id === id);
  if (!job) return;
  life.journey!.career = { id, rank: 0, since: life.age };
  if (!life.journey!.careerHistory.includes(id)) life.journey!.careerHistory.push(id);
  life.journey!.hasWorked = true;

  life.job = positionTitle(id, 0);
  life.income = careerIncome(id, 0);
  life.flags = life.flags.filter((flag) => flag !== "retired");
}
function applyOutcome(life: Life, result: Outcome) {
  const j = life.journey!;
  if (result.habit) applyHabit(life, result.habit);
  for (const [key, value] of Object.entries(result.stats || {}))
    life.stats[key as Stat] = clamp(life.stats[key as Stat] + value!);
  for (const [key, value] of Object.entries(result.skills || {}))
    j.skills[key as Skill] = clamp(j.skills[key as Skill] + value!);
  receiveMoney(life, result.money || 0);
  if (life.money < 0) {
    j.debt += -life.money;
    life.money = 0;
  }
  if (result.loseAsset) {
    j.debt += j[result.loseAsset]?.balance || 0;
    if (result.loseAsset === "car") removeCar(life);
    else j.house = null;
  }
  if (result.school) j.school = result.school;
  if (result.location) life.location = result.location;
  if (result.loseJob) {
    j.career = null;
    life.job = "ว่างงาน";
    life.income = 0;
  }
  if (result.career) setCareer(life, result.career);
  if (result.promote && j.career) {
    j.career.rank = Math.min(3, j.career.rank + 1);
    life.income = careerIncome(j.career.id, j.career.rank);
    life.job = positionTitle(j.career.id, j.career.rank);
  }
  if (result.stopHavingChildren) j.stopHavingChildren = true;
  if (result.retire) {
    j.career = null;
    j.retirement = life.job;
    life.job = "เกษียณจาก " + j.retirement;
    life.income = result.retirementIncome || 0;
    if (!life.flags.includes("retired")) life.flags.push("retired");
    j.queue.push({
      id: "retirement-" + life.age,
      title: "บทใหม่หลังวัยทำงาน",
      text: life.job,
      scene: "home",
      effects: "รายได้ใหม่ ฿" + life.income.toLocaleString("th-TH") + "/ปี",
    });
  }
  if (result.relationship === "meet") {
    const names = ["แพร", "ต้น", "น้ำ", "ภูมิ", "พลอย", "กันต์"];
    j.partner = {
      name: names[Math.floor(randomAt(life.seed, life.age, 141) * names.length)],
      status: "dating",
      income: Math.floor(
        gameConfig.family.spouseIncomeMin +
          randomAt(life.seed, life.age, 175) * gameConfig.family.spouseIncomeRange,
      ),
      savings: Math.floor(
        randomAt(life.seed, life.age, 176) * gameConfig.family.spouseStartingSavings,
      ),
      bond: 60,
      since: life.age,
    };
    if (!life.flags.includes("partner")) life.flags.push("partner");
  }
  if (result.relationship === "marry" && j.partner) j.partner.status = "married";
  if (result.relationship === "leave" && j.partner) {
    j.partner.status = "separated";
    j.partner.bond = 0;
    life.flags = life.flags.filter((flag) => flag !== "partner");
  }
  if (result.relationship === "child") {
    const names = ["ฟ้า", "ดาว", "ข้าว", "อุ่น", "ไผ่", "เมฆ", "ปัน", "ยิ้ม"];
    const index = (life.seed + j.children.length) % names.length;
    const child = {
      name: names[index],
      bornAt: life.age,
      id: life.seed + "-child-" + j.children.length,
      parentSeed: life.seed,
      sex:
        randomAt(life.seed, life.age, 220 + j.children.length) > 0.5
          ? ("female" as const)
          : ("male" as const),
      skin: ["#f4ca9f", "#d9a578", "#b77f59"][
        Math.floor(randomAt(life.seed, life.age, 230 + j.children.length) * 3)
      ],
      trait: [
        "ขี้สงสัย ชอบเรียนรู้",
        "อารมณ์ดี ชอบเสียงเพลง",
        "ใจเย็น ชอบอยู่กับคน",
        "กล้าลอง ชอบสำรวจ",
      ][Math.floor(randomAt(life.seed, life.age, 240 + j.children.length) * 4)],
    };
    j.children.push(child);
    j.queue.push({
      id: "new-child-" + child.id,
      title: "สำเร็จ! ต้อนรับ " + child.name,
      text:
        (child.sex === "female" ? "ลูกสาว" : "ลูกชาย") +
        " · " +
        child.trait +
        " · ตอนนี้มีลูก " +
        j.children.length +
        " คน",
      scene: "birth",
      effects:
        "ค่าเลี้ยงดูเพิ่ม ฿" +
        gameConfig.family.childCost.toLocaleString("th-TH") +
        "/ปี",
    });
    if (!life.flags.includes("child")) life.flags.push("child");
  }
  if (result.bond && j.partner && j.partner.status !== "separated")
    j.partner.bond = clamp(j.partner.bond + result.bond);
  if (result.heat)
    life.simulation!.economy!.heat = clamp(life.simulation!.economy!.heat + result.heat);
  if (result.debtFactor !== undefined) {
    j.debt = Math.ceil(j.debt * result.debtFactor);
    j.arrears = 0;
  }
  if (result.bankrupt) bankrupt(life);
  if (result.prison) imprison(life, result.prison, result.fine);
  refreshSkills(life);
}
function finishLife(life: Life, cause: string) {
  life.done = true;
  life.journey!.pending = null;
  life.journey!.queue = [];
  settleDeathBenefit(life);
  life.journey!.funeral = buildFuneral(life);
  life.simulation!.death = { age: life.age, cause };
  life.simulation!.notice = {
    id: "death",
    title: "ทุกชีวิตมีเรื่องราว",
    text:
      cause +
      "\n" +
      life.journey!.funeral!.title +
      " · ผู้มาร่วม " +
      life.journey!.funeral!.guests.length +
      " คน",
    scene: "death",
    effects:
      "อายุ " +
      life.age +
      " ปี · ลูก " +
      life.journey!.children.length +
      " คน · หนี้คงเหลือ " +
      life.journey!.debt.toLocaleString("th-TH") +
      " บาท",
  };
  record(life, "จบการเดินทาง", "ความทรงจำที่ยังอยู่", cause, "บทสรุป", "death");
}
function showQueue(life: Life) {
  if (isImprisoned(life)) {
    const index = life.journey!.queue.findIndex((notice) => notice.scene === "prison");
    if (!life.simulation!.notice && index >= 0)
      life.simulation!.notice = life.journey!.queue.splice(index, 1)[0];
    return;
  }
  if (!life.simulation!.notice)
    life.simulation!.notice = life.journey!.queue.shift() || null;
}
function trigger(life: Life, event: StoryEvent) {
  life.journey!.pending = event;
  life.journey!.lastEventAge = life.age;
  if (event.id.startsWith("career-loss")) {
    life.journey!.career = null;
    life.income = 0;
    life.job = "ว่างงาน";
    life.journey!.queue.push({
      id: "layoff-" + life.age,
      visual: "layoff",
      title: "ถูกเลิกจ้างกะทันหัน",
      text: "องค์กรลดกำลังคน งานและรายได้ประจำของคุณหยุดลงทันที ต้องเลือกว่าจะสมัครงานใหม่หรือรอโอกาส",
      scene: "home",
      effects: "รายได้งานเป็น 0 · เงินเก็บและทักษะยังอยู่",
    });
    record(
      life,
      event.title,
      "สูญเสียงาน",
      "รายได้ประจำเป็น 0 รอโอกาสสมัครใหม่",
      "การงาน",
    );
  }
}
function stepYear(life: Life) {
  const j = life.journey!;
  const wasImprisoned = isImprisoned(life);
  if (wasImprisoned) prisonConfiscation(life);
  life.age++;
  j.luck = Math.floor(randomAt(life.seed, life.age, 140) * 101);
  ageFamily(life);
  yearlyFinance(life, wasImprisoned);
  applyAssetBenefits(life);
  const healthCause = yearlyHealth(life);
  settleMission(life);
  if (wasImprisoned && !isImprisoned(life)) {
    const releasedMoney = j.frozenMoney || 0;
    life.money += releasedMoney;
    j.frozenMoney = 0;
    life.job = "พ้นโทษ · รอโอกาสใหม่";
    j.queue.push({
      id: "release-" + life.age,
      title: "ได้กลับมาข้างนอกแล้ว",
      text:
        "ครบกำหนดโทษ คุณกลับมาสร้างชีวิตใหม่ได้อีกครั้ง" +
        (releasedMoney
          ? " · รับเงินที่พักไว้ ฿" + releasedMoney.toLocaleString("th-TH")
          : ""),
      scene: "home",
      effects: "รอโอกาสงานใหม่ · จัดการการเงินและทรัพย์สินได้แล้ว",
    });
  }
  if (j.career && riskyJobs.has(j.career.id) && !isImprisoned(life))
    life.simulation!.economy!.heat = clamp(
      life.simulation!.economy!.heat + gameConfig.dark.heatPerYear,
    );
  if (life.age >= 6 && life.age <= 21) {
    j.skills.academic = clamp(j.skills.academic + 1);
  }
  if (j.career && life.simulation!.economy!.prisonUntil <= life.age) {
    const job = jobs.find((job) => job.id === j.career!.id)!;
    j.skills[job.skill] = clamp(j.skills[job.skill] + 2);
  }
  refreshSkills(life);
  if (life.age > 45)
    life.stats.health = clamp(life.stats.health - (life.age > 75 ? 2 : 1));
  const hazard = mortalityRisk(life);
  if (
    healthCause ||
    life.age >= gameConfig.life.maxAge ||
    life.stats.health <= 0 ||
    randomAt(life.seed, life.age, 142) < hazard
  ) {
    finishLife(life, deathCause(life, healthCause));
    return;
  }
  if (stages[life.age] && !j.summaries.includes(life.age)) {
    j.summaries.push(life.age);
    j.queue.push({
      id: "stage-" + life.age,
      title: stages[life.age],
      scene: "home",
      text:
        "อายุ " +
        life.age +
        " ปี · " +
        life.job +
        "\nเงินสด " +
        life.money.toLocaleString("th-TH") +
        " · หนี้ " +
        j.debt.toLocaleString("th-TH") +
        " บาท\nครอบครัว: " +
        (j.partner?.status === "married"
          ? "แต่งงานกับ " + j.partner.name
          : j.partner?.status === "dating"
            ? "คบกับ " + j.partner.name
            : "โสด") +
        " · ลูก " +
        j.children.length +
        " คน",
      effects:
        "สุขภาพ " +
        life.stats.health +
        " · สุข " +
        life.stats.happy +
        " · ทักษะรวม " +
        life.stats.skill +
        " · ดวง " +
        j.luck,
    });
  }
  const scheduled = milestoneEvent(life);
  if (life.simulation!.economy!.prisonUntil <= life.age) {
    const heat = life.simulation!.economy!.heat;
    if (wasImprisoned) trigger(life, careerOffer(life));
    else if (
      life.age >= 18 &&
      heat > 0 &&
      randomAt(life.seed, life.age, 136) < (heat / 100) * gameConfig.dark.maxRaidChance
    )
      trigger(life, policeRaid(life));
    else if (scheduled && !j.milestones.includes(scheduled.id)) {
      trigger(life, scheduled);
      j.milestones.push(scheduled.id);
    } else if (
      life.age >= gameConfig.family.redEnvelope.minAge &&
      life.age <= gameConfig.family.redEnvelope.maxAge &&
      randomAt(life.seed, life.age, 251) < gameConfig.events.redEnvelopeChance
    ) {
      const gift = redEnvelopeEvent(life);
      trigger(life, gift);
      j.queue.push({
        id: "red-envelope-preview-" + life.age,
        title: gift.title,
        text: gift.text,
        scene: "gift",
        visual: "red-envelope",
        effects: "เลือกวิธีรับอั่งเปาเพื่อรับเงิน · ไม่มีเงินเพิ่มอัตโนมัติรายปี",
      });
    } else if (j.arrears === 2 && j.debt > 0) trigger(life, debtCrisis(life));
    else if (
      life.age >= 22 &&
      life.age < 60 &&
      !j.career &&
      !life.flags.includes("retired") &&
      life.age - j.lastEventAge >= 2 &&
      randomAt(life.seed, life.age, 144) < 0.35
    )
      trigger(life, careerOffer(life));
    else if (
      j.career &&
      !life.flags.includes("retired") &&
      randomAt(life.seed, life.age, 247) < gameConfig.events.layoffChance
    )
      trigger(life, careerOffer(life, "loss"));
    else if (
      life.age - j.lastEventAge >= gameConfig.events.cooldownYears &&
      randomAt(life.seed, life.age, 208) < healthEventChance(life.age)
    )
      trigger(life, randomHealthEvent(life));
    else if (
      life.age >= 6 &&
      life.age - j.lastEventAge >= gameConfig.events.cooldownYears &&
      randomAt(life.seed, life.age, 143) < gameConfig.events.randomChance
    )
      trigger(life, randomStory(life));
    else if (life.age >= 18 && life.age - j.lastEventAge >= 2) {
      const story = assetStory(life);
      if (story) {
        trigger(life, story);
        j.queue.push({
          id: "asset-preview-" + life.age,
          title: story.title,
          visual: story.id.startsWith("damage-house")
            ? "fire"
            : story.id.startsWith("damage-car")
              ? "repair"
              : undefined,
          text: story.text,
          scene: story.scene,
          effects: "ปิดหน้าต่างนี้เพื่อเลือกวิธีจัดการ",
        });
      }
    }
  }
  showQueue(life);
}
export function journeyAction(life: Life, action: SimulationAction): Life {
  if (life.version !== 8 || !life.journey || !life.simulation) return life;
  if (isImprisoned(life) && action.type !== "year" && action.type !== "ack") return life;
  if (action.type === "ack") {
    if (!life.simulation.notice) return life;
    const next = structuredClone(life);
    next.simulation!.notice = null;
    showQueue(next);
    next.simulation!.actions.push(action);
    return next;
  }
  if (life.done || life.simulation.notice) return life;
  const next = structuredClone(life),
    j = next.journey!;
  if (action.type === "year") {
    if (j.pending) return life;
    stepYear(next);
  } else if (action.type === "choice") {
    const current = j.pending,
      choice = current?.choices[action.index];
    if (!current || !choice || storyChoiceLocked(life, choice)) return life;
    if (choice.assetAction) {
      j.pending = null;
      if (!purchaseAsset(next, choice.assetAction)) return life;
    } else payChoice(next, choice.cost || 0);
    const chance = successChance(life, choice);
    const won =
      chance === 100 ||
      randomAt(life.seed, life.age, 150 + life.simulation.actions.length) < chance / 100;
    applyOutcome(next, won ? choice.success : choice.failure || {});
    if (won && current.id.startsWith("debt-") && choice.cost === 10000)
      j.debt = Math.max(0, j.debt - 10000);
    const result = won
      ? choice.successText || "สำเร็จ: " + choice.detail
      : choice.failureText ||
        "ไม่สำเร็จ · " +
          (choice.cost ? "ค่าใช้จ่ายไม่คืน · " : "") +
          "ลองใหม่เมื่อมีโอกาส";
    j.lastResult = choice.label + " — " + result;
    if (choice.success.promote || choice.success.promotionTitle)
      j.queue.push({
        id: "promotion-result-" + life.age,
        title: won ? "ผลงานได้รับการยอมรับ!" : "ยังไม่ผ่านการพิจารณา",
        visual: won && choice.success.promote ? "level-up" : "review",
        text: result + " · " + next.job,
        scene: "festival",
        effects:
          "รายได้ ฿" +
          next.income.toLocaleString("th-TH") +
          "/ปี · ตำรวจจับตา " +
          next.simulation!.economy!.heat,
      });
    if (choice.success.relationship === "child" && !won)
      j.queue.push({
        id: "child-unsuccessful-" + life.age,
        title: "ครั้งนี้ยังไม่สำเร็จ",
        text: "ยังไม่มีสมาชิกใหม่ สามารถวางแผนอีกครั้งเมื่อมีโอกาส",
        scene: "home",
        effects: "ตอนนี้มีลูก " + j.children.length + " คน",
      });
    settleMission(next);
    record(
      next,
      current.title,
      choice.label,
      result + " · โอกาส " + chance + "%",
      current.category,
      current.id,
    );
    j.pending = null;
    if (next.stats.health <= 0) finishLife(next, deathCause(next));
    else showQueue(next);
  } else if (action.type === "venture") {
    if (j.pending || !financeAction(next, action.id)) return life;
    j.lastResult =
      next.simulation!.notice?.text ||
      next.history.at(-1)?.choice + " · " + next.history.at(-1)?.detail ||
      "ทำรายการแล้ว";
    next.simulation!.notice = null;
  } else return life;
  j.moneyChange = next.money - life.money;
  next.simulation!.actions.push(action);
  return next;
}
export function replayJourney(seed: number, name: string, actions: unknown): Life | null {
  if (
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 4294967295 ||
    typeof name !== "string" ||
    name.length > 30 ||
    !Array.isArray(actions) ||
    actions.length > 5000
  )
    return null;
  let life = createGameLife(seed, name);
  for (const value of actions) {
    if (!value || typeof value !== "object") return null;
    const action = value as SimulationAction;
    if (action.type === "year" || action.type === "ack") {
      if (Object.keys(action).length !== 1) return null;
    } else if (action.type === "choice") {
      if (
        Object.keys(action).length !== 2 ||
        !Number.isInteger(action.index) ||
        action.index < 0
      )
        return null;
    } else if (action.type === "venture") {
      if (Object.keys(action).length !== 2 || !financeIds.includes(action.id))
        return null;
    } else return null;
    const next = journeyAction(life, action);
    if (next === life) return null;
    life = next;
  }
  return life;
}
