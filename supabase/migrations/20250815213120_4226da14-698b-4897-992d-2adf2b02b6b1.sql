-- Add character limits for username and display_name
ALTER TABLE public.profiles 
ADD CONSTRAINT username_length_check CHECK (char_length(username) <= 30),
ADD CONSTRAINT display_name_length_check CHECK (char_length(display_name) <= 50);