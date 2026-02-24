export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      titles: {
        Row: {
          id: number;
          media_type: string;
          title: string;
          poster_path: string | null;
          release_year: number | null;
          credits_fetched_at: string | null;
          cached_at: string;
        };
        Insert: {
          id: number;
          media_type: string;
          title: string;
          poster_path?: string | null;
          release_year?: number | null;
          credits_fetched_at?: string | null;
          cached_at?: string;
        };
        Update: {
          id?: number;
          media_type?: string;
          title?: string;
          poster_path?: string | null;
          release_year?: number | null;
          credits_fetched_at?: string | null;
          cached_at?: string;
        };
        Relationships: [];
      };
      actors: {
        Row: {
          id: number;
          name: string;
          profile_path: string | null;
          cached_at: string;
        };
        Insert: {
          id: number;
          name: string;
          profile_path?: string | null;
          cached_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          profile_path?: string | null;
          cached_at?: string;
        };
        Relationships: [];
      };
      appearances: {
        Row: {
          actor_id: number;
          title_id: number;
          character: string | null;
          billing_order: number | null;
        };
        Insert: {
          actor_id: number;
          title_id: number;
          character?: string | null;
          billing_order?: number | null;
        };
        Update: {
          actor_id?: number;
          title_id?: number;
          character?: string | null;
          billing_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "appearances_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "actors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appearances_title_id_fkey";
            columns: ["title_id"];
            referencedRelation: "titles";
            referencedColumns: ["id"];
          }
        ];
      };
      seen_titles: {
        Row: {
          user_id: string;
          title_id: number;
          watched_at: string;
        };
        Insert: {
          user_id: string;
          title_id: number;
          watched_at?: string;
        };
        Update: {
          user_id?: string;
          title_id?: number;
          watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seen_titles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seen_titles_title_id_fkey";
            columns: ["title_id"];
            referencedRelation: "titles";
            referencedColumns: ["id"];
          }
        ];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_overlap_score: {
        Args: { user_a: string; user_b: string };
        Returns: { shared_count: number; total_unique: number; score: number }[];
      };
      get_actor_comparison: {
        Args: { actor_id_input: number; user_a: string; user_b: string };
        Returns: {
          total_titles: number;
          user_a_seen: number;
          user_b_seen: number;
        }[];
      };
      get_user_stats: {
        Args: { user_id_input: string };
        Returns: {
          total_watched: number;
          unique_actors: number;
          most_completed_actor_id: number | null;
          most_completed_actor_name: string | null;
          most_completed_pct: number;
          friends_count: number;
        }[];
      };
      find_users_by_phone: {
        Args: { phone_numbers: string[] };
        Returns: {
          id: string;
          display_name: string | null;
          username: string | null;
          avatar_url: string | null;
          phone: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Title = Database['public']['Tables']['titles']['Row'];
export type Actor = Database['public']['Tables']['actors']['Row'];
export type Appearance = Database['public']['Tables']['appearances']['Row'];
export type SeenTitle = Database['public']['Tables']['seen_titles']['Row'];
export type Friendship = Database['public']['Tables']['friendships']['Row'];
