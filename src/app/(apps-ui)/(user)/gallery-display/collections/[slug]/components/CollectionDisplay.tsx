"use client"; // This tells Next.js that this component is a client-side component

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { deleteCollectionItem } from "@/services/Collections/deleteCollection";
import { getSession } from "@/services/authservice";
import { jwtVerify } from "jose";
import useAuthRedirect from "@/services/hoc/auth";
import DeleteCollection from "../(collectionModal)/DeleteCollection";
import { toast, ToastContainer } from "react-toastify";
import { EditCollection } from "../(collectionModal)/EditCollection";
import { Interested } from "../(collectionModal)/Interested";
import { ViewCollection } from "../(collectionModal)/viewCollection";
import Lottie from "lottie-react";
import clickMe from "../../../../../../../../public/lottie/clickme.json";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

interface CollectionProps {
  collection: {
    images: {
      created_at: Date;
      generatedId: string;
      path: string;
      title: string;
      desc: string;
      artist: string;
      year: number;
      childid: string;
      link?: string;
    }[];
  };
}



const CollectionDisplay: React.FC<CollectionProps> = ({ collection }) => {
  const [images, setImages] = useState(collection.images);
  const [getID, setID] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(collection.images[0] || null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isInterestModalOpen, setInterestModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    generatedId: string;
    path: string;
  } | null>(null);
  const [chat, setChat] = useState(false);

  const handleOpenInterestModal = (image: typeof selectedImage) => {
    setSelectedImage(image); // Set the selected image
    setInterestModalOpen(true); // Open the modal
    setViewModalOpen(false);
  };

  const handleOpenEditModal = (image: typeof selectedImage) => {
    setSelectedImage(image); // Set the selected image
    setEditModalOpen(true); // Open the Edit modal
    setViewModalOpen(false);
  };

  const handleOpenDeleteModal = (image: typeof selectedImage) => {
    setImageToDelete(image); // Set the image to delete
    setDeleteModalOpen(true); // Open the Delete modal
    setViewModalOpen(false);
  };

  const [isViewModalOpen, setViewModalOpen] = useState(false);

  const handleImageClick = (image: typeof selectedImage) => {
    setSelectedImage(image);
    setViewModalOpen(true);
  };

  useAuthRedirect();

  useEffect(() => {
    if (collection.images.length > 0) {
      setImages(collection.images);
      setSelectedImage(collection.images[0]);
    }
  }, [collection.images]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getSession();
        if (!token) return;
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );
        const userId = payload.id as string;
        setID(userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchData();
  }, [collection.images]);

  const handleDelete = async () => {
    if (!imageToDelete) return;

    const token = getSession();
    if (!token) return;

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userId = payload.id as string;
      await deleteCollectionItem(
        imageToDelete.generatedId,
        userId,
        imageToDelete.path
      );
      toast.success("Deleted successfully!", { position: "bottom-right" });

      window.location.reload();

      const updatedImages = images.filter(
        (img) => img.generatedId !== imageToDelete.generatedId
      );
      setImages(updatedImages);

      if (selectedImage?.generatedId === imageToDelete.generatedId) {
        setSelectedImage(
          updatedImages.length > 0 ? updatedImages[0] : collection.images[0]
        );
      }

      setDeleteModalOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleEdit = async (updatedData: {
    title: string;
    desc: string;
    year: number;
    path: string | null;
  }) => {
    if (!selectedImage) return;

    const token = getSession();
    if (!token) return;

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userId = payload.id as string;

      toast.success("Collection updated successfully!", {
        position: "bottom-right",
      });

      const updatedImages = images.map((img) =>
        img.generatedId === selectedImage.generatedId
          ? {
            ...img,
            ...updatedData,
            path: updatedData.path || "/images/default.jpg",
          }
          : img
      );
      setImages(updatedImages);

      setSelectedImage({
        ...selectedImage,
        ...updatedData,
        path: updatedData.path || "/images/default.jpg",
      });

      setEditModalOpen(false);
    } catch (error) {
      console.error("Error editing the collection:", error);
      toast.error("Failed to update the collection.", {
        position: "bottom-right",
      });
    }
  };

  const controls = useAnimation();

  // Trigger animations after the component mounts
  useEffect(() => {
    controls.start((i) => ({
      scale: [0.5, 1], // Start small and grow to original size
      opacity: [0, 1], // Fade in
      transition: {
        delay: i * 0.2, // Stagger delay (0.2 seconds between each image)
        type: "spring", // Spring effect
        stiffness: 100,
        damping: 10,
      },
    }));
  }, [controls]);



  return (
    <div className=" min-h-screen relative w-full max-w-[90%] py-[20dvh] mx-auto">
      <div className="w-full h-full flex flex-col gap-6">
        <motion.h1
          className="text-3xl font-bold text-palette-1 uppercase"
          initial={{ scale: 0.6, opacity: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView={{
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 200,
              delay: 0.1 // Staggered delay based on index
            }
          }} >collection</motion.h1>
        {/* Image Gallery Collections*/}
        <AnimatePresence>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {images
              // Sort the images array in descending order based on a specific property (e.g., created_at or id)
              .sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
              })
              .map((image, index) => (
                <motion.div
                  key={`${image.path}-${index}`}
                  className="mb-4 break-inside-avoid"
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: index * 0.1 // Staggered delay based on index
                    }
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="bg-palette-6/20 rounded-3xl p-4 flex flex-col gap-4">
                    <div
                      key={image.generatedId}
                      onClick={() => handleImageClick(image)}
                      className="w-full relative cursor-pointer rounded-3xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out z-10">
                        <div className="flex justify-center items-center h-full w-full">
                          <Lottie className="w-full h-full max-w-[60%] max-h-[60%]" animationData={clickMe} loop={true} />
                        </div>
                      </div>
                      <div className="max-h-[32rem] overflow-hidden">
                        <img
                          src={image.path}
                          alt={image.title}
                          className="w-full h-fit object-fill"
                          style={{
                            maxHeight: "32rem",
                            width: "100%",
                            objectFit: "fill",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </AnimatePresence>

      </div>

      {/* Confirmation Modal for Deletion */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            {imageToDelete && (
              <DeleteCollection
                isOpen={isDeleteModalOpen}
                generatedId={imageToDelete.generatedId}
                imagePath={imageToDelete.path}
                userId={getID!}
                onCancel={() => setDeleteModalOpen(false)}
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInterestModalOpen && selectedImage && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 500, x: 200, opacity: 0 }}
            animate={{ scale: 1, y: 0, x: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 500, x: 500, opacity: 0 }}
            transition={{
              type: "tween",
              damping: 25,
              stiffness: 500,
            }}
            className="w-full h-full fixed z-[550] bottom-0 right-0"
          >
            <Interested
              childid={selectedImage.childid}
              created_at={selectedImage.created_at}
              artist={selectedImage.artist}
              image={selectedImage.path}
              title={selectedImage.title}
              desc={selectedImage.desc}
              year={selectedImage.year}
              onCancel={() => setInterestModalOpen(false)}
              chat={chat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Edit Modal */}
        {isEditModalOpen && selectedImage && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1000] flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setEditModalOpen(false)}
          >
            <EditCollection
              generatedId={selectedImage.generatedId}
              created_at={selectedImage.created_at}
              artist={selectedImage.artist}
              image={selectedImage.path}
              title={selectedImage.title}
              desc={selectedImage.desc}
              year={selectedImage.year}
              link={selectedImage.link}
              onEdit={handleEdit}
              onCancel={() => setEditModalOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isViewModalOpen && selectedImage && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black/50 z-[1000] flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setViewModalOpen(false)} // Close modal when clicking outside
          >
            <ViewCollection
              onOpenInterestModal={handleOpenInterestModal}
              onOpenEditModal={handleOpenEditModal} // Pass the Edit modal handler
              onOpenDeleteModal={handleOpenDeleteModal} // Pass the Delete modal handler
              collection={collection}
              generatedId={selectedImage.generatedId}
              created_at={selectedImage.created_at}
              image={selectedImage.path}
              title={selectedImage.title}
              desc={selectedImage.desc}
              year={selectedImage.year}
              artist={selectedImage.artist}
              onClose={() => setViewModalOpen(false)} // Close modal
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
};

export default CollectionDisplay;