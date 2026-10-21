import { baht } from "@/lib/format";
import { Life } from "@/lib/game";
import { Flag, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export default function LifeTimeline({ life }: { life: Life }) {
  const [tab, setTab] = useState("ทั้งหมด");
  return (
    <section className="timeline card">
      <div className="timeline-heading">
        <div>
          <span className="eyebrow">YOUR ADVENTURE LOG</span>
          <h2>
            บันทึกการผจญภัย <span>{life.history.length + 1}</span>
          </h2>
        </div>
        <Flag size={20} />
      </div>
      <div className="life-track">
        <div className="track-line">
          <i style={{ width: `${(life.age / 100) * 100}%` }} />
        </div>
        {[0, 18, 35, 60, 100].map((a) => (
          <span className={life.age >= a ? "passed" : ""} key={a}>
            <i />
            {a} ปี
          </span>
        ))}
      </div>
      <div className="filters" aria-label="กรองประวัติ">
        {[
          "ทั้งหมด",
          "เหตุการณ์สุ่ม",
          "การศึกษา",
          "การงาน",
          "ครอบครัว",
          "ต่างประเทศ",
          "การเงิน",
          "การเงินและสังคม",
          "ตอบรับเหตุการณ์",
          "สุขภาพ",
          "ความสัมพันธ์",
        ].map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="timeline-list">
        {[...life.history]
          .reverse()
          .filter((h) => tab === "ทั้งหมด" || h.category === tab)
          .map((h, i) => (
            <article className="timeline-entry" key={h.id} id={`event-${h.id}`}>
              <div className="entry-age">
                {h.age}
                <small>ปี</small>
              </div>
              <span className={`entry-dot ${i === 0 ? "current" : ""}`} />
              <div className="entry-content">
                <span className="entry-category">{h.category}</span>
                <h3>{h.title}</h3>
                <p>{h.choice}</p>
                <details>
                  <summary>ดูผลลัพธ์</summary>
                  <p>{h.detail}</p>
                  <p>เงินสะสมหลังเหตุการณ์ ฿{baht(h.money)}</p>
                </details>
                {h.cause && (
                  <a
                    className="causal-link"
                    href={`#event-${h.cause}`}
                    onClick={() => setTab("ทั้งหมด")}
                  >
                    <LinkIcon size={12} /> ต่อเนื่องจาก{" "}
                    {life.history.find((e) => e.id === h.cause)?.title}
                  </a>
                )}
              </div>
            </article>
          ))}
        {tab === "ทั้งหมด" ? (
          <article className="timeline-entry birth">
            <div className="entry-age">
              0<small>ปี</small>
            </div>
            <span className="entry-dot" />
            <div className="entry-content">
              <span className="entry-category">จุดเริ่มต้น</span>
              <h3>สวัสดีโลก ฉันชื่อ{life.name}</h3>
              <p>
                เกิดที่{life.province} ใน{life.background}
              </p>
              <span className="birth-tag">จุดเริ่มต้นของการผจญภัย ✦</span>
            </div>
          </article>
        ) : (
          !life.history.some((h) => h.category === tab) && (
            <p className="empty">ยังไม่มีเรื่องราวในหมวดนี้ เส้นทางยังอีกยาวไกล</p>
          )
        )}
      </div>
    </section>
  );
}
