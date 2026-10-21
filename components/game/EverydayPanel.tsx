import EconomyPanel from "./EconomyPanel";
import { doActivity, upcomingEvent, type Life, type Activity } from "@/lib/game";
export default function EverydayPanel({
  life,
  setLife,
  pauseTime,
}: {
  life: Life;
  pauseTime: () => void;
  setLife: React.Dispatch<React.SetStateAction<Life | null>>;
}) {
  const next = upcomingEvent(life),
    used = life.simulation?.activityAge === life.age;
  return (
    <div className="everyday-panel">
      <span className="pill">
        {life.age < 3 ? "กำลังเติบโต" : "ปีธรรมดาที่ไม่ธรรมดา"}
      </span>
      <h2>
        {life.age < 2
          ? "กิน นอน แล้วก็โตขึ้นอีกนิด"
          : life.age < 6
            ? "โลกกว้างเริ่มสนุกแล้ว!"
            : "ปีนี้อยากเติมอะไรให้ชีวิต?"}
      </h2>
      <p>
        {life.age < 3
          ? "ใช้แถบเวลาด้านบน แล้วดูเจ้าตัวน้อยเติบโต"
          : used
            ? "ทำกิจกรรมปีนี้แล้ว! เดินเวลาต่อเพื่อพบเรื่องใหม่"
            : "เลือกกิจกรรมได้ 1 ครั้งต่อปี ก่อนเดินเวลาต่อ"}
      </p>
      {life.age >= 3 && (
        <div className="activities">
          {(
            [
              { id: "rest", label: "♥ พักผ่อน", hint: "สุขภาพ +3 · สุข +1" },
              { id: "learn", label: "✦ เรียนรู้", hint: "ทักษะ +2 · สุข −1" },
              { id: "connect", label: "☺ พบผู้คน", hint: "สัมพันธ์ +3 · สุข +2" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              disabled={used}
              onClick={() =>
                setLife((current) =>
                  current ? doActivity(current, item.id as Activity) : current,
                )
              }
            >
              {item.label}
              <small>{item.hint}</small>
            </button>
          ))}
        </div>
      )}
      <EconomyPanel life={life} setLife={setLife} pauseTime={pauseTime} />
      <div className="next-milestone">
        {next
          ? `เป้าหมายถัดไป: อายุ ${next.age} ปี · ${next.category}`
          : "ใช้เวลาที่เหลือในแบบของคุณ"}
        <span>ระหว่างทางอาจมีเรื่องไม่คาดคิด!</span>
      </div>
    </div>
  );
}
