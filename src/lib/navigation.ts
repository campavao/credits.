import { router } from 'expo-router';
import type { Href } from 'expo-router';

/**
 * Safe "go back" for pushed screens.
 *
 * `router.back()` silently no-ops when there is no in-app navigation history —
 * e.g. opening a shared/deep link, or refreshing the page directly onto a
 * screen. That made Back buttons look broken. Fall back to a real destination
 * so Back is never a dead end.
 */
export function goBack(fallback: Href = '/(tabs)/home') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
