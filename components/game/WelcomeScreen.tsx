import { ArrowRight } from "lucide-react";

import type { LifeGameController } from "@/hooks/useLifeGame";
export default function WelcomeScreen({
  name,
  setName,
  start,
  input,
}: Pick<LifeGameController, "name" | "setName" | "start" | "input">) {
  return (
    <section className="welcome">
      <div className="welcome-art">
        ✦<span> LITTLE LIFE</span>
      </div>
      <div className="eyebrow">ชีวิตบทใหม่กำลังรอคุณ</div>
      <h2>ถ้าได้เริ่มใหม่ คุณจะเป็นใคร?</h2>
      <p>
        สุ่มบ้านเกิดและพื้นฐานครอบครัว แล้วสร้างเส้นทางของคุณผ่านการตัดสินใจ
        <br />
        ตั้งแต่วัยเรียน ถึงวันที่มองย้อนกลับมาด้วยรอยยิ้ม
      </p>
      <label className="name-label">
        ชื่อที่อยากให้เรื่องราวจดจำ
        <input
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อของคุณ"
        />
      </label>
      <button className="button green" onClick={start}>
        เริ่มต้นชีวิตของฉัน <ArrowRight size={18} />
      </button>
      <button className="text-button" onClick={() => input.current?.click()}>
        มีไฟล์บันทึกแล้ว? นำเข้าชีวิตเดิม
      </button>
      <small>เป็นเกมจำลองเพื่อความบันเทิง ตัวเลขไม่ได้แทนสถิติประชากรจริง</small>
    </section>
  );
}
