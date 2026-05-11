import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Restaurant } from '@/types/restaurant';
import { WheelColors } from '@/constants/theme';

const WHEEL_SIZE = 300;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const CENTER = WHEEL_RADIUS;
const MAX_SEGMENTS = 50; // allow up to 50 restaurants on the wheel

interface RouletteWheelProps {
  restaurants: Restaurant[];
  spinning: boolean;
  onFinished: (winner: Restaurant) => void;
}

/**
 * Convert polar coordinates to cartesian for SVG path drawing.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/**
 * Create an SVG arc path for a pie segment.
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

/**
 * Truncate text to fit roughly within a wheel segment.
 */
function truncateLabel(text: string, maxLen: number = 12): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 1) + '...';
}

export function RouletteWheel({ restaurants, spinning, onFinished }: RouletteWheelProps) {
  const items = restaurants.slice(0, MAX_SEGMENTS);
  const segmentCount = items.length;
  const segmentAngle = 360 / segmentCount;

  const rotation = useSharedValue(0);
  const hasSpun = useSharedValue(false);

  const handleFinish = useCallback(
    (winnerIndex: number) => {
      onFinished(items[winnerIndex]);
    },
    [items, onFinished]
  );

  useEffect(() => {
    if (spinning && !hasSpun.value) {
      hasSpun.value = true;

      // Pick a random winner
      const winnerIndex = Math.floor(Math.random() * segmentCount);

      // Calculate target angle so the winner segment is at the top (0 degrees / 12 o'clock)
      // The pointer is at the top. We rotate the wheel clockwise.
      // Segment i spans from (i * segmentAngle) to ((i+1) * segmentAngle).
      // We want the midpoint of the winner segment to be at the top.
      const winnerMidAngle = winnerIndex * segmentAngle + segmentAngle / 2;
      const currentOffset = rotation.value % 360;
      const targetAngle = ((360 - winnerMidAngle) - currentOffset + 360) % 360 || 360;
      const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
      const totalAngle = rotation.value + fullSpins * 360 + targetAngle;

      rotation.value = withTiming(
        totalAngle,
        {
          duration: 4000 + Math.random() * 1000,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(handleFinish)(winnerIndex);
          }
        }
      );
    }

    if (!spinning) {
      hasSpun.value = false;
    }
  }, [spinning, segmentCount, segmentAngle, rotation, hasSpun, handleFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Pointer triangle at top */}
      <View style={styles.pointer}>
        <Svg width={24} height={20} viewBox="0 0 24 20">
          <Path d="M12 20 L0 0 L24 0 Z" fill="#333" />
        </Svg>
      </View>

      <Animated.View style={[styles.wheelWrapper, animatedStyle]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <G>
            {items.map((restaurant, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const color = WheelColors[i % WheelColors.length];
              const path = describeArc(CENTER, CENTER, WHEEL_RADIUS, startAngle, endAngle);

              // Position label at the midpoint of the segment, ~60% out from center
              const labelAngle = startAngle + segmentAngle / 2;
              const labelRadius = WHEEL_RADIUS * 0.62;
              const labelPos = polarToCartesian(CENTER, CENTER, labelRadius, labelAngle);

              return (
                <G key={restaurant.id}>
                  <Path d={path} fill={color} stroke="#fff" strokeWidth={2} />
                  <SvgText
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#fff"
                    fontSize={segmentCount > 20 ? 6 : segmentCount > 8 ? 8 : 10}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={labelAngle}
                    origin={`${labelPos.x}, ${labelPos.y}`}
                  >
                    {truncateLabel(restaurant.name, segmentCount > 20 ? 7 : segmentCount > 8 ? 9 : 12)}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    zIndex: 10,
    marginBottom: -6,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_RADIUS,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
