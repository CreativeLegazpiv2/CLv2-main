import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const FeaturedArtist = () => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null); // YouTube player instance
  const [isPlaying, setIsPlaying] = useState(false); // Track play/pause state
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load the YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize the YouTube player when the API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      if (videoRef.current) {
        const ytPlayer = new (window as any).YT.Player(videoRef.current, {
          events: {
            onReady: () => setPlayer(ytPlayer), // Save the player instance
            onStateChange: (event: any) => {
              // Update play/pause state based on player state
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };
  }, []);

  // Autoplay the video when it comes into view, but only once
  useEffect(() => {
    if (!hasStartedPlaying) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && videoRef.current && !hasStartedPlaying) {
              // Autoplay the video using the YouTube player instance
              if (player) {
                player.playVideo();
              }
              setHasStartedPlaying(true);

              // Disconnect the observer after triggering once
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { threshold: 0.5 } // Trigger when 50% of the video is in view
      );

      if (videoRef.current) {
        observerRef.current.observe(videoRef.current);
      }
    }

    return () => {
      // Clean up the observer on component unmount
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasStartedPlaying, player]);

  // Toggle play/pause when the video is clicked
  const handleVideoClick = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-palette-5 to-palette-5/80">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-palette-2/30 blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-palette-1/20 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-palette-2/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="mx-auto max-w-screen-xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {/* Heading with creative typography */}
          <motion.div
            className="mb-16 relative"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 100 },
              },
            }}
          >
            <div className="absolute -top-10 left-0 text-8xl font-black text-palette-1/5 select-none">
              FEATURED
            </div>
            <h2 className="font-bold text-5xl md:text-7xl text-palette-1 relative">
              Featured <span className="text-palette-2">Artist</span>
            </h2>
            <div className="h-1 w-20 bg-palette-2 mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Video Section - Takes up 3/5 of the grid on desktop */}
            <motion.div
              className="lg:col-span-3 relative z-10"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 100 },
                },
              }}
            >
              <div
                className="rounded-xl overflow-hidden shadow-2xl relative group cursor-pointer"
                onClick={handleVideoClick} // Add click handler to toggle play/pause
              >
                {/* Decorative frame around video */}
                <div className="absolute inset-0 border-2 border-palette-2/30 rounded-xl transform scale-105 group-hover:scale-110 transition-transform duration-500"></div>

                {/* The video iframe */}
                <div className="aspect-video relative rounded-xl overflow-hidden">
                  <iframe
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/1yGa2S8r6Bk?enablejsapi=1"
                    title="Dennis Concepcion Interview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video overlay with play/pause icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-palette-2/80 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-8 h-8"
                    >
                      {isPlaying ? (
                        // Pause icon
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      ) : (
                        // Play icon
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Artist Info Section - Takes up 2/5 of the grid on desktop */}
            <motion.div
              className="lg:col-span-2 relative z-10"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 100 },
                },
              }}
            >
              <div className="relative">
                {/* Decorative quote mark */}
                <div className="absolute -top-10 -left-8 text-8xl font-serif text-palette-2/10">
                  "
                </div>

                <h3 className="font-bold text-4xl text-palette-2 mb-2">
                  Dennis Concepcion
                </h3>
                <p className="text-palette-1/70 text-lg mb-2 italic">
                  Founder, Artlift PH
                </p>

                <div className="h-0.5 w-12 bg-palette-2/50 my-6"></div>

                <p className="text-lg text-palette-1 mb-6 leading-relaxed">
                  Join us as we sit down with Dennis Concepcion, founder of
                  Artlift PH, and discover the inspiring story behind his
                  passion-driven journey. From humble beginnings to empowering
                  artists, Dennis shares his heart and vision for curating
                  Bikularyes and empowering Philippine artists.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-palette-2/10 text-palette-2 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-palette-2 hover:text-white transition-colors duration-300">
                    #ArtliftPH
                  </span>
                  <span className="bg-palette-2/10 text-palette-2 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-palette-2 hover:text-white transition-colors duration-300">
                    #ArtCommunity
                  </span>
                  <span className="bg-palette-2/10 text-palette-2 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-palette-2 hover:text-white transition-colors duration-300">
                    #PhilippineArt
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom decorative elements */}
          <motion.div
            className="mt-16 flex justify-center"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 100 },
              },
            }}
          >
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};