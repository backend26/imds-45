import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const useLocationTracking = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    if (!user || !session) return;

    const trackLogin = async () => {
      try {
        // Get user's IP and basic info
        const userAgent = navigator.userAgent;
        
        // Get IP address (you might want to use a more reliable service)
        let ipAddress = '';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ipAddress = ipData.ip;
        } catch (error) {
          console.error('Could not get IP address:', error);
          return;
        }

        // Call the location detector edge function
        const { data, error } = await supabase.functions.invoke('location-detector', {
          body: {
            ip_address: ipAddress,
            user_agent: userAgent,
            user_id: user.id
          }
        });

        if (error) {
          console.error('Error tracking location:', error);
          return;
        }

        if (data?.is_new_location) {
          console.log('New location detected:', data.location_data);
          
          // You could show a toast notification here
          if (data.is_suspicious) {
            console.warn('Suspicious login detected');
          }
        }
      } catch (error) {
        console.error('Error in location tracking:', error);
      }
    };

    // Track login only once per session
    const hasTracked = sessionStorage.getItem(`location_tracked_${session.access_token.substring(0, 10)}`);
    if (!hasTracked) {
      trackLogin();
      sessionStorage.setItem(`location_tracked_${session.access_token.substring(0, 10)}`, 'true');
    }
  }, [user, session]);

  return null;
};