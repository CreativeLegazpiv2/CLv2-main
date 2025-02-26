// import { NextResponse } from 'next/server';
// import { supabase } from '@/services/supabaseClient';

// export async function GET(req: Request) {
//   try {
//     // Retrieve all records from the 'event_featured_image' table
//     const { data, error } = await supabase
//       .from('event_featured_image')
//       .select('*');
      
//     if (error) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 500 }
//       );
//     }
    
//     return NextResponse.json({
//       message: 'Data fetched successfully',
//       data
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabaseClient';

export async function GET() {
  try {
    // Fetch images from Supabase
    const { data, error } = await supabase
      .from('event_featured_image') // Ensure this table exists
      .select('image_url, title'); // Ensure these fields exist in the database

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn('No images found in the database');
      return NextResponse.json({ data: [] }, { status: 200 }); // Return an empty array
    }

    // If there are 4 or fewer images, return all of them; otherwise, return 4 random images
    const shuffled = data.length <= 4 ? data : data.sort(() => Math.random() - 0.5).slice(0, 4);

    // Ensure the response has the expected structure
    return NextResponse.json({ data: shuffled }, { status: 200 });
  } catch (err) {
    console.error('Internal server error:', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}