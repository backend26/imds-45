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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
            foreignKeyName: "data_deletions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      login_sessions: {
        Row: {
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          is_new_location: boolean | null
          is_suspicious: boolean | null
          location_data: Json | null
          logged_in_at: string | null
          logged_out_at: string | null
          login_method: string | null
          session_duration: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_new_location?: boolean | null
          is_suspicious?: boolean | null
          location_data?: Json | null
          logged_in_at?: string | null
          logged_out_at?: string | null
          login_method?: string | null
          session_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          is_new_location?: boolean | null
          is_suspicious?: boolean | null
          location_data?: Json | null
          logged_in_at?: string | null
          logged_out_at?: string | null
          login_method?: string | null
          session_duration?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          badges_earned: boolean | null
          comments_on_posts: boolean | null
          content_moderation: boolean | null
          created_at: string | null
          email_digest_frequency: string | null
          email_enabled: boolean | null
          enabled: boolean | null
          event_reminders: boolean | null
          favorite_team_updates: boolean | null
          featured_posts: boolean | null
          likes_on_comments: boolean | null
          likes_on_posts: boolean | null
          live_events: boolean | null
          mentions: boolean | null
          new_followers: boolean | null
          posts_by_sport: Json | null
          posts_from_all_authors: boolean | null
          posts_from_followed_authors: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          rating_milestones: boolean | null
          replies_to_comments: boolean | null
          score_updates: boolean | null
          system_announcements: boolean | null
          trending_posts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges_earned?: boolean | null
          comments_on_posts?: boolean | null
          content_moderation?: boolean | null
          created_at?: string | null
          email_digest_frequency?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          event_reminders?: boolean | null
          favorite_team_updates?: boolean | null
          featured_posts?: boolean | null
          likes_on_comments?: boolean | null
          likes_on_posts?: boolean | null
          live_events?: boolean | null
          mentions?: boolean | null
          new_followers?: boolean | null
          posts_by_sport?: Json | null
          posts_from_all_authors?: boolean | null
          posts_from_followed_authors?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          rating_milestones?: boolean | null
          replies_to_comments?: boolean | null
          score_updates?: boolean | null
          system_announcements?: boolean | null
          trending_posts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges_earned?: boolean | null
          comments_on_posts?: boolean | null
          content_moderation?: boolean | null
          created_at?: string | null
          email_digest_frequency?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          event_reminders?: boolean | null
          favorite_team_updates?: boolean | null
          featured_posts?: boolean | null
          likes_on_comments?: boolean | null
          likes_on_posts?: boolean | null
          live_events?: boolean | null
          mentions?: boolean | null
          new_followers?: boolean | null
          posts_by_sport?: Json | null
          posts_from_all_authors?: boolean | null
          posts_from_followed_authors?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          rating_milestones?: boolean | null
          replies_to_comments?: boolean | null
          score_updates?: boolean | null
          system_announcements?: boolean | null
          trending_posts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "post_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          avatar_updated_at: string | null
          banner_updated_at: string | null
          banner_url: string | null
          bio: string | null
          birth_date: string | null
          cookie_consent: Json | null
          cookie_consent_date: string | null
          created_at: string
          display_name: string
          favorite_team: string | null
          favorite_teams: Json | null
          id: string
          is_banned: boolean | null
          last_login: string | null
          last_username_change: string | null
          location: string | null
          login_count: number | null
          notification_preferences: Json | null
          preferred_sports: string[] | null
          privacy_settings: Json | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          social_links: Json
          tfa_enabled: boolean | null
          tfa_secret: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          avatar_updated_at?: string | null
          banner_updated_at?: string | null
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cookie_consent?: Json | null
          cookie_consent_date?: string | null
          created_at?: string
          display_name: string
          favorite_team?: string | null
          favorite_teams?: Json | null
          id?: string
          is_banned?: boolean | null
          last_login?: string | null
          last_username_change?: string | null
          location?: string | null
          login_count?: number | null
          notification_preferences?: Json | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          social_links?: Json
          tfa_enabled?: boolean | null
          tfa_secret?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          avatar_updated_at?: string | null
          banner_updated_at?: string | null
          banner_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cookie_consent?: Json | null
          cookie_consent_date?: string | null
          created_at?: string
          display_name?: string
          favorite_team?: string | null
          favorite_teams?: Json | null
          id?: string
          is_banned?: boolean | null
          last_login?: string | null
          last_username_change?: string | null
          location?: string | null
          login_count?: number | null
          notification_preferences?: Json | null
          preferred_sports?: string[] | null
          privacy_settings?: Json | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          social_links?: Json
          tfa_enabled?: boolean | null
          tfa_secret?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sports_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_datetime: string | null
          event_type: string
          external_id: string | null
          id: string
          live_score: Json | null
          location: string | null
          priority: number | null
          sport_category: string
          start_datetime: string
          status: string | null
          streaming_url: string | null
          teams: Json | null
          ticket_url: string | null
          timezone: string | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          live_score?: Json | null
          location?: string | null
          priority?: number | null
          sport_category: string
          start_datetime: string
          status?: string | null
          streaming_url?: string | null
          teams?: Json | null
          ticket_url?: string | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          live_score?: Json | null
          location?: string | null
          priority?: number | null
          sport_category?: string
          start_datetime?: string
          status?: string | null
          streaming_url?: string | null
          teams?: Json | null
          ticket_url?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trending_topics: {
        Row: {
          created_at: string | null
          id: string
          mention_count: number | null
          period: string | null
          score: number | null
          sport_category: string | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mention_count?: number | null
          period?: string | null
          score?: number | null
          sport_category?: string | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mention_count?: number | null
          period?: string | null
          score?: number | null
          sport_category?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          display_settings: Json | null
          id: string
          notification_settings: Json | null
          privacy_settings: Json | null
          reading_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_settings?: Json | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          reading_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_settings?: Json | null
          id?: string
          notification_settings?: Json | null
          privacy_settings?: Json | null
          reading_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          ip_address: unknown | null
          is_suspicious: boolean | null
          last_seen: string
          location_info: Json | null
          security_score: number | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          last_seen?: string
          location_info?: Json | null
          security_score?: number | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          ip_address?: unknown | null
          is_suspicious?: boolean | null
          last_seen?: string
          location_info?: Json | null
          security_score?: number | null
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_session_security_score: {
        Args: { p_ip_address: unknown; p_user_agent: string; p_user_id: string }
        Returns: number
      }
      can_change_username: {
        Args: { user_uuid: string }
        Returns: boolean
      }
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
          pending_reports: number
          posts_this_month: number
          total_comments: number
          total_likes: number
          total_published_posts: number
          total_users: number
          users_last_month: number
          users_this_month: number
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
      get_email_by_username: {
        Args: { username_input: string }
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
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          banner_url: string
          bio: string
          birth_date: string
          created_at: string
          display_name: string
          id: string
          location: string
          privacy_settings: Json
          profile_picture_url: string
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
      invalidate_user_role_cache: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_user_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_user_editor_or_journalist: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_user_journalist_or_admin: {
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
      update_trending_topics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      validate_unique_username: {
        Args: { p_user_id?: string; p_username: string }
        Returns: boolean
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
