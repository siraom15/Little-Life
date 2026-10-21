import PixelCharacter from "./PixelCharacter";
export default function StartScene() {
  return (
    <svg
      className="start-scene"
      viewBox="0 0 400 155"
      role="img"
      aria-label="จากทารกถึงวัยชรา หนึ่งชีวิตที่รอคุณเขียน"
      shapeRendering="crispEdges"
    >
      <rect width="400" height="155" fill="#101f38" />
      <path d="M0 117h400v38H0z" fill="#244c60" />
      <g className="pixel-cloud">
        <path d="M35 30h45v12H35zM45 22h23v8H45zM265 40h65v12h-65z" fill="#8cdcf0" />
      </g>
      <path d="M335 18h22v22h-22z" fill="#ffcb60" />
      <g className="start-cast">
        <PixelCharacter x={65} y={119} age={0} />
        <PixelCharacter x={150} y={125} age={10} shirt="#ffba68" />
        <PixelCharacter x={240} y={125} age={28} female shirt="#5bd9ca" />
        <PixelCharacter x={330} y={125} age={75} shirt="#8bbaff" />
      </g>
      <path d="M95 137h22v4H95zM185 137h22v4h-22zM275 137h22v4h-22z" fill="#ffcd66" />
    </svg>
  );
}
