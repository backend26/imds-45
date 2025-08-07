-- FASE 1 & 2: Add journalist role and improve security constraints

-- 1. Add journalist role to app_role enum (editor and journalist are synonyms)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'journalist';

-- 2. Create function to check username uniqueness
CREATE OR REPLACE FUNCTION check_username_exists(username_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE username = username_check
    );
END;
$$;

-- 3. Create function to check email uniqueness across auth.users
CREATE OR REPLACE FUNCTION check_email_exists(email_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = email_check
    );
END;
$$;

-- 4. Add is_hero column to posts table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'is_hero') THEN
        ALTER TABLE posts ADD COLUMN is_hero BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 5. Update profiles table to make display_name NOT NULL (mandatory)
UPDATE profiles SET display_name = COALESCE(display_name, username, 'User') WHERE display_name IS NULL;
ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;

-- 6. Add unique constraint on username if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF;
END $$;

-- 7. Create analytics view for admin dashboard
CREATE OR REPLACE VIEW admin_analytics AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as users_this_month,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days') as users_last_month,
    (SELECT COUNT(*) FROM posts WHERE status = 'published') as total_published_posts,
    (SELECT COUNT(*) FROM posts WHERE published_at >= CURRENT_DATE - INTERVAL '30 days') as posts_this_month,
    (SELECT COUNT(*) FROM comments) as total_comments,
    (SELECT COUNT(*) FROM post_likes) as total_likes,
    (SELECT COUNT(*) FROM post_reports WHERE status = 'pending') as pending_reports;

-- 8. Create function to promote user to journalist/editor
CREATE OR REPLACE FUNCTION promote_user_to_journalist(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role app_role;
    target_user_exists BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role 
    FROM profiles 
    WHERE user_id = auth.uid();
    
    IF current_user_role != 'administrator' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if target user exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = user_uuid) INTO target_user_exists;
    
    IF NOT target_user_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Promote to journalist (synonym for editor)
    UPDATE profiles 
    SET role = 'journalist', updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN TRUE;
END;
$$;

-- 9. Update useRoleCheck compatibility for journalists (grant same permissions as editor)
CREATE OR REPLACE FUNCTION is_user_editor_or_journalist(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('administrator', 'editor', 'journalist')
    );
END;
$$;