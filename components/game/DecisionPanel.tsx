import ChoiceButton from "./ChoiceButton";
import { decisionCount, achievements } from "@/lib/game/summary";
import EverydayPanel from "./EverydayPanel";
import { baht } from "@/lib/format";
import { Life, available, choose, nextEvent } from "@/lib/game";
import { Link as LinkIcon, Share2, Sparkles } from "lucide-react";

export default function DecisionPanel({
  life,
  shared,
  openShare,
  setLife,
  onRestart,
  pauseTime,
}: {
  onRestart: () => void;
  pauseTime: () => void;
  life: Life;
  shared: boolean;
  openShare: () => void;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
}) {
  const event = nextEvent(life);
  return (
    <section className="decision card">
      <div className="section-top">
        <span className="pill">
          {shared
            ? "เรื่องราวที่เพื่อนแบ่งปัน"
            : life.done
              ? "บทสรุปชีวิต"
              : "ตาคุณเลือกแล้ว!"}
        </span>
        <span className="event-age">
          {event && !shared ? `เมื่ออายุ ${event.age} ปี` : `อายุ ${life.age} ปี`}
        </span>
      </div>
      {shared || life.done ? (
        <>
          <div className="event-symbol">✳</div>
          <h2>
            {life.simulation?.death
              ? `จบการเดินทางที่อายุ ${life.age} ปี`
              : life.done
                ? "ทุกทางที่เลือก กลายเป็นคุณ"
                : `เรื่องราวของ${life.name}`}
          </h2>
          <p className="event-copy">
            {decisionCount(life)} การตัดสินใจ จาก{life.province}สู่
            {life.location} พร้อมเงินสะสม ฿{baht(life.money)}{" "}
            และความทรงจำที่คุณสร้างด้วยตัวเอง
          </p>
          {!!life.simulation?.economy?.beneficiaryPayout && (
            <p className="insurance-payout">
              เงินประกันถึงผู้รับผลประโยชน์ ฿
              {baht(life.simulation.economy.beneficiaryPayout)}
            </p>
          )}
          <div className="achievement-list">
            {achievements(life).map((badge) => (
              <span key={badge}>★ {badge}</span>
            ))}
          </div>
          <button className="button green" onClick={openShare}>
            <Share2 size={17} /> ส่งต่อเรื่องราวนี้
          </button>
          {life.done && (
            <div className="ending-actions">
              <button className="button outline" onClick={onRestart}>
                ↻ ลองอีกชีวิต
              </button>
              <span className="pill">
                {life.simulation?.death?.cause || "ทุกเส้นทางมีความหมาย"}
              </span>
            </div>
          )}
        </>
      ) : event ? (
        <>
          <div className="event-heading">
            <span className="event-symbol">{event.icon}</span>
            <span className="event-category">
              {event.category}
              <small>ภารกิจชีวิต</small>
            </span>
          </div>
          <h2>{event.title}</h2>
          <p className="event-copy desktop-event-copy">{event.text}</p>
          <details className="mobile-event-details" key={event.id}>
            <summary>อ่านเรื่องราว</summary>
            <p>{event.text}</p>
          </details>
          {event.requires && (
            <div className="connection">
              <LinkIcon size={14} /> โอกาสนี้เชื่อมโยงจากการตัดสินใจในอดีตของคุณ
            </div>
          )}
          <div className="choices">
            {event.choices.map((c, i) => (
              <ChoiceButton
                key={event.id + "-" + i}
                choice={c}
                icon={
                  event.category === "การงาน"
                    ? "briefcase"
                    : event.category === "การศึกษา"
                      ? "book"
                      : event.category === "ต่างประเทศ"
                        ? "plane"
                        : event.category === "การเงิน"
                          ? "wallet"
                          : "heart"
                }
                locked={
                  !available(life, c)
                    ? (c.cost || 0) > life.money && (c.cost || 0) > 0
                      ? "เงินสะสมไม่พอ"
                      : c.needs && !life.flags.includes(c.needs)
                        ? "ต้องมีพื้นฐานจากทางเลือกก่อนหน้า"
                        : "ต้องมีทักษะ " + c.minSkill
                    : null
                }
                onClick={() =>
                  setLife((current) => (current ? choose(current, i) : current))
                }
              />
            ))}
          </div>
          <div className="decision-note">
            <Sparkles size={14} /> เลือก 1 ทาง แล้วดูชีวิตเปลี่ยนไป
          </div>
        </>
      ) : (
        <EverydayPanel life={life} setLife={setLife} pauseTime={pauseTime} />
      )}
    </section>
  );
}
