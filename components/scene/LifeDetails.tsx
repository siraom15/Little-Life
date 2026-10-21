import type { Life } from "@/lib/game";
export default function LifeDetails({ life }: { life: Life }) {
  const j = life.journey!,
    notice = life.simulation?.notice?.id || "",
    event = j.pending?.id || "";
  const piles =
    life.money < 100000 ? 0 : Math.min(8, Math.floor(Math.log10(life.money / 10000) * 2));
  return (
    <g aria-label="รายละเอียดฐานะ อาชีพ และสุขภาพ">
      {Array.from({ length: piles }, (_, i) => (
        <g
          key={i}
          className="coin-glint"
          transform={
            "translate(" + (15 + (i % 4) * 20) + " " + (180 - Math.floor(i / 4) * 9) + ")"
          }
        >
          <path d="M0 0h17v6H0z" fill="#eebc40" />
          <path d="M2 0h13v2H2z" fill="#fff399" />
        </g>
      ))}
      {j.homeless && (
        <g>
          <path d="M22 145h72v29H22zM18 140h80v5H18z" fill="#9a7854" />
          <path d="M36 150h20v24H36z" fill="#493b36" />
          <text x="24" y="136" fontSize="10" fill="#293e55">
            ที่พักชั่วคราว
          </text>
        </g>
      )}
      {(notice.startsWith("promotion") ||
        event.startsWith("promotion") ||
        notice.startsWith("mission")) && (
        <g className="pixel-celebrate">
          <path
            d="M180 45h40v20h-40zM192 65h16v12h-16zM185 77h30v5h-30z"
            fill="#ffcf52"
          />
          <text x="200" y="35" textAnchor="middle" fontSize="11" fill="#183956">
            LEVEL UP
          </text>
        </g>
      )}
      {(event === "study" || (life.age >= 18 && life.age < 22)) && (
        <g>
          <path d="M133 55h42v7h-42zM140 62h28v12h-28zM171 60v17" fill="#263f65" />
          <text x="150" y="89" textAnchor="middle" fontSize="10" fill="#183956">
            มหาวิทยาลัย
          </text>
        </g>
      )}
      {(notice.startsWith("investment") || j.investment.deposited > 0) && (
        <g>
          <rect x="275" y="112" width="48" height="28" fill="#152c42" />
          <path
            d="M280 134h6v-5h8v-8h8v4h8v-10h7"
            stroke="#69e6a4"
            strokeWidth="3"
            fill="none"
          />
        </g>
      )}
      {j.health.exercise > 0 && (
        <g>
          <path d="M102 160h28v4h-28zM102 155h5v14h-5zM125 155h5v14h-5z" fill="#31455f" />
        </g>
      )}
      {(j.health.addiction > 0 || j.health.smoking > 0 || j.health.alcohol > 0) && (
        <g>
          <rect x="350" y="120" width="26" height="22" fill="#cf5267" />
          <text x="363" y="137" textAnchor="middle" fill="white" fontSize="16">
            !
          </text>
        </g>
      )}
      {j.health.smoking > 0 && (
        <g>
          <rect x="340" y="155" width="18" height="4" fill="#eae4cc" />
          <rect x="355" y="155" width="4" height="4" fill="#d8704b" />
          <path
            className="pixel-clouds"
            d="M358 151v-5h4v-5"
            stroke="#b7c6cd"
            strokeWidth="3"
            fill="none"
          />
        </g>
      )}
      {j.health.alcohol > 0 && (
        <g>
          <path d="M370 148h6v8h4v18h-14v-18h4z" fill="#8c7442" />
          <rect x="368" y="160" width="10" height="8" fill="#e6c27b" />
        </g>
      )}
      {j.career && (
        <g>
          <rect x="257" y="50" width="100" height="24" fill="#17354e" />
          <path d="M261 54h8v14h-8z" fill="#ffd36a" />
          <text x="276" y="65" fontSize="9" fill="#e3f6ff">
            {life.job}
          </text>
        </g>
      )}
      {life.flags.includes("retired") && (
        <g>
          <rect x="266" y="151" width="20" height="12" fill="#f0d68d" />
          <path d="M274 151v12" stroke="#786340" strokeWidth="2" />
        </g>
      )}
    </g>
  );
}
