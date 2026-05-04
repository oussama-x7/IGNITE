export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      company: {
        Row: {
          id: number
          created_at: string
          name: string | null
          description: string | null
          Logo_Abbreviation: string | null
          Opportunities: string | null
          Accepted_Year_Groups: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name?: string | null
          description?: string | null
          Logo_Abbreviation?: string | null
          Opportunities?: string | null
          Accepted_Year_Groups?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string | null
          description?: string | null
          Logo_Abbreviation?: string | null
          Opportunities?: string | null
          Accepted_Year_Groups?: string | null
        }
        Relationships: []
      }
      talks: {
        Row: {
          id: number
          created_at: string
          talk_tilte: string | null
          speaker_name: string | null
          time: string | null
          location: string | null
          status: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          talk_tilte?: string | null
          speaker_name?: string | null
          time?: string | null
          location?: string | null
          status?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          talk_tilte?: string | null
          speaker_name?: string | null
          time?: string | null
          location?: string | null
          status?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: number
          created_at: string
          name: string | null
          email: string | null
          year_of_study: string | null
          school: string | null
          check_in: number | null
          cv_path: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name?: string | null
          email?: string | null
          year_of_study?: string | null
          school?: string | null
          check_in?: number | null
          cv_path?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string | null
          email?: string | null
          year_of_study?: string | null
          school?: string | null
          check_in?: number | null
          cv_path?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: number
          created_at: string
          person_name: string | null
          feedback: string | null
          category: string | null
          company_name: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          person_name?: string | null
          feedback?: string | null
          category?: string | null
          company_name?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          person_name?: string | null
          feedback?: string | null
          category?: string | null
          company_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
