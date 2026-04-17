import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, spacing } from '../utils/constants';

type PieDatum = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: PieDatum[];
  size?: number;
};

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function PieChart({ data, size = 180 }: Props) {
  const total = data.reduce((sum, row) => sum + row.value, 0);
  const usable = total <= 0 ? [{ label: 'No data', value: 1, color: '#e2e8f0' }] : data;
  const safeTotal = usable.reduce((sum, row) => sum + row.value, 0);

  let currentAngle = 0;
  const radius = size / 2;
  const innerRadius = radius - 4;

  return (
    <View style={styles.root}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {usable.map((slice) => {
          const sweep = (slice.value / safeTotal) * 360;
          // SVG arc commands don't reliably render a full 360° sweep (start==end => invisible).
          if (sweep >= 359.999) {
            currentAngle += sweep;
            return (
              <Circle
                key={slice.label}
                cx={radius}
                cy={radius}
                r={innerRadius}
                fill={slice.color}
              />
            );
          }

          const path = describeArc(radius, radius, innerRadius, currentAngle, currentAngle + sweep);
          currentAngle += sweep;
          return <Path key={slice.label} d={path} fill={slice.color} />;
        })}
      </Svg>
      <View style={styles.legend}>
        {usable.map((slice) => {
          const pct = Math.round((slice.value / safeTotal) * 100);
          return (
            <View key={slice.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: slice.color }]} />
              <Text style={styles.legendText}>{`${slice.label}: ${slice.value} (${pct}%)`}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  legend: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
