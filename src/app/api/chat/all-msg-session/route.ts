import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabaseClient';

export async function GET(req: Request ) {
  try {
    const headers = req.headers;
    const sender_a = headers.get('sender_a');
    console.log("sender_a", sender_a);
    

    if (!sender_a) {
      return NextResponse.json({ error: 'sender_a is required' }, { status: 400 });
    }

    // Query the msgSession table for sessions where sender_a exists in either column a or b
    const { data: message, error: sessionsError } = await supabase
      .from('allmessage')
      .select('*')  // Select id, a, and b fields explicitly
      .eq('sessionid', sender_a)
      console.log("sender_a", sender_a);
      

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    // Return only the sessions (no messages)
    return NextResponse.json({ message }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
