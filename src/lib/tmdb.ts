import { TMDB_BASE_URL, POSTER_SIZES, PROFILE_SIZES } from './constants';
import type {
  TMDBSearchResult,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBCredits,
  TMDBPersonDetails,
  TMDBPersonCredits,
  TMDBPersonSearchResult,
} from '../types/tmdb';

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY!;

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<{ results: TMDBSearchResult[]; total_pages: number; total_results: number }>(
    '/search/multi',
    { query, page: String(page), include_adult: 'false' }
  );
}

export async function getMovieDetails(id: number) {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`);
}

export async function getTVDetails(id: number) {
  return tmdbFetch<TMDBTVDetails>(`/tv/${id}`);
}

export async function getTitleCredits(id: number, mediaType: 'movie' | 'tv') {
  return tmdbFetch<TMDBCredits>(`/${mediaType}/${id}/credits`);
}

export async function getPersonDetails(id: number) {
  return tmdbFetch<TMDBPersonDetails>(`/person/${id}`);
}

export async function getPersonCredits(id: number) {
  return tmdbFetch<TMDBPersonCredits>(`/person/${id}/combined_credits`);
}

export async function searchPerson(query: string, page = 1) {
  return tmdbFetch<{ results: TMDBPersonSearchResult[]; total_pages: number; total_results: number }>(
    '/search/person',
    { query, page: String(page), include_adult: 'false' }
  );
}

export function getPosterUrl(path: string | null, size: keyof typeof POSTER_SIZES = 'medium') {
  if (!path) return null;
  return `${POSTER_SIZES[size]}${path}`;
}

export function getProfileUrl(path: string | null, size: keyof typeof PROFILE_SIZES = 'medium') {
  if (!path) return null;
  return `${PROFILE_SIZES[size]}${path}`;
}
