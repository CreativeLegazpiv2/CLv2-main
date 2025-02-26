

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export const EventHeroPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSet, setImageSet] = useState<{ image_url: string; title: string }[]>([]);

  // Fetch images only once when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/featured/fetch");
        // const response = await fetch("/api/collections/homepage");
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
        const filteredImages = result.data.filter((image: { image_url: string; title: string }) => {
          const fileExtension = getFileExtension(image.image_url);
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
    <>
      <RightSide currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
    </>
  );
};


const RightSide = ({
  currentIndex,
  setCurrentIndex,
}: {
  currentIndex: number
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
}) => {
  const [imageSet, setImageSet] = useState<{ image_url: string; title: string }[]>([])
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/featured/fetch")
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const result = await response.json()
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Unexpected API response format")
        }
        setImageSet(result.data)
      } catch (error) {
        console.error("Error fetching images:", error)
        setImageSet([])
      }
    }
    fetchImages()
  }, [])

  const totalSlides = imageSet.length

  // Update active index when currentIndex changes
  useEffect(() => {
    if (currentIndex === totalSlides) {
      setTimeout(() => setActiveIndex(0), 100) // Small delay prevents flicker
    } else {
      setActiveIndex(currentIndex)
    }
  }, [currentIndex, totalSlides])

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % (totalSlides + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [setCurrentIndex, totalSlides])

  // Handle the end of the transition
  const handleTransitionEnd = () => {
    if (currentIndex === totalSlides) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0) // Instantly reset to first slide without flicker
      }, 100) // Small delay allows transition to complete
    }
  }

  // Delay before restarting the transition
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [isTransitioning])

  // Render nothing if imageSet is empty
  if (imageSet.length === 0) {
    return <div className="text-center"></div>
  }

  // Clone first and last images for smooth looping
  const safeClone = imageSet.length > 0 ? imageSet[0] : { image_url: "/images/events/hero.jpg", title: "" }

  return (
    <div className="w-full h-screen max-h-dvh overflow-hidden relative">
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
        <AnimatePresence>
          {/* Duplicate the imageSet and append the first image for seamless looping */}
          {[...imageSet, safeClone].map((image, index) => {
            return (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                {/* Background image with enhanced styling */}
                <div
                  className="w-full h-full bg-cover bg-no-repeat bg-center transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage: `url('${image.image_url || "/images/events/hero.jpg"}')`,
                    
                  }}
                ></div>

                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-black/20 z-10" />

                {/* Quote Box (Event Description) */}
                <div className="absolute h-full max-h-[90dvh] inset-0 flex flex-col justify-end items-center z-[100]">
                  <motion.div
                    className="relative p-8 md:p-10 w-full max-w-screen-md bg-gradient-to-t from-palette-2/30 via-palette-2/30 to-transparent backdrop-blur-sm border border-white/20 rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={index === activeIndex ? { opacity: 1, y: 0, scale: 1 } : {}}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}

                  >
                    {/* Large quote mark */}
                    <div className="absolute top-2 left-4 text-white/40 text-6xl font-serif">"</div>

                    {/* Event Title as Quote */}
                    <div className="relative text-center">
                      <p className="text-white text-lg md:text-xl italic font-light tracking-wide leading-relaxed">
                        {image.title}
                      </p>

                      {/* Decorative underline */}
                      <div className="w-24 h-0.5 bg-white/60 mt-6 mb-2 mx-auto"></div>

                      {/* Subtitle */}
                      <p className="text-white/80 text-sm font-medium">Event History</p>
                    </div>

                    {/* Closing quote mark */}
                    <div className="absolute bottom-2 right-4 text-white/40 text-6xl font-serif">"</div>
                  </motion.div>
                </div>
              </div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
