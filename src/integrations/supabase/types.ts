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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
        }
        Relationships: []
      }
      logistics_settings: {
        Row: {
          eligible_categories: string[] | null
          fixed_delivery_fee: number | null
          id: string
          intermediate_rate: number | null
          local_rate: number | null
          long_distance_rate: number | null
          max_delivery_fee: number
          min_delivery_fee: number | null
          price_per_km: number | null
          updated_at: string | null
        }
        Insert: {
          eligible_categories?: string[] | null
          fixed_delivery_fee?: number | null
          id?: string
          intermediate_rate?: number | null
          local_rate?: number | null
          long_distance_rate?: number | null
          max_delivery_fee?: number
          min_delivery_fee?: number | null
          price_per_km?: number | null
          updated_at?: string | null
        }
        Update: {
          eligible_categories?: string[] | null
          fixed_delivery_fee?: number | null
          id?: string
          intermediate_rate?: number | null
          local_rate?: number | null
          long_distance_rate?: number | null
          max_delivery_fee?: number
          min_delivery_fee?: number | null
          price_per_km?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          card_message: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_type: string | null
          id: string
          items: string | null
          mercadopago_preference_id: string | null
          payment_method: string | null
          recipient_name: string | null
          status: string | null
          total_price: number | null
          wreath_details: string | null
        }
        Insert: {
          address?: string | null
          card_message?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_type?: string | null
          id?: string
          items?: string | null
          mercadopago_preference_id?: string | null
          payment_method?: string | null
          recipient_name?: string | null
          status?: string | null
          total_price?: number | null
          wreath_details?: string | null
        }
        Update: {
          address?: string | null
          card_message?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_type?: string | null
          id?: string
          items?: string | null
          mercadopago_preference_id?: string | null
          payment_method?: string | null
          recipient_name?: string | null
          status?: string | null
          total_price?: number | null
          wreath_details?: string | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          criado_em: string | null
          detalhes_coroa: string | null
          endereco_entrega: string | null
          id: string
          itens_pedido: string | null
          mensagem_cartao: string | null
          mercadopago_preference_id: string | null
          metodo_pagamento: string | null
          nome_cliente: string | null
          nome_destinatario: string | null
          numero_endereco: string | null
          preco_total: number | null
          status: string | null
          tipo_entrega: string | null
          valor_frete: number | null
          whatsapp_cliente: string | null
        }
        Insert: {
          criado_em?: string | null
          detalhes_coroa?: string | null
          endereco_entrega?: string | null
          id?: string
          itens_pedido?: string | null
          mensagem_cartao?: string | null
          mercadopago_preference_id?: string | null
          metodo_pagamento?: string | null
          nome_cliente?: string | null
          nome_destinatario?: string | null
          numero_endereco?: string | null
          preco_total?: number | null
          status?: string | null
          tipo_entrega?: string | null
          valor_frete?: number | null
          whatsapp_cliente?: string | null
        }
        Update: {
          criado_em?: string | null
          detalhes_coroa?: string | null
          endereco_entrega?: string | null
          id?: string
          itens_pedido?: string | null
          mensagem_cartao?: string | null
          mercadopago_preference_id?: string | null
          metodo_pagamento?: string | null
          nome_cliente?: string | null
          nome_destinatario?: string | null
          numero_endereco?: string | null
          preco_total?: number | null
          status?: string | null
          tipo_entrega?: string | null
          valor_frete?: number | null
          whatsapp_cliente?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          price: number
          sold_out: boolean
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          price?: number
          sold_out?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          price?: number
          sold_out?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          product_id: string | null
          product_title: string
          quantity: number
          sale_date: string
          sale_price: number
        }
        Insert: {
          cost_price?: number
          created_at?: string
          id?: string
          product_id?: string | null
          product_title: string
          quantity?: number
          sale_date?: string
          sale_price?: number
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          product_id?: string | null
          product_title?: string
          quantity?: number
          sale_date?: string
          sale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          store_is_open: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          store_is_open?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          store_is_open?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
    Enums: {},
  },
} as const
