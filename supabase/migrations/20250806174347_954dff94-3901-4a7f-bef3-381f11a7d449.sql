-- Fix the last remaining function search path issue
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
    email_domain TEXT := split_part(NEW.email, '@', 2);
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.allowed_email_domains WHERE domain = email_domain) THEN
        RAISE EXCEPTION 'Dominio email non consentito: %', email_domain;
    END IF;
    RETURN NEW;
END;
$$;