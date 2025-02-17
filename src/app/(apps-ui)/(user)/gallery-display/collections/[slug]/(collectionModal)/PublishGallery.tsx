"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { jwtVerify } from "jose";
import { getSession } from "@/services/authservice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { checkTokenExpiration, logoutAndRedirect } from "@/services/jwt";
import { X } from "lucide-react";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

interface props {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PublishGallery({ openModal, setOpenModal }: props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [getFname, setFname] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    year: "",
    image: null as File | null,
  });

  const validateYear = (year: string) => {
    const yearPattern = /^[0-9]{4}$/; // RegEx to match 4 digits
    return yearPattern.test(year);
  };

  const [loading, setLoading] = useState(false); // Add loading state

  // Use useEffect to access localStorage only on the client side

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getSession();
        if (!token) {
          logoutAndRedirect();
          return;
        }
        // Verify and decode the token
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );

        // Extract the user ID from the token payload
        const userIdFromToken = payload.id as string;

        // Call the API with the userIdFromToken
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Authorization': userIdFromToken, // Pass the userId as the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        // Parse the response JSON
        const data = await response.json();

        // Store the first_name in localStorage under the key "Fname"
        if (data.first_name) {
          localStorage.setItem('Fname', data.first_name);
          setFname(data.first_name);
          console.log('First name stored in localStorage:', data.first_name);
        } else {
          console.error('No first_name found in the response');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    const fname = localStorage.getItem("Fname");
    if (fname) {
      setFname(fname);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Get file extension
      const fileExtension = file.name.toLowerCase().split('.').pop();

      // Allow only non-GIF images
      if (fileExtension === 'gif') {
        toast.error("GIF images are not allowed. Please upload PNG, JPG, or JPEG.");
        return;
      }

      setImagePreview(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setImagePreview(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  };

  const setImagePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFormData({ ...formData, image: file }); // Update form data with selected file
  };

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpload = async () => {

    if (!formData.image) {
      toast.error("Please upload an image.");
      return;
    }

    // Extract file extension
    const fileExtension = formData.image.name.toLowerCase().split('.').pop();

    // Reject .gif images
    if (fileExtension === 'gif') {
      toast.error("GIF images are not allowed. Please upload PNG, JPG, or JPEG.");
      return;
    }

    const token = getSession();
    const Fname = localStorage.getItem("Fname") as string;

    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    // Validate fields
    if (!formData.image) {
      toast.error("Please upload an image.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!formData.desc.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (!formData.year.trim() || !validateYear(formData.year)) {
      toast.error("Year must be a valid 4-digit number.");
      return;
    }

    setLoading(true); // Set loading to true when upload starts

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userIdFromToken = payload.id as string;

      const data = new FormData();
      data.append("image", formData.image as File);
      data.append("title", formData.title);
      data.append("desc", formData.desc);
      data.append("year", formData.year);

      const response = await fetch("/api/collections/publish", {
        method: "PUT",
        headers: {
          "user-id": userIdFromToken,
          Fname: Fname,
        },
        body: data,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to send message: ${errorBody}`);
      }

      const result = await response.json();
      console.log(result); // Handle success (optional)

      setFormData({
        title: "",
        desc: "",
        year: "",
        image: null,
      });
      setPreviewImage(null);
      toast.success("Gallery published successfully!", {
        position: "bottom-right",
      });

      setOpenModal(false);

      window.location.reload();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to publish gallery. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
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
      <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpenModal(false)} size={25}/>
      <h2 className="text-3xl font-extrabold mb-2">PUBLISH COLLECTION</h2>
      <div className="p-4 rounded-lg h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="h-full overflow-y-auto relative">
            <h3 className="text-xl font-bold mb-4">UPLOAD</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="bg-orange-100 rounded-lg p-8 text-center flex items-center justify-center">
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
                      <Icon
                        className="mx-auto h-12 w-12 text-gray-400"
                        icon="stash:image-plus-light"
                        width="25"
                        height="25"
                      />

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
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
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
                  className="block text-sm font-medium text-gray-700 "
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="desc"
                  name="desc"
                  rows={3}
                  value={formData.desc}
                  onChange={handleChange}
                  className="mt-1 block w-full resize-none border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                    <Image
                      src={previewImage}
                      alt="Preview"
                      width={0} height={0} className="object-fill w-full h-full max-h-[50dvh]"
                    />

                  </div>

                </div>
              ) : (
                <p className="text-gray-500">
                  Upload an image to see the preview.
                </p>
              )}
            </div>

            <motion.button
              onClick={handleUpload}
              disabled={loading} // Disable button during loading
              className={`w-full py-3 mt-4 rounded-md text-white ${loading ? "bg-gray-500" : "bg-orange-500 hover:bg-orange-600"
                }`}
            >
              {loading ? "Publishing..." : "Publish"}{" "}
              {/* Change button text based on loading state */}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>

  );
}