import type { Life } from "@/lib/game";
import { characterAppearance } from "@/lib/game/appearance";
import PixelCharacter from "./PixelCharacter";
export default function PrisonScene({ life }: { life: Life }) {
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={
        "ฉากคุก เหลือโทษ " + (life.simulation!.economy!.prisonUntil - life.age) + " ปี"
      }
      shapeRendering="crispEdges"
    >
      <rect width="400" height="200" fill="#26394c" />
      <path
        d="M0 45h400M0 85h400M0 125h400M50 0v45M150 0v45M250 0v45M350 0v45M100 45v40M200 45v40M300 45v40"
        stroke="#42566a"
        strokeWidth="2"
      />
      <rect x="286" y="22" width="62" height="55" fill="#8ebde0" />
      <path d="M305 22v55M328 22v55M286 49h62" stroke="#172a3c" strokeWidth="6" />
      <rect y="155" width="400" height="45" fill="#53616d" />
      <rect x="26" y="128" width="115" height="20" fill="#677f94" />
      <rect x="29" y="120" width="29" height="12" fill="#b0beca" />
      <path d="M30 148v23M133 148v23" stroke="#a0aeb5" strokeWidth="5" />
      <PixelCharacter
        x={218}
        y={176}
        {...characterAppearance(life)}
        shirt="#ef934d"
        sad
      />
      <g stroke="#182936" strokeWidth="8">
        {[12, 62, 112, 162, 262, 312, 362, 395].map((x) => (
          <path key={x} d={"M" + x + " 0v200"} />
        ))}
      </g>
      <path d="M0 8h400M0 193h400" stroke="#7993a8" strokeWidth="8" />
      <rect x="280" y="103" width="15" height="27" fill="#d5b56f" />
    </svg>
  );
}
