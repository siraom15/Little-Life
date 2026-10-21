import type { Life } from "@/lib/game";
import PixelCharacter from "./PixelCharacter";
export default function WorkRewardScene({ life }: { life: Life }) {
  const subject = life.simulation?.notice?.subject || "",
    house = subject.includes("house"),
    car = subject.includes("car");
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label="เลิกงานอย่างเหนื่อยล้าและคิดถึงความมั่นคง"
      shapeRendering="crispEdges"
    >
      <rect width="400" height="200" fill="#0a1628" />
      <path d="M0 145h400v55H0z" fill="#244050" />
      <path d="M24 30h100v115H24z" fill="#31435c" />
      <path
        d="M38 44h16v20H38zm40 0h16v20H78zM38 82h16v20H38zm40 0h16v20H78z"
        fill="#e8b767"
      />
      <PixelCharacter
        x={150}
        y={155}
        age={life.age}
        female={life.simulation?.sex === "female"}
        sad
        shirt="#55a0be"
        scale={1.5}
      />
      <g className="reward-thought">
        <path d="M220 20h150v105H220zM202 119h12v12h-12z" fill="#e7f3f1" />
        {house ? (
          <path
            d="M244 70l50-34 50 34v8h-10v35h-80V78h-10zm40 12v31h20V82z"
            fill="#dc8865"
          />
        ) : car ? (
          <>
            <path d="M244 75h100v30H244zM262 55h56v20h-56z" fill="#499aba" />
            <path d="M256 100h20v15h-20zm60 0h20v15h-20z" fill="#24364d" />
          </>
        ) : (
          <>
            <path d="M264 40h60v40l-30 30-30-30z" fill="#4b9e80" />
            <path d="M288 52h12v12h12v12h-12v12h-12V76h-12V64h12z" fill="#fff3c8" />
          </>
        )}
      </g>
      <text x="200" y="188" textAnchor="middle" fill="#f5deab" fontSize="13">
        ให้รางวัลวันนี้ หรือวางแผนเพื่อวันข้างหน้า
      </text>
    </svg>
  );
}
