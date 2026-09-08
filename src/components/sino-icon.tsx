import Svg, { Circle, Path, Rect } from "react-native-svg";

type SinoIconProps = {
  size?: number;
};

export function SinoIcon({ size = 64 }: SinoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="48 56 160 160" fill="none">
      <Path d="M64 152V128a64 64 0 0 1 128 0v24H64Z" fill="#2563E8" />
      <Rect x={48} y={160} width={160} height={12} rx={6} fill="#232A38" />
      <Circle cx={128} cy={196} r={12} fill="#232A38" />
    </Svg>
  );
}
