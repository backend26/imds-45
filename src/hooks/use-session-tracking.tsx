import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export function useSessionTracking() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const trackSession = async () => {
      try {
        // Get device and location info
        const userAgent = navigator.userAgent;
        const deviceInfo = {
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth
        };

        // Try to get basic location info (city level)
        let locationInfo = {};
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const data = await response.json();
            locationInfo = {
              city: data.city,
              region: data.region,
              country: data.country_name,
              timezone: data.timezone
            };
          }
        } catch (error) {
          console.log('Location detection not available');
        }

        // Generate session ID
        const sessionId = `${user.id}_${Date.now()}_${Math.random().toString(36)}`;

        // Insert session record
        const { error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            user_agent: userAgent,
            device_info: deviceInfo,
            location_info: locationInfo,
            security_score: 100 // Default score, can be calculated by backend function
          });

        if (error) {
          console.error('Error tracking session:', error);
        }

        // Store session ID for cleanup on logout
        sessionStorage.setItem('current_session_id', sessionId);
      } catch (error) {
        console.error('Session tracking error:', error);
      }
    };

    trackSession();

    // Update last_seen periodically
    const interval = setInterval(async () => {
      if (user) {
        const sessionId = sessionStorage.getItem('current_session_id');
        if (sessionId) {
          await supabase
            .from('user_sessions')
            .update({ last_seen: new Date().toISOString() })
            .eq('session_id', sessionId);
        }
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const endSession = async () => {
    const sessionId = sessionStorage.getItem('current_session_id');
    if (sessionId && user) {
      try {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_id', sessionId);
        
        sessionStorage.removeItem('current_session_id');
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };

  return { endSession };
}