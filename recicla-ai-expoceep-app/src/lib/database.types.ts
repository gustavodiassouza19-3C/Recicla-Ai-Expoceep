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
      conquistas: {
        Row: {
          ativa: boolean | null
          categoria: string
          codigo: string
          condicao_tipo: string
          condicao_valor: number
          criado_em: string | null
          descricao: string
          icone: string
          id: number
          nome: string
          pontos: number
        }
        Insert: {
          ativa?: boolean | null
          categoria: string
          codigo: string
          condicao_tipo: string
          condicao_valor: number
          criado_em?: string | null
          descricao: string
          icone: string
          id?: number
          nome: string
          pontos?: number
        }
        Update: {
          ativa?: boolean | null
          categoria?: string
          codigo?: string
          condicao_tipo?: string
          condicao_valor?: number
          criado_em?: string | null
          descricao?: string
          icone?: string
          id?: number
          nome?: string
          pontos?: number
        }
        Relationships: []
      }
      eco_pontos: {
        Row: {
          criado_em: string | null
          endereco: string
          id: number
          lat: number
          lng: number
          nome: string
          status: string | null
        }
        Insert: {
          criado_em?: string | null
          endereco: string
          id?: number
          lat: number
          lng: number
          nome: string
          status?: string | null
        }
        Update: {
          criado_em?: string | null
          endereco?: string
          id?: number
          lat?: number
          lng?: number
          nome?: string
          status?: string | null
        }
        Relationships: []
      }
      reciclagens: {
        Row: {
          data_confirmacao: string | null
          data_entrega: string
          funcionario_id: number | null
          id: number
          status: string
          tag_id: number
          usuario_id: number
        }
        Insert: {
          data_confirmacao?: string | null
          data_entrega?: string
          funcionario_id?: number | null
          id?: never
          status?: string
          tag_id: number
          usuario_id: number
        }
        Update: {
          data_confirmacao?: string | null
          data_entrega?: string
          funcionario_id?: number | null
          id?: never
          status?: string
          tag_id?: number
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_funcionario"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_usuario"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas: {
        Row: {
          data_liberacao: string | null
          id: number
          reciclagem_id: number
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          data_liberacao?: string | null
          id?: never
          reciclagem_id: number
          status?: string
          tipo: string
          valor: number
        }
        Update: {
          data_liberacao?: string | null
          id?: never
          reciclagem_id?: number
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_reciclagem"
            columns: ["reciclagem_id"]
            isOneToOne: true
            referencedRelation: "reciclagens"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          codigo_nfc: string
          id: number
          status: string
        }
        Insert: {
          codigo_nfc: string
          id?: never
          status?: string
        }
        Update: {
          codigo_nfc?: string
          id?: never
          status?: string
        }
        Relationships: []
      }
      usuario_conquistas: {
        Row: {
          concedida_em: string | null
          conquista_codigo: string
          conquista_id: number
          id: number
          pontos_ganhos: number
          usuario_id: number
        }
        Insert: {
          concedida_em?: string | null
          conquista_codigo: string
          conquista_id: number
          id?: number
          pontos_ganhos?: number
          usuario_id: number
        }
        Update: {
          concedida_em?: string | null
          conquista_codigo?: string
          conquista_id?: number
          id?: number
          pontos_ganhos?: number
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "usuario_conquistas_conquista_id_fkey"
            columns: ["conquista_id"]
            isOneToOne: false
            referencedRelation: "conquistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_conquistas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          cpf: string
          criado_em: string | null
          email: string
          id: number
          nome: string
          pontos: number
          senha: string
          tipo: string
        }
        Insert: {
          cpf: string
          criado_em?: string | null
          email: string
          id?: never
          nome: string
          pontos?: number
          senha: string
          tipo?: string
        }
        Update: {
          cpf?: string
          criado_em?: string | null
          email?: string
          id?: never
          nome?: string
          pontos?: number
          senha?: string
          tipo?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
