import PixelCharacter from "../scene/PixelCharacter";
import { gameConfig } from "@/lib/game/journey/config";
import { spouseIncome } from "@/lib/game/journey/family";
import type { Life } from "@/lib/game";
import { familyIncome } from "@/lib/game/journey/family";
import { baht } from "@/lib/format";
import { Heart, Users } from "lucide-react";
export default function FamilyScreen({ life }: { life: Life }) {
  const j = life.journey!,
    partner = j.partner;
  return (
    <div className="family-screen">
      <h2>คนรอบตัว</h2>
      {!j.hasWorked && (
        <p>
          {life.background} · ใช้เงินส่วนตัวทุกตัวเลือก
          ไม่หักค่าครองชีพและลูกต่อปีก่อนมีงานแรก
        </p>
      )}
      <section className="simple-card">
        <h3>
          <Users size={18} /> พ่อและแม่
        </h3>
        <p className="family-total">รายได้พ่อแม่ ฿{baht(familyIncome(life))}/ปี</p>
        <small className="muted">
          เงินของพ่อแม่แยกจากเงินของคุณ ไม่ถูกใช้จ่ายค่าเรียนหรือค่าเลือกกิจกรรม
          เงินอั่งเปาและรางวัลเข้ากระเป๋าคุณทันที
        </small>
        {Object.entries(j.parents).map(([role, parent]) => (
          <div
            className={"person-row " + (!parent.alive ? "person-gone" : "")}
            key={role}
          >
            <span className="person-avatar">{role === "father" ? "พ่อ" : "แม่"}</span>
            <div>
              <strong>{parent.name}</strong>
              <p>
                {parent.alive
                  ? "อายุ " + (parent.ageAtBirth + life.age) + " ปี · " + parent.job
                  : "จากไปเมื่ออายุ " + (parent.ageAtBirth + parent.deathAt) + " ปี"}
              </p>
              <small>
                {parent.alive
                  ? "รายได้ ฿" + baht(parent.income) + "/ปี"
                  : "อยู่ในความทรงจำเสมอ"}
              </small>
              <small>เงินเก็บ ฿{baht(parent.savings || 0)}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="simple-card">
        <h3>
          <Heart size={18} /> คู่ชีวิต
        </h3>
        {partner ? (
          <>
            <div className="person-row">
              <span className="person-avatar">♥</span>
              <div>
                <strong>{partner.name}</strong>
                <p>
                  {partner.deceased
                    ? "จากไปแล้ว"
                    : partner.status === "married"
                      ? "แต่งงานแล้ว"
                      : partner.status === "dating"
                        ? "กำลังคบกัน"
                        : "แยกทางแล้ว"}{" "}
                  · รู้จักกันตอนอายุ {partner.since}
                </p>
              </div>
            </div>
            <p>
              รายได้เข้าครัวเรือน ฿{baht(spouseIncome(life))}/ปี · เงินเก็บส่วนตัว ฿
              {baht(partner.savings || 0)}
            </p>
            {partner.status !== "separated" && (
              <>
                <label>ความผูกพัน {partner.bond}/100</label>
                <meter min={0} max={100} value={partner.bond} aria-label="ความผูกพัน" />
              </>
            )}
          </>
        ) : (
          <p>ยังไม่มีคู่ชีวิต เมื่อถึงช่วงวัยอาจมีคนเข้ามาในเรื่องราว</p>
        )}
        <small className="muted">
          ความสุข การสื่อสาร และภาระหนี้มีผลต่อความสัมพันธ์
          การแต่งงานและมีลูกเกิดผ่านเหตุการณ์
        </small>
      </section>
      <section className="simple-card">
        <h3>ลูกของคุณ · {j.children.length} คน</h3>
        {j.children.length ? (
          j.children.map((child, index) => (
            <div className="person-row" key={index}>
              <svg width="55" height="60" viewBox="0 0 60 65" aria-label={child.name}>
                <PixelCharacter
                  x={30}
                  y={60}
                  age={life.age - child.bornAt}
                  female={child.sex === "female"}
                  skin={child.skin}
                />
              </svg>
              <div>
                <strong>{child.name}</strong>
                <small>{child.trait}</small>
                <p>
                  อายุ {life.age - child.bornAt} ปี · เกิดเมื่อคุณอายุ {child.bornAt}
                </p>
                <small>
                  {life.age - child.bornAt < gameConfig.family.supportUntil
                    ? "พ่อแม่จ่ายค่าเลี้ยงดู ฿" +
                      baht(gameConfig.family.childCost) +
                      "/ปี"
                    : "เติบโตดูแลตัวเองแล้ว"}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p>ยังไม่มีลูก</p>
        )}
      </section>
    </div>
  );
}
