import AbroadScene from "./AbroadScene";
import AccidentScene from "./AccidentScene";
import WorkRewardScene from "./WorkRewardScene";
import NoticeScene from "./NoticeScene";
import { noticeVisual } from "@/lib/game/journey/notice-visual";
import LifeDetails from "./LifeDetails";
import { isImprisoned } from "@/lib/game/journey/police";
import PrisonScene from "./PrisonScene";
import FuneralScene from "./FuneralScene";
import { PropertyHouse, PropertyCar } from "./PropertySprites";
import type { Life, SceneKind } from "@/lib/game";
import { characterAppearance, lifeStage } from "@/lib/game/appearance";
import PixelCharacter from "./PixelCharacter";
export default function SceneIllustration({
  life,
  kind,
}: {
  life: Life;
  kind?: SceneKind;
}) {
  if (life.simulation?.notice?.accident) return <AccidentScene life={life} />;
  if (life.done && life.journey?.funeral) return <FuneralScene life={life} />;
  if (isImprisoned(life) || kind === "prison") return <PrisonScene life={life} />;
  if (life.simulation?.notice?.subject?.startsWith("offer-"))
    return <WorkRewardScene life={life} />;
  if (noticeVisual(life.simulation?.notice)) return <NoticeScene life={life} />;
  const appearance = characterAppearance(life);
  const newborn = life.simulation?.notice?.id.startsWith("new-child-")
    ? life.journey?.children.at(-1)
    : null;
  if (newborn)
    return (
      <svg
        viewBox="0 0 400 200"
        role="img"
        aria-label={"ทารก " + newborn.name}
        shapeRendering="crispEdges"
      >
        <rect width="400" height="200" fill="#142d49" />
        <path d="M30 30h340v130H30z" fill="#254d68" />
        <PixelCharacter
          x={200}
          y={135}
          scale={2.5}
          age={0}
          female={newborn.sex === "female"}
          skin={newborn.skin}
        />
        <text x="200" y="40" textAnchor="middle" fontSize="18" fill="#ffe199">
          ♥ {newborn.name} ♥
        </text>
        <text x="200" y="183" textAnchor="middle" fontSize="12" fill="#e8f5ff">
          {newborn.trait}
        </text>
      </svg>
    );
  const japan = life.location === "ญี่ปุ่น";
  const nursery = (kind === "birth" || !kind) && life.age < 2;
  const hospital =
    kind === "hospital" || (life.journey?.health.hospitalUntil ?? -1) >= life.age;
  const dead = kind === "death" || !!life.simulation?.death;
  const festival = kind === "festival";
  const indoor = nursery || hospital;
  if (!indoor && !dead && ["ญี่ปุ่น", "ออสเตรเลีย", "เยอรมนี"].includes(life.location))
    return <AbroadScene life={life} />;
  const shirt =
    life.age < 13
      ? "#f7edce"
      : life.age >= 60
        ? "#9a85c5"
        : life.flags.includes("business")
          ? "#d99567"
          : japan
            ? "#608db5"
            : "#8f6dcd";
  return (
    <svg
      viewBox="0 0 400 200"
      role="img"
      aria-label={
        dead
          ? "ฉากอำลาและความทรงจำ"
          : nursery
            ? "ทารกนอนในเปล"
            : `${lifeStage(life.age)} ${appearance.female ? "หญิง" : "ชาย"} ${hospital ? "พักรักษาตัว" : festival ? "งานเทศกาล" : japan ? "ญี่ปุ่น" : "ประเทศไทย"}`
      }
      shapeRendering="crispEdges"
    >
      <rect
        width="400"
        height="200"
        fill={dead ? "#292440" : festival ? "#393357" : indoor ? "#eedce5" : "#afd4ec"}
      />
      {indoor ? (
        <>
          <rect x="25" y="24" width="90" height="77" fill="#fff3d9" />
          <rect x="31" y="30" width="78" height="64" fill="#b0d8e9" />
          <path d="M69 30v64M31 62h78" stroke="#fff1db" strokeWidth="5" />
          <rect x="297" y="32" width="58" height="50" fill="#fff6ec" />
          {hospital ? (
            <path d="M319 41h14v32h-14zM310 50h32v14h-32z" fill="#cf8095" />
          ) : (
            <>
              <path
                d="M314 45h24v5h-24zM309 50h34v14h-34zM314 64h24v5h-24z"
                fill="#e5bd68"
              />
              <rect x="170" y="13" width="3" height="30" fill="#b59acb" />
              <path
                d="M150 43h43v3h-43zM151 46v12M190 46v12"
                stroke="#b59acb"
                strokeWidth="2"
              />
              <path d="M146 59h11v8h-11zM185 59h11v8h-11z" fill="#d2a6bf" />
            </>
          )}
        </>
      ) : (
        <>
          <rect
            y="96"
            width="400"
            height="60"
            fill={dead ? "#4d4563" : festival ? "#575073" : "#cadde6"}
          />
          <path
            d="M0 110h35V90h30v20h25V74h32v36h28V86h25v24h28V68h34v42h25V85h35v25h30V72h28v38h45v42H0z"
            fill={dead ? "#5d526f" : festival ? "#756280" : "#96bdcf"}
          />
          {!dead && (
            <>
              <rect x="316" y="24" width="24" height="24" fill="#ffe0a1" />
              <rect x="312" y="28" width="32" height="16" fill="#ffe0a1" />
            </>
          )}
          <g
            className="pixel-clouds"
            fill={dead ? "#8d799a" : festival ? "#ab8da9" : "#f5f5e9"}
          >
            <path d="M32 32h18v-6h24v6h15v11H32zM210 49h12v-6h25v6h18v10h-55z" />
          </g>
        </>
      )}
      <rect
        y="151"
        width="400"
        height="49"
        fill={dead ? "#686178" : indoor ? "#c9a5aa" : "#8fb58e"}
      />
      <rect
        y="173"
        width="400"
        height="27"
        fill={dead ? "#8a7b90" : indoor ? "#dcbdb4" : "#dccab0"}
      />
      <path d="M0 173h400v3H0z" fill={dead ? "#a292a5" : "#efdebf"} />
      {dead ? (
        <>
          <path d="M165 170v-55h8v-9h54v9h8v55z" fill="#c5b8ce" />
          <path d="M176 119h48v36h-48z" fill="#a596b4" />
          <path d="M190 130h20v3h-20zM186 139h28v3h-28z" fill="#e7dced" />
          <path d="M150 173h100v6H150z" fill="#a89bb6" />
          <path d="M257 169v-18M263 169v-24" stroke="#a0b59d" strokeWidth="3" />
          <path d="M251 145h13v7h-13zM257 139h13v7h-13z" fill="#edd7ab" />
          <g className="memory-star">
            <path d="M197 42h6v19h-6zM191 48h18v6h-18z" fill="#ffe3ae" />
          </g>
        </>
      ) : (
        <>
          {!indoor && (
            <>
              {life.journey?.homeless ? null : life.journey?.house ? (
                <PropertyHouse asset={life.journey.house} />
              ) : japan ? (
                <g>
                  <rect x="25" y="85" width="93" height="67" fill="#f1e0cb" />
                  <path
                    d="M15 80h113v8H15zM25 72h93v8H25zM35 64h73v8H35z"
                    fill="#666080"
                  />
                  <path d="M46 110h18v42H46zM82 110h18v42H82z" fill="#b9818d" />
                  <rect x="67" y="92" width="15" height="13" fill="#dd738b" />
                </g>
              ) : (
                <g>
                  <rect
                    x="26"
                    y="85"
                    width="101"
                    height="67"
                    fill={life.age < 18 ? "#f1d58d" : "#f2ddbb"}
                  />
                  <path
                    d="M17 82h119v8H17zM27 74h99v8H27zM37 66h79v8H37zM47 58h59v8H47z"
                    fill={life.flags.includes("house") ? "#987cb7" : "#bd7d80"}
                  />
                  <rect x="69" y="118" width="21" height="34" fill="#79658e" />
                  <path d="M37 103h19v18H37zM103 103h15v18h-15z" fill="#8bb7c9" />
                  {life.age >= 6 && life.age < 18 && (
                    <path d="M70 93h21v13H70z" fill="#fff0d2" />
                  )}
                </g>
              )}
              <rect x="326" y="99" width="7" height="53" fill="#977765" />
              <path
                d="M310 66h39v10h-39zM299 76h61v24h-61zM311 100h36v11h-36z"
                fill={japan ? "#e4a7c4" : "#78a98d"}
              />
              {festival && (
                <g>
                  <path d="M0 58L400 80" stroke="#a58a9e" strokeWidth="2" />
                  {[35, 90, 145, 200, 255, 310, 365].map((x, i) => (
                    <rect
                      key={x}
                      x={x}
                      y={57 + i * 3}
                      width="12"
                      height="15"
                      fill={i % 2 ? "#e4b66c" : "#da8cae"}
                    />
                  ))}
                </g>
              )}
              {life.age >= 60 && (
                <path
                  d="M270 137h42v6h-42zM270 147h42v6h-42zM275 153h4v13h-4zM304 153h4v13h-4z"
                  fill="#a78066"
                />
              )}
            </>
          )}
          {hospital ? (
            <>
              <rect x="153" y="140" width="88" height="22" fill="#f4eee5" />
              <rect x="160" y="135" width="25" height="18" fill="#f8f3f3" />
              <path d="M156 162h6v12h-6zM232 162h6v12h-6z" fill="#9a849e" />
              <rect x="165" y="131" width="16" height="12" fill={appearance.skin} />
              <rect x="184" y="139" width="53" height="16" fill="#9cbac7" />
            </>
          ) : (
            <PixelCharacter
              x={200}
              y={nursery ? 150 : 174}
              scale={nursery ? 1.5 : 1.12}
              shirt={shirt}
              {...appearance}
              age={nursery ? 0 : life.age}
              sad={life.stats.happy < 40}
              torn={(life.journey?.debt || 0) > 0 || life.journey?.homeless}
            />
          )}
          {!nursery && !hospital && life.flags.includes("partner") && (
            <PixelCharacter
              x={244}
              y={174}
              age={life.age}
              female={!appearance.female}
              shirt="#bd8ca9"
            />
          )}
          {!nursery &&
            !hospital &&
            life.journey?.children
              .slice(0, 3)
              .map((child, index) => (
                <PixelCharacter
                  key={index}
                  x={133 + index * 23}
                  y={178}
                  age={life.age - child.bornAt}
                  scale={0.8}
                  female={child.sex === "female"}
                  skin={child.skin}
                  shirt={["#f0c160", "#7bd0c3", "#f3a1b5"][index]}
                />
              ))}
          {!indoor && life.journey?.car && <PropertyCar asset={life.journey.car} />}
          {!indoor &&
            life.journey?.extraCars.map((car, index) => (
              <g
                key={index}
                transform={"translate(" + (-90 - index * 70) + " 25) scale(.8)"}
              >
                <PropertyCar asset={car} />
              </g>
            ))}
          {!indoor && life.journey && <LifeDetails life={life} />}
          {kind === "gift" && (
            <g>
              <rect x="143" y="154" width="25" height="20" fill="#d496ae" />
              <path d="M141 151h29v6h-29zM153 151h6v23h-6z" fill="#f0cb82" />
            </g>
          )}
          {kind === "travel" && (
            <g>
              <path d="M265 24h70v7h-70zM294 12h10v31h-10z" fill="#faf0d2" />
              <rect x="222" y="160" width="16" height="14" fill="#ba8b67" />
            </g>
          )}
          {!indoor && life.age < 6 && life.age >= 2 && (
            <>
              <rect x="142" y="160" width="10" height="10" fill="#d3a2bd" />
              <rect x="130" y="167" width="10" height="10" fill="#e8c875" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
