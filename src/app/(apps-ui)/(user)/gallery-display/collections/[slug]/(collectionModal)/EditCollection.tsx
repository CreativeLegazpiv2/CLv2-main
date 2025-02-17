import { getSession } from "@/services/authservice";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { jwtVerify } from "jose";
import Image from "next/image";
import { useState, useEffect } from "react";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

interface FormData {
  generatedId: string;
  created_at: Date;
  title: string;
  desc: string;
  year: number;
  artist: string;
  link?: string;
  image: File | null; // Keep image property as File
}

interface EditCollectionProps {
  generatedId: string;
  created_at: Date;
  image: string | null;
  title: string;
  desc: string;
  year: number;
  artist: string;
  link?: string;
  onEdit: (updatedData: Omit<FormData, 'image'> & { path: string | null }) => void; // Update type here
  onCancel: () => void;
}
export const EditCollection = ({
  generatedId,
  created_at,
  image,
  title,
  desc,
  year,
  artist,
  link,
  onEdit,
  onCancel,
}: EditCollectionProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(image);
  const [originalImage, setOriginalImage] = useState<string | null>(image); // Track the original image
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    generatedId,
    created_at,
    title,
    desc,
    year,
    artist,
    link,
    image: null, // Initialize image as null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreviewImage(image);
    setOriginalImage(image); // Set original image
    setPreviewImage(image);
    setFormData({ generatedId, created_at, title, desc, year, image: null, artist, link }); // Reset image in formData
  }, [image, title, desc, year]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
    setFormData({ ...formData, image: file }); // Update form data with selected file
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = getSession();
    if (!token) return;

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userIdFromToken = payload.id as string; // Get user ID from the JWT

      const data = new FormData();

      // Always append the required fields
      data.append('title', formData.title);
      data.append('desc', formData.desc);
      data.append('year', formData.year.toString());
      data.append('artist', formData.artist);
      data.append('link', formData.link || '');

      // Convert created_at to ISO string format
      const createdAtISO = new Date(formData.created_at).toISOString();
      data.append('created_at', createdAtISO);
      data.append('generatedId', formData.generatedId);

      // Append the original image path for cleanup
      data.append('imageBefore', originalImage || '');

      // Append the image only if it exists and is different from the original image
      if (formData.image) {
        console.log("Image passing: " + formData.image.name);
        data.append('image', formData.image); // Append new image
      } else if (previewImage) {
        // If no new image is provided, use the preview image
        const response = await fetch(previewImage);
        const blob = await response.blob();
        data.append('image', blob, imageFileName || 'image.png'); // Use the filename
      } else {
        throw new Error("No image available for upload."); // Handle the case where no image is provided
      }

      // Debugging: Log FormData contents
      const entries = data.entries();
      let entry = entries.next();
      while (!entry.done) {
        const [key, value] = entry.value;
        console.log(key, value);
        entry = entries.next();
      }

      const response = await fetch(`/api/collections/updateCollection`, {
        method: 'PUT',
        body: data,
        headers: {
          "userId": userIdFromToken,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update collection');
      }

      // Call the onEdit callback with updated data
      onEdit({
        generatedId: formData.generatedId,
        created_at: formData.created_at,
        title: formData.title,
        desc: formData.desc,
        year: formData.year,
        artist: formData.artist,
        link: formData.link,
        path: previewImage ? previewImage : originalImage, // Keep the original if no new image

      });
      window.location.reload();

    } catch (error) {
      console.error('Error updating collection:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, y: 50, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 50, opacity: 0 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 500,
      }}
      className="w-[90%] lg:max-w-screen-xl h-[80vh] overflow-hidden flex flex-col mx-auto bg-white rounded-lg p-4 relative"
    >
      <Icon
        onClick={onCancel}
        className="absolute top-4 right-4 cursor-pointer"
        icon="line-md:close-small"
        width="35"
        height="35"
      />
      <h2 className="text-3xl font-extrabold mb-2">EDIT COLLECTION</h2>
      <hr className="border-t border-gray-300 mb-8" />

      <div className="p-4 rounded-lg h-fit overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="h-full overflow-y-auto relative">
            <h3 className="text-xl font-bold mb-4">UPLOAD</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="bg-orange-100 rounded-lg p-2 text-center items-center flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-input"
                  />

                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Preview"
                      width={0}
                      height={0}
                      className="rounded-lg h-32 w-32"
                    />
                  ) : (
                    <>
                      <p className="mt-1">
                        Drag and drop files here or click to upload
                      </p>
                    </>
                  )}

                </div>
              </label>
            </div>

            <div className="space-y-4">
            <div>
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-primary-2"
                >
                  Link to video/audio
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-primary-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-primary-2 "
                >
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="desc"
                  className="block text-sm font-medium text-primary-2"
                >
                  description
                </label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full border resize-none border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col w-full h-full">
            <div className="h-full flex justify-center items-center p-4">
              {previewImage ? (
                <div className="h-full bg-white">
                  <div className='overflow-hidden relative'>
                    <Image src={previewImage} alt="Preview" width={0} height={0} className="object-fill w-full h-full max-h-[50dvh]" />
                    {/* <div className='absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black to-transparent'>
                        <h3 className="text-lg font-bold text-white">{formData.title || "Title"}</h3>
                        <p className="text-gray-200">by {formData.artist}</p>
                      </div> */}
                  </div>
                  {/* <div className="p-4">
                      <p className="mt-2 text-gray-800 break-words">{formData.desc || "desc"}</p>
                    </div> */}
                </div>
              ) : (
                <p className="text-gray-500">Upload an image to see the preview.</p>
              )}
            </div>

            <motion.button
              onClick={handleSubmit}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-md text-white"
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

