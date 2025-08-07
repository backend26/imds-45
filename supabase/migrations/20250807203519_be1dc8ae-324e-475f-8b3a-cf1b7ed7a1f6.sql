-- Security hardening migration (retry with corrected policy checks)

-- 1) Performance & search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts (category_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes (user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments (author_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_ci_unique ON public.profiles (lower(username)) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles (is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON public.profiles USING GIN (username gin_trgm_ops) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm ON public.profiles USING GIN (display_name gin_trgm_ops);

-- 2) updated_at triggers
DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3) Storage security policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read - public buckets'
  ) THEN
    CREATE POLICY "Public read - public buckets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id IN ('profile-images','cover-images','post-media'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users upload profile images to own folder'
  ) THEN
    CREATE POLICY "Users upload profile images to own folder"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users update profile images in own folder'
  ) THEN
    CREATE POLICY "Users update profile images in own folder"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users delete profile images in own folder'
  ) THEN
    CREATE POLICY "Users delete profile images in own folder"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload cover images'
  ) THEN
    CREATE POLICY "Editors upload cover images"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'cover-images'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors update cover images'
  ) THEN
    CREATE POLICY "Editors update cover images"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'cover-images'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'cover-images'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors delete cover images'
  ) THEN
    CREATE POLICY "Editors delete cover images"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'cover-images'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors upload post media'
  ) THEN
    CREATE POLICY "Editors upload post media"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'post-media'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors update post media'
  ) THEN
    CREATE POLICY "Editors update post media"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'post-media'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'post-media'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Editors delete post media'
  ) THEN
    CREATE POLICY "Editors delete post media"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'post-media'
      AND (public.is_user_editor_or_journalist(auth.uid()) OR public.is_user_admin(auth.uid()))
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;