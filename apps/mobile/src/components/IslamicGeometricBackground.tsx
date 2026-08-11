import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Pattern,
  Rect,
} from "react-native-svg";

type Tone = "chalk" | "ink";

type IslamicGeometricBackgroundProps = {
  tone?: Tone;
  opacity?: number;
  cellSize?: number;
};

function starPath(cx: number, cy: number, outer: number, inner: number) {
  const points: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
}

function rotatedSquarePath(
  cx: number,
  cy: number,
  size: number,
  rotationDeg: number,
) {
  const rad = (rotationDeg * Math.PI) / 180;
  const half = size / 2;
  const corners = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ].map(([x, y]) => {
    const rx = x * Math.cos(rad) - y * Math.sin(rad);
    const ry = x * Math.sin(rad) + y * Math.cos(rad);
    return [cx + rx, cy + ry] as const;
  });

  return (
    corners
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
      )
      .join(" ") + " Z"
  );
}

export function IslamicGeometricBackground({
  tone = "chalk",
  opacity = 0.22,
  cellSize = 96,
}: IslamicGeometricBackgroundProps) {
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  const stroke = tone === "chalk" ? "#FBFDFC" : "#13211C";
  const patternId = `girih-${tone}-${cellSize}`;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    if (w !== width || h !== height) {
      setSize({ width: w, height: h });
    }
  };

  const cx = cellSize / 2;
  const cy = cellSize / 2;
  const outer = cellSize * 0.34;
  const inner = cellSize * 0.14;

  return (
    <View
      pointerEvents="none"
      onLayout={onLayout}
      style={StyleSheet.absoluteFill}
    >
      {width > 0 && height > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <Pattern
              id={patternId}
              width={cellSize}
              height={cellSize}
              patternUnits="userSpaceOnUse"
            >
              <G stroke={stroke} strokeWidth={1.1} fill="none" opacity={opacity}>
                <Path d={rotatedSquarePath(cx, cy, cellSize * 0.58, 0)} />
                <Path d={rotatedSquarePath(cx, cy, cellSize * 0.58, 45)} />
                <Path d={starPath(cx, cy, outer, inner)} />
                <Circle cx={cx} cy={cy} r={cellSize * 0.18} />
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (Math.PI / 4) * i;
                  const x2 = cx + Math.cos(angle) * (cellSize * 0.48);
                  const y2 = cy + Math.sin(angle) * (cellSize * 0.48);
                  return (
                    <Line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      strokeOpacity={0.55}
                    />
                  );
                })}
                <Line x1={0} y1={cy} x2={cellSize * 0.18} y2={cy} />
                <Line x1={cellSize * 0.82} y1={cy} x2={cellSize} y2={cy} />
                <Line x1={cx} y1={0} x2={cx} y2={cellSize * 0.18} />
                <Line x1={cx} y1={cellSize * 0.82} x2={cx} y2={cellSize} />
              </G>
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </Svg>
      ) : null}
    </View>
  );
}
