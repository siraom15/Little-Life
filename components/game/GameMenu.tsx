import {
  Activity,
  Bookmark,
  ChevronRight,
  Download,
  RotateCcw,
  Upload,
} from "lucide-react";

export default function GameMenu({
  shared,
  save,
  download,
  input,
  setModal,
}: {
  shared: boolean;
  save: () => void;
  download: () => void;
  input: React.RefObject<HTMLInputElement | null>;
  setModal: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <aside className="side-column">
      <section className="quote-card">
        <span>✦</span>
        <h3>
          ไม่มีสูตรสำเร็จ
          <br />
          ลองใช้ชีวิต
          <br />
          <em>ในแบบของคุณ!</em>
        </h3>
        <div>
          HOW TO PLAY <span>↙</span>
        </div>
        <p>
          1. ดูชีวิตตอนนี้
          <br />
          2. เลือกทางที่อยากไป
          <br />
          3. รับผล แล้วเล่นต่อ!
        </p>
      </section>
      <section className="tools card">
        <h3>เมนูเกม</h3>
        <button onClick={save} disabled={shared}>
          <Bookmark size={17} />
          <span>
            บันทึกตอนนี้<small>เก็บชีวิตไว้ในเบราว์เซอร์</small>
          </span>
          <ChevronRight size={15} />
        </button>
        <button onClick={download}>
          <Download size={17} />
          <span>
            ส่งออกไฟล์ชีวิต<small>เก็บสำรองหรือย้ายเครื่อง</small>
          </span>
          <ChevronRight size={15} />
        </button>
        <button onClick={() => input.current?.click()}>
          <Upload size={17} />
          <span>
            นำเข้าไฟล์ชีวิต<small>เล่นต่อจากไฟล์บันทึก</small>
          </span>
          <ChevronRight size={15} />
        </button>
        <button onClick={() => setModal("restart")}>
          <RotateCcw size={17} />
          <span>
            เริ่มเรื่องราวใหม่<small>อีกชีวิต อีกความเป็นไปได้</small>
          </span>
          <ChevronRight size={15} />
        </button>
      </section>
      <div className="hint">
        <Activity size={17} />
        <p>
          เรื่องเล็ก ๆ วันนี้
          <br />
          อาจเป็นจุดเริ่มต้นของเรื่องใหญ่ในวันหน้า
        </p>
      </div>
    </aside>
  );
}
