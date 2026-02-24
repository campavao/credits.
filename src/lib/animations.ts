import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { springs } from './theme';

export function useStaggeredEntrance(index: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      index * 60,
      withSpring(1, springs.gentle)
    );
    translateY.value = withDelay(
      index * 60,
      withSpring(0, springs.gentle)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
}

export function useSpringPressable() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, springs.snappy);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, springs.snappy);
  };

  return { animatedStyle, onPressIn, onPressOut };
}

export function useAnimatedMount() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSpring(1, springs.gentle);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}
