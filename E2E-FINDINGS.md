# creditz. — E2E Test Findings

> Driven via Playwright (headless Chromium) against `expo start --web` on localhost:8081.
> Test account: `e2e.creditz.tester@gmail.com` (auto-created through the real signup flow).
> Date: 2026-06-03. Severity: **P0** = blocks core flow · **P1** = major UX breakage · **P2** = noticeable rough edge · **P3** = polish/nit.

---

## Status (fixed in this commit)

| # | Finding | Status |
|---|---------|--------|
| P0 | Auth-token lock deadlock (poisons whole session) | ✅ **Fixed** — profile load moved out of `onAuthStateChange`; verified: sign-in + 6 rapid tab switches + watch/unwatch writes all run with the lock never sticking |
| P1 | Home stuck on skeletons for empty account | ✅ **Fixed** (was a symptom of the P0; home now loads data / empty state) |
| P1 | "Back" dead on deep-linked screens | ✅ **Fixed** — shared `goBack()` helper rolled out to every pushed screen; verified Back from a deep-linked screen now lands on home |
| P2 | Sign Out dead on web (`Alert.alert`) | ✅ **Fixed** — cross-platform `confirmAction`; now confirms, signs out, and redirects to login. Same fix applied to "Remove Friend" |
| P2 | Stale `useFocusEffect` refreshers | ⬜ Not yet (left as-is) |
| P3 | Loading-state `try/finally`, dead code, deprecation warnings, swipe-button clipping, `app/search.tsx` dead duplicate | ⬜ Not yet (documented below) |

New shared helpers added: `src/lib/navigation.ts` (`goBack`) and `src/lib/confirm.ts` (`confirmAction`).

---

## 🔴 P0 — Supabase auth-token lock deadlocks and poisons the entire session

**This is the headline bug and almost certainly the cause of BOTH "buttons aren't responsive" AND "weird stuck loading states."**

**Where:** `src/providers/AuthProvider.tsx` (root cause) → manifests app-wide.

### What happens
The Supabase JS client serializes access to the auth token with a Web Lock named
`lock:sb-<ref>-auth-token` (via `navigator.locks`). In this app the lock gets **acquired and never
released**, after which **every authenticated Supabase call — reads and writes alike — hangs forever,
never even issuing a network request.** The UI sits on whatever loading/idle state it was in:
spinners spin forever, buttons do nothing.

### Direct evidence captured during the session
- After interacting with the app, `navigator.locks.query()` returned:
  ```json
  { "held": [{ "name": "lock:sb-ztlogtwepxkxjnzrlbfn-auth-token", "mode": "exclusive" }],
    "pending": [] }
  ```
  → the auth-token lock is held exclusively and is never released.
- Onboarding **"Continue"** → `users.update({display_name})` hung on **"Saving…"** with **no `PATCH /users`
  request, no CORS `OPTIONS` preflight, and no `window.fetch` call** (instrumented and verified).
- Title detail **"Mark as Watched"** → `titles.upsert` + `seen_titles.upsert` produced **zero network
  requests** and the button never flipped to "✓ Watched" — reproduced twice, ~12 minutes after auth had
  settled (so it is NOT only a startup-timing fluke).
- Home screen's data hooks were left stuck on skeleton loaders (see "Symptoms" below).
- **Contrast / proof of intermittency:** after a fresh page reload (new lock manager, `held: []`), the
  *same* "Mark as Watched" button worked perfectly — `titles` + `seen_titles` upserts fired (686ms/236ms),
  the button flipped to "✓ Watched", and the lock released cleanly. So the feature code is correct; the
  deadlock is a race, which is why the user sees it as "*sometimes* buttons don't respond."

### Likely trigger (root cause)
`AuthProvider` performs a **data read inside the `onAuthStateChange` callback**:
```ts
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (_event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
  setSession(session);
  if (session?.user) {
    await fetchProfile(session.user.id);   // ← supabase.from('users').select() INSIDE the lock
  } else { setProfile(null); }
});
```
auth-js invokes these callbacks **while holding the auth-token lock**. Awaiting another
token-requiring Supabase call from inside the callback creates a re-entrancy/ordering hazard that, under
the right race (signup → immediate sign-in attempt → token refresh, plus React 19 double-invoke), leaves
the lock-holding promise unresolved. The lock stays held for the life of the page and starves all later
calls. Reloading the page creates a fresh lock manager and temporarily clears it — which is why some
attempts "work" and others don't.

### Suggested fixes (in priority order)
1. **Never `await` Supabase data calls inside `onAuthStateChange`.** Defer out of the lock context:
   ```ts
   supabase.auth.onAuthStateChange((event, session) => {
     setSession(session);
     if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
     // escape the lock before touching the DB
     if (session?.user) setTimeout(() => { fetchProfile(session.user.id); }, 0);
     else setProfile(null);
   });
   ```
   (This is the documented Supabase workaround for exactly this deadlock.)
2. Move profile loading into its own effect keyed on `session?.user?.id` instead of doing it in the
   auth callback at all.
3. Make every data hook resilient with `try { … } finally { setLoading(false); }` so a thrown/cancelled
   call can't strand a spinner (defense in depth — see P1 below).
4. Confirm `@supabase/supabase-js` is current and consider an explicit `auth.lock` strategy; audit for
   any other `supabase.*` calls made synchronously during auth init / inside auth callbacks.

### Symptoms this one bug produces (all observed)
- **Onboarding is unbeatable on a bad-luck load** — new users can get permanently stuck on "Saving…".
- **Home stuck on skeletons** — "Your Crew" / "Recently Watched" show skeleton cards forever; the
  intended *"Welcome to creditz. — Search for a movie or actor to get started"* empty state never appears.
- **"Mark as Watched" does nothing** — the core action of the app silently no-ops.
- Any later authenticated action (friend requests, swipe seen/skip, profile edits) will hang the same way
  once the session is poisoned.

---

## P1 — Loading states have no failure/timeout escape hatch (amplifies the P0)

**Where:** `useStats`, `useTrackedActors`, `useRecentlyWatched`, `useSeenTitles`, `useTitle`, etc.

Every data hook follows `setLoading(true)` → `await supabase…` → `setLoading(false)` with the
`setLoading(false)` only on the happy path (no `try/finally`, no timeout). So any call that throws, is
cancelled, or deadlocks (P0) leaves `loading === true` forever and the UI shows an infinite skeleton with
no error and no retry. Even after the P0 is fixed, this makes the app fragile on flaky networks.

**Fix:** wrap each fetch body in `try/catch/finally`, set `loading=false` in `finally`, surface an error +
"Retry" affordance, and consider a max-time fallback that degrades a stuck skeleton to an empty/error state.

**Related empty-state bug:** `home.tsx:62` gates the whole empty state on stats only —
`const isEmpty = !statsLoading && (stats?.total_watched ?? 0) === 0;` — so if stats loads but actors/titles
are still (or stuck) loading, you get a half-skeleton screen instead of the welcome copy.

---

## P2 — `useFocusEffect` refreshers are stale; returning to a tab never refreshes data

**Where:** `home.tsx:40-47`, `search.tsx:27-31` (same pattern).

```ts
useFocusEffect(useCallback(() => { refreshStats(); refreshActors(); refreshTitles(); refreshActivity(); }, []));
```
The `[]` deps capture the **first render's** refresh closures, which close over `user === null` (auth not
ready yet). Every refresh fn early-returns on `!user`. **Confirmed:** navigating away from Home and back
issued **zero** new network requests — the focus refresh is a no-op. Data only ever loads via each hook's
own mount effect. Add `user` (or the refresh callbacks) to the dependency array.

---

## P1 — "Back" button is dead on deep-linked/refreshed screens (the earlier fix was incomplete)

**Where:** `title/[id].tsx` (verified), plus `friend/[id].tsx`, `contacts-import.tsx`, `profile-picture.tsx`,
`actor-search.tsx`, `privacy-policy.tsx`, `terms-of-service.tsx`, `(auth)/verify.tsx`, `app/search.tsx`,
and a leftover at `actor/[id]/swipe.tsx:83`.

**Observed:** On the title-detail screen reached via refresh/deep-link, tapping **Back does nothing**
(verified with a real Playwright click — URL stays `/title/27205`, no navigation), leaving the user
stranded with no tab bar and no way out except editing the URL.

**Cause:** Commit `c9ef7d6` ("Fix Back button on deep-linked/refreshed screens") correctly diagnosed that
`router.back()` no-ops without in-app history and added a `goBack()` fallback
(`router.canGoBack() ? router.back() : router.replace(...)`) — **but only to `actor/[id]/index.tsx` and
`actor/[id]/swipe.tsx`.** Every other pushed screen still calls raw `router.back()`:
```
src/app/title/[id].tsx:22, 71      ← verified broken
src/app/friend/[id].tsx:104, 122   (+ a programmatic router.back() at :94)
src/app/contacts-import.tsx:83
src/app/profile-picture.tsx:40, 52
src/app/actor-search.tsx:16
src/app/privacy-policy.tsx:11
src/app/terms-of-service.tsx:11
src/app/(auth)/verify.tsx:79
src/app/search.tsx:24
src/app/actor/[id]/swipe.tsx:83    ← leftover: file defines goBack() but this Pressable still uses router.back()
```
**This is higher-impact than it looks for title detail specifically:** commit `72f1a72` added Open Graph
share metadata, so titles are now shareable links — a friend opening a shared title URL and tapping Back is
exactly the stranded case.

**Fix:** Hoist the `goBack()` helper (or a tiny `useGoBack()` hook with a sensible per-screen fallback) and
use it for every Back button + programmatic back in the list above. A shared hook would also prevent the
next screen from regressing.

---

## P2 — Web: `Alert.alert` is used for confirmations/errors but is unreliable on web

**Where:** `(tabs)/index.tsx` (Profile) — `handleSignOut` (`:51`) and `saveDisplayName` error (`:44`);
`(auth)/login.tsx` phone path; `title`/others.

The login + onboarding code already learned this lesson ("`Alert.alert is unreliable on web, so show the
message inline`") but the Profile screen still relies on it:
- **"Sign Out" — VERIFIED dead on web.** Clicking it produced no dialog and no sign-out (session token still
  in `localStorage`, still on the Profile screen). RN-Web's `Alert.alert` with buttons is a no-op, so the
  confirmation never shows and `signOut()` is never called. **There is no way to sign out on web.** (This alone
  is arguably P1 for a web build.)
- Name-edit save errors are surfaced via `Alert.alert`, so a failed save on web shows no feedback.

**Fix:** use an inline confirm/toast (or a small cross-platform modal) instead of `Alert.alert` on web, the
same way login/onboarding already do.

---

## P3 — Smaller issues / cleanups

- **Swipe action buttons clipped on short, wide web viewports:** at ~700×1030 the Seen/Skip/Undo row sits at
  the very bottom and its lower ~24px is below the fold. Fine at true mobile sizes (375×812) — mobile-first, so
  low priority — but on desktop web it looks cut off. Consider reserving space for the controls / capping card height.

- `home.tsx:54-56`: `const topActorProfileUrl = stats?.most_completed_actor_id ? null : null;` — both
  branches are `null`, and the variable is unused. Leftover from an unfinished "top actor hero image" feature.
- `home.tsx:18-32` `AnimatedNumber` wires up a reanimated `withSpring` value but its own comment admits it
  "just displays the target value" — the spring is computed and thrown away. Either animate the displayed
  number or drop the animation machinery.
- Console is noisy with RN-Web deprecation warnings on every screen: `props.pointerEvents is deprecated`
  and `"shadow*" style props are deprecated` (many repeats). Worth migrating to `style.pointerEvents` /
  `boxShadow` to cut the noise and stay ahead of RN-Web removals.

---

## ✅ Verified working (web, on a healthy/non-deadlocked session)
- Email auth auto sign-up/sign-in flow (account created, session established).
- Onboarding form gating (Continue disabled until a name is entered).
- Tab-bar navigation between Home / Search / Friends / Profile (URL + active tab + screen all switch
  correctly — an early "tab looks broken" observation was a stale screenshot frame, not a real bug).
- Search/Discover: TMDB title + actor search, debounced, results, clear (×) button, "No results", Trending row.
- Title detail: poster, overview, cast list with photos + character names; **Mark as Watched works on a fresh
  session** (titles + seen_titles upserts fire, button flips to "✓ Watched").
- Actor detail: hero, star rating, seen/complete pills, completion bar, filmography (with ✓ on seen titles),
  "Start Swiping" (with immediate spinner feedback).
- **Swipe deck: SEEN and SKIP both work** — deck advances, counter updates, SEEN persists the upsert. (These
  were the subject of an earlier fix and are functioning.)
- Friends: empty state, friend-search query executes (no hang).
- Profile: avatar/initial, editable name, live stats, "Most Watched Actor" hero, Recently Watched.
- **Data pipeline works:** after marking 2 titles watched, stats showed 2 watched / 39 actors, and the
  fetch-credits webhook populated tracked actors (DiCaprio surfaced as "Most Watched Actor, 2 films seen").
- "+" center button correctly opens Actor Mode (`/actor-search`).

---

## Recommended fix order
1. **P0 — auth-token lock deadlock** (`AuthProvider` `onAuthStateChange`). Fixes the "unresponsive buttons"
   and most "stuck loading" reports in one shot. Everything else is smaller.
2. **P1 — Sign Out dead on web** (replace `Alert.alert`) and **deep-link Back buttons** (finish the
   `canGoBack()` rollout to title/friend/etc.). Both are quick, high-visibility wins.
3. **P1 — loading-state resilience** (`try/finally` + empty-state decoupling on Home).
4. **P2/P3** — stale `useFocusEffect` refreshers, `Alert.alert` elsewhere, swipe-button clipping on web,
   dead code, deprecation warnings.

## How this was tested
- Headless Chromium (Playwright) driving `expo start --web`; real clicks + DOM/network/`navigator.locks`
  inspection. A throwaway account (`e2e.creditz.tester@gmail.com`) was created through the live signup flow and
  has 2 watched titles in the `credits` Supabase project — delete it whenever convenient.
- **Caveat:** the P0 is a *race*, so a given screen may work on one load and hang on the next. Several findings
  were confirmed by contrasting a poisoned session (everything hangs) against a fresh reload (same action works).
- Launch config added at `.claude/launch.json` (`expo-web` on port 8081) for repeatable runs.
