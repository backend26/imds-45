import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, username, displayName } = await req.json()

    if (!userId || !username) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate a unique username if the provided one already exists
    let finalUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    let counter = 0
    
    while (true) {
      const testUsername = counter === 0 ? finalUsername : `${finalUsername}_${counter}`
      
      const { data: existingProfile } = await supabaseClient
        .from('profiles')
        .select('username')
        .eq('username', testUsername)
        .single()
      
      if (!existingProfile) {
        finalUsername = testUsername
        break
      }
      
      counter++
      if (counter > 100) {
        return new Response(
          JSON.stringify({ error: 'Unable to generate unique username' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // UPSERT the profile - this prevents duplicate key errors
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: userId,
        username: finalUsername,
        display_name: displayName || finalUsername,
        accepted_terms_at: new Date().toISOString(),
        privacy_settings: {
          email: false,
          birth_date: false,
          location: false,
          activity: true,
          posts: true,
          likes: false,
          bookmarks: false
        }
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error creating profile:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create profile' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        username: finalUsername
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})