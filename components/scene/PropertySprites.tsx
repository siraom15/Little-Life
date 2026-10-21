import type { OwnedAsset } from "@/lib/game/journey/types";
import { assetCatalog } from "@/lib/game/journey/assets";
export function PropertyHouse({ asset }: { asset: OwnedAsset }) {
  const model = assetCatalog.house.find((m) => m.id === asset.id)!,
    tall = asset.id === "condo" || asset.id === "mansion",
    wide = asset.id === "garden" || asset.id === "mansion";
  return (
    <g aria-label={model.name}>
      <rect
        x={wide ? 10 : 25}
        y={tall ? 48 : 82}
        width={wide ? 132 : 100}
        height={tall ? 105 : 71}
        fill={model.color}
      />
      <path
        d={
          tall ? "M20 40h110v10H20z" : "M15 80h120v10H15zM29 67h91v13H29zM44 55h61v12H44z"
        }
        fill="#324e72"
      />
      {[0, 1, 2].map((col) => (
        <g key={col}>
          <rect
            x={35 + col * 28}
            y={tall ? 65 : 96}
            width="17"
            height="20"
            fill="#c1eeff"
          />
          {tall && (
            <rect x={35 + col * 28} y="96" width="17" height="20" fill="#e9dc9e" />
          )}
        </g>
      ))}
      <rect x="65" y="124" width="23" height="29" fill="#315066" />
      {asset.id === "mansion" && (
        <path d="M11 44h13v109H11zM127 44h13v109h-13z" fill="#e7e8dc" />
      )}
      {asset.id === "garden" && (
        <g fill="#428b63">
          <path d="M4 134h27v20H4zM120 130h32v24h-32z" />
        </g>
      )}
      <rect x="13" y="153" width="130" height="5" fill="#4f6e6e" />
    </g>
  );
}
export function PropertyCar({ asset }: { asset: OwnedAsset }) {
  const model = assetCatalog.car.find((m) => m.id === asset.id)!;
  const bike = asset.id === "scooter",
    suv = asset.id === "suv";
  return (
    <g className="property-car" aria-label={model.name} transform="translate(306 145)">
      {bike ? (
        <>
          <circle cx="13" cy="29" r="8" fill="#243549" />
          <circle cx="49" cy="29" r="8" fill="#243549" />
          <path d="M13 24h25v-13h10v13h7v7H25z" fill={model.color} />
          <path d="M36 7h16v5H36z" fill="#d9edf5" />
        </>
      ) : (
        <>
          <path
            d={suv ? "M2 15h8V0h40v15h16v18H2z" : "M2 18h11l8-13h25l8 13h13v16H2z"}
            fill={model.color}
          />
          <path
            d={suv ? "M15 5h14v11H15zM33 5h14v11H33z" : "M24 9h11v10H18zM39 9h6l6 10H39z"}
            fill="#c0e9fa"
          />
          <rect x="4" y="22" width="7" height="5" fill="#ffe9a0" />
          <circle cx="17" cy="33" r="8" fill="#172736" />
          <circle cx="53" cy="33" r="8" fill="#172736" />
          <circle cx="17" cy="33" r="3" fill="#95b6c8" />
          <circle cx="53" cy="33" r="3" fill="#95b6c8" />
        </>
      )}
    </g>
  );
}
