import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationRequest {
  ip_address: string;
  user_agent: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { ip_address, user_agent, user_id }: LocationRequest = await req.json();

    // Get location data from IP
    let locationData = {};
    let isNewLocation = false;
    let isSuspicious = false;

    try {
      // Using a free IP geolocation service (ipapi.co)
      const ipResponse = await fetch(`https://ipapi.co/${ip_address}/json/`);
      const ipData = await ipResponse.json();
      
      if (ipData && !ipData.error) {
        locationData = {
          country: ipData.country_name,
          country_code: ipData.country_code,
          city: ipData.city,
          region: ipData.region,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          timezone: ipData.timezone,
          isp: ipData.org
        };
      }
    } catch (error) {
      console.error('Error fetching IP location:', error);
    }

    // Check for previous logins from this user
    const { data: previousSessions, error: fetchError } = await supabaseClient
      .from('login_sessions')
      .select('location_data, ip_address')
      .eq('user_id', user_id)
      .order('logged_in_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching previous sessions:', fetchError);
    }

    if (previousSessions && previousSessions.length > 0) {
      // Check if this location is significantly different from previous ones
      const currentLocation = locationData as any;
      
      for (const session of previousSessions) {
        const prevLocation = session.location_data as any;
        
        // If we have previous location data, compare
        if (prevLocation && prevLocation.country_code && currentLocation.country_code) {
          // Same country = not new location
          if (prevLocation.country_code === currentLocation.country_code) {
            // If same city or within reasonable distance, not new
            if (prevLocation.city === currentLocation.city) {
              isNewLocation = false;
              break;
            }
          }
        }
        
        // Same IP = definitely not new location
        if (session.ip_address === ip_address) {
          isNewLocation = false;
          break;
        }
      }
      
      // If we haven't found a match, it's a new location
      if (isNewLocation === false && previousSessions.length > 0) {
        const hasMatchingCountry = previousSessions.some(session => {
          const prevLocation = session.location_data as any;
          return prevLocation?.country_code === (locationData as any)?.country_code;
        });
        
        if (!hasMatchingCountry) {
          isNewLocation = true;
        }
      }
    } else {
      // First login ever
      isNewLocation = true;
    }

    // Simple suspicion detection
    const suspicionFactors = [];
    
    // VPN/Proxy detection (basic)
    if ((locationData as any).isp?.toLowerCase().includes('vpn') || 
        (locationData as any).isp?.toLowerCase().includes('proxy')) {
      suspicionFactors.push('vpn_proxy');
    }
    
    // Unusual country for this user
    if (isNewLocation && (locationData as any).country_code) {
      const commonCountries = ['IT', 'US', 'GB', 'DE', 'FR', 'ES'];
      if (!commonCountries.includes((locationData as any).country_code)) {
        suspicionFactors.push('unusual_country');
      }
    }
    
    isSuspicious = suspicionFactors.length > 0;

    // Create device fingerprint (simple hash of user agent + IP)
    const deviceFingerprint = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${user_agent}${ip_address}`)
    ).then(buffer => 
      Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 16)
    );

    // Insert login session record
    const { data: sessionData, error: insertError } = await supabaseClient
      .from('login_sessions')
      .insert([{
        user_id,
        ip_address,
        user_agent,
        location_data: locationData,
        device_fingerprint: deviceFingerprint,
        login_method: 'email', // This could be passed from the client
        is_new_location: isNewLocation,
        is_suspicious: isSuspicious,
        logged_in_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting session:', insertError);
      throw insertError;
    }

    // If it's a new location, create a notification and potentially send email
    if (isNewLocation) {
      // Create notification for the user
      await supabaseClient
        .from('notifications')
        .insert([{
          recipient_id: user_id,
          actor_id: user_id, // System notification
          type: 'system_announcement',
          related_post_id: null,
          metadata: {
            type: 'new_location_login',
            location: locationData,
            ip_address,
            timestamp: new Date().toISOString(),
            is_suspicious: isSuspicious
          }
        }]);

      // TODO: Send email notification
      // This would typically call another edge function or email service
      console.log(`New location login detected for user ${user_id} from ${(locationData as any).city}, ${(locationData as any).country}`);
    }

    return new Response(JSON.stringify({
      success: true,
      session_id: sessionData.id,
      is_new_location: isNewLocation,
      is_suspicious: isSuspicious,
      location_data: locationData,
      device_fingerprint: deviceFingerprint
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in location-detector function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});