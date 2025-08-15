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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      allowed_email_domains: {
        Row: {
          domain: string
        }
        Insert: {
          domain: string
        }
        Update: {
          domain?: string
        }
        Relationships: []
      }
      bookmarked_posts: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarked_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookmarked_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletions: {
        Row: {
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "data_deletions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "data_deletions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "data_deletions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      data_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          download_url: string | null
          expires_at: string | null
          export_type: string
          file_size_bytes: number | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          expires_at?: string | null
          export_type?: string
          file_size_bytes?: number | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          download_url?: string | null
          expires_at?: string | null
          export_type?: string
          file_size_bytes?: number | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "data_exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          related_post_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          related_post_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          related_post_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_ratings: {
        Row: {
          created_at: string
          post_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_ratings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "post_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          banner_url: string | null
          category_id: string
          co_authoring_enabled: boolean | null
          comments_enabled: boolean | null
          content: string
          cover_images: Json | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_hero: boolean | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          banner_url?: string | null
          category_id: string
          co_authoring_enabled?: boolean | null
          comments_enabled?: boolean | null
          content: string
          cover_images?: Json | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_hero?: boolean | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          banner_url?: string | null
          category_id?: string
          co_authoring_enabled?: boolean | null
          comments_enabled?: boolean | null
          content?: string
          cover_images?: Json | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_hero?: boolean | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          banner_url: string | null
          bio: string | null
          birth_date: string | null
          cookie_consent: Json | null
          cookie_consent_date: string | null
          created_at: string
          display_name: string
          id: string
          is_banned: boolean | null
          last_login: string | null
          location: string | null
          login_count: number | null
          notification_preferences: Json | null
          preferred_sports: string[] | null
          privacy_settings: Json | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          tfa_enabled: boolean | null
          tfa_secret: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cookie_consent?: Json | null
          cookie_consent_date?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_banned?: boolean | null
          last_login?: string | null
          location?: string | null
          login_count?: number | null
          notification_preferences?: Json | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tfa_enabled?: boolean | null
          tfa_secret?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cookie_consent?: Json | null
          cookie_consent_date?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_banned?: boolean | null
          last_login?: string | null
          location?: string | null
          login_count?: number | null
          notification_preferences?: Json | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tfa_enabled?: boolean | null
          tfa_secret?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          ip_address: unknown | null
          last_seen: string
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          ip_address?: unknown | null
          last_seen?: string
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          ip_address?: unknown | null
          last_seen?: string
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      admin_analytics: {
        Row: {
          pending_reports: number | null
          posts_this_month: number | null
          total_comments: number | null
          total_likes: number | null
          total_published_posts: number | null
          total_users: number | null
          users_last_month: number | null
          users_this_month: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          banner_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          location: string | null
          preferred_sports: string[] | null
          privacy_settings: Json | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          location?: string | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          location?: string | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_email_exists: {
        Args: { email_check: string }
        Returns: boolean
      }
      check_username_exists: {
        Args: { username_check: string }
        Returns: boolean
      }
      get_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          pending_reports: number | null
          posts_this_month: number | null
          total_comments: number | null
          total_likes: number | null
          total_published_posts: number | null
          total_users: number | null
          users_last_month: number | null
          users_this_month: number | null
        }[]
      }
      get_author_stats: {
        Args: { author_uuid: string }
        Returns: {
          comments_received: number
          likes_received: number
          posts_count: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_post_metrics: {
        Args: { post_ids: string[] }
        Returns: {
          comment_count: number
          like_count: number
          post_id: string
        }[]
      }
      get_public_profile_by_user_id: {
        Args: { p_user_id: string }
        Returns: {
          banner_url: string
          bio: string
          birth_date: string
          created_at: string
          display_name: string
          id: string
          location: string
          preferred_sports: string[]
          privacy_settings: Json
          profile_picture_url: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username: string
        }[]
      }
      initialize_admin: {
        Args: {
          admin_display_name?: string
          admin_user_id: string
          admin_username?: string
        }
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_user_editor_or_journalist: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      promote_user_to_journalist: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      safe_purge_user_content: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "registered_user" | "editor" | "administrator" | "journalist"
      notification_type: "like" | "comment" | "mention" | "new_follower"
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
      app_role: ["registered_user", "editor", "administrator", "journalist"],
      notification_type: ["like", "comment", "mention", "new_follower"],
    },
  },
} as const
