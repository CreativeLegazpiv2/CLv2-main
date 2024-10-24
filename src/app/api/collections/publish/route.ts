import { supabase } from '@/services/supabaseClient';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(request: Request) {
  const headers = request.headers;
  const userId = headers.get("user-id");
  const Fname = headers.get("Fname");

  // Check if userId is provided
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const desc = formData.get("desc");
  const year = formData.get("year");
  const artist = Fname;
  const imageFile = formData.get("image");
  const slug = `${userId}`;
  
  // Validate required fields
  if (!title || !desc || !year || !artist || !imageFile) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Check if imageFile is a valid Blob object
  if (!(imageFile instanceof Blob)) {
    return NextResponse.json({ error: 'Invalid image file.' }, { status: 400 });
  }

  console.log('Headers:', headers);
  console.log('User ID:', userId);
  console.log('Title:', title);
  console.log('Description:', desc);
  console.log('Year:', year);
  console.log('Artist:', Fname);
  console.log('Image File:', imageFile);

  // Upload the image to Supabase Storage with no-cache control
  const uniqueFileName = `${Date.now()}-${imageFile.name}`;
  const { error: imageUploadError } = await supabase.storage
    .from('Images_File')
    .upload(uniqueFileName, imageFile, {
      cacheControl: 'no-cache', // Prevent caching at the CDN
      upsert: false,
    });

  if (imageUploadError) {
    console.error('Image Upload Error:', imageUploadError);
    return NextResponse.json({ error: imageUploadError.message }, { status: 500 });
  }

  // Get the public URL for the uploaded image
  const { data } = supabase.storage.from('Images_File').getPublicUrl(uniqueFileName);

  // Check if data is available and contains publicUrl
  if (!data || !data.publicUrl) {
    console.error('Error retrieving image URL.');
    return NextResponse.json({ error: 'Error retrieving image URL.' }, { status: 500 });
  }

  const publicURL = `${data.publicUrl}?v=${Date.now()}`; // Append timestamp for cache busting
  console.log('Image Path:', publicURL);

  // Check if userId already exists in image_collections
  const { data: existingImageCollection, error: checkError } = await supabase
    .from('image_collections')
    .select('*')
    .eq('id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // Handle error if userId not found
    console.error('Error checking image collections:', checkError);
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  // Insert into image_collections only if userId does not exist
  let insertData = null;
  if (!existingImageCollection) {
    const { data: insertData1, error: insertError1 } = await supabase
      .from('image_collections')
      .insert([{ id: userId, title, desc, year, artist, slug, image_path: publicURL }]);

    if (insertError1) {
      console.error('Insert Error:', insertError1);
      return NextResponse.json({ error: insertError1.message }, { status: 500 });
    }
    insertData = insertData1; // Store data for the response
  }

  // Insert into child_collection regardless
  const { data: insertData2, error: insertError2 } = await supabase
    .from('child_collection')
    .insert([{ childid: userId, title, desc, year, artist, sluger: slug, path: publicURL }]);

  if (insertError2) {
    console.error('Insert Error:', insertError2);
    return NextResponse.json({ error: insertError2.message }, { status: 500 });
  }

  // Set cache control headers
  const response = NextResponse.json({ message: 'Gallery item published successfully!', data: insertData, data1: insertData2 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Surrogate-Control', 'no-store');

  return response;
}
