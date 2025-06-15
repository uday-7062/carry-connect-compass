export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      delivery_confirmations: {
        Row: {
          confirmed_by_sender: boolean | null
          confirmed_by_traveler: boolean | null
          created_at: string
          id: string
          payment_id: string | null
          sender_confirmed_at: string | null
          traveler_confirmed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed_by_sender?: boolean | null
          confirmed_by_traveler?: boolean | null
          created_at?: string
          id?: string
          payment_id?: string | null
          sender_confirmed_at?: string | null
          traveler_confirmed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed_by_sender?: boolean | null
          confirmed_by_traveler?: boolean | null
          created_at?: string
          id?: string
          payment_id?: string | null
          sender_confirmed_at?: string | null
          traveler_confirmed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_confirmations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          available_space_kg: number | null
          created_at: string | null
          description: string | null
          destination: string
          dimensions: string | null
          id: string
          is_active: boolean | null
          origin: string
          price_usd: number
          title: string
          travel_date: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          available_space_kg?: number | null
          created_at?: string | null
          description?: string | null
          destination: string
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          origin: string
          price_usd: number
          title: string
          travel_date: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          available_space_kg?: number | null
          created_at?: string | null
          description?: string | null
          destination?: string
          dimensions?: string | null
          id?: string
          is_active?: boolean | null
          origin?: string
          price_usd?: number
          title?: string
          travel_date?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          price_agreed: number | null
          sender_id: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          traveler_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          price_agreed?: number | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          traveler_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          price_agreed?: number | null
          sender_id?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          traveler_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          match_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          match_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          listing_id: string | null
          platform_fee_usd: number
          sender_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          traveler_amount_usd: number
          traveler_id: string | null
          updated_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          listing_id?: string | null
          platform_fee_usd: number
          sender_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          traveler_amount_usd: number
          traveler_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          listing_id?: string | null
          platform_fee_usd?: number
          sender_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          traveler_amount_usd?: number
          traveler_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          address_proof_url: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          id_document_url: string | null
          id_verified: Database["public"]["Enums"]["verification_status"] | null
          onboarding_completed: boolean | null
          phone: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"]
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_proof_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          id_document_url?: string | null
          id_verified?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          onboarding_completed?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_proof_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          id_document_url?: string | null
          id_verified?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          onboarding_completed?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          match_id: string | null
          rated_id: string | null
          rater_id: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id?: string | null
          rated_id?: string | null
          rater_id?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          match_id?: string | null
          rated_id?: string | null
          rater_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      listing_type: "space_available" | "delivery_request"
      match_status: "pending" | "accepted" | "completed" | "cancelled"
      user_role: "traveler" | "sender"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      listing_type: ["space_available", "delivery_request"],
      match_status: ["pending", "accepted", "completed", "cancelled"],
      user_role: ["traveler", "sender"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
