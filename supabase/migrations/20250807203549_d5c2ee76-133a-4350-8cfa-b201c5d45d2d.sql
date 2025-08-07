-- Fix linter warnings: move pg_trgm to extensions schema and enforce security_invoker on views

-- 1) Move pg_trgm to the dedicated extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- 2) Ensure views run with caller privileges (security_invoker)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'public_profiles'
  ) THEN
    EXECUTE 'ALTER VIEW public.public_profiles SET (security_invoker = on)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'admin_analytics'
  ) THEN
    EXECUTE 'ALTER VIEW public.admin_analytics SET (security_invoker = on)';
  END IF;
END $$;