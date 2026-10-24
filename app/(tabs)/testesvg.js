 
import Svg, { Path } from "react-native-svg";

export default function Testesvg() {
  return (
    <Svg width="100%" height="100%" style={{ position: "absolute" }}>
      {/* Le chemin de la route */}
      <Path
        d="M 30 100 C 30 30, 200 30, 200 120 S 50 180, 80 280"
        stroke="#555555"
        strokeWidth="100"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Le centre de la route */}
      <Path
        d="M 30 100 C 30 30, 200 30, 200 120 S 50 180, 80 280"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
      />
    </Svg>
  );
}
