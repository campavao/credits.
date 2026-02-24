import { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { surface, borderRadius as br } from '../../lib/theme';

interface SkeletonBaseProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBase({ width, height, borderRadius = br.sm, style }: SkeletonBaseProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: surface.overlay,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

function Rect({ width = 100, height = 100, borderRadius, style }: SkeletonBaseProps) {
  return <SkeletonBase width={width} height={height} borderRadius={borderRadius ?? br.sm} style={style} />;
}

function Circle({ width = 48, style }: { width?: number; style?: ViewStyle }) {
  return <SkeletonBase width={width} height={width} borderRadius={width / 2} style={style} />;
}

function Text({ width = 120, height = 14, style }: { width?: number | `${number}%`; height?: number; style?: ViewStyle }) {
  return <SkeletonBase width={width} height={height} borderRadius={br.sm} style={style} />;
}

export const Skeleton = {
  Rect,
  Circle,
  Text,
};
