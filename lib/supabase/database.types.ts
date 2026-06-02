/**
 * Minimal Database types for Supabase client inference.
 * Regenerate with `supabase gen types` after schema changes.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          presenter: string;
          total_days: number;
          current_day: number;
          status: string;
          started_at: string | null;
          student_count: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      day_meta: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          topic: string;
          date: string;
        };
        Insert: Database["public"]["Tables"]["day_meta"]["Row"];
        Update: Partial<Database["public"]["Tables"]["day_meta"]["Row"]>;
      };
      day_display: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          mode: string;
          payload: Json;
          quote_text: string;
          question_id: string | null;
          question_text: string | null;
          question_votes: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["day_display"]["Row"]> & {
          event_id: string;
          day: number;
        };
        Update: Partial<Database["public"]["Tables"]["day_display"]["Row"]>;
      };
      day_slides: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          current: number;
          total: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["day_slides"]["Row"]> & {
          event_id: string;
          day: number;
        };
        Update: Partial<Database["public"]["Tables"]["day_slides"]["Row"]>;
      };
      day_reactions: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          fire: number;
          clap: number;
          think: number;
          question: number;
        };
        Insert: Partial<
          Database["public"]["Tables"]["day_reactions"]["Row"]
        > & { event_id: string; day: number };
        Update: Partial<Database["public"]["Tables"]["day_reactions"]["Row"]>;
      };
      day_subtitles: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          lines: Json;
          full_transcript: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["day_subtitles"]["Row"]
        > & { event_id: string; day: number };
        Update: Partial<Database["public"]["Tables"]["day_subtitles"]["Row"]>;
      };
      day_wordcloud: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          words: Json;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["day_wordcloud"]["Row"]> & {
          event_id: string;
          day: number;
        };
        Update: Partial<Database["public"]["Tables"]["day_wordcloud"]["Row"]>;
      };
      questions: {
        Relationships: [];
        Row: {
          id: string;
          event_id: string;
          day: number;
          text: string;
          votes: number;
          status: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          day: number;
          text: string;
          votes?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
      };
      question_votes: {
        Relationships: [];
        Row: {
          question_id: string;
          voter_id: string;
          created_at: string;
        };
        Insert: {
          question_id: string;
          voter_id: string;
        };
        Update: never;
      };
      note_cards: {
        Relationships: [];
        Row: {
          id: string;
          event_id: string;
          day: number;
          type: string;
          content: Json;
          created_at: string;
        };
        Insert: {
          event_id: string;
          day: number;
          type: string;
          content?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["note_cards"]["Row"]>;
      };
      session_segments: {
        Relationships: [];
        Row: {
          id: string;
          event_id: string;
          day: number;
          title: string;
          start_time: string;
          note_ids: Json;
          sort_order: number;
        };
        Insert: {
          event_id: string;
          day: number;
          title: string;
          start_time?: string;
          note_ids?: Json;
          sort_order?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["session_segments"]["Row"]
        >;
      };
      day_archives: {
        Relationships: [];
        Row: {
          event_id: string;
          day: number;
          archived_at: string;
          snapshot: Json;
        };
        Insert: {
          event_id: string;
          day: number;
          snapshot: Json;
          archived_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
