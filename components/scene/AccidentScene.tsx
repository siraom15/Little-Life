import type { Life } from "@/lib/game";
import PixelCharacter from "./PixelCharacter";
export default function AccidentScene({life}:{life:Life}) {
 const kind=life.simulation?.notice?.accident;
 return <svg viewBox="0 0 400 200" role="img" aria-label={life.simulation?.notice?.title || "อุบัติเหตุร้ายแรง"} shapeRendering="crispEdges">
  <rect width="400" height="200" fill="#111c30"/><path d="M0 150h400v50H0z" fill="#35404f"/>
  <g className="accident-alert"><path d="M190 15h20v25h-20zM194 45h12v10h-12z" fill="#ffb651"/></g>
  {kind==="car" && <><path d="M35 115h110v35H35zM60 85h55l25 30H60z" fill="#5da7cb"/><path d="M225 115h120v35H225zM240 85h70l25 30h-95z" fill="#cd786d"/><path d="M58 142h24v18H58zm50 0h24v18h-24zm130 0h24v18h-24zm55 0h24v18h-24z" fill="#101622"/><path d="M169 101l18 11 10-25 8 29 22-9-13 20 15 10-28 1-12 22-4-28-20-8z" fill="#ffd86d"/></>}
  {kind==="bus" && <g transform="rotate(-16 160 130)"><path d="M40 75h245v75H40z" fill="#b67a62"/><path d="M55 88h35v28H55zm45 0h35v28h-35zm45 0h35v28h-35zm45 0h35v28h-35zm45 0h35v28h-35z" fill="#82bfd3"/><path d="M66 145h30v18H66zm163 0h30v18h-30z" fill="#101622"/></g>}
  {kind==="collapse" && <><path d="M40 45h100v105H40zM200 92h95v58h-95z" fill="#566e85"/><path d="M55 60h22v22H55zm40 0h22v22H95z" fill="#d8b878"/><path d="M120 30l65 12-18 85-47-6zM150 135h30v18h-30zM235 145h45v16h-45zM85 142h28v18H85z" fill="#8e96a0"/></>}
  {kind==="drowning" && <><path d="M0 110h400v90H0z" fill="#1d5573"/><path d="M10 130h65v5H10zm105 0h60v5h-60zm105 0h60v5h-60zm105 0h65v5h-65zM45 165h70v5H45zm110 0h70v5h-70zm110 0h70v5h-70z" fill="#78c5cf"/><path d="M170 115h65v35h-65z" fill="#e29c5e"/><path d="M185 122h35v20h-35z" fill="#1d5573"/><path d="M230 130l95-45" stroke="#e8d7ab" strokeWidth="4"/></>}
  {kind==="electric" && <><path d="M45 45h90v95H45z" fill="#6e7f8d"/><path d="M60 63h58v45H60z" fill="#263546"/><path d="M135 80h75v38h45" fill="none" stroke="#333" strokeWidth="6"/><path d="M160 65l30-15-12 37 28-8-40 49 9-33-24 7z" fill="#ffe17a"/><path d="M85 18v20m-42 0L27 23m104 13 15-16" stroke="#ffc85c" strokeWidth="4"/></>}
  {kind!=="drowning" && <PixelCharacter x={335} y={144} age={30} shirt="#f0e8cf" scale={1.2}/>}
  <path d="M313 98h12v12h12v12h-12v12h-12v-12h-12v-12h12z" fill="#df6d6d"/>
  <text x="200" y="191" textAnchor="middle" fill="#ffe3b4" fontSize="13">หน่วยกู้ภัยกำลังช่วยเหลือ • เหตุฉุกเฉิน</text>
 </svg>;
}
