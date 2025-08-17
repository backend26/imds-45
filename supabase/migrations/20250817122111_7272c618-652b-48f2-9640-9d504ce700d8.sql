-- Remove the duplicate trigger that's causing the conflict
-- There are two triggers trying to insert into notification_preferences:
-- 1. create_default_notification_preferences_trigger 
-- 2. on_auth_user_created (via handle_new_user)

DROP TRIGGER IF EXISTS create_default_notification_preferences_trigger ON auth.users;

-- Keep only the handle_new_user trigger which creates both profile and preferences
-- The trigger on_auth_user_created already exists and calls handle_new_user()
-- which now correctly creates profiles first, then notification_preferences