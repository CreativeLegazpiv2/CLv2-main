import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabaseClient';

export async function GET(req: Request) {
  try {
    // Retrieve all records from the 'event_featured_image' table
    const { data, error } = await supabase
      .from('event_featured_image')
      .select('*');
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Data fetched successfully',
      data
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
