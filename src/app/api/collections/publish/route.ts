import { supabase } from '@/services/supabaseClient';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const headers = request.headers;
  const userId = headers.get("user-id");
  const Fname = headers.get("Fname");

  // Ensure userId is provided
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const desc = formData.get("desc");
  const year = formData.get("year");
  const link = formData.get("link");
  const artist = Fname;
  const imageFile = formData.get("image");
  const slug = `${userId}`;  // Slug to be used for matching

  // Validate required fields
  if (!title || !desc || !year || !artist || !imageFile) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (!(imageFile instanceof Blob)) {
    return NextResponse.json({ error: 'Invalid image file.' }, { status: 400 });
  }

  // Upload the image to Supabase Storage
  const uniqueFileName = `${Date.now()}-${imageFile.name}`;
  const { error: imageUploadError } = await supabase.storage
    .from('Images_File')
    .upload(uniqueFileName, imageFile, {
      cacheControl: 'no-cache',
      upsert: false,
    });

  if (imageUploadError) {
    console.error('Image Upload Error:', imageUploadError);
    return NextResponse.json({ error: imageUploadError.message }, { status: 500 });
  }

  // Get the public URL for the uploaded image
  const { data: publicUrlData } = supabase
    .storage
    .from('Images_File')
    .getPublicUrl(uniqueFileName);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    console.error('Error retrieving image URL.');
    return NextResponse.json({ error: 'Error retrieving image URL.' }, { status: 500 });
  }

  const publicURL = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  // Check if the slug matches any entry in image_collections
  const { data: existingImageCollection, error: checkError } = await supabase
    .from('image_collections')
    .select('*')
    .eq('id', slug)  // Check if slug matches id
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking image collections:', checkError);
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  let collectionResponse;

  if (existingImageCollection) {
    // If slug matches id, update the existing record
    const { data: updateData, error: updateError } = await supabase
      .from('image_collections')
      .update({
        title,
        desc,
        year,
        artist,
        slug,
        link,
        created_at: new Date(),
        image_path: publicURL
      })
      .eq('id', slug);  // Update based on slug

    if (updateError) {
      console.error('Update Error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    collectionResponse = updateData;
  } else {
    // If no match found, insert a new record
    const { data: insertData, error: insertError } = await supabase
      .from('image_collections')
      .insert([{
        id: slug,  // Use slug as id
        title,
        desc,
        year,
        artist,
        link,
        slug,
        image_path: publicURL
      }]);

    if (insertError) {
      console.error('Insert Error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    collectionResponse = insertData;
  }

  // Insert into child_collection regardless
  const { data: childCollectionData, error: childInsertError } = await supabase
    .from('child_collection')
    .insert([{
      childid: userId,
      title,
      desc,
      year,
      artist,
      link,
      sluger: slug,
      path: publicURL
    }]);

  if (childInsertError) {
    console.error('Child Collection Insert Error:', childInsertError);
    return NextResponse.json({ error: childInsertError.message }, { status: 500 });
  }

  const response = NextResponse.json({
    message: 'Gallery item published successfully!',
    imageCollection: collectionResponse,
    childCollection: childCollectionData
  });

  // Cache control headers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Surrogate-Control', 'no-store');

  return response;
}
