import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

// Total acceleration (in g) above which we count a "shake". Resting is ~1g.
const SHAKE_THRESHOLD = 1.8;
// Ignore repeat triggers within this window so one shake fires once.
const SHAKE_COOLDOWN_MS = 1000;

/**
 * Calls `onShake` when the device is physically shaken.
 * No-ops on web (browsers gate motion sensors behind a permission prompt that
 * requires a user gesture, so it's unreliable) and when `enabled` is false.
 */
export function useShake(onShake: () => void, enabled = true) {
  const callbackRef = useRef(onShake);
  callbackRef.current = onShake;

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let lastShake = 0;
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (magnitude > SHAKE_THRESHOLD && now - lastShake > SHAKE_COOLDOWN_MS) {
        lastShake = now;
        callbackRef.current();
      }
    });

    return () => subscription.remove();
  }, [enabled]);
}
