    import { NextResponse } from 'next/server'
    import { supabase } from '@/services/supabaseClient'

    export async function PUT(req: Request) {
        console.log("PUT request received")

        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'No token provided' },
                { status: 401, headers: { 'Cache-Control': 'no-store' } }
            )
        }
        const userId = authHeader.split(' ')[1]

        try {
            console.log("UserId from Authorization:", userId)
            const formData = await req.formData()
            console.log("Request form data:", formData)

            const detailsid = formData.get('detailsid') as string
            if (detailsid !== userId) {
                return NextResponse.json(
                    { message: 'You are not authorized to update these details.' },
                    { status: 403, headers: { 'Cache-Control': 'no-store' } }
                )
            }

            const userDetails = JSON.parse(formData.get('userDetails') as string)
            const profilePicFile = formData.get('profile_pic') as File

            if (profilePicFile) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
                if (!allowedTypes.includes(profilePicFile.type)) {
                    return NextResponse.json(
                        { message: 'Invalid file type. Only images are allowed.' },
                        { status: 400, headers: { 'Cache-Control': 'no-store' } }
                    )
                }

                const { data: currentUserDetails, error: fetchError } = await supabase
                    .from('userDetails')
                    .select('profile_pic')
                    .eq('detailsid', userId)
                    .single()

                if (fetchError) {
                    console.error('Supabase fetch user details error:', fetchError)
                    return NextResponse.json(
                        { message: 'Failed to fetch user details', error: fetchError.message },
                        { status: 500, headers: { 'Cache-Control': 'no-store' } }
                    )
                }

                const currentProfilePicUrl = currentUserDetails?.profile_pic
                if (currentProfilePicUrl) {
                    const urlParts = currentProfilePicUrl.split('/')
                    const bucketName = urlParts[3]
                    const filePath = urlParts.slice(4).join('/')

                    const { error: deleteError } = await supabase
                        .storage
                        .from(bucketName)
                        .remove([filePath])

                    if (deleteError) {
                        console.error('Supabase profile image delete error:', deleteError)
                        return NextResponse.json(
                            { message: 'Failed to delete old profile image', error: deleteError.message },
                            { status: 500, headers: { 'Cache-Control': 'no-store' } }
                        )
                    }
                }

                const fileExtension = profilePicFile.name.split('.').pop()
                const fileName = `${userId}/${Date.now()}.${fileExtension}`

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('profile_image')
                    .upload(fileName, profilePicFile, {
                        contentType: profilePicFile.type,
                    })

                if (uploadError) {
                    console.error('Supabase profile image upload error:', uploadError)
                    return NextResponse.json(
                        { message: 'Failed to upload profile image', error: uploadError.message },
                        { status: 500, headers: { 'Cache-Control': 'no-store' } }
                    )
                }

                const { data: { publicUrl } } = supabase
                    .storage
                    .from('profile_image')
                    .getPublicUrl(uploadData.path)

                userDetails.profile_pic = publicUrl
            }

            const updatedUserDetails = { ...userDetails }
            if (!profilePicFile) {
                delete updatedUserDetails.profile_pic
            }

            const { data: updatedData, error: userDetailsError } = await supabase
                .from('userDetails')
                .update(updatedUserDetails)
                .eq('detailsid', userId)
                .select()

            if (userDetailsError) {
                console.error('Supabase userDetails update error:', userDetailsError)
                return NextResponse.json(
                    { message: 'Failed to update user details', error: userDetailsError.message },
                    { status: 500, headers: { 'Cache-Control': 'no-store' } }
                )
            }

            if (userDetails.first_name) {
                const { error: childCollectionError } = await supabase
                    .from('child_collection')
                    .update({ artist: userDetails.first_name })
                    .eq('user_id', userId)

                const { error: imageCollectionError } = await supabase
                    .from('image_collections')
                    .update({ artist: userDetails.first_name })
                    .eq('user_id', userId)

                const { error: messageError } = await supabase
                    .from('messages')
                    .update({ first_name: userDetails.first_name })
                    .eq('user_id', userId)

                if (childCollectionError || imageCollectionError || messageError) {
                    console.error('Error updating related collections:', { childCollectionError, imageCollectionError, messageError })
                }
            }

            return NextResponse.json(
                { message: 'User details updated successfully', updatedData },
                { status: 200, headers: { 'Cache-Control': 'no-store' } }
            )

        } catch (error: any) {
            console.error('Error in PUT method:', error)
            return NextResponse.json(
                { message: 'Error processing the request', error: error.message || 'Unknown error' },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            )
        }
    }
