export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const POSTER_SIZES = {
  small: `${TMDB_IMAGE_BASE}/w185`,
  medium: `${TMDB_IMAGE_BASE}/w342`,
  large: `${TMDB_IMAGE_BASE}/w500`,
  original: `${TMDB_IMAGE_BASE}/original`,
} as const;

export const PROFILE_SIZES = {
  small: `${TMDB_IMAGE_BASE}/w185`,
  medium: `${TMDB_IMAGE_BASE}/h632`,
  original: `${TMDB_IMAGE_BASE}/original`,
} as const;

export const MAX_CAST_DEPTH = 20;

export const SWIPE_THRESHOLD = 0.4; // 40% of screen width to commit

export const SEARCH_DEBOUNCE_MS = 400;
