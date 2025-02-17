import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/services/supabaseClient'

export async function GET(req: NextRequest) {
  try {
    // Extract userIdFromToken and id from headers
    const headers = req.headers
    const userIdFromToken = headers.get('userIdFromToken')
    const id = headers.get('id')

    if (!userIdFromToken || !id) {
      return NextResponse.json({ error: 'userIdFromToken and id are required' }, { status: 400 })
    }

    // Check if a session exists where the user is either `a` or `b`
    const { data: sessions, error: sessionsError } = await supabase
      .from('msgSession')
      .select('id, a, b')
      .or(`and(a.eq.${userIdFromToken},b.eq.${id}),and(a.eq.${id},b.eq.${userIdFromToken})`)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    // If no session exists, return 404
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ error: 'No session found for the given user' }, { status: 404 })
    }

    // Get the latest session ID
    const sessionId = sessions[0].id

    // Fetch messages related to the session ID
    const { data: messages, error: messagesError } = await supabase
      .from('allmessage')
      .select('*')
      .eq('sessionid', sessionId)

    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    return NextResponse.json({ sessionId, messages }, { status: 200 })
  } catch (error: any) {
    console.error('API Error:', error.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
