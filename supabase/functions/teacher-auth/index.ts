import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, email, password, fullName } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'login') {
      // Find teacher by email
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !teacher) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify password
      const isValidPassword = await compare(password, teacher.password_hash)
      
      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Remove password hash from response
      const { password_hash, ...teacherData } = teacher

      return new Response(
        JSON.stringify({ teacher: teacherData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'signup') {
      // Check if email already exists
      const { data: existingTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', email)
        .single()

      if (existingTeacher) {
        return new Response(
          JSON.stringify({ error: 'Email already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Hash password
      const passwordHash = await hash(password)

      // Create new teacher
      const { error } = await supabase
        .from('teachers')
        .insert({
          username: email.split('@')[0], // Generate username from email
          password_hash: passwordHash,
          full_name: fullName,
          email: email,
          access_level: 'admin' // Default to admin level
        })

      if (error) {
        console.error('Error creating teacher:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in teacher-auth function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})