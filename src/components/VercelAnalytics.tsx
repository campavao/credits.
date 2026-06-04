/**
 * Native stub for Vercel Web Analytics (which is web-only).
 *
 * Metro resolves `VercelAnalytics.web.tsx` for the web bundle; this file is used
 * on iOS/Android, where it renders nothing and pulls in no web-only deps.
 */
export function VercelAnalytics(): null {
  return null;
}
