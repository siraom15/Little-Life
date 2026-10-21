import type { Life } from "@/lib/game";
import PixelCharacter from "./PixelCharacter";
export default function FuneralScene({ life }: { life: Life }) {
  const guests = life.journey?.funeral?.guests || [];
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={"พิธีอำลา มีผู้มาร่วม " + guests.length + " คน"}
      shapeRendering="crispEdges"
    >
      <rect width="400" height="200" fill="#142b40" />
      <path d="M80 55h240v100H80z" fill="#3c5d72" />
      <path
        d="M60 55h280v8H60zM85 43h230v12H85zM120 28h160v15H120zM160 16h80v12h-80z"
        fill="#d3b471"
      />
      <rect x="174" y="66" width="52" height="55" fill="#e3c884" />
      <rect x="180" y="72" width="40" height="43" fill="#273e57" />
      <PixelCharacter
        x={200}
        y={110}
        age={life.age}
        female={life.simulation?.sex === "female"}
        scale={0.6}
        shirt="#84a9ba"
      />
      <rect y="155" width="400" height="45" fill="#456479" />
      <path d="M157 138h86v17h-86zM149 155h102v8H149z" fill="#e0d5b6" />
      {[135, 265].map((x) => (
        <g key={x}>
          <rect x={x} y="126" width="5" height="27" fill="#ddc17c" />
          <rect
            x={x}
            y="118"
            width="5"
            height="8"
            fill="#ffe5a2"
            className="funeral-flame"
          />
        </g>
      ))}
      {guests.slice(0, 12).map((g, i) => (
        <PixelCharacter
          key={i}
          x={18 + i * 33}
          y={197}
          age={g.role === "ลูก" ? 16 : 45}
          female={i % 2 === 0}
          scale={0.58}
          shirt={i % 2 ? "#d7dfe3" : "#314859"}
        />
      ))}
      <g fill="#ebc6d0">
        <path d="M110 147h20v8h-20zM272 147h20v8h-20z" />
      </g>
    </svg>
  );
}
