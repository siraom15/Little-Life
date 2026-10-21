import type { Life } from "@/lib/game";
import { baht } from "@/lib/format";
export default function FuneralSummary({ life }: { life: Life }) {
  const funeral = life.journey?.funeral;
  if (!funeral) return null;
  return (
    <section className="funeral-summary">
      <h3>{funeral.title}</h3>
      <p>
        คนมาร่วม {funeral.guests.length} คน · ทรัพย์สินสุทธิ ฿{baht(funeral.estate)}
      </p>
      <small>ผู้มาร่วมขึ้นกับครอบครัว ความสัมพันธ์ อาชีพที่ผ่านมา และดวง</small>
      <ul>
        {funeral.guests.length ? (
          funeral.guests.map((guest, index) => (
            <li key={index}>
              <span>✿ {guest.name}</span>
              <small>{guest.role}</small>
            </li>
          ))
        ) : (
          <li>พิธีสงบเรียบง่าย ไม่มีผู้มาร่วมในครั้งนี้</li>
        )}
      </ul>
    </section>
  );
}
