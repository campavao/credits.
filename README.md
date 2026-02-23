# credits.

A social film tracking app that's **actor-first**. Track movies and TV shows you've watched, automatically build actor profiles, swipe through filmographies, and compare stats with friends. No reviews, no ratings — film literacy, completion, and social comparison.

## Features

- **Search & Watch** — Search TMDB for movies and TV shows, mark them as watched with one tap
- **Actor Tracking** — Automatically track actors from everything you watch (top 20 billed per title)
- **Swipe Mode** — Tinder-style swipe through an actor's filmography: right = seen, left = skip
- **Completion Stats** — See what percentage of an actor's work you've watched
- **Friends** — Add friends, send/accept requests, compare your film habits
- **Film Compatibility** — Overlap score showing how similar your taste is to a friend's
- **Actor Comparison** — Side-by-side completion bars for shared actors
- **Push Notifications** — Get notified when someone sends you a friend request

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Expo (React Native) + TypeScript |
| Navigation | Expo Router (file-based) |
| Gestures | react-native-gesture-handler + react-native-reanimated |
| Backend | Supabase (Auth, Postgres, RLS, Edge Functions) |
| External API | TMDB API |
| Push | Expo Push Notifications |

## Getting Started

### Prerequisites

- Node.js >= 20
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com) project (free tier works)
- A [TMDB API key](https://developer.themoviedb.org/docs/getting-started) (free)

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd credits
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.local` and fill in your credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
   ```

3. **Set up the database**

   Run the migration against your Supabase project:

   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

   This creates all tables, RLS policies, triggers, and RPC functions.

4. **Configure Supabase Auth**

   In your Supabase dashboard:
   - Enable **Email** provider with magic links
   - (Optional) Enable **Google** and **Apple** OAuth providers
   - Add `credits://` to the redirect URLs

5. **Deploy Edge Functions**

   ```bash
   npx supabase functions deploy fetch-credits
   npx supabase functions deploy push
   ```

   Set the TMDB API key as a secret:

   ```bash
   npx supabase secrets set TMDB_API_KEY=your-tmdb-api-key
   ```

   Then create database webhooks in the Supabase dashboard:
   - `seen_titles` INSERT → `fetch-credits` function
   - `friendships` INSERT → `push` function

6. **Start the dev server**

   ```bash
   npx expo start
   ```

   - Press `w` to open in browser
   - Press `a` to open on Android
   - Press `i` to open on iOS (Mac only)

## Project Structure

```
credits/
├── src/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── (auth)/             # Login, verify screens
│   │   ├── (tabs)/             # Home/Search, Friends, Profile
│   │   ├── title/[id].tsx      # Title detail
│   │   ├── actor/[id].tsx      # Actor profile
│   │   ├── actor/[id]/swipe.tsx # Swipe deck
│   │   └── friend/[id].tsx     # Friend comparison
│   ├── components/             # UI components
│   ├── hooks/                  # Data hooks (search, seen, friends, stats)
│   ├── lib/                    # Supabase client, TMDB client, theme, constants
│   ├── providers/              # AuthProvider
│   └── types/                  # TypeScript types (database, TMDB, navigation)
├── supabase/
│   ├── migrations/             # Database schema
│   └── functions/              # Edge Functions (fetch-credits, push)
└── assets/                     # App icons, splash screen
```

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for both platforms
eas build --platform all --profile production
```

## Year 1 Cost

| Item | Cost |
|---|---|
| Supabase | Free tier |
| TMDB API | Free |
| EAS Build | Free tier (15 builds/month/platform) |
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| **Total** | **~$124** |

## License

Private — all rights reserved.

---

Film data provided by [TMDB](https://www.themoviedb.org/).
