export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      experiencias: {
        Row: {
          cargo: string
          created_at: string
          descricao: string | null
          empresa: string
          id: string
          ordem: number
          periodo: string | null
        }
        Insert: {
          cargo: string
          created_at?: string
          descricao?: string | null
          empresa: string
          id?: string
          ordem?: number
          periodo?: string | null
        }
        Update: {
          cargo?: string
          created_at?: string
          descricao?: string | null
          empresa?: string
          id?: string
          ordem?: number
          periodo?: string | null
        }
        Relationships: []
      }
      formacoes: {
        Row: {
          anexos: Json
          created_at: string
          data_conclusao: string | null
          descricao: string | null
          id: string
          instituicao: string
          ordem: number
          periodo: string | null
          titulo: string
        }
        Insert: {
          anexos?: Json
          created_at?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          instituicao: string
          ordem?: number
          periodo?: string | null
          titulo: string
        }
        Update: {
          anexos?: Json
          created_at?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          instituicao?: string
          ordem?: number
          periodo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          categoria: string | null
          cliente: string | null
          conteudo: string | null
          cover_url: string | null
          created_at: string
          descricao_curta: string | null
          galeria: Json
          id: string
          ordem: number
          papel: string | null
          periodo: string | null
          publicado: boolean
          slug: string
          subtitulo: string | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          categoria?: string | null
          cliente?: string | null
          conteudo?: string | null
          cover_url?: string | null
          created_at?: string
          descricao_curta?: string | null
          galeria?: Json
          id?: string
          ordem?: number
          papel?: string | null
          periodo?: string | null
          publicado?: boolean
          slug: string
          subtitulo?: string | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          categoria?: string | null
          cliente?: string | null
          conteudo?: string | null
          cover_url?: string | null
          created_at?: string
          descricao_curta?: string | null
          galeria?: Json
          id?: string
          ordem?: number
          papel?: string | null
          periodo?: string | null
          publicado?: boolean
          slug?: string
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_text: string
          contact_intro: string
          email: string | null
          hero_image_url: string | null
          hero_intro: string
          hero_name: string
          hero_subtitle: string
          id: string
          marquee_palavras: Json
          social_behance: string | null
          social_instagram: string | null
          social_linkedin: string | null
          updated_at: string
          whatsapp_display: string
          whatsapp_number: string
        }
        Insert: {
          about_text?: string
          contact_intro?: string
          email?: string | null
          hero_image_url?: string | null
          hero_intro?: string
          hero_name?: string
          hero_subtitle?: string
          id?: string
          marquee_palavras?: Json
          social_behance?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          updated_at?: string
          whatsapp_display?: string
          whatsapp_number?: string
        }
        Update: {
          about_text?: string
          contact_intro?: string
          email?: string | null
          hero_image_url?: string | null
          hero_intro?: string
          hero_name?: string
          hero_subtitle?: string
          id?: string
          marquee_palavras?: Json
          social_behance?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          updated_at?: string
          whatsapp_display?: string
          whatsapp_number?: string
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
      voluntariados: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          organizacao: string
          periodo: string | null
          titulo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          organizacao: string
          periodo?: string | null
          titulo: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          organizacao?: string
          periodo?: string | null
          titulo?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
