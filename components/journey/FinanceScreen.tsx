"use client";
import InvestmentPanel from "./InvestmentPanel";
import MoneyChange from "./MoneyChange";
import { householdIncome } from "@/lib/game/journey/family";

import AssetShop from "./AssetShop";
import { assetAnnual } from "@/lib/game/journey/assets";
import { useState } from "react";
import { journeyAction, type Life } from "@/lib/game";
import { annualExpenses, debtPayment, financeLocked } from "@/lib/game/journey/finance";
import { ventures, policyTerms } from "@/lib/game/ventures";
import { baht } from "@/lib/format";
import GameIcon from "../game/GameIcon";
export default function FinanceScreen({
  life,
  setLife,
  shared,
}: {
  life: Life;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
  shared: boolean;
}) {
  const [confirm, setConfirm] = useState(false),
    j = life.journey!,
    e = life.simulation!.economy!;
  const act = (id: string) =>
    setLife((current) =>
      current ? journeyAction(current, { type: "venture", id }) : current,
    );
  const button = (id: string, label: string) => {
    const reason = financeLocked(life, id);
    return (
      <button
        className="finance-action"
        disabled={shared || !!reason}
        onClick={() => act(id)}
      >
        {label}
        {reason && <small>{reason}</small>}
      </button>
    );
  };
  return (
    <div className="finance-screen">
      <h2>การเงิน</h2>
      {!j.hasWorked && (
        <p>
          ใช้เงินส่วนตัวจากฐานะครอบครัว · ค่าครองชีพและลูกต่อปีเป็น 0 จนเริ่มงานแรก
          เงินเพิ่มได้จากเหตุการณ์พิเศษ
        </p>
      )}
      <p className="finance-feedback" role="status">
        {j.lastResult} <MoneyChange amount={j.moneyChange || 0} />
      </p>
      <section className="simple-card">
        <div className="money-head">
          <span>
            เงินสด<strong>฿{baht(life.money)}</strong>
          </span>
          <span>
            หนี้ทั้งหมด<strong className="debt-amount">฿{baht(j.debt)}</strong>
          </span>
        </div>
        <dl className="budget-list">
          <div>
            <dt>รายได้รวมคุณและคู่สมรส / ปี</dt>
            <dd>
              <MoneyChange amount={j.hasWorked ? householdIncome(life) : 0} />
            </dd>
          </div>
          <div>
            <dt>ค่าครองชีพและลูก / ปี</dt>
            <dd>
              <MoneyChange amount={-annualExpenses(life)} />
            </dd>
          </div>
          <div>
            <dt>ค่างวดบ้านและรถ / ปี</dt>
            <dd>
              <MoneyChange amount={-assetAnnual(life)} />
            </dd>
          </div>
          <div>
            <dt>เบี้ยประกัน / ปี</dt>
            <dd>
              <MoneyChange amount={-policyTerms[e.policy].premium} />
            </dd>
          </div>
          <div>
            <dt>หนี้ขั้นต่ำปีหน้า</dt>
            <dd>
              <MoneyChange amount={-(j.debt ? debtPayment(j.debt) : 0)} />
            </dd>
          </div>
        </dl>
        <small className="muted">
          คำนวณเมื่ออายุเพิ่มขึ้น รายจ่ายที่เงินไม่พอจะกลายเป็นหนี้
          รายได้งานคุณหยุดระหว่างรับโทษ แต่รายได้คู่สมรสยังคงรวมอยู่
        </small>
      </section>
      {j.homeless && (
        <section className="simple-card">
          <h3>เริ่มต้นจากข้างถนน</h3>
          <p>สุขภาพลดลงทุกปี เก็บเงิน 12,000 เพื่อกลับมาเช่าห้องได้</p>
          {button("rent-room", "เช่าห้องเริ่มต้น −฿12,000")}
        </section>
      )}
      <InvestmentPanel life={life} setLife={setLife} shared={shared} />
      <AssetShop life={life} setLife={setLife} shared={shared} />
      <details className="simple-details" open={j.debt > 0 || undefined}>
        <summary>
          หนี้และเงินกู้ <span>ดอกเบี้ย 18%/ปี</span>
        </summary>
        <p className="risk-note">
          ค้างครบ 3 ปี หรือหนี้เกิน 350,000 จะล้มละลาย: บ้าน รถ และพอร์ตถูกยึด เงินสดเหลือ
          0 และต้องอยู่ข้างถนน ห้ามกู้ 8 ปี
        </p>
        {j.arrears > 0 && <p>ค้างชำระ {j.arrears}/3 ปี</p>}
        {j.creditUntil > life.age && <p>กู้ได้อีกครั้งเมื่ออายุ {j.creditUntil} ปี</p>}
        {confirm ? (
          <div className="loan-confirm" role="alert">
            <strong>ยืนยันกู้ 50,000 บาท?</strong>
            <p>
              หนี้รวม ฿{baht(j.debt + 50000)} · ดอกเบี้ย 18% ต่อปี · ขั้นต่ำปีหน้า ฿
              {baht(debtPayment(j.debt + 50000))}
            </p>
            <button
              className="primary-action"
              disabled={shared || !!financeLocked(life, "loan")}
              onClick={() => {
                act("loan");
                setConfirm(false);
              }}
            >
              ยืนยันกู้
            </button>
            <button className="finance-action" onClick={() => setConfirm(false)}>
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            className="finance-action"
            disabled={shared || !!financeLocked(life, "loan")}
            onClick={() => setConfirm(true)}
          >
            กู้ 50,000 บาท
            <small>
              {financeLocked(life, "loan") || "ตรวจยอดจ่ายก่อนยืนยัน · กู้ได้ปีละครั้ง"}
            </small>
          </button>
        )}
        {button("repay", "ชำระหนี้สูงสุด 10,000 บาท")}
        {button("repay-all", "ปิดหนี้ทั้งหมด ฿" + baht(j.debt))}
      </details>
      <details className="simple-details">
        <summary>
          เงินลงทุนและหวย <span>พอร์ต ฿{baht(e.fund + e.crypto)}</span>
        </summary>
        <p>
          กองทุน ฿{baht(e.fund)} · คริปโต ฿{baht(e.crypto)}
        </p>
        {ventures
          .filter((v) => ["lottery"].includes(v.id))
          .map((item) => (
            <div className="finance-item" key={item.id}>
              <p>
                <GameIcon name={item.icon} size={17} />
                <strong>{item.label}</strong>
                {item.cost > 0 && <MoneyChange amount={-item.cost} />}
              </p>
              <small>{item.detail}</small>
              {button(item.id, "เลือก " + item.label)}
            </div>
          ))}
      </details>
      <details className="simple-details">
        <summary>
          ประกันชีวิต{" "}
          <span>
            {e.policy === "none"
              ? "ไม่มีแผน"
              : e.policy === "basic"
                ? "พื้นฐาน"
                : "ครอบครัว"}
          </span>
        </summary>
        <p>
          จ่ายเบี้ยทันทีและต่อทุกปี หากเงินไม่พอความคุ้มครองสิ้นสุด
          เงินเสียชีวิตแยกให้คนข้างหลัง
        </p>
        {ventures
          .filter((v) => ["basic", "family", "cancel-policy"].includes(v.id))
          .map((item) => (
            <div className="finance-item" key={item.id}>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
              {button(item.id, "เลือก " + item.label)}
            </div>
          ))}
      </details>
    </div>
  );
}
