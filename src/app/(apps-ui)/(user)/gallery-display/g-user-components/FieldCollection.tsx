import { useState, useEffect } from "react";

const imageSet = [
  {
    src: "/images/homepage/bread.png",
    alt: "Bread",
  },
  {
    src: "/images/homepage/ea.png",
    alt: "idk",
  },
  {
    src: "/images/homepage/plates.png",
    alt: "plates",
  },
  {
    src: "/images/homepage/cake.png",
    alt: "Cakes",
  },
  {
    src: "/images/homepage/sili.png",
    alt: "Sili",
  },
];

export const FieldCollection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalSlides = imageSet.length;

  // Create extended set with triple the images for continuous looping
  const extendedImageSet = [
    ...imageSet.slice(-2), // Last 2 images
    ...imageSet, // Original set
    ...imageSet, // Duplicate set
    ...imageSet.slice(0, 3), // First 3 images
  ];

  const goToNext = () => {
    if (currentIndex >= totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalSlides - 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]); // Added currentIndex as dependency

  const getVisibleIndexes = () => {
    return [
      currentIndex % totalSlides,
      (currentIndex + 1) % totalSlides,
      (currentIndex + 2) % totalSlides,
    ];
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* Main carousel container */}
      <div className="w-full h-full flex justify-center items-center relative">
        <div
          className={`flex h-full ${
            isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
          }`}
          style={{
            transform: `translateX(calc(-${(currentIndex + 2) * (100/3)}%))`,
            width: `${(extendedImageSet.length * 100) / 3}%`
          }}
        >
          {extendedImageSet.map((image, index) => (
            <div key={`${index}-${image.src}`} className="w-1/3 h-full flex-shrink-0 px-4">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="max-h-[60dvh] w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-colors"
      >
        ◀
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-colors"
      >
        ▶
      </button>

      {/* Indicators */}
      {/* <div className="absolute bottom-4 flex gap-2">
        {imageSet.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 border-2 border-gray-800 rounded-full transition-colors ${
              getVisibleIndexes().includes(index)
                ? "bg-transparent"
                : "bg-gray-800"
            }`}
          />
        ))}
      </div> */}
    </div>
  );
};

export default FieldCollection;