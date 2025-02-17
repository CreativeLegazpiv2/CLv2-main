import { NextResponse } from 'next/server'
import { supabase } from '@/services/supabaseClient'
import { create } from 'lodash'

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('userId')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    // Parse the incoming form data
    const formData = await req.formData()
    const imageBefore = formData.get('imageBefore') // The URL of the previous image
    const updatedData = {
      title: formData.get('title'),
      link: formData.get('link'),
      desc: formData.get('desc'),
      year: formData.get('year'),
      artist: formData.get('artist'),
      image: formData.get('image'), // Assuming this is a File
      created_at: formData.get('created_at'),
      generatedId: formData.get('generatedId'),
    }

    if (!updatedData.title || !updatedData.year || !updatedData.desc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!(updatedData.image instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid image file.' }, { status: 400 })
    }

    // Generate a unique file name for the new image
    const uniqueFileName = `${Date.now()}-${updatedData.image.name}`

    // Upload the new image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('Images_File')
      .upload(uniqueFileName, updatedData.image, {
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('Images_File')
      .getPublicUrl(uniqueFileName)

    const publicUrl = publicUrlData.publicUrl

    // Update the child_collection record
    const { data: childData, error: childError } = await supabase
      .from('child_collection')
      .update({
        path: publicUrl,
        year: updatedData.year,
        title: updatedData.title,
        artist: updatedData.artist,
        link: updatedData.link,
        desc: updatedData.desc,
        created_at: new Date(),
      })
      .eq('childid', token)
      .eq('generatedId', updatedData.generatedId)

    if (childError) {
      return NextResponse.json({ error: childError.message }, { status: 500 })
    }

    /**
     * New Logic: Check if slug matches id in image_collections and update it
     */
    console.log('Checking if slug matches id in image_collections...')
    const { data: existingImageCollection, error: checkError } = await supabase
      .from('image_collections')
      .select('*')
      .eq('id', token)  // Check if token (slug) matches id
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking image_collections:', checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingImageCollection) {
      // If slug matches id, update the image_collections record
      const { data: updateImageData, error: updateImageError } = await supabase
        .from('image_collections')
        .update({
          image_path: publicUrl,
          year: updatedData.year,
          title: updatedData.title,
          artist: updatedData.artist,
          link: updatedData.link,
          desc: updatedData.desc,
          created_at: new Date(),
        })
        .eq('id', token)

      if (updateImageError) {
        console.error('Error updating image_collections:', updateImageError)
        return NextResponse.json({ error: updateImageError.message }, { status: 500 })
      } else {
        console.log('image_collections updated successfully:', updateImageData)
      }
    } else {
      console.log('No matching slug in image_collections, skipping update.')
    }

    // Remove the old image from Supabase storage
    if (typeof imageBefore === 'string') {
      const urlParts = imageBefore.split('/')
      const fileName = urlParts[urlParts.length - 1]

      const { error: deleteError } = await supabase.storage
        .from('Images_File')
        .remove([fileName])

      if (deleteError) {
        console.error('Error deleting old image:', deleteError)
        return NextResponse.json({ error: `Failed to delete previous image: ${deleteError.message}` }, { status: 500 })
      }
    }

    // Return success response
    return NextResponse.json({
      message: 'Collection and image updated successfully',
      updatedChildCollection: childData,
    })
  } catch (error) {
    console.error('Error in API:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
