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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Auth-aware client using the caller's JWT (from request headers)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      }
    )

    // Service role client for privileged DB writes
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId: bodyUserId, username, displayName } = await req.json()

    // Enforce authentication
    const {
      data: { user: authUser },
      error: getUserError,
    } = await supabaseAuth.auth.getUser()

    if (getUserError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const callerId = authUser.id
    const targetUserId = bodyUserId ?? callerId

    if (bodyUserId && bodyUserId !== callerId) {
      // Check if caller is admin
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('user_id', callerId)
        .maybeSingle()

      const isAdmin = callerProfile?.role === 'administrator'
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: cannot act on another user' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate a unique username if the provided one already exists
    let finalUsername = (username ?? '').toLowerCase().replace(/[^a-z0-9_]/g, '_')
    if (!finalUsername) {
      finalUsername = `user_${targetUserId.substring(0, 8)}`
    }

    let counter = 0
    while (true) {
      const testUsername = counter === 0 ? finalUsername : `${finalUsername}_${counter}`
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('username', testUsername)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking username:', checkError)
        // Continue with the username if error checking
      }

      if (!existingProfile) {
        finalUsername = testUsername
        break
      }

      counter++
      if (counter > 100) {
        return new Response(
          JSON.stringify({ error: 'Unable to generate unique username' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Upsert the profile
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: targetUserId,
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
            bookmarks: false,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Error creating profile:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, username: finalUsername }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
