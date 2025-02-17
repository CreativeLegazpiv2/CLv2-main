"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion, AnimatePresence } from "framer-motion";

import { getSession } from "@/services/authservice";
import { jwtVerify } from "jose";
import Image from "next/image";
import { UserDetail } from "../page";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

interface ProfileModalProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  formData: UserDetail; // Accept formData as prop
  setFormData: React.Dispatch<React.SetStateAction<UserDetail>>; // Accept setFormData as prop
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  openModal,
  setOpenModal,
  formData,
  setFormData,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false)
  const genders = ['male', 'female', 'other']  // Use lowercase if required by the backend

  const handleSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }))  // Ensure it updates correctly
    setIsOpen(false)
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedField, setSelectedField] = useState("")

  const creativeFieldOptions = [
    "audiovisual-media",
    "digital-interactive-media",
    "creative-services",
    "design",
    "publishing-and-printing-media",
    "performing-arts",
    "visual-arts",
    "traditional-and-cultural-expressions",
    "cultural-sites"
  ];

  const handleSelectField = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      creative_field: field, // Store the selected value inside formData
    }));
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openModal]);

  // profile_pic
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type;

      // List of allowed file types
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/tiff",
        "image/bmp",
      ];

      if (!allowedTypes.includes(fileType)) {
        setErrorMessage(
          "Invalid image format. Only JPG, PNG, GIF, TIFF, and BMP files are allowed."
        );
        return;
      }

      setErrorMessage(null);
      setProfilePicFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_pic: reader.result as string, // Preview the uploaded image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  // Handle input change within modal
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSave = async () => {
    if (!/^09\d{9}$/.test(formData.mobileNo)) {
      toast.error("Invalid mobile number! pattern must be 09XXXXXXXXX", {
        position: "top-right",
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return; // Stop form submission
    }
  
    setIsEditing(true);
  
    const token = getSession();
    if (!token) {
      toast.error("You must be logged in to save changes.");
      setIsEditing(false);
      return;
    }
  
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userId = payload.id as string;
  
      const formDataToSend = new FormData();
      formDataToSend.append("detailsid", userId);
      formDataToSend.append("userDetails", JSON.stringify({
        ...formData,
        creative_field: formData.creative_field,
      }));
  
      if (profilePicFile) {
        formDataToSend.append("profile_pic", profilePicFile);
      }
  
      const response = await fetch("/api/creatives", {
        method: "PUT",
        headers: { Authorization: `Bearer ${userId}` },
        body: formDataToSend,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update user details.");
        throw new Error(errorData.message);
      }
  
      const updatedUserDetail: UserDetail = await response.json();
      setFormData(updatedUserDetail);
      setOpenModal(false);
      toast.success("Profile updated successfully!", { autoClose: 2000 });
      window.location.reload();
  
    } catch (error) {
      console.error("Error updating user details:", error);
      toast.error("An error occurred while saving your changes.");
    } finally {
      setIsEditing(false);
    }
  };
  




  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpenModal(false);
      setIsClosing(false);
    }, 500); // Adjust duration for the exit animation
  };







  return (
    <>
      {(openModal || isClosing) && (


        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-palette-6 rounded-2xl pb-12 shadow-2xl w-full lg:max-w-screen-xl max-w-[90%] max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 350,
          }}
        >
          {/* Header */}
          <div className=" px-6 py-2 flex items-center justify-between bg-palette-6">
            <h2 className="text-xl font-semibold text-palette-5">Edit Profile</h2>
            <button
              onClick={handleClose}
              className="p-2   rounded-full transition-colors"
            >
              <Icon
                icon="line-md:close-circle"
                className="w-6 h-6 text-palette-5 hover:text-palette-7 hover:bg-gray-100 rounded-full"
              />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={(e) => e.preventDefault()} className="p-4 overflow-y-auto scroll-none max-h-[calc(90vh-8rem)]">
            <div className="grid md:grid-cols-[300px,1fr] gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-gray-100 shadow-lg">
                      <Image
                        src={formData.profile_pic || "/images/creative-directory/profile.jpg"}
                        alt="Profile"
                        fill
                        style={{ objectFit: "cover" }}
                        className="hover:opacity-90 transition-opacity w-full h-full rounded-full"
                      />
                    </div>
                    <label
                      htmlFor="file-upload"
                      className="absolute bottom-2 right-2 bg-white shadow-lg rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Icon icon="bxs:camera" className="w-5 h-5 text-palette-7" />
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/jpeg, image/png, image/gif, image/tiff, image/bmp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-sm text-palette-5/70">Upload a new photo</p>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Full Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Birth Date</label>
                    <input
                      type="date"
                      name="bday"
                      value={formData.bday}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Social Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Facebook</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="ri:facebook-fill" className="w-5 h-5 text-palette-6/40" />
                      </div>
                      <input
                        type="text"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                        placeholder="Facebook profile URL"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Instagram</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="ri:instagram-line" className="w-5 h-5 text-palette-6/40" />
                      </div>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                        placeholder="Instagram profile URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="ri:mail-line" className="w-5 h-5 text-palette-6/40" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-palette-5/60 ml-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="ri:phone-line" className="w-5 h-5 text-palette-6/40" />
                      </div>
                      <input
                        type="tel"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers
                          if (!/^\d*$/.test(value)) return;
                          // Validate length (max 11) and must start with "09"
                          if ((value.length === 1 && value !== "0") || (value.length === 2 && value !== "09")) {
                            return;
                          }
                          if (value.length <= 11) {
                            setFormData((prev) => ({ ...prev, mobileNo: value }));
                          }
                        }}
                        className="w-full pl-10 px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                        placeholder="Your phone number"
                      />
                      {/* Error message */}
                    {formData.mobileNo && !/^09\d{9}$/.test(formData.mobileNo) && (
                      <p className="text-palette-2 text-xs mt-1 absolute">Mobile number must start with 09 and be 11 digits.</p>
                    )}
                    </div>
                    
                  </div>

                </div>

                {/* Professional Information */}
                {formData.role !== "buyer" && (
                  <div className="grid md:grid-cols-2 gap-4 ">

                    <div className="relative">
                      <label className="block text-sm font-medium text-palette-5/60 ml-1">
                        Creative Field
                      </label>

                      {/* Custom Dropdown Trigger */}
                      <div
                        className="flex justify-between items-center w-full px-3 py-1.5 rounded-lg bg-palette-5/90 text-palette-6/90 cursor-pointer outline-none focus:outline focus:outline-palette-4"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className={formData.creative_field ? "text-palette-7 " : "text-palette-6/40"}>
                          {formData.creative_field
                            ? formData.creative_field.replace(/-/g, " ")
                            : "Select Creative Field"}
                        </span>
                        <ChevronDown className="w-5 h-5 text-palette-6" />
                      </div>

                      {/* Dropdown Options */}
                      {isDropdownOpen && (
                        <div className="absolute mt-1 w-full p-1 bg-palette-5 text-palette-6/90 shadow-lg rounded-lg z-50 max-h-60 overflow-auto scroll-none">
                          {creativeFieldOptions.map((field) => (
                            <div
                              key={field}
                              className={`px-4 py-2 cursor-pointer hover:bg-palette-6/30 rounded-xl ${formData.creative_field === field ? "bg-palette-6/30" : ""}`}
                              onClick={() => handleSelectField(field)}
                            >
                              {field.replace(/-/g, " ")} {/* Show user-friendly name */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-palette-5/60 ml-1">Portfolio Link</label>
                      <input
                        type="url"
                        name="portfolioLink"
                        value={formData.portfolioLink}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40"
                        placeholder="Your portfolio URL"
                      />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative w-full">
                    {/* Label */}
                    <label className="block text-sm font-medium text-palette-5/60 ml-1 mb-1">
                      Gender
                    </label>

                    {/* Custom Dropdown Trigger */}
                    <div
                      className="flex justify-between items-center w-full px-3 py-1.5 rounded-lg bg-palette-5/90 text-palette-6/90 cursor-pointer outline-none focus:outline focus:outline-palette-4"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <span className={formData.gender ? "text-palette-7" : "text-palette-6/40"}>
                        {formData.gender || "Select Gender"}
                      </span>
                      <ChevronDown className="w-5 h-5 text-palette-6" />
                    </div>

                    {/* Dropdown Options */}
                    {isOpen && (
                      <div className="absolute mt-1 w-full p-1 flex flex-col gap-2 bg-palette-5 rounded-lg shadow-lg z-10">
                        {genders.map((gender) => (
                          <div
                            key={gender}
                            className={`px-3 py-1.5 cursor-pointer rounded-lg hover:bg-palette-6/30 text-palette-6 ${formData.gender === gender ? "bg-palette-6/30" : ""
                              }`}
                            onClick={() => handleSelect(gender)}
                          >
                            {gender}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-palette-5/60 ml-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={9}
                    className="w-full px-3 py-1.5 scroll-none rounded-lg outline-none focus:outline focus:outline-palette-4 bg-palette-5/90 placeholder:text-palette-6/40 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end items-center space-x-4">
            <button
              onClick={handleClose}
              className="w-32 py-2 rounded-lg text-palette-7 font-thin hover:bg-palette-7 hover:text-palette-5 bg-palette-5  transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isEditing}
              className="w-32 py-2 bg-palette-1 text-white rounded-lg font-thin hover:bg-palette-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Icon icon="eos-icons:loading" className="w-5 h-5" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save"
              )}
            </motion.button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="px-6 py-3 bg-red-50">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}
        </motion.div>

      )}
    </>
  );
};