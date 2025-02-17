"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Buttons } from "./Buttons";

export const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSet, setImageSet] = useState<{ path: string; title: string }[]>([]);

  // Fetch images only once when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/collections/homepage");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Unexpected API response format");
        }
  
        // Function to extract the actual file extension before any query params
        const getFileExtension = (url: string) => {
          const cleanUrl = url.split('?')[0]; // Remove query parameters
          return cleanUrl.split('.').pop()?.toLowerCase() || ''; // Extract extension
        };
  
        // Filter out .gif files
        const filteredImages = result.data.filter((image: { path: string; title: string }) => {
          const fileExtension = getFileExtension(image.path);
          return fileExtension !== 'gif'; // Exclude GIFs
        });
  
        setImageSet(filteredImages);
      } catch (error) {
        console.error("Error fetching images:", error);
        setImageSet([]);
      }
    };
    fetchImages();
  }, []);
  


  return (
    <div className="w-full h-screen bg-palette-5 overflow-hidden">
      <div className="w-full h-full flex justify-end items-center relative">
        <LeftSide currentIndex={currentIndex} imageSet={imageSet} />
        <RightSide currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}  />
      </div>
    </div> 
  );
};

const RightSide = ({
  currentIndex,
  setCurrentIndex,
}: {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [imageSet, setImageSet] = useState<{ path: string; title: string }[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Fetch images from the API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/collections/homepage");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Unexpected API response format");
        }
        setImageSet(result.data);
      } catch (error) {
        console.error("Error fetching images:", error);
        setImageSet([]);
      }
    };
    fetchImages();
  }, []);

  const totalSlides = imageSet.length;

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (totalSlides + 1)); // Include the cloned first image
    }, 5000);

    return () => clearInterval(interval);
  }, [setCurrentIndex, totalSlides]);

  // Handle the end of the transition
  const handleTransitionEnd = () => {
    if (currentIndex === totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(0); // Reset to the first image
    }
  };

  // Delay before restarting the transition
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50); // Match this delay with the animation duration
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  // Render nothing if imageSet is empty

  if (imageSet.length === 0) {
    return <div className="text-center"></div>;
  }

  return (

    <div className="w-full md:max-w-[65%] h-full overflow-hidden relative">
      {/* Gradient overlay */}
      <div className="md:block hidden absolute inset-0 bg-gradient-to-r from-palette-5 via-palette-5/10 to-transparent z-10" />
      <div className="block md:hidden absolute inset-0 bg-gradient-to-r from-palette-5 via-palette-5/70 to-transparent z-10" />
      {/* Image container with sliding effect */}
      <div
        className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
          }`}
        style={{
          transform: `translateX(-${(currentIndex % (totalSlides + 1)) * 100
            }%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Duplicate the imageSet and append the first image for seamless looping */}
        {[...imageSet, imageSet[0]].map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              className="w-full h-full object-cover md:object-right-top"
              src={image.path}
              alt={image.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LeftSide = ({ currentIndex, imageSet }: { currentIndex: number; imageSet: { path: string; title: string }[] }) => {
  return (
    <motion.div
      className="md:w-[40%] w-full absolute top-0 md:left-[5%] left-[2%] z-20 h-full"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
        },
      }}
      viewport={{ once: true }}
    >
      <div className="w-full h-full flex flex-col gap-6 justify-center items-center relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {[
            {
              key: "circle-1",
              className: "absolute left-[10%] bottom-[20%] z-10 bg-palette-2 rounded-full w-6 h-6",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.8, 1],
                scale: [1, 1.2, 1],
              },
            },
            {
              key: "circle-2",
              className: "absolute right-[30%] bottom-[20%] z-10 bg-palette-3 rounded-full w-5 h-5",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.3, 1],
                scale: [1, 0.9, 1],
                rotate: [-35, -35, -35],
              },
            },
            {
              key: "circle-3",
              className: "absolute right-[10%] bottom-[10%] z-10 bg-yellow-500 rounded-md w-7 h-7 rotate-[-35deg]",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.8, 1],
                scale: [1, 1.2, 1],
                rotate: [-35, -35, -35],
              },
            },
            {
              key: "circle-4",
              className: "absolute right-[15%] md:bottom-[35%] z-10 bg-palette-3 rounded-md w-7 h-7 rotate-45",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.8, 1],
                scale: [1, 1.1, 1],
                rotate: [45, 45, 45],
              },
            },
            {
              key: "circle-5",
              className: "absolute left-[38%] top-[22%] z-10 bg-palette-3 rounded-md w-5 h-5",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.8, 1],
                scale: [1, 1.2, 1],
              },
            },
          ].map((item) => (
            <motion.div
              key={item.key}
              className={item.className}
              variants={{
                hidden: { opacity: 0, scale: 0, y: 50 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }
                }
              }}
              animate={{
                ...item.twinkleParams,
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                },
              }}
            />
          ))}

          {[
            {
              key: "image-1",
              src: "/images/homepage/1.png",
              className: "absolute right-[0%] bottom-[20%]",
              initialTransform: { x: 50 },
              twinkleParams: {
                opacity: [1, 0.9, 1],
                scale: [1, 0.9, 1],
                rotate: [-35, -35, -35],
              },
            },
            {
              key: "image-2",
              src: "/images/homepage/2.png",
              className: "absolute left-[45%] top-[15%] z-10",
              initialTransform: { y: 50 },
              twinkleParams: {
                opacity: [1, 0.9, 1],
                scale: [1, 0.9, 1],
              },
            },
          ].map((item) => (
            <motion.img
              key={item.key}
              className={item.className}
              src={item.src}
              alt=""
              variants={{
                hidden: { opacity: 0, scale: 0, ...item.initialTransform },
                visible: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }
                }
              }}
              animate={{
                ...item.twinkleParams,
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                },
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 100 }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, type: "spring", stiffness: 100 }}
            className="w-full md:max-w-sm max-w-xs md:text-8xl text-6xl font-sans  font-bold text-palette-2"
          >
            <span className="md:text-5xl text-3xl">This is</span> <span className="uppercase">Creative legazpi</span>
          </motion.h1>

          <Buttons />
          <Indicator currentIndex={currentIndex} imageSet={imageSet} />
        </motion.div>
      </div>
    </motion.div>
  );
};

const Indicator = ({
  currentIndex,
  imageSet,
}: {
  currentIndex: number;
  imageSet: { path: string; title: string }[];
}) => {
  if (imageSet.length === 0) return null;

  return (
    <div className="px-4 flex gap-2">
      {imageSet.map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 border-2 border-palette-2 rounded-full transition-all ${
            index === currentIndex % imageSet.length ? "bg-palette-3 scale-110" : "bg-transparent"
          }`}
        ></div>
      ))}
    </div>
  );
};

