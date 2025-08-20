import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  user_id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
}

export const useRealProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProfiles = async () => {
    if (profiles.length > 0) return profiles; // Cache

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, profile_picture_url')
        .eq('is_banned', false)
        .limit(20);

      if (error) throw error;
      
      const profilesList = data || [];
      setProfiles(profilesList);
      return profilesList;
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const findProfileByUsername = (username: string): Profile | null => {
    return profiles.find(p => p.username.toLowerCase() === username.toLowerCase()) || null;
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return {
    profiles,
    loading,
    loadProfiles,
    findProfileByUsername
  };
};