import { raidChance } from "@/lib/game/journey/police";
import { diseaseLabel } from "@/lib/game/journey/diseases";
import { positionTitle } from "@/lib/game/journey/career-paths";
import MoneyChange from "./MoneyChange";
import { storyChoiceLocked } from "@/lib/game/journey/asset-stories";
import LifeGoal from "./LifeGoal";
import { useState, useEffect } from "react";
import { isImprisoned } from "@/lib/game/journey/police";
import FuneralSummary from "./FuneralSummary";
import type { Life } from "@/lib/game";
import { journeyAction } from "@/lib/game";
import { successChance } from "@/lib/game/journey/chance";
import { skillLabels, ranks, jobs } from "@/lib/game/journey/catalog";
import type { Skill } from "@/lib/game/journey/types";
import { baht } from "@/lib/format";
import GameIcon from "../game/GameIcon";
import { Coins } from "lucide-react";
export default function LifeScreen({
  life,
  setLife,
  shared,
  restart,
}: {
  life: Life;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
  shared: boolean;
  restart: () => void;
}) {
  const j = life.journey!,
    event = j.pending,
    career = j.career;
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [event?.id]);
  if (isImprisoned(life))
    return (
      <section className="prison-wait">
        <span className="prison-label">LOCKED · รับโทษ</span>
        <h2>
          อีก {life.simulation!.economy!.prisonUntil - life.age} ปี จะได้กลับไปเริ่มใหม่
        </h2>
        <p>ตอนนี้ทำได้เพียงรอเวลา ทุกการตัดสินใจและการซื้อขายถูกล็อก</p>
        <div className="prison-count">
          {life.age} → {life.simulation!.economy!.prisonUntil}
        </div>
        <small>
          {shared
            ? "ช่วงชีวิตที่เพื่อนแบ่งปัน เวลาไม่เดินในโหมดอ่าน"
            : "เวลาเดินอัตโนมัติ ปรับความเร็วได้ที่แถบด้านบน"}
        </small>
      </section>
    );
  return (
    <div className="life-content">
      {!life.done && j.health.severe && (
        <p className="risk-note">♥ {diseaseLabel(life)} · ติดตามอาการทุก 2 ปี</p>
      )}
      {!life.done && life.simulation!.economy!.heat > 0 && (
        <div className="heat-indicator">
          ⚠ ตำรวจจับตา {life.simulation!.economy!.heat}/100 · ตรวจค้น {Math.round(raidChance(life)*100)}%
          <small>ฐานโอกาสเพิ่มทุกปีที่ยังถูกจับตา · เต็ม 100 จะถูกตรวจค้นแน่นอน</small>
        </div>
      )}
      {life.done ? (
        <section className="simple-card">
          <h2>หนึ่งชีวิต หลายความทรงจำ</h2>
          <p>{life.simulation?.death?.cause}</p>
          <p>
            ใช้ชีวิต {life.age} ปี · ลูก {j.children.length} คน
          </p>
          <p>
            เงินสด ฿{baht(life.money)} · หนี้ ฿{baht(j.debt)}
          </p>
          {!!life.simulation?.economy?.beneficiaryPayout && (
            <p>
              เงินประกันให้คนข้างหลัง ฿{baht(life.simulation.economy.beneficiaryPayout)}
            </p>
          )}
          <FuneralSummary life={life} />
          <button className="primary-action" onClick={restart}>
            เริ่มอีกชีวิต
          </button>
        </section>
      ) : event && !shared ? (
        <section className="current-event" key={event.id}>
          <div className="event-kicker">
            {event.category} · อายุ {life.age} ปี
          </div>
          <h2>{event.title}</h2>
          <p>{event.text}</p>
          <div className="story-choices">
            {(expanded ? event.choices : event.choices.slice(0, 5)).map(
              (choice, index) => {
                const chance = successChance(life, choice),
                  cost = choice.cost || 0,
                  locked = storyChoiceLocked(life, choice);
                return (
                  <button
                    key={index}
                    className="story-choice"
                    disabled={!!locked}
                    onClick={() =>
                      setLife((current) =>
                        current
                          ? journeyAction(current, { type: "choice", index })
                          : current,
                      )
                    }
                  >
                    <span className="story-icon">
                      <GameIcon name={choice.icon} />
                    </span>
                    <span className="story-choice-body">
                      <strong>{choice.label}</strong>
                      <small>{choice.detail}</small>
                      <span className="choice-meta">
                        <span className={cost > 0 ? "cost-badge" : "free-badge"}>
                          <Coins size={13} />
                          {cost > 0 ? "-฿" + baht(cost) : "ไม่เสียเงิน"}
                        </span>
                        <b className={chance >= 70 ? "chance-high" : "chance-low"}>
                          {chance}%
                        </b>
                      </span>
                      {choice.success.money ? (
                        <MoneyChange amount={choice.success.money} />
                      ) : null}
                      {locked && <small className="chance-explanation">{locked}</small>}
                    </span>
                  </button>
                );
              },
            )}
          </div>
          {event.choices.length > 5 && (
            <button className="finance-action" onClick={() => setExpanded(!expanded)}>
              {expanded
                ? "แสดงน้อยลง"
                : "ดูทางเลือกเพิ่ม (" + (event.choices.length - 5) + ")"}
            </button>
          )}
        </section>
      ) : (
        <section className="quiet-year">
          <span className="year-pulse" />
          <h2>{shared ? "เรื่องราวที่แบ่งปัน" : "ปีนี้ชีวิตดำเนินไปเรื่อย ๆ"}</h2>
          <p>
            {shared
              ? "ดูงาน ครอบครัว และการเงินได้จากเมนูด้านล่าง"
              : "ไม่ต้องเลือกอะไร รอเรื่องราวถัดไปได้เลย"}
          </p>
          {!shared && <LifeGoal life={life} />}
          {j.lastResult && (
            <div className="last-result" role="status">
              {j.lastResult} <MoneyChange amount={j.moneyChange || 0} />
            </div>
          )}
        </section>
      )}
      <details className="simple-details">
        <summary>
          งานและทักษะ{" "}
          <span>
            {career
              ? positionTitle(career.id, career.rank)
              : life.age < 18
                ? "กำลังเรียน"
                : life.job}
          </span>
        </summary>
        <p>{j.school}</p>
        <p>
          {career ? jobs.find((job) => job.id === career.id)?.label : life.job} · รายได้ ฿
          {baht(life.income)}/ปี
        </p>
        <p className="muted">
          เปลี่ยนงานหรือเลื่อนขั้นได้เมื่อมีเหตุการณ์ ทักษะเฉพาะและดวงช่วยเพิ่มโอกาส
        </p>
        <div className="skill-list">
          {(Object.entries(skillLabels) as [Skill, string][]).map(([key, label]) => (
            <div key={key}>
              <span>
                {label}
                <b>{j.skills[key]}</b>
              </span>
              <meter min={0} max={100} value={j.skills[key]} aria-label={label} />
            </div>
          ))}
        </div>
      </details>
      <details className="simple-details">
        <summary>
          บันทึกชีวิต <span>{life.history.length} เรื่อง</span>
        </summary>
        <ol className="compact-history">
          {[...life.history].reverse().map((entry, index) => (
            <li key={entry.id + index}>
              <b>
                {entry.age} ปี · {entry.title}
              </b>
              <p>{entry.choice}</p>
              <small>{entry.detail}</small>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
