import type { Life } from "@/lib/game";
import { characterAppearance } from "@/lib/game/appearance";
import PixelCharacter from "./PixelCharacter";
import LifeDetails from "./LifeDetails";
import { PropertyCar, PropertyHouse } from "./PropertySprites";
export default function AbroadScene({ life }: { life: Life }) {
  const country = life.location;
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={"ชีวิตใน" + country}
      shapeRendering="crispEdges"
    >
      <rect width="400" height="200" fill="#182e51" />
      <g className="pixel-cloud">
        <path d="M20 35h65v12H20zM35 25h30v10H35zM290 40h70v12h-70z" fill="#b0def0" />
      </g>
      <rect y="143" width="400" height="57" fill="#386e6b" />
      {country === "ญี่ปุ่น" ? (
        <>
          <path d="M60 140l80-100 85 100z" fill="#6b8bb6" />
          <path d="M117 70l23-30 26 30z" fill="#f6f5e5" />
          <path
            d="M250 72h112v10H250zM258 88h96v7h-96zM267 82h9v62h-9zM337 82h9v62h-9z"
            fill="#f27668"
          />
          <path d="M22 95h8v50h-8z" fill="#91645f" />
          <path d="M8 74h40v24H8zM16 64h26v12H16z" fill="#f5a4c6" />
        </>
      ) : country === "ออสเตรเลีย" ? (
        <>
          <path d="M0 108h400v35H0z" fill="#258ca5" />
          <path
            d="M40 132l15-70 40 70zM77 132l35-95 45 95zM140 132l30-67 40 67z"
            fill="#fff0d2"
          />
          <path
            d="M255 132h80v10h-80zM290 75h7v57h-7zM297 80l35 45h-35z"
            fill="#ffd078"
          />
        </>
      ) : (
        <>
          <path
            d="M70 86h180v12H70zM80 76h160v10H80zM90 98h13v46H90zM125 98h13v46h-13zM160 98h13v46h-13zM195 98h13v46h-13zM230 98h13v46h-13z"
            fill="#d9c398"
          />
          <path d="M288 95h62v50h-62zM280 95l39-43 39 43z" fill="#b17766" />
          <path d="M299 108h12v14h-12zM327 108h12v14h-12z" fill="#ffe09c" />
        </>
      )}
      {life.journey!.house && (
        <g transform="translate(-5 42) scale(.65)">
          <PropertyHouse asset={life.journey!.house} />
        </g>
      )}
      {life.journey!.car && <PropertyCar asset={life.journey!.car} />}
      {life.journey!.extraCars.map((car, i) => (
        <g key={i} transform={"translate(" + (-90 - i * 70) + " 25) scale(.8)"}>
          <PropertyCar asset={car} />
        </g>
      ))}
      <LifeDetails life={life} />
      <PixelCharacter
        x={205}
        y={183}
        scale={1.3}
        shirt="#62d4cb"
        {...characterAppearance(life)}
        torn={life.journey!.debt > 0}
      />
      <text x="15" y="20" fontSize="13" fill="#fff1ce">
        {country} · {life.job}
      </text>
    </svg>
  );
}
