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
      achievements: {
        Row: {
          achieved_date: string | null
          created_at: string
          id: string
          name: string
          type: string | null
          user_id: string
        }
        Insert: {
          achieved_date?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
          user_id: string
        }
        Update: {
          achieved_date?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          color: string | null
          commander_id: string | null
          created_at: string
          description: string | null
          founded_date: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["company_status"] | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          commander_id?: string | null
          created_at?: string
          description?: string | null
          founded_date?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          commander_id?: string | null
          created_at?: string
          description?: string | null
          founded_date?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["company_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          joined_date: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          joined_date?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          joined_date?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          author_id: string
          body: string | null
          channel: string
          created_at: string
          id: string
          interactions: number | null
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          body?: string | null
          channel: string
          created_at?: string
          id?: string
          interactions?: number | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          interactions?: number | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image_url: string | null
          instructor: string | null
          level: Database["public"]["Enums"]["course_level"] | null
          modules: number | null
          price: number | null
          rating: number | null
          status: Database["public"]["Enums"]["course_status"] | null
          students: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          level?: Database["public"]["Enums"]["course_level"] | null
          modules?: number | null
          price?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["course_status"] | null
          students?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          level?: Database["public"]["Enums"]["course_level"] | null
          modules?: number | null
          price?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["course_status"] | null
          students?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          event_id: string | null
          id: string
          status: Database["public"]["Enums"]["enrollment_status"] | null
          training_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          training_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          training_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          event_date: string
          id: string
          location: string
          max_participants: number | null
          name: string
          registered_participants: number | null
          status: Database["public"]["Enums"]["event_status"] | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          event_date: string
          id?: string
          location: string
          max_participants?: number | null
          name: string
          registered_participants?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          event_date?: string
          id?: string
          location?: string
          max_participants?: number | null
          name?: string
          registered_participants?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          joined_at: string | null
          name: string
          phone: string | null
          rank: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string | null
          name: string
          phone?: string | null
          rank?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          phone?: string | null
          rank?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          id: string
          location: string | null
          max_participants: number | null
          name: string
          next_session: string | null
          requirements: string[] | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name: string
          next_session?: string | null
          requirements?: string[] | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name?: string
          next_session?: string | null
          requirements?: string[] | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_date: string | null
          created_at: string
          description: string | null
          id: string
          points: number | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      company_status: "Ativa" | "Reorganização" | "Planejamento" | "Inativa"
      content_status: "published" | "draft" | "archived"
      content_type: "announcement" | "training" | "event" | "resource"
      course_level: "Básico" | "Intermediário" | "Avançado"
      course_status: "available" | "coming-soon" | "discontinued"
      enrollment_status: "pending" | "approved" | "completed" | "cancelled"
      event_status: "planning" | "active" | "completed" | "cancelled"
      event_type: "rally" | "camp" | "training" | "meeting"
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
      app_role: ["admin", "moderator", "user"],
      company_status: ["Ativa", "Reorganização", "Planejamento", "Inativa"],
      content_status: ["published", "draft", "archived"],
      content_type: ["announcement", "training", "event", "resource"],
      course_level: ["Básico", "Intermediário", "Avançado"],
      course_status: ["available", "coming-soon", "discontinued"],
      enrollment_status: ["pending", "approved", "completed", "cancelled"],
      event_status: ["planning", "active", "completed", "cancelled"],
      event_type: ["rally", "camp", "training", "meeting"],
    },
  },
} as const
