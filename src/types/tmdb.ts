export interface TMDBSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string; // movie
  name?: string; // tv / person
  poster_path: string | null;
  profile_path?: string | null; // person
  release_date?: string; // movie
  first_air_date?: string; // tv
  overview?: string;
  vote_average?: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  overview: string;
  number_of_seasons: number;
  genres: { id: number; name: string }[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
}

export interface TMDBPersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

export interface TMDBPersonCreditEntry {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  character: string;
  vote_count?: number;
}

export interface TMDBPersonCredits {
  id: number;
  cast: TMDBPersonCreditEntry[];
}
