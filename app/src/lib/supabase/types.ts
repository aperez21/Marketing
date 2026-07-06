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
      attributions: {
        Row: {
          attribution_method: string
          campaign_id: string
          conversion_type: string
          converted_at: string
          external_user_id: string | null
          id: string
          placement_id: string | null
          promo_code_used: string | null
          revenue_usd: number | null
          tenant_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          attribution_method: string
          campaign_id: string
          conversion_type: string
          converted_at: string
          external_user_id?: string | null
          id?: string
          placement_id?: string | null
          promo_code_used?: string | null
          revenue_usd?: number | null
          tenant_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          attribution_method?: string
          campaign_id?: string
          conversion_type?: string
          converted_at?: string
          external_user_id?: string | null
          id?: string
          placement_id?: string | null
          promo_code_used?: string | null
          revenue_usd?: number | null
          tenant_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attributions_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attributions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_goals: {
        Row: {
          campaign_id: string
          id: string
          metric: string
          priority: string
          target_value: number
        }
        Insert: {
          campaign_id: string
          id?: string
          metric: string
          priority?: string
          target_value: number
        }
        Update: {
          campaign_id?: string
          id?: string
          metric?: string
          priority?: string
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_goals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_goals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          primary_goal: string
          start_date: string | null
          status: string
          tenant_id: string
          total_budget_usd: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          primary_goal: string
          start_date?: string | null
          status?: string
          tenant_id: string
          total_budget_usd?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          primary_goal?: string
          start_date?: string | null
          status?: string
          tenant_id?: string
          total_budget_usd?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          id: string
          name: string
          platform: string | null
          type: string
        }
        Insert: {
          id?: string
          name: string
          platform?: string | null
          type: string
        }
        Update: {
          id?: string
          name?: string
          platform?: string | null
          type?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          audience_size: number | null
          avg_engagement_rate: number | null
          contact_email: string | null
          created_at: string | null
          handle: string | null
          id: string
          location: string | null
          name: string
          niche: string[] | null
          notes: string | null
          platform: string | null
          profile_url: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          audience_size?: number | null
          avg_engagement_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          location?: string | null
          name: string
          niche?: string[] | null
          notes?: string | null
          platform?: string | null
          profile_url?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          audience_size?: number | null
          avg_engagement_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          handle?: string | null
          id?: string
          location?: string | null
          name?: string
          niche?: string[] | null
          notes?: string | null
          platform?: string | null
          profile_url?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_snapshots: {
        Row: {
          captured_at: string
          clicks: number | null
          comments: number | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          link_clicks: number | null
          placement_id: string
          reach: number | null
          saves: number | null
          shares: number | null
          source: string
          views: number | null
        }
        Insert: {
          captured_at?: string
          clicks?: number | null
          comments?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          link_clicks?: number | null
          placement_id: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          source?: string
          views?: number | null
        }
        Update: {
          captured_at?: string
          clicks?: number | null
          comments?: number | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          link_clicks?: number | null
          placement_id?: string
          reach?: number | null
          saves?: number | null
          shares?: number | null
          source?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_snapshots_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          budget_allocated_usd: number | null
          campaign_id: string
          channel_id: string | null
          content_notes: string | null
          content_url: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          name: string
          partner_id: string | null
          placement_type: string
          promo_code: string | null
          scheduled_at: string | null
          spend_actual_usd: number | null
          status: string
          tracking_url: string | null
          updated_at: string | null
          went_live_at: string | null
        }
        Insert: {
          budget_allocated_usd?: number | null
          campaign_id: string
          channel_id?: string | null
          content_notes?: string | null
          content_url?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          name: string
          partner_id?: string | null
          placement_type: string
          promo_code?: string | null
          scheduled_at?: string | null
          spend_actual_usd?: number | null
          status?: string
          tracking_url?: string | null
          updated_at?: string | null
          went_live_at?: string | null
        }
        Update: {
          budget_allocated_usd?: number | null
          campaign_id?: string
          channel_id?: string | null
          content_notes?: string | null
          content_url?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          name?: string
          partner_id?: string | null
          placement_type?: string
          promo_code?: string | null
          scheduled_at?: string | null
          spend_actual_usd?: number | null
          status?: string
          tracking_url?: string | null
          updated_at?: string | null
          went_live_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      spend_records: {
        Row: {
          amount_usd: number
          campaign_id: string
          id: string
          invoice_ref: string | null
          notes: string | null
          paid_at: string
          placement_id: string | null
          spend_type: string
          tenant_id: string
        }
        Insert: {
          amount_usd: number
          campaign_id: string
          id?: string
          invoice_ref?: string | null
          notes?: string | null
          paid_at: string
          placement_id?: string | null
          spend_type: string
          tenant_id: string
        }
        Update: {
          amount_usd?: number
          campaign_id?: string
          id?: string
          invoice_ref?: string | null
          notes?: string | null
          paid_at?: string
          placement_id?: string | null
          spend_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spend_records_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spend_records_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spend_records_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spend_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          name: string
          revoked_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          name?: string
          revoked_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          name?: string
          revoked_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string | null
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_performance: {
        Row: {
          budget_remaining: number | null
          cac: number | null
          cpa: number | null
          cpc: number | null
          cpe: number | null
          cpm: number | null
          ctr: number | null
          id: string | null
          leads: number | null
          name: string | null
          primary_goal: string | null
          purchases: number | null
          revenue_attributed: number | null
          roas: number | null
          signups: number | null
          status: string | null
          tenant_id: string | null
          total_budget_usd: number | null
          total_clicks: number | null
          total_engagements: number | null
          total_impressions: number | null
          total_reach: number | null
          total_spend: number | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
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
