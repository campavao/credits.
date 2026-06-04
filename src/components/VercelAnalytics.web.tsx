import { Analytics } from '@vercel/analytics/react';

/**
 * Vercel Web Analytics — web only.
 *
 * Injects the insights script on the deployed site (it no-ops in local dev).
 * Native builds resolve `VercelAnalytics.tsx` (a null stub) instead, so
 * `@vercel/analytics` is never bundled into the iOS/Android apps.
 */
export function VercelAnalytics() {
  return <Analytics />;
}
