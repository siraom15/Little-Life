import { useEffect, useRef } from "react";
import { baht } from "@/lib/format";
import type { choiceCredit } from "@/lib/game/journey/choice-credit";
export default function ChoiceLoanDialog({
  label,
  credit,
  onCancel,
  onConfirm,
}: {
  label: string;
  credit: NonNullable<ReturnType<typeof choiceCredit>>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={onCancel}
      aria-labelledby="loan-title"
      className="simple-card loan-dialog"
    >
      <h2 id="loan-title">ยืนยันกู้เพื่อทางเลือกนี้?</h2>
      <p>{label}</p>
      <p>
        กู้เพิ่ม ฿{baht(credit.amount)} · หนี้รวม ฿{baht(credit.total)}
      </p>
      <p>
        ดอกเบี้ย 18% ต่อปี · เริ่มชำระอายุ {credit.repaymentAge} ปี · ยอดขั้นต่ำ ฿
        {baht(credit.annual)}
      </p>
      <p className="risk-note">
        การกู้ไม่เพิ่มโอกาสสำเร็จ จ่ายไม่ไหวต่อเนื่องอาจถูกยึดทรัพย์และล้มละลาย
      </p>
      {credit.bankruptcyRisk && (
        <p className="risk-note">
          ยอดหนี้หลังคิดดอกเบี้ยจะสูงกว่าเกณฑ์ล้มละลาย หากลดหนี้ไม่ทันก่อนรอบชำระ
          อาจเสียทรัพย์สินทั้งหมด
        </p>
      )}
      <button autoFocus className="finance-action" onClick={onCancel}>
        กลับไปเลือกใหม่
      </button>
      <button className="primary-action" onClick={onConfirm}>
        ยืนยันกู้และเลือก
      </button>
    </dialog>
  );
}
